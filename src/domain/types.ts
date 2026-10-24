export const ACTIVITY_IDS = [
  "gym",
  "functional-training",
  "badminton",
  "tennis",
  "table-tennis",
  "basketball",
  "volleyball",
  "football",
  "futsal",
  "floorball",
  "swimming",
  "figure-skating",
  "ice-hockey",
  "outdoor-ice",
  "gymnastics",
  "martial-arts",
  "other-indoor",
] as const

export type ActivityId = (typeof ACTIVITY_IDS)[number]

export const AVAILABLE_MINUTES = [60, 90, 120, 180] as const

export type AvailableMinutes = (typeof AVAILABLE_MINUTES)[number]

/** Maximum time for the whole outing, including travel both ways. */
export const MAX_OUTING_OPTIONS = [45, 60, 90, 120, 180] as const

export type MaxOutingMinutes = (typeof MAX_OUTING_OPTIONS)[number]

/** Shortest workout the user still wants. */
export const MIN_WORKOUT_OPTIONS = [30, 45, 60, 90] as const

export type MinWorkoutMinutes = (typeof MIN_WORKOUT_OPTIONS)[number]

export const TRANSPORT_MODES = ["walking", "cycling", "public-transport", "car"] as const

export type TransportMode = (typeof TRANSPORT_MODES)[number]

export type SortKey = "relevance" | "travel"

export type SearchQuery = {
  activityId: ActivityId
  /** Same-day clock time, `HH:MM`. */
  availableFrom: string
  /** Same-day clock time, `HH:MM`. Must be later than availableFrom. */
  availableUntil: string
  maxOutingMinutes: MaxOutingMinutes
  minWorkoutMinutes: MinWorkoutMinutes
  transport: TransportMode
  startingPointId: string
}

/**
 * Availability in this MVP is demonstration data, so a record cannot be
 * marked as checked in Timmi without changing this type.
 */
export type Provenance = {
  status: "demonstration" | "city-published"
  sourceName: string
  sourceUrl?: string
  /** Set only when the cited page prints an update date. */
  pageUpdated?: string
  verifiedInTimmi: false
  summary: string
}

export type CoordinateSource = {
  provider: "LIPAS" | "OpenStreetMap Nominatim"
  retrievedOn: "2026-10-24"
  query: string
  matchedName: string
  note: string
  sourceUrl?: string
  /** LIPAS record event-date. Not an availability timestamp. */
  recordEventDate?: string
}

export const FACILITY_KINDS = [
  "sports-centre",
  "swimming-pool",
  "open-air-pool",
  "ice-arena",
  "outdoor-ice-rink",
] as const

export type FacilityKind = (typeof FACILITY_KINDS)[number]

/**
 * Opening hours and ice condition stay separate from the permanent place.
 * Unknown sessions stay unknown. A published closure is not a live sensor.
 */
export type PlaceSchedule =
  | {
      state: "demonstration-examples"
      label: "Demonstration examples"
      detail: string
    }
  | {
      state: "not-loaded"
      label: "Schedule not loaded"
      detail: string
      sourceUrl: string
    }
  | {
      state: "seasonal-check"
      label: "Seasonal — check current conditions"
      detail: string
      sourceUrl: string
    }
  | {
      state: "published-closed"
      label: "Season ended on the city page"
      detail: string
      sourceUrl: string
    }

export type SupportedActivity = {
  id: ActivityId
  spaceName: string
  detail: string
  /** Guest calendar link copied from the City of Tampere ticket page. */
  timmiUrl?: string
}

export const DEMO_SLOT_SOURCE_LABEL = "DEMO DATA — NOT LIVE AVAILABILITY"

export type DemoSlotStatus = "demo_available" | "demo_unavailable" | "unknown"

/** A fictional timetable row. Never a live booking. */
export type DemoSlot = {
  id: string
  facilityId: string
  sport: ActivityId
  /** Local date and time, `YYYY-MM-DDTHH:mm`, without a UTC shift. */
  startTime: string
  endTime: string
  status: DemoSlotStatus
  isDemo: true
  sourceLabel: typeof DEMO_SLOT_SOURCE_LABEL
  durationMinutes: number
  spaceName: string
  /** Set when the row must not be read as a real open session, such as outdoor ice. */
  conditionsNote: string | null
}

export type ScheduleCoverage = {
  facilityId: string
  state: "demo-generated" | "unknown"
  reason: string | null
  slotCount: number
}

export type AvailabilitySlot = {
  id: string
  activityId: ActivityId
  spaceName: string
  durationMinutes: number
  exampleWindow: string
  provenance: Provenance
}

export type Facility = {
  id: string
  name: string
  localName: string
  area: string
  address: string
  latitude: number
  longitude: number
  coordinateSource: CoordinateSource
  kind: FacilityKind
  activities: SupportedActivity[]
  slots: AvailabilitySlot[]
  /** Session times, season and closure. Not a substitute for a permanent feature of the place. */
  schedule: PlaceSchedule
  /** City-documented uses that are not a confirmed match for the selected activities. */
  otherDocumentedUses?: string
  infoUrl: string
  programme: Provenance
}

export type StartingPoint = {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  coordinateSource: CoordinateSource
}

/** A search origin. Device locations are kept in memory for the current search only. */
export type MapOrigin = {
  id: string
  name: string
  detail: string
  latitude: number
  longitude: number
  sourceNote: string
}

export type TravelEstimate = {
  mode: TransportMode
  straightLineKm: number
  assumedRoadKm: number
  outboundMinutes: number
  returnMinutes: number
  roundTripMinutes: number
  label: "demonstration-estimate"
  method: string
}

export type TimeFit = {
  outboundMinutes: number
  returnMinutes: number
  roundTripMinutes: number
  remainingMinutes: number
  /**
   * For a demonstration slot this is the usable exercise time.
   * When the session length is unknown it is only the time left after travel.
   */
  exerciseMinutes: number
  /** False when no session length is on record. */
  sessionKnown: boolean
  fits: boolean
}

export type ScoreBreakdown = {
  travelConvenience: number
  timeFit: number
  dataConfidence: number
  index: number
}

export type ScoredMatch = {
  facility: Facility
  activity: SupportedActivity
  /** Null when the place is confirmed but no session length is on record. */
  slot: AvailabilitySlot | null
  /** Demo rows inside the searched time of day. Includes unavailable illustrations. */
  windowSlots: DemoSlot[]
  travel: TravelEstimate
  timeFit: TimeFit
  score: ScoreBreakdown
  reasons: string[]
  isBest: boolean
}

export type ScheduleNote = {
  facilityId: string
  facilityName: string
  message: string
}

export type TimeExclusion = {
  facilityId: string
  facilityName: string
  bestRemainingMinutes: number
  outboundMinutes: number
  returnMinutes: number
  windowSlots: DemoSlot[]
}

export type MatchOutcome = {
  /** Demonstration examples and places whose calendars are not loaded. Not confirmed free slots. */
  results: ScoredMatch[]
  /**
   * Slots whose start and end came from a booking or public-session source.
   * This stays empty until such a source is connected. It is not filled with examples.
   */
  confirmed: ScoredMatch[]
  timeExclusions: TimeExclusion[]
  scheduleNotes: ScheduleNote[]
  activitySupportedCount: number
}
