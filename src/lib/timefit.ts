import type { TimeFit } from "../domain/types.ts"

/**
 * A visit shorter than this is excluded. The threshold is a product rule
 * for a useful session, not a claim about booking rules.
 */
export const MIN_EXERCISE_MINUTES = 30

/**
 * Time left to exercise is the selected window minus the outbound estimate
 * and the same estimate again for the return. The recorded slot duration
 * is a hard cap: a short example slot is never stretched to fill the window.
 */
export function assessTimeFit(
  availableMinutes: number,
  oneWayMinutes: number,
  slotDurationMinutes: number,
  minWorkoutMinutes: number = MIN_EXERCISE_MINUTES,
): TimeFit {
  const outboundMinutes = oneWayMinutes
  const returnMinutes = oneWayMinutes
  const roundTripMinutes = outboundMinutes + returnMinutes
  const remainingMinutes = availableMinutes - roundTripMinutes
  const exerciseMinutes = Math.max(0, Math.min(remainingMinutes, slotDurationMinutes))
  const fits =
    remainingMinutes >= minWorkoutMinutes &&
    exerciseMinutes >= minWorkoutMinutes &&
    exerciseMinutes <= slotDurationMinutes

  return {
    outboundMinutes,
    returnMinutes,
    roundTripMinutes,
    remainingMinutes,
    exerciseMinutes,
    sessionKnown: true,
    fits,
  }
}

/**
 * Used when a confirmed place has no session length on record.
 * The journey can still leave 30 minutes, but that remainder is not a booked session.
 */
export function assessUnscheduledVisit(
  availableMinutes: number,
  oneWayMinutes: number,
  minWorkoutMinutes: number = MIN_EXERCISE_MINUTES,
): TimeFit {
  const outboundMinutes = oneWayMinutes
  const returnMinutes = oneWayMinutes
  const roundTripMinutes = outboundMinutes + returnMinutes
  const remainingMinutes = availableMinutes - roundTripMinutes
  const exerciseMinutes = Math.max(0, remainingMinutes)

  return {
    outboundMinutes,
    returnMinutes,
    roundTripMinutes,
    remainingMinutes,
    exerciseMinutes,
    sessionKnown: false,
    fits: remainingMinutes >= minWorkoutMinutes,
  }
}
