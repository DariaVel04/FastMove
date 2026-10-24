import type { ScoreBreakdown } from "../domain/types.ts"

/**
 * Smart Match weights. These apply only after hard filters.
 *
 * A facility is removed before scoring when:
 * - it does not support the chosen activity
 * - a demonstration slot exists but is not marked as demonstration data
 * - the city page says the season has ended
 * - the time window cannot leave at least 30 minutes after the journey
 *   (and, when a slot length is known, inside that slot)
 *
 * A confirmed place with no session length can still be ranked. Its time-fit
 * score stays at 0 so an unknown session is not treated as a long workout.
 * A higher score cannot put an incompatible activity or an impossible
 * journey back into the list.
 *
 * travelConvenience — shorter estimated round trip ranks higher.
 *   0 minutes scores 1. A round trip at or beyond the cap scores 0.
 * timeFit — more usable exercise minutes ranks higher, capped at 90
 *   so a very long window does not dominate the rank.
 * dataConfidence — trust in the availability record. Demonstration slots
 *   share one value. A place with no loaded session uses another value,
 *   and neither value means the place is open right now.
 */
export const SCORE_WEIGHTS = {
  travelConvenience: 0.55,
  timeFit: 0.3,
  dataConfidence: 0.15,
} as const

export const TRAVEL_CONVENIENCE_CAP_MINUTES = 120
export const TIME_FIT_CAP_MINUTES = 90

/** Fixed because no availability record has been checked in Timmi. */
export const DEMONSTRATION_CONFIDENCE = 0.3

/**
 * The place is in a city or LIPAS source, but the session length is not loaded.
 * This is not a live-availability score.
 */
export const SESSION_UNKNOWN_CONFIDENCE = 0.4

export function scoreMatch(input: {
  roundTripMinutes: number
  exerciseMinutes: number
  dataConfidence: number
}): ScoreBreakdown {
  const travelConvenience =
    1 -
    Math.min(Math.max(input.roundTripMinutes, 0), TRAVEL_CONVENIENCE_CAP_MINUTES) /
      TRAVEL_CONVENIENCE_CAP_MINUTES
  const timeFit =
    Math.min(Math.max(input.exerciseMinutes, 0), TIME_FIT_CAP_MINUTES) / TIME_FIT_CAP_MINUTES
  const dataConfidence = input.dataConfidence
  const weighted =
    SCORE_WEIGHTS.travelConvenience * travelConvenience +
    SCORE_WEIGHTS.timeFit * timeFit +
    SCORE_WEIGHTS.dataConfidence * dataConfidence

  return {
    travelConvenience,
    timeFit,
    dataConfidence,
    index: Math.round(weighted * 1000) / 10,
  }
}
