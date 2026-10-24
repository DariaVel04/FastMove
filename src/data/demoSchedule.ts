import type { ActivityId, DemoSlot, DemoSlotStatus, Facility, ScheduleCoverage, SupportedActivity } from "../domain/types.ts"
import { DEMO_SLOT_SOURCE_LABEL } from "../domain/types.ts"
import { ACTIVITY_LABELS } from "./sources.ts"
import { formatClock } from "../lib/slotMatch.ts"

type IntervalStatus = Exclude<DemoSlotStatus, "unknown">

type ParsedInterval = {
  start: number
  end: number
  status: IntervalStatus
}

type Week = [string, string, string, string, string, string, string]

/** Explicit demonstration profile. Days are indexed by Date.getDay(), Sunday = 0. */
export type DemoScheduleProfile = {
  facilityId: string
  sport: ActivityId
  spaceName: string
  days: Week
  note: string | null
  /** Different room names that still cannot be used at the same time. */
  conflictGroup: string | null
}

const SHARED_NOTE =
  "Demo only: this room is shared, so the other listed sports use different illustrated times."

const DAY_COUNT = 7
const TOKEN = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})([au])$/

/**
 * Hand-authored demonstration weeks. Each facility and sport has its own intervals.
 * These are not opening hours and not a Timmi calendar.
 */
export const DEMO_SCHEDULE_PROFILES: readonly DemoScheduleProfile[] = [
  profile("hervanta", "gym", "Hilkka gym", null, null, [
    "09:00-10:00a 12:00-12:45u 14:30-16:00a 16:15-17:20a 17:45-18:50a",
    "09:30-10:45a 11:30-12:15a 14:30-16:00a 16:20-17:30a 18:00-19:15a",
    "08:50-09:40a 10:30-11:30u 13:00-13:50a 14:30-16:00a 16:15-17:10a 17:40-18:40a 19:10-20:00a",
    "09:15-10:20a 12:10-13:00a 14:30-16:00a 16:30-17:25a 17:50-19:00a",
    "10:00-11:10a 12:30-13:15u 14:30-16:00a 16:10-17:15a 17:35-18:45a 19:20-20:10a",
    "09:05-10:00a 11:00-12:00a 14:30-16:00a 16:25-17:35a 18:10-19:20a",
    "09:40-10:40a 12:20-13:10a 14:30-16:00a 16:20-17:20a 17:45-18:55a 19:30-20:15u",
  ]),
  profile("hervanta", "functional-training", "Functional training gym", null, null, [
    "09:20-10:35a 12:30-13:20u 14:45-16:05a 16:30-17:15a 18:30-19:45a",
    "10:00-11:15a 13:10-14:00a 14:50-16:10a 16:40-17:40a 18:15-19:30a",
    "09:10-10:00a 11:20-12:20a 14:40-16:00a 16:25-17:35a 19:00-20:10a",
    "08:55-09:50a 11:00-11:50u 13:40-14:25a 15:00-16:15a 16:45-17:50a 18:20-19:10a",
    "09:35-10:50a 12:05-12:55a 14:35-16:00a 16:20-17:05a 17:30-18:45a",
    "10:15-11:30a 12:40-13:30u 15:00-16:20a 16:50-17:55a 18:40-19:50a",
    "09:00-09:55a 11:40-12:45a 14:55-16:10a 16:35-17:45a 18:05-19:20a",
  ]),
  profile("hervanta", "martial-arts", "Tauno martial arts hall and Pertsa tatami hall", null, null, [
    "10:10-11:25a 13:00-13:45u 14:55-16:15a 16:40-17:50a 18:20-19:05a",
    "09:15-10:30a 12:00-12:50a 14:40-16:05a 16:25-17:15a 19:00-20:15a",
    "10:40-11:55a 13:20-14:10a 15:00-16:20a 16:45-17:55a 18:15-19:00u",
    "09:40-10:55a 12:20-13:10u 14:30-16:00a 16:15-17:30a 18:00-19:20a",
    "08:50-10:05a 11:30-12:20a 14:45-16:10a 16:35-17:40a 19:10-20:00a",
    "09:50-11:05a 13:15-14:05a 14:50-16:05a 17:00-18:15a 18:40-19:40a",
    "10:20-11:40a 12:50-13:40u 15:05-16:20a 16:50-18:00a 18:30-19:30a",
  ]),
  profile("kaukajarvi", "gym", "Lower gym", null, null, [
    "08:45-09:40a 11:00-12:15a 13:30-14:15u 14:40-15:40a 16:25-17:40a 18:10-19:00a",
    "09:25-10:40a 12:00-12:50a 14:55-15:50a 16:20-17:05a 17:30-18:50a",
    "10:05-11:20a 12:40-13:30u 15:00-15:50a 16:45-18:00a 18:30-19:15a",
    "09:00-10:15a 11:40-12:30a 14:50-15:45a 16:30-17:45a 19:00-20:05a",
    "08:50-09:45a 10:30-11:45u 13:10-14:00a 14:42-15:32a 16:15-17:30a 18:00-19:20a",
    "09:10-10:25a 12:20-13:35a 14:45-15:35a 16:40-17:25a 17:50-19:05a",
    "10:20-11:35a 13:00-13:45u 15:05-15:55a 16:35-17:50a 18:20-19:40a",
  ]),
  profile("kaukajarvi", "basketball", "Ball sports hall", SHARED_NOTE, null, [
    "09:00-10:00a 14:30-16:00a 18:10-19:20a",
    "10:30-11:30a 15:00-17:00a",
    "09:15-10:20a 13:00-13:50u 14:40-15:50a 19:00-20:10a",
    "11:00-12:10a 14:30-15:40a 17:00-18:20a",
    "09:40-10:50a 15:05-16:15a 18:00-19:30a",
    "10:00-11:00u 12:15-13:20a 14:30-16:00a 17:45-18:45a",
    "09:25-10:35a 14:45-15:55a 18:15-19:15a",
  ]),
  profile("kaukajarvi", "volleyball", "Ball sports hall", SHARED_NOTE, null, [
    "10:20-11:30a 16:15-17:30a 19:40-20:30u",
    "09:00-10:15a 12:00-13:15a 17:15-18:30a 19:00-19:50u",
    "10:40-11:50a 16:10-17:30a 17:50-18:40a",
    "09:20-10:20a 12:30-13:40a 15:55-16:45a 18:40-19:40a",
    "11:10-12:20a 13:15-14:20a 16:30-17:40a 19:45-20:30u",
    "09:00-09:45a 11:15-12:00a 16:15-17:30a 19:00-20:00a",
    "11:00-12:10a 13:00-14:20a 16:10-17:40a 19:40-20:25a",
  ]),
  profile("naashalli", "gym", "Gym", null, null, [
    "09:50-11:05a 12:45-13:35u 14:50-16:10a 16:35-17:50a 18:20-19:05a",
    "08:40-09:35a 10:50-12:05a 14:30-16:00a 16:15-17:00a 17:20-18:35a",
    "09:30-10:45a 12:10-13:00a 15:05-16:25a 16:50-18:05a 18:30-19:20u",
    "10:15-11:40a 13:20-14:10u 14:40-16:00a 16:20-17:35a 19:05-20:00a",
    "09:05-10:20a 11:45-12:35a 14:45-16:05a 16:30-17:15a 17:40-19:00a",
    "08:55-10:10a 12:25-13:40u 14:55-16:15a 16:40-17:55a 18:15-19:25a",
    "09:20-10:35a 11:50-12:55a 14:35-16:00a 16:25-17:40a 18:00-18:50a",
  ]),
  profile("naashalli", "functional-training", "Functional training gym", null, null, [
    "10:30-11:50a 13:40-14:25a 15:10-16:20a 16:45-17:35a 18:50-20:05a",
    "09:05-10:25a 12:15-13:05u 14:35-15:55a 16:20-17:30a 18:00-18:55a",
    "08:45-09:55a 11:10-12:25a 14:45-16:10a 16:30-17:20a 19:15-20:20a",
    "09:40-11:00a 12:30-13:15a 15:00-16:15a 16:40-18:00a 18:25-19:10u",
    "10:05-11:20a 13:00-13:50u 14:30-15:50a 16:10-17:25a 17:50-19:05a",
    "09:15-10:40a 12:00-12:50a 14:50-16:05a 17:00-18:20a 18:45-19:40a",
    "10:20-11:45a 13:15-14:05a 14:40-16:00a 16:15-17:05a 17:30-18:45a",
  ]),
  profile("naashalli", "table-tennis", "Table tennis", null, null, [
    "09:00-09:50a 11:15-12:15a 14:30-15:30a 16:00-17:00a 18:15-19:15a",
    "10:00-11:00a 12:30-13:15u 15:00-16:00a 16:30-17:45a 18:20-19:05a",
    "09:20-10:20a 11:40-12:40a 14:40-15:50a 16:15-17:15a 19:00-20:00a",
    "08:50-09:45a 12:00-13:00a 14:35-15:35a 16:45-18:00a 18:30-19:20u",
    "09:40-10:40a 13:10-14:00a 15:05-16:15a 16:40-17:30a 18:00-19:00a",
    "10:10-11:10u 11:30-12:20a 14:30-16:00a 16:20-17:10a 17:40-18:40a",
    "09:10-10:15a 12:10-13:10a 14:55-16:05a 16:30-17:40a 18:10-19:10a",
  ]),
  profile("naashalli", "martial-arts", "Aikido hall and budo halls 2–6", null, null, [
    "11:00-12:20a 13:30-14:15u 14:45-16:05a 16:25-17:40a 18:00-19:10a",
    "09:35-10:55a 12:20-13:10a 15:10-16:20a 16:45-18:00a 18:25-19:15a",
    "10:00-11:15a 12:45-13:35u 14:30-15:55a 16:20-17:25a 19:20-20:20a",
    "09:10-10:30a 11:45-12:40a 14:55-16:15a 16:40-17:50a 18:15-19:00u",
    "08:55-10:15a 12:00-12:50a 14:40-16:00a 16:15-17:05a 17:35-18:50a",
    "09:45-11:05a 13:00-13:50u 15:00-16:10a 16:35-17:55a 18:20-19:30a",
    "10:25-11:45a 13:20-14:10a 14:50-16:10a 16:40-17:45a 18:05-19:05a",
  ]),
  profile("tampere-stadium", "gym", "Gym", null, null, [
    "09:45-11:00a 12:15-13:00u 15:10-16:05a 16:20-17:35a 18:05-19:15a",
    "08:50-10:05a 11:20-12:20a 15:15-16:10a 16:30-17:20a 17:45-19:00a",
    "09:10-10:25a 13:05-14:00a 15:05-16:00a 16:45-18:05a 18:25-19:10u",
    "10:00-11:20a 12:40-13:30a 15:10-16:00a 16:15-17:25a 19:00-20:10a",
    "09:00-10:10a 11:30-12:15u 15:00-15:55a 16:40-17:55a 18:15-19:05a",
    "09:30-10:50a 12:05-13:05a 15:20-16:10a 16:25-17:40a 18:00-18:50a 19:10-20:00a",
    "10:10-11:25a 13:15-14:05u 15:10-16:05a 16:35-17:45a 18:10-19:25a",
  ]),
  profile("tampere-stadium", "floorball", "Sports hall 1", SHARED_NOTE, "stadium-halls", [
    "09:00-10:15a 11:30-12:30u 14:30-16:00a",
    "09:40-10:50a 12:10-13:20a 14:45-15:55a",
    "10:00-11:20a 12:40-13:30u 14:30-15:50a",
    "09:15-10:30a 13:00-14:00a 14:20-15:40a",
    "09:00-09:55a 11:15-12:25a 14:35-15:45a",
    "10:20-11:40a 12:00-12:45u 14:30-16:00a",
    "09:25-10:40a 12:50-13:50a 14:50-15:55a",
  ]),
  profile("tampere-stadium", "gymnastics", "Sports halls 1–3", SHARED_NOTE, "stadium-halls", [
    "16:00-17:15a 18:00-19:20a 19:45-20:30u",
    "16:10-17:30a 18:15-19:15a 19:40-20:25a",
    "16:00-16:50u 17:10-18:20a 18:45-20:00a",
    "16:20-17:40a 18:00-18:50a 19:10-20:20a",
    "16:05-17:20a 17:45-18:55a 19:20-20:10u",
    "16:15-17:45a 18:10-19:00u 19:15-20:30a",
    "16:00-17:10a 17:30-18:40a 19:05-20:05a",
  ]),
  profile("tesoma-ice", "gym", "Gym", null, null, [
    "09:35-10:50a 12:25-13:15a 14:55-16:15a 16:40-17:45a 18:15-19:00a",
    "10:05-11:25a 13:00-13:50u 14:40-16:00a 16:20-17:15a 17:40-19:00a",
    "08:55-10:10a 11:30-12:40a 15:00-16:20a 16:45-18:00a 18:25-19:20a",
    "09:15-10:30a 12:00-12:50u 14:30-15:55a 16:15-17:30a 18:00-19:15a",
    "09:50-11:10a 12:40-13:40a 14:45-16:05a 16:30-17:20a 19:00-20:05u",
    "10:20-11:40a 13:10-14:00a 14:50-16:10a 16:35-17:50a 18:10-19:05a",
    "09:05-10:20a 11:45-12:45u 14:35-16:00a 16:25-17:40a 18:05-19:20a",
  ]),
  profile("tesoma-ball", "gym", "Gym", null, null, [
    "08:40-09:45a 11:20-12:35a 14:30-15:50a 16:10-17:25a 18:40-19:50a",
    "09:55-11:15a 12:45-13:35u 15:05-16:25a 16:50-18:05a 18:30-19:15a",
    "09:10-10:25a 13:15-14:05a 14:45-16:05a 16:30-17:15a 17:40-18:55a",
    "10:00-11:20a 12:10-13:00a 14:40-16:00a 16:20-17:35a 19:10-20:15a",
    "08:50-10:00a 11:15-12:05u 14:55-16:15a 16:40-17:55a 18:15-19:05a",
    "09:20-10:40a 12:20-13:20a 14:35-16:00a 16:15-17:00a 17:25-18:40a",
    "10:30-11:50a 13:05-13:55u 15:00-16:20a 16:45-18:00a 18:20-19:10a",
  ]),
  profile("tesoma-ball", "basketball", "Ball games hall courts 1–3", SHARED_NOTE, null, [
    "09:00-10:00a 14:30-16:00a",
    "10:05-11:05a 15:30-17:30a",
    "09:15-10:15a 14:40-15:45a 19:05-20:05a",
    "11:05-12:05u 15:00-16:05a 18:25-19:25a",
    "09:00-09:50a 14:30-15:50a 18:45-19:45a",
    "12:05-13:05a 16:15-17:15a",
    "09:35-10:40a 14:35-15:55a",
  ]),
  profile("tesoma-ball", "futsal", "Ball games hall courts 1–3", SHARED_NOTE, null, [
    "10:15-11:20a 18:20-19:20a",
    "11:20-12:25a 14:30-15:15a 18:00-19:05a",
    "10:30-11:35a 16:00-17:05a",
    "09:05-10:10a 13:25-14:30a 16:20-17:25a",
    "10:05-11:10a 16:05-17:20a",
    "09:25-10:30a 14:30-15:35a 18:05-19:15a",
    "11:00-12:10a 16:20-17:20a 18:35-19:25u",
  ]),
  profile("tesoma-ball", "floorball", "Ball games hall courts 1–3", SHARED_NOTE, null, [
    "11:40-12:40a 16:15-17:40a 19:40-20:30u",
    "09:00-09:50a 12:45-13:40u 19:20-20:25a",
    "11:50-12:55a 17:20-18:40a",
    "12:20-13:15a 17:40-18:20a",
    "11:25-12:35a 17:35-18:35u",
    "10:45-11:50u 13:20-14:15a 19:30-20:30a",
    "12:25-13:35a 17:35-18:25a 19:45-20:35a",
  ]),
  profile("exhibition", "football", "Hall A", null, null, [
    "09:25-10:40a 12:00-12:50u 14:30-16:00a 16:20-17:35a 18:00-19:15a",
    "10:10-11:30a 13:00-13:50a 14:50-16:10a 16:40-18:00a 18:25-19:10a",
    "08:55-10:15a 11:40-12:40a 15:00-16:20a 16:45-17:45a 19:00-20:10a",
    "09:40-11:00a 12:20-13:10u 14:40-16:00a 16:15-17:20a 17:45-19:00a",
    "09:00-10:20a 13:15-14:05a 14:35-15:55a 16:25-17:50a 18:15-19:05u",
    "10:00-11:15a 12:30-13:30a 14:45-16:15a 16:35-17:25a 17:50-19:05a",
    "09:15-10:30a 11:50-12:55u 15:05-16:25a 16:50-18:05a 18:30-19:20a",
  ]),
]

export function missingScheduleReason(facility: Facility): string | null {
  if (facility.schedule.state === "published-closed") {
    return "The city page says this season has ended, so FastMove does not generate demo sessions that would look open."
  }
  if (facility.schedule.state === "not-loaded" || facility.schedule.state === "seasonal-check") {
    return "Session times are not loaded, so FastMove does not invent a free session."
  }
  if (facility.activities.length === 0) {
    return "No sport is confirmed for this place, so a compatible demo schedule cannot be generated."
  }
  return null
}

export function buildDemoSchedule(
  facilities: readonly Facility[],
  now = new Date(),
): { slots: DemoSlot[]; coverage: ScheduleCoverage[] } {
  assertProfilesMatchFacilities(facilities)
  const today = startOfLocalDay(now)
  const slots: DemoSlot[] = []
  const coverage: ScheduleCoverage[] = []

  for (const facility of facilities) {
    const reason = missingScheduleReason(facility)
    if (reason) {
      coverage.push({ facilityId: facility.id, state: "unknown", reason, slotCount: 0 })
      continue
    }

    const facilitySlots: DemoSlot[] = []
    for (const activity of facility.activities) {
      const plan = profileFor(facility.id, activity.id)
      for (let dayIndex = 0; dayIndex < DAY_COUNT; dayIndex += 1) {
        const day = addDays(today, dayIndex)
        const intervals = parseDay(plan.days[day.getDay()], `${facility.id} ${activity.id}`)
        for (const interval of intervals) {
          facilitySlots.push(makeSlot(facility, activity, day, interval, plan))
        }
      }
    }
    assertNoConflicts(facilitySlots)
    slots.push(...facilitySlots)
    coverage.push({
      facilityId: facility.id,
      state: "demo-generated",
      reason: null,
      slotCount: facilitySlots.length,
    })
  }

  if (new Set(slots.map((slot) => slot.id)).size !== slots.length) {
    throw new Error("Demo schedule produced duplicate slot ids")
  }

  return { slots, coverage }
}

export function overlapsDailyWindow(slot: DemoSlot, availableFrom: string, availableUntil: string): boolean {
  const from = clockMinutes(availableFrom)
  const until = clockMinutes(availableUntil)
  const start = clockMinutes(slot.startTime.slice(11))
  const end = clockMinutes(slot.endTime.slice(11))
  if (from === null || until === null) return false
  return start < until && end > from
}

export function clockMinutes(value: string): number {
  const match = /(\d{2}):(\d{2})$/.exec(value)
  if (!match) return 0
  return Number(match[1]) * 60 + Number(match[2])
}

export function formatDemoDate(stamp: string): string {
  const [datePart] = stamp.split("T")
  const [year, month, day] = datePart.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date)
  const monthName = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date)
  return `${weekday}, ${date.getDate()} ${monthName}`
}

export function formatDemoRange(slot: DemoSlot): string {
  return `${formatClock(clockMinutes(slot.startTime))}–${formatClock(clockMinutes(slot.endTime))}`
}

export function demoStatusLabel(status: DemoSlotStatus): string {
  if (status === "demo_available") return "Demo slot — illustrative only"
  if (status === "demo_unavailable") return "Demo unavailable — illustrative only"
  return "Real availability unknown"
}

export function describeDemoSlot(slot: DemoSlot): string {
  const note = slot.conditionsNote ? ` ${slot.conditionsNote}` : ""
  return `${formatDemoDate(slot.startTime)} ${formatDemoRange(slot)} ${ACTIVITY_LABELS[slot.sport]} ${slot.durationMinutes} min ${demoStatusLabel(slot.status)}${note}`
}

function profile(
  facilityId: string,
  sport: ActivityId,
  spaceName: string,
  note: string | null,
  conflictGroup: string | null,
  days: Week,
): DemoScheduleProfile {
  return { facilityId, sport, spaceName, note, conflictGroup, days }
}

function profileFor(facilityId: string, sport: ActivityId): DemoScheduleProfile {
  const plan = DEMO_SCHEDULE_PROFILES.find((item) => item.facilityId === facilityId && item.sport === sport)
  if (!plan) throw new Error(`Missing demo profile for ${facilityId} ${sport}`)
  return plan
}

function assertProfilesMatchFacilities(facilities: readonly Facility[]): void {
  const seen = new Set<string>()
  for (const plan of DEMO_SCHEDULE_PROFILES) {
    const key = `${plan.facilityId}|${plan.sport}`
    if (seen.has(key)) throw new Error(`Duplicate demo profile ${key}`)
    seen.add(key)
    const facility = facilities.find((item) => item.id === plan.facilityId)
    if (!facility) throw new Error(`Demo profile names an unknown facility ${plan.facilityId}`)
    if (missingScheduleReason(facility)) {
      throw new Error(`Demo profile ${key} is not allowed for this facility`)
    }
    const activity = facility.activities.find((item) => item.id === plan.sport)
    if (!activity) throw new Error(`Demo profile ${key} is not a listed activity`)
    if (activity.spaceName !== plan.spaceName) {
      throw new Error(`Demo profile ${key} uses a room that is not in the facility data`)
    }
  }

  for (const facility of facilities) {
    if (missingScheduleReason(facility)) continue
    for (const activity of facility.activities) {
      if (!seen.has(`${facility.id}|${activity.id}`)) {
        throw new Error(`No demo profile for ${facility.id} ${activity.id}`)
      }
    }
  }
}

function parseDay(spec: string, label: string): ParsedInterval[] {
  const tokens = spec.trim().split(/\s+/).filter(Boolean)
  const intervals = tokens.map((token) => {
    const match = TOKEN.exec(token)
    if (!match) throw new Error(`Invalid demo interval "${token}" in ${label}`)
    const start = Number(match[1]) * 60 + Number(match[2])
    const end = Number(match[3]) * 60 + Number(match[4])
    const duration = end - start
    if (duration < 30 || duration > 180) {
      throw new Error(`Invalid demo duration ${duration} for "${token}" in ${label}`)
    }
    return {
      start,
      end,
      status: match[5] === "a" ? "demo_available" : "demo_unavailable",
    } satisfies ParsedInterval
  })
  const ordered = [...intervals].sort((left, right) => left.start - right.start || left.end - right.end)
  for (let index = 1; index < ordered.length; index += 1) {
    if (ordered[index - 1].end > ordered[index].start) {
      throw new Error(`Overlapping demo intervals in ${label}`)
    }
  }
  return intervals
}

function assertNoConflicts(slots: DemoSlot[]): void {
  assertGroupFits(slots, (slot) => `${slot.facilityId}|${slot.spaceName}|${slot.startTime.slice(0, 10)}`)
  assertGroupFits(slots, (slot) => {
    const plan = profileFor(slot.facilityId, slot.sport)
    return plan.conflictGroup ? `${slot.facilityId}|${plan.conflictGroup}|${slot.startTime.slice(0, 10)}` : ""
  })
}

function assertGroupFits(slots: DemoSlot[], keyFor: (slot: DemoSlot) => string): void {
  const groups = new Map<string, DemoSlot[]>()
  for (const slot of slots) {
    const key = keyFor(slot)
    if (!key) continue
    const list = groups.get(key) ?? []
    list.push(slot)
    groups.set(key, list)
  }
  for (const [key, group] of groups) {
    const ordered = [...group].sort((left, right) => left.startTime.localeCompare(right.startTime))
    for (let index = 1; index < ordered.length; index += 1) {
      if (ordered[index - 1].endTime > ordered[index].startTime) {
        throw new Error(`Conflicting demo sessions in ${key}`)
      }
    }
  }
}

function makeSlot(
  facility: Facility,
  activity: SupportedActivity,
  day: Date,
  interval: ParsedInterval,
  plan: DemoScheduleProfile,
): DemoSlot {
  const start = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    Math.floor(interval.start / 60),
    interval.start % 60,
    0,
    0,
  )
  const end = new Date(start.getTime() + (interval.end - interval.start) * 60_000)
  const startTime = localStamp(start)
  const endTime = localStamp(end)
  return {
    id: `${facility.id}|${activity.id}|${startTime}`,
    facilityId: facility.id,
    sport: activity.id,
    startTime,
    endTime,
    status: interval.status,
    isDemo: true,
    sourceLabel: DEMO_SLOT_SOURCE_LABEL,
    durationMinutes: interval.end - interval.start,
    spaceName: activity.spaceName,
    conditionsNote: facility.kind === "outdoor-ice-rink" ? plan.note : null,
  }
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function localStamp(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}T${hour}:${minute}`
}
