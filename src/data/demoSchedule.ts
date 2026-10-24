import type { ActivityId, DemoSlot, DemoSlotStatus, Facility, ScheduleCoverage, SupportedActivity } from "../domain/types.ts"
import { DEMO_SLOT_SOURCE_LABEL } from "../domain/types.ts"
import { ACTIVITY_LABELS } from "./sources.ts"
import { formatClock } from "../lib/slotMatch.ts"

type Block = {
  startHour: number
  startMinute: number
  durationMinutes: number
  status: Exclude<DemoSlotStatus, "unknown">
}

const GYM_BLOCKS: Block[] = [
  { startHour: 7, startMinute: 30, durationMinutes: 30, status: "demo_unavailable" },
  { startHour: 9, startMinute: 0, durationMinutes: 60, status: "demo_available" },
  { startHour: 12, startMinute: 0, durationMinutes: 90, status: "demo_available" },
  { startHour: 17, startMinute: 0, durationMinutes: 45, status: "demo_unavailable" },
  { startHour: 18, startMinute: 0, durationMinutes: 60, status: "demo_available" },
]

const HALL_BLOCKS: Block[] = [
  { startHour: 9, startMinute: 0, durationMinutes: 90, status: "demo_unavailable" },
  { startHour: 11, startMinute: 0, durationMinutes: 60, status: "demo_available" },
  { startHour: 14, startMinute: 0, durationMinutes: 120, status: "demo_available" },
  { startHour: 16, startMinute: 30, durationMinutes: 45, status: "demo_unavailable" },
  { startHour: 18, startMinute: 0, durationMinutes: 90, status: "demo_available" },
]

const POOL_BLOCKS: Block[] = [
  { startHour: 6, startMinute: 30, durationMinutes: 45, status: "demo_unavailable" },
  { startHour: 10, startMinute: 0, durationMinutes: 60, status: "demo_available" },
  { startHour: 14, startMinute: 0, durationMinutes: 45, status: "demo_available" },
  { startHour: 16, startMinute: 0, durationMinutes: 60, status: "demo_unavailable" },
  { startHour: 18, startMinute: 0, durationMinutes: 60, status: "demo_available" },
]

const HOCKEY_BLOCKS: Block[] = [
  { startHour: 10, startMinute: 0, durationMinutes: 90, status: "demo_unavailable" },
  { startHour: 14, startMinute: 0, durationMinutes: 60, status: "demo_available" },
  { startHour: 16, startMinute: 0, durationMinutes: 90, status: "demo_available" },
  { startHour: 19, startMinute: 0, durationMinutes: 60, status: "demo_unavailable" },
]

const SKATING_BLOCKS: Block[] = [
  { startHour: 12, startMinute: 0, durationMinutes: 45, status: "demo_available" },
  { startHour: 13, startMinute: 0, durationMinutes: 60, status: "demo_unavailable" },
  { startHour: 18, startMinute: 0, durationMinutes: 60, status: "demo_available" },
  { startHour: 20, startMinute: 0, durationMinutes: 45, status: "demo_unavailable" },
]

const OUTDOOR_BLOCKS: Block[] = [
  { startHour: 14, startMinute: 0, durationMinutes: 60, status: "demo_unavailable" },
  { startHour: 16, startMinute: 0, durationMinutes: 90, status: "demo_available" },
  { startHour: 18, startMinute: 0, durationMinutes: 60, status: "demo_available" },
]

const OUTDOOR_NOTE =
  "Seasonal demo session. Real ice conditions are not verified, and this does not mean the rink is open."

const DAY_COUNT = 7

export function missingScheduleReason(facility: Facility): string | null {
  if (facility.schedule.state === "published-closed") {
    return "The city page says this season has ended, so FastMove does not generate demo sessions that would look open."
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
  const today = startOfLocalDay(now)
  const slots: DemoSlot[] = []
  const coverage: ScheduleCoverage[] = []

  for (const facility of facilities) {
    const reason = missingScheduleReason(facility)
    if (reason) {
      coverage.push({ facilityId: facility.id, state: "unknown", reason, slotCount: 0 })
      continue
    }

    const facilitySlots = slotsForFacility(facility, today)
    slots.push(...facilitySlots)
    coverage.push({
      facilityId: facility.id,
      state: "demo-generated",
      reason: null,
      slotCount: facilitySlots.length,
    })
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
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(date)
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

function slotsForFacility(facility: Facility, today: Date): DemoSlot[] {
  const sharesIce = facility.activities.some((activity) => activity.id === "ice-hockey") &&
    facility.activities.some((activity) => activity.id === "figure-skating")
  const groups = new Map<string, SupportedActivity[]>()
  for (const activity of facility.activities) {
    const key = activity.spaceName
    const list = groups.get(key) ?? []
    list.push(activity)
    groups.set(key, list)
  }

  const slots: DemoSlot[] = []
  for (const activities of groups.values()) {
    const blocks = blocksFor(facility, activities[0].id, sharesIce)
    for (let dayIndex = 0; dayIndex < DAY_COUNT; dayIndex += 1) {
      const day = addDays(today, dayIndex)
      const assigned = activities.length === 1
        ? blocks.map((block) => ({ block, activity: activities[0] }))
        : blocks.map((block, index) => ({
            block,
            activity: activities[(dayIndex + index) % activities.length],
          }))
      for (const { block, activity } of assigned) {
        slots.push(makeSlot(facility, activity, day, block))
      }
    }
  }
  return slots
}

function blocksFor(facility: Facility, sport: ActivityId, sharesIce: boolean): Block[] {
  if (facility.kind === "outdoor-ice-rink") return OUTDOOR_BLOCKS
  if (facility.kind === "swimming-pool") return POOL_BLOCKS
  if (sport === "ice-hockey") return sharesIce ? HOCKEY_BLOCKS.filter((block) => block.startHour < 19) : HOCKEY_BLOCKS
  if (sport === "figure-skating") return SKATING_BLOCKS
  if (
    sport === "gym" ||
    sport === "functional-training" ||
    sport === "martial-arts" ||
    sport === "table-tennis" ||
    sport === "gymnastics"
  ) {
    return GYM_BLOCKS
  }
  return HALL_BLOCKS
}

function makeSlot(facility: Facility, activity: SupportedActivity, day: Date, block: Block): DemoSlot {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), block.startHour, block.startMinute, 0, 0)
  const end = new Date(start.getTime() + block.durationMinutes * 60_000)
  const startTime = localStamp(start)
  const endTime = localStamp(end)
  return {
    id: `${facility.id}|${activity.id}|${startTime}`,
    facilityId: facility.id,
    sport: activity.id,
    startTime,
    endTime,
    status: block.status,
    isDemo: true,
    sourceLabel: DEMO_SLOT_SOURCE_LABEL,
    durationMinutes: block.durationMinutes,
    spaceName: activity.spaceName,
    conditionsNote: facility.kind === "outdoor-ice-rink" ? OUTDOOR_NOTE : null,
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
