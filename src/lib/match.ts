import type {
  AvailabilitySlot,
  Facility,
  MatchOutcome,
  ScoredMatch,
  ScheduleNote,
  SearchQuery,
  SupportedActivity,
  TimeExclusion,
  TimeFit,
} from "../domain/types.ts"
import { ACTIVITY_CATALOG, ACTIVITY_LABELS, TRANSPORT_LABELS } from "../data/sources.ts"
import { facilities } from "../data/facilities.ts"
import { DEMONSTRATION_CONFIDENCE, scoreMatch, SESSION_UNKNOWN_CONFIDENCE } from "./scoring.ts"
import { assessTimeFit, assessUnscheduledVisit } from "./timefit.ts"
import { estimateTravel } from "./travel.ts"

function compareSlots(
  left: { fit: TimeFit; slot: AvailabilitySlot },
  right: { fit: TimeFit; slot: AvailabilitySlot },
): number {
  return (
    right.fit.exerciseMinutes - left.fit.exerciseMinutes ||
    left.slot.durationMinutes - right.slot.durationMinutes ||
    left.slot.id.localeCompare(right.slot.id)
  )
}

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

  reasons.push("This availability is a demonstration example and has not been checked in Timmi.")
  return reasons
}

export function findMatches(
  query: SearchQuery,
  origin?: { latitude: number; longitude: number } | null,
): MatchOutcome {
  const start = origin ?? null
  if (!start || !Number.isFinite(start.latitude) || !Number.isFinite(start.longitude)) {
    return { results: [], timeExclusions: [], scheduleNotes: [], activitySupportedCount: 0 }
  }

  const results: ScoredMatch[] = []
  const timeExclusions: TimeExclusion[] = []
  const scheduleNotes: ScheduleNote[] = []
  let activitySupportedCount = 0

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

    const slots = facility.slots.filter(
      (slot) =>
        slot.activityId === query.activityId &&
        slot.provenance.status === "demonstration" &&
        slot.provenance.verifiedInTimmi === false,
    )
    const travel = estimateTravel(start, facility, query.transport)

    if (slots.length === 0) {
      if (facility.schedule.state === "demonstration-examples") continue
      const fit = assessUnscheduledVisit(query.availableMinutes, travel.outboundMinutes)
      if (!fit.fits) {
        timeExclusions.push({
          facilityId: facility.id,
          facilityName: facility.name,
          bestRemainingMinutes: fit.remainingMinutes,
        })
        continue
      }

      results.push({
        facility,
        activity,
        slot: null,
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

    const evaluated = slots.map((slot) => ({
      slot,
      fit: assessTimeFit(query.availableMinutes, travel.outboundMinutes, slot.durationMinutes),
    }))
    const fitting = evaluated.filter((item) => item.fit.fits).sort(compareSlots)

    if (fitting.length === 0) {
      const bestRemainingMinutes = Math.max(...evaluated.map((item) => item.fit.remainingMinutes))
      timeExclusions.push({
        facilityId: facility.id,
        facilityName: facility.name,
        bestRemainingMinutes,
      })
      continue
    }

    const chosen = fitting[0]
    const score = scoreMatch({
      roundTripMinutes: chosen.fit.roundTripMinutes,
      exerciseMinutes: chosen.fit.exerciseMinutes,
      dataConfidence: DEMONSTRATION_CONFIDENCE,
    })

    results.push({
      facility,
      activity,
      slot: chosen.slot,
      travel,
      timeFit: chosen.fit,
      score,
      reasons: buildReasons(
        activity,
        TRANSPORT_LABELS[query.transport],
        chosen.fit,
        chosen.slot,
        facility,
      ),
      isBest: false,
    })
  }

  results.sort(compareRelevance)
  return { results, timeExclusions, scheduleNotes, activitySupportedCount }
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
  availableMinutes: number,
): string | null {
  if (exclusions.length === 0) return null
  const names = exclusions.map((item) => item.facilityName).join(", ")
  const verb = exclusions.length === 1 ? "supports" : "support"
  return `${names} ${verb} ${ACTIVITY_LABELS[activityId]}. The estimated journey does not leave 30 minutes to exercise inside a ${availableMinutes}-minute window.`
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
