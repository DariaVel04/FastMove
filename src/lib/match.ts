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
    exampleWindow: `${formatDemoDate(demo.startTime)} · ${formatDemoRange(demo)}`,
    provenance: {
      status: "demonstration",
      sourceName: demo.sourceLabel,
      verifiedInTimmi: false,
      summary: "Fictional demonstration slot for this search. It is not a booking and it was not read from Timmi.",
    },
  }
}

type DatedChoice = {
  startTime: string
  durationMinutes: number
  workoutMinutes: number
}

/**
 * Keep a fitting demo row from today when one exists.
 * Otherwise keep the nearest later day. A longer row on a later day does not win.
 */
export function chooseNearestFittingDemo<T extends DatedChoice>(
  candidates: readonly T[],
  today: string,
): T | null {
  if (candidates.length === 0) return null
  const rank = (items: readonly T[]) =>
    [...items].sort(
      (left, right) =>
        right.workoutMinutes - left.workoutMinutes ||
        right.durationMinutes - left.durationMinutes ||
        left.startTime.localeCompare(right.startTime),
    )
  const todayMatches = candidates.filter((item) => item.startTime.slice(0, 10) === today)
  if (todayMatches.length > 0) return rank(todayMatches)[0]
  const nearestDay = [...candidates].map((item) => item.startTime.slice(0, 10)).sort()[0]
  return rank(candidates.filter((item) => item.startTime.slice(0, 10) === nearestDay))[0]
}

function localDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export function findMatches(
  query: SearchQuery,
  origin?: { latitude: number; longitude: number } | null,
): MatchOutcome {
  const start = origin ?? null
  if (!start || !Number.isFinite(start.latitude) || !Number.isFinite(start.longitude)) {
    return {
      results: [],
      confirmed: [],
      timeExclusions: [],
      reachable: [],
      scheduleNotes: [],
      visitCautions: [],
      activitySupportedCount: 0,
    }
  }

  const capOuting = query.applyOutingCap !== false
  const results: ScoredMatch[] = []
  const visitCautions: ScoredMatch[] = []
  const timeExclusions: TimeExclusion[] = []
  const reachable: ScoredMatch[] = []
  const scheduleNotes: ScheduleNote[] = []
  let activitySupportedCount = 0
  const now = new Date()
  const todayKey = localDayKey(now)
  const demoSchedule = buildDemoSchedule(facilities, now)
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
        chosenInterval: null,
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
    const fitting = evaluated.filter((item) => item.assessment.fits && item.assessment.workoutMinutes !== null)

    if (fitting.length === 0) {
      const reach =
        !capOuting && !activity.dropInLimited
          ? reachableInWindow(facility, activity, windowSlots, travel, query, windowStart, windowEnd, todayKey)
          : null
      if (reach) {
        reachable.push(reach)
        continue
      }
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

    const chosen = chooseNearestFittingDemo(
      fitting.map((entry) => ({
        ...entry,
        startTime: entry.demo.startTime,
        durationMinutes: entry.demo.durationMinutes,
        workoutMinutes: entry.assessment.workoutMinutes ?? 0,
      })),
      todayKey,
    )
    if (!chosen) continue
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

    const scored: ScoredMatch = {
      facility,
      activity,
      slot,
      chosenInterval: {
        demoStartMinutes: clockMinutes(chosen.demo.startTime),
        demoEndMinutes: clockMinutes(chosen.demo.endTime),
        usableStartMinutes: chosen.assessment.workoutStart ?? clockMinutes(chosen.demo.startTime),
        usableEndMinutes: chosen.assessment.workoutEnd ?? clockMinutes(chosen.demo.endTime),
      },
      windowSlots,
      travel,
      timeFit: fit,
      score,
      reasons: buildReasons(activity, TRANSPORT_LABELS[query.transport], fit, slot, facility),
      isBest: false,
    }
    if (activity.dropInLimited) visitCautions.push(scored)
    else results.push(scored)
  }

  results.sort(compareRelevance)
  reachable.sort(compareRelevance)
  return { results, confirmed: [], timeExclusions, reachable, scheduleNotes, visitCautions, activitySupportedCount }
}

/**
 * With the outing cap off, keep a hall whose example interval can be reached and
 * left inside the free window. The outing limit is the only thing that failed,
 * so the result says nothing about how busy the hall is.
 */
function reachableInWindow(
  facility: Facility,
  activity: SupportedActivity,
  windowSlots: DemoSlot[],
  travel: ReturnType<typeof estimateTravel>,
  query: SearchQuery,
  windowStart: number,
  windowEnd: number,
  todayKey: string,
): ScoredMatch | null {
  const assess = (demo: DemoSlot, minWorkoutMinutes: number) =>
    assessSlotAttendance(
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
        maxOutingMinutes: windowEnd - windowStart,
        minWorkoutMinutes,
        outboundMinutes: travel.outboundMinutes,
        returnMinutes: travel.returnMinutes,
        selectedActivityId: query.activityId,
      },
    )
  const available = windowSlots.filter((slot) => slot.status === "demo_available")
  const pick = (minWorkoutMinutes: number) =>
    chooseNearestFittingDemo(
      available
        .map((demo) => ({ demo, assessment: assess(demo, minWorkoutMinutes) }))
        .filter((entry) => entry.assessment.fits && entry.assessment.workoutMinutes !== null)
        .map((entry) => ({
          ...entry,
          startTime: entry.demo.startTime,
          durationMinutes: entry.demo.durationMinutes,
          workoutMinutes: entry.assessment.workoutMinutes ?? 0,
        })),
      todayKey,
    )
  const chosen = pick(query.minWorkoutMinutes) ?? pick(1)
  if (!chosen) return null

  const fit: TimeFit = {
    outboundMinutes: travel.outboundMinutes,
    returnMinutes: travel.returnMinutes,
    roundTripMinutes: travel.roundTripMinutes,
    remainingMinutes: query.maxOutingMinutes - travel.roundTripMinutes,
    exerciseMinutes: chosen.assessment.workoutMinutes ?? 0,
    sessionKnown: true,
    fits: false,
  }
  const slot = demoToAvailability(chosen.demo)
  return {
    facility,
    activity,
    slot,
    chosenInterval: {
      demoStartMinutes: clockMinutes(chosen.demo.startTime),
      demoEndMinutes: clockMinutes(chosen.demo.endTime),
      usableStartMinutes: chosen.assessment.workoutStart ?? clockMinutes(chosen.demo.startTime),
      usableEndMinutes: chosen.assessment.workoutEnd ?? clockMinutes(chosen.demo.endTime),
    },
    windowSlots,
    travel,
    timeFit: fit,
    score: scoreMatch({
      roundTripMinutes: fit.roundTripMinutes,
      exerciseMinutes: fit.exerciseMinutes,
      dataConfidence: DEMONSTRATION_CONFIDENCE,
    }),
    reasons: [
      activity.detail,
      `${TRANSPORT_LABELS[query.transport]} estimate: ${fit.outboundMinutes} minutes each way. About ${fit.exerciseMinutes} minutes left to exercise.`,
      "This availability is a fictional demo slot and has not been checked in Timmi. The labelled window is not a confirmed start and end.",
    ],
    isBest: false,
  }
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
    return `${ACTIVITY_LABELS[activityId]} is not matched to a room in this dataset. ${activity.summary} Check the city page or Timmi before you decide a place is unavailable.${alternatives}`
  }
  return `No listed place confirms ${ACTIVITY_LABELS[activityId]}. ${activity.summary}${alternatives}`
}
