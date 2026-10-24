import type { ActivityId } from "../domain/types.ts"

/**
 * What kind of interval a source actually published.
 * Opening hours are not a free sports slot. Demonstration times are not bookings.
 */
export type ScheduleKind =
  | "confirmed-bookable"
  | "confirmed-public-session"
  | "opening-hours"
  | "unknown"
  | "demonstration"
  | "demo-interval"

export type ClockSlot = {
  startMinutes: number
  endMinutes: number
  kind: ScheduleKind
  activityId: ActivityId
  /** The user has to be there at the published start, as with a public session. */
  fixedSession: boolean
}

export type AttendanceQuery = {
  windowStart: number
  windowEnd: number
  maxOutingMinutes: number
  minWorkoutMinutes: number
  /** Null when the journey has not been estimated. Never treat that as zero. */
  outboundMinutes: number | null
  returnMinutes: number | null
  selectedActivityId: ActivityId
  /** Only set when a source requires an early arrival. Omitted means no extra buffer. */
  arrivalBufferMinutes?: number
}

export type AttendanceStatus =
  | "fits"
  | "outside-window"
  | "workout-too-short"
  | "outing-too-long"
  | "travel-unknown"
  | "schedule-unknown"
  | "demonstration-only"
  | "sport-incompatible"
  | "opening-hours-not-a-slot"

export type AttendanceAssessment = {
  status: AttendanceStatus
  fits: boolean
  workoutMinutes: number | null
  outingMinutes: number | null
  workoutStart: number | null
  workoutEnd: number | null
  outboundMinutes: number | null
  returnMinutes: number | null
  reasons: string[]
}

export function parseClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

export function formatClock(totalMinutes: number): string {
  const minutes = ((Math.trunc(totalMinutes) % 1440) + 1440) % 1440
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
}

export function validateSearchTiming(input: {
  availableFrom: string
  availableUntil: string
  maxOutingMinutes: number
  minWorkoutMinutes: number
}): string | null {
  const from = parseClock(input.availableFrom)
  const until = parseClock(input.availableUntil)
  if (from === null || until === null) return "Enter both times as hours and minutes."
  if (until <= from) return "Available until must be later than available from on the same day."
  if (input.minWorkoutMinutes > input.maxOutingMinutes) {
    return "The minimum workout cannot be longer than the maximum outing."
  }
  if (input.minWorkoutMinutes > until - from) {
    return "The minimum workout is longer than the time you are available."
  }
  return null
}

function refused(
  status: AttendanceStatus,
  reason: string,
  travel: { outboundMinutes: number | null; returnMinutes: number | null },
): AttendanceAssessment {
  return {
    status,
    fits: false,
    workoutMinutes: null,
    outingMinutes: null,
    workoutStart: null,
    workoutEnd: null,
    outboundMinutes: travel.outboundMinutes,
    returnMinutes: travel.returnMinutes,
    reasons: [reason],
  }
}

/**
 * Decide whether one published interval can be attended.
 * A missing travel time is not zero. Opening hours and example slots never count as free.
 */
export function assessSlotAttendance(slot: ClockSlot, query: AttendanceQuery): AttendanceAssessment {
  const outboundMinutes = query.outboundMinutes
  const returnMinutes = query.returnMinutes
  const travel = { outboundMinutes, returnMinutes }

  if (slot.activityId !== query.selectedActivityId) {
    return refused(
      "sport-incompatible",
      "This interval is for a different activity, so it is not a match.",
      travel,
    )
  }

  if (slot.kind === "unknown") {
    return refused(
      "schedule-unknown",
      "No confirmed interval was loaded for this place. That is not the same as a full booking calendar.",
      travel,
    )
  }

  if (slot.kind === "demonstration") {
    return refused(
      "demonstration-only",
      "This clock time is a demonstration example. It has not been checked in a booking system.",
      travel,
    )
  }

  if (slot.kind === "opening-hours") {
    return refused(
      "opening-hours-not-a-slot",
      "Opening hours describe when the building can be open. They are not an unbooked sports slot.",
      travel,
    )
  }

  if (
    outboundMinutes === null ||
    returnMinutes === null ||
    !Number.isFinite(outboundMinutes) ||
    !Number.isFinite(returnMinutes) ||
    outboundMinutes < 0 ||
    returnMinutes < 0
  ) {
    return refused(
      "travel-unknown",
      "Travel time is unknown, so it is not treated as zero and the slot is not claimed to fit.",
      { outboundMinutes: null, returnMinutes: null },
    )
  }

  const slotLength = slot.endMinutes - slot.startMinutes
  if (slotLength < query.minWorkoutMinutes) {
    return refused(
      "workout-too-short",
      `The interval is ${slotLength} minutes, shorter than the ${query.minWorkoutMinutes}-minute workout.`,
      travel,
    )
  }

  const buffer = query.arrivalBufferMinutes ?? 0
  const outboundWithBuffer = outboundMinutes + buffer
  const maxWorkout = query.maxOutingMinutes - outboundWithBuffer - returnMinutes
  if (maxWorkout < query.minWorkoutMinutes) {
    return refused(
      "outing-too-long",
      "The slot only fits if the return journey is left out. Both directions count toward the outing limit.",
      travel,
    )
  }

  if (slot.fixedSession) {
    const earliestArrival = query.windowStart + outboundWithBuffer
    if (earliestArrival > slot.startMinutes || slot.startMinutes >= query.windowEnd) {
      return refused(
        "outside-window",
        "You cannot arrive before this fixed session starts and still be inside your availability window.",
        travel,
      )
    }
    const latestLeave = query.windowEnd - returnMinutes
    const workoutEnd = Math.min(slot.endMinutes, latestLeave, slot.startMinutes + maxWorkout)
    const workoutMinutes = workoutEnd - slot.startMinutes
    if (workoutMinutes < query.minWorkoutMinutes) {
      const ignoringReturn = Math.min(slot.endMinutes, query.windowEnd, slot.startMinutes + (query.maxOutingMinutes - outboundWithBuffer)) - slot.startMinutes
      return refused(
        ignoringReturn >= query.minWorkoutMinutes ? "outing-too-long" : "outside-window",
        ignoringReturn >= query.minWorkoutMinutes
          ? "The session fits only when the return journey is ignored."
          : "The fixed session does not leave the minimum workout inside your window.",
        travel,
      )
    }
    const outingMinutes = outboundWithBuffer + workoutMinutes + returnMinutes
    return {
      status: "fits",
      fits: true,
      workoutMinutes,
      outingMinutes,
      workoutStart: slot.startMinutes,
      workoutEnd: slot.startMinutes + workoutMinutes,
      outboundMinutes,
      returnMinutes,
      reasons: [
        `Arrive by ${formatClock(slot.startMinutes)} for the fixed session.`,
        `${workoutMinutes} minutes of exercise, ${outingMinutes} minutes including travel both ways.`,
      ],
    }
  }

  const earliestStart = Math.max(slot.startMinutes, query.windowStart + outboundWithBuffer)
  const latestEnd = Math.min(slot.endMinutes, query.windowEnd - returnMinutes)
  const available = latestEnd - earliestStart
  if (available < query.minWorkoutMinutes) {
    const ignoringReturn =
      Math.min(slot.endMinutes, query.windowEnd) - Math.max(slot.startMinutes, query.windowStart + outboundWithBuffer)
    return refused(
      ignoringReturn >= query.minWorkoutMinutes ? "outing-too-long" : "outside-window",
      ignoringReturn >= query.minWorkoutMinutes
        ? "The interval fits only when the return journey is ignored."
        : "The interval does not overlap your availability window for long enough.",
      travel,
    )
  }

  const workoutMinutes = Math.min(available, maxWorkout)
  const outingMinutes = outboundWithBuffer + workoutMinutes + returnMinutes
  return {
    status: "fits",
    fits: true,
    workoutMinutes,
    outingMinutes,
    workoutStart: earliestStart,
    workoutEnd: earliestStart + workoutMinutes,
    outboundMinutes,
    returnMinutes,
    reasons: [
      `Feasible workout ${formatClock(earliestStart)}–${formatClock(earliestStart + workoutMinutes)}.`,
      `${workoutMinutes} minutes of exercise, ${outingMinutes} minutes including travel both ways.`,
    ],
  }
}
