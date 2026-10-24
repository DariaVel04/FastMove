import type {
  AvailabilitySlot,
  DemoSlot,
  Facility,
  MatchOutcome,
  ScoredMatch,
  ScheduleNote,
  SearchQuery,
  SupportedActivity,
  TimeExclusion,
  TimeFit,
} from "../domain/types.ts"
import { buildDemoSchedule, clockMinutes, formatDemoDate, formatDemoRange, overlapsDailyWindow } from "../data/demoSchedule.ts"
import { ACTIVITY_CATALOG, ACTIVITY_LABELS, TRANSPORT_LABELS } from "../data/sources.ts"
import { facilities } from "../data/facilities.ts"
import { DEMONSTRATION_CONFIDENCE, scoreMatch, SESSION_UNKNOWN_CONFIDENCE } from "./scoring.ts"
import { assessSlotAttendance, parseClock } from "./slotMatch.ts"
import { assessUnscheduledVisit } from "./timefit.ts"
import { estimateTravel } from "./travel.ts"

function buildReasons(
  activity: SupportedActivity,
  travelModeLabel: string,
  fit: TimeFit,
  slot: AvailabilitySlot | null,
  facility: Facility,
): string[] {
  if (!slot || !fit.sessionKnown) {
    return [
      activity.detail,
      `${travelModeLabel} estimate: ${fit.outboundMinutes} minutes each way. About ${fit.remainingMinutes} minutes remain after the journey. The session length is not confirmed.`,
      facility.schedule.detail,
      "This rank uses the travel estimate. It does not treat the place as available right now.",
    ]
  }

  const reasons = [
    activity.detail,
    `${travelModeLabel} estimate: ${fit.outboundMinutes} minutes each way. About ${fit.exerciseMinutes} minutes left to exercise.`,
  ]

  if (fit.remainingMinutes > slot.durationMinutes) {
    reasons.push(
      `The example slot is ${slot.durationMinutes} minutes, so the visit stops there even though ${fit.remainingMinutes} minutes remain after travel.`,
    )
  } else if (fit.remainingMinutes < slot.durationMinutes) {
    reasons.push(
      `The example slot is ${slot.durationMinutes} minutes. Your remaining time is the tighter limit, so the visit is ${fit.exerciseMinutes} minutes.`,
    )
  } else {
    reasons.push(
      `The example slot is ${slot.durationMinutes} minutes, the same as the time left after travel.`,
    )
  }

  reasons.push(
    "This availability is a fictional demo slot and has not been checked in Timmi. The labelled window is not a confirmed start and end.",
  )
  if (facility.schedule.state === "seasonal-check") {
    reasons.push(
      "Real ice conditions are not verified. This demo schedule does not treat the place as available right now.",
    )
  }
  return reasons
}

function demoToAvailability(demo: DemoSlot): AvailabilitySlot {
  return {
    id: demo.id,
    activityId: demo.sport,
    spaceName: demo.spaceName,
    durationMinutes: demo.durationMinutes,
    exampleWindow: `${formatDemoDate(demo.startTime)} ${formatDemoRange(demo)}`,
    provenance: {
      status: "demonstration",
      sourceName: demo.sourceLabel,
      verifiedInTimmi: false,
      summary: "Fictional demonstration slot for this search. It is not a booking and it was not read from Timmi.",
    },
  }
}

export function findMatches(
  query: SearchQuery,
  origin?: { latitude: number; longitude: number } | null,
): MatchOutcome {
  const start = origin ?? null
  if (!start || !Number.isFinite(start.latitude) || !Number.isFinite(start.longitude)) {
    return { results: [], confirmed: [], timeExclusions: [], scheduleNotes: [], activitySupportedCount: 0 }
  }

  const results: ScoredMatch[] = []
  const timeExclusions: TimeExclusion[] = []
  const scheduleNotes: ScheduleNote[] = []
  let activitySupportedCount = 0
  const demoSchedule = buildDemoSchedule(facilities)
  const windowStart = parseClock(query.availableFrom) ?? 0
  const windowEnd = parseClock(query.availableUntil) ?? 0

  for (const facility of facilities) {
    const activity = facility.activities.find((item) => item.id === query.activityId)
    if (!activity) continue

    activitySupportedCount += 1
    if (facility.schedule.state === "published-closed") {
      scheduleNotes.push({
        facilityId: facility.id,
        facilityName: facility.name,
        message: facility.schedule.detail,
      })
      continue
    }

    const sportSlots = demoSchedule.slots.filter(
      (slot) => slot.facilityId === facility.id && slot.sport === query.activityId,
    )
    const travel = estimateTravel(start, facility, query.transport)
    const windowSlots = sportSlots.filter((slot) =>
      overlapsDailyWindow(slot, query.availableFrom, query.availableUntil),
    )

    if (sportSlots.length === 0) {
      if (facility.schedule.state === "demonstration-examples") continue
      const fit = assessUnscheduledVisit(
        query.maxOutingMinutes,
        travel.outboundMinutes,
        query.minWorkoutMinutes,
      )
      if (!fit.fits) {
        timeExclusions.push({
          facilityId: facility.id,
          facilityName: facility.name,
          bestRemainingMinutes: fit.remainingMinutes,
          outboundMinutes: travel.outboundMinutes,
          returnMinutes: travel.returnMinutes,
          windowSlots: [],
        })
        continue
      }

      results.push({
        facility,
        activity,
        slot: null,
        windowSlots: [],
        travel,
        timeFit: fit,
        score: scoreMatch({
          roundTripMinutes: fit.roundTripMinutes,
          exerciseMinutes: 0,
          dataConfidence: SESSION_UNKNOWN_CONFIDENCE,
        }),
        reasons: buildReasons(activity, TRANSPORT_LABELS[query.transport], fit, null, facility),
        isBest: false,
      })
      continue
    }

    if (windowSlots.length === 0) continue

    const evaluated = windowSlots
      .filter((slot) => slot.status === "demo_available")
      .map((demo) => ({
        demo,
        assessment: assessSlotAttendance(
          {
            startMinutes: clockMinutes(demo.startTime),
            endMinutes: clockMinutes(demo.endTime),
            kind: "demo-interval",
            activityId: demo.sport,
            fixedSession: false,
          },
          {
            windowStart,
            windowEnd,
            maxOutingMinutes: query.maxOutingMinutes,
            minWorkoutMinutes: query.minWorkoutMinutes,
            outboundMinutes: travel.outboundMinutes,
            returnMinutes: travel.returnMinutes,
            selectedActivityId: query.activityId,
          },
        ),
      }))
    const fitting = evaluated
      .filter((item) => item.assessment.fits && item.assessment.workoutMinutes !== null)
      .sort(
        (left, right) =>
          (right.assessment.workoutMinutes ?? 0) - (left.assessment.workoutMinutes ?? 0) ||
          right.demo.durationMinutes - left.demo.durationMinutes ||
          left.demo.startTime.localeCompare(right.demo.startTime),
      )

    if (fitting.length === 0) {
      timeExclusions.push({
        facilityId: facility.id,
        facilityName: facility.name,
        bestRemainingMinutes: query.maxOutingMinutes - travel.roundTripMinutes,
        outboundMinutes: travel.outboundMinutes,
        returnMinutes: travel.returnMinutes,
        windowSlots,
      })
      continue
    }

    const chosen = fitting[0]
    const workoutMinutes = chosen.assessment.workoutMinutes ?? 0
    const fit: TimeFit = {
      outboundMinutes: travel.outboundMinutes,
      returnMinutes: travel.returnMinutes,
      roundTripMinutes: travel.roundTripMinutes,
      remainingMinutes: query.maxOutingMinutes - travel.roundTripMinutes,
      exerciseMinutes: workoutMinutes,
      sessionKnown: true,
      fits: true,
    }
    const slot = demoToAvailability(chosen.demo)
    const score = scoreMatch({
      roundTripMinutes: fit.roundTripMinutes,
      exerciseMinutes: fit.exerciseMinutes,
      dataConfidence: DEMONSTRATION_CONFIDENCE,
    })

    results.push({
      facility,
      activity,
      slot,
      windowSlots,
      travel,
      timeFit: fit,
      score,
      reasons: buildReasons(activity, TRANSPORT_LABELS[query.transport], fit, slot, facility),
      isBest: false,
    })
  }

  results.sort(compareRelevance)
  return { results, confirmed: [], timeExclusions, scheduleNotes, activitySupportedCount }
}

export function compareRelevance(left: ScoredMatch, right: ScoredMatch): number {
  return (
    right.score.index - left.score.index ||
    left.timeFit.outboundMinutes - right.timeFit.outboundMinutes ||
    left.facility.name.localeCompare(right.facility.name)
  )
}

export function describeTimeExclusions(
  exclusions: TimeExclusion[],
  activityId: SearchQuery["activityId"],
  maxOutingMinutes: number,
  minWorkoutMinutes: number,
): string | null {
  if (exclusions.length === 0) return null
  const names = exclusions.map((item) => item.facilityName).join(", ")
  const verb = exclusions.length === 1 ? "supports" : "support"
  return `${names} ${verb} ${ACTIVITY_LABELS[activityId]}. The estimated journey does not leave ${minWorkoutMinutes} minutes to exercise inside a ${maxOutingMinutes}-minute outing. This does not mean the facilities are fully booked.`
}

export function describeActivityGap(activityId: SearchQuery["activityId"]): string {
  const activity = ACTIVITY_CATALOG[activityId]
  const alternatives =
    " Listed places exist for Gym / Fitness, Swimming, Ice Hockey and Public Outdoor Ice Rinks."
  if (activity.status === "needs-verification") {
    return `${ACTIVITY_LABELS[activityId]} is not a confirmed match. ${activity.summary} Check the city page or Timmi before you decide a place is unavailable.${alternatives}`
  }
  return `No listed place confirms ${ACTIVITY_LABELS[activityId]}. ${activity.summary}${alternatives}`
}
