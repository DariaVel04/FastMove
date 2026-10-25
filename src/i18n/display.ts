import type { ActivityId, DemoSlotStatus, FacilityKind, ScoredMatch, TimeExclusion, TransportMode } from "../domain/types.ts"
import { formatDemoDate, clockMinutes } from "../data/demoSchedule.ts"
import { ACTIVITY_CATALOG, FACILITY_KIND_LABELS } from "../data/sources.ts"
import { formatClock } from "../lib/slotMatch.ts"
import { facilities } from "../data/facilities.ts"
import { describeActivityGap, describeTimeExclusions } from "../lib/match.ts"
import { matchSummaryLines } from "../lib/present.ts"
import { formatStraightLineDistance, TRAVEL_MODEL } from "../lib/travel.ts"
import { phrase } from "./phrases.ts"
import { translate, type MessageKey } from "./translations.ts"
import type { Language } from "./types.ts"

const SPORT_KEYS: Record<ActivityId, MessageKey> = {
  gym: "sport.gym",
  "functional-training": "sport.functional-training",
  badminton: "sport.badminton",
  tennis: "sport.tennis",
  "table-tennis": "sport.table-tennis",
  basketball: "sport.basketball",
  volleyball: "sport.volleyball",
  football: "sport.football",
  futsal: "sport.futsal",
  floorball: "sport.floorball",
  swimming: "sport.swimming",
  "figure-skating": "sport.figure-skating",
  "ice-hockey": "sport.ice-hockey",
  "outdoor-ice": "sport.outdoor-ice",
  gymnastics: "sport.gymnastics",
  "martial-arts": "sport.martial-arts",
  "other-indoor": "sport.other-indoor",
}

const TRANSPORT_KEYS: Record<TransportMode, MessageKey> = {
  walking: "transport.walking",
  cycling: "transport.cycling",
  "public-transport": "transport.public-transport",
  car: "transport.car",
}

const KIND_KEYS: Record<FacilityKind, MessageKey> = {
  "sports-centre": "kind.sports-centre",
  "swimming-pool": "kind.swimming-pool",
  "open-air-pool": "kind.open-air-pool",
  "ice-arena": "kind.ice-arena",
  "outdoor-ice-rink": "kind.outdoor-ice-rink",
}

const GROUP_KEYS: Record<string, MessageKey> = {
  Fitness: "group.fitness",
  "Racket Sports": "group.racket",
  "Ball Sports": "group.ball",
  Other: "group.other",
  "Not named on the ticket page": "group.unnamed",
  "Not the Liikkuva Tampere ticket": "group.notTicket",
}

export function sportLabel(language: Language, activityId: ActivityId): string {
  return translate(language, SPORT_KEYS[activityId])
}

export function transportLabel(language: Language, mode: TransportMode): string {
  return translate(language, TRANSPORT_KEYS[mode])
}

export function kindLabel(language: Language, kind: FacilityKind): string {
  if (language === "en") return FACILITY_KIND_LABELS[kind]
  return translate(language, KIND_KEYS[kind])
}

export function groupLabel(language: Language, label: string): string {
  const key = GROUP_KEYS[label]
  return key ? translate(language, key) : label
}

export function formatLocalizedDemoDate(stamp: string, language: Language): string {
  if (language === "en") return formatDemoDate(stamp)
  const [datePart] = stamp.split("T")
  const [year, month, day] = datePart.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat("fi-FI", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
  }).format(date)
}

export function formatLocalizedClock(totalMinutes: number, language: Language): string {
  const clock = formatClock(totalMinutes)
  return language === "fi" ? clock.replace(":", ".") : clock
}

export function localizedDistance(kilometres: number | null | undefined, language: Language): string | null {
  if (language === "en") return formatStraightLineDistance(kilometres)
  if (kilometres == null || !Number.isFinite(kilometres) || kilometres < 0) return null
  if (kilometres < 1) {
    const metres = Math.round((kilometres * 1000) / 50) * 50
    return translate(language, "distance.metres", { metres })
  }
  const kilometresLabel = (Math.round(kilometres * 10) / 10).toFixed(1).replace(".", ",")
  return translate(language, "distance.kilometres", { kilometres: kilometresLabel })
}

export function facilityTitle(name: string, localName: string, language: Language): string {
  return language === "fi" ? localName : name
}

function demoWhen(result: ScoredMatch, language: Language): string | null {
  if (!result.slot?.exampleWindow) return null
  if (language === "en") return result.slot.exampleWindow
  const demo = result.windowSlots.find((slot) => slot.id === result.slot?.id)
  if (!demo) return result.slot.exampleWindow
  const start = formatLocalizedClock(clockMinutes(demo.startTime), language)
  const end = formatLocalizedClock(clockMinutes(demo.endTime), language)
  return `${formatLocalizedDemoDate(demo.startTime, language)} · ${start}–${end}`
}

export function localizedSummary(result: ScoredMatch, language: Language): string[] {
  if (language === "en") return matchSummaryLines(result)
  const lines: string[] = []
  const when = demoWhen(result, language)
  const interval = result.chosenInterval
  if (interval && when) {
    lines.push(translate(language, "card.demoInterval", { when }))
    const partial =
      interval.usableStartMinutes !== interval.demoStartMinutes ||
      interval.usableEndMinutes !== interval.demoEndMinutes
    if (partial) {
      const demoDate = when.split(" · ")[0]
      const usable = `${demoDate} · ${formatLocalizedClock(interval.usableStartMinutes, language)}–${formatLocalizedClock(interval.usableEndMinutes, language)}`
      lines.push(translate(language, "card.usable", { when: usable }))
    }
  }
  lines.push(
    result.timeFit.sessionKnown
      ? translate(language, "card.workout", { minutes: result.timeFit.exerciseMinutes })
      : translate(language, "card.workoutUnknown"),
  )
  const sameLeg = result.timeFit.outboundMinutes === result.timeFit.returnMinutes
  const travel = sameLeg
    ? translate(language, "card.travelSame", { minutes: result.timeFit.outboundMinutes })
    : translate(language, "card.travelSplit", {
        out: result.timeFit.outboundMinutes,
        back: result.timeFit.returnMinutes,
      })
  const distance = localizedDistance(result.travel.straightLineKm, language)
  lines.push(distance ? `${distance}. ${travel}` : travel)
  const outing = result.timeFit.sessionKnown
    ? result.timeFit.outboundMinutes + result.timeFit.exerciseMinutes + result.timeFit.returnMinutes
    : null
  lines.push(outing === null ? translate(language, "card.outingUnknown") : translate(language, "card.outing", { minutes: outing }))
  lines.push(translate(language, "card.sport", { sport: sportLabel(language, result.activity.id) }))
  lines.push(
    result.slot?.provenance.status === "demonstration"
      ? translate(language, "card.statusDemo")
      : translate(language, "card.statusOther", { status: phrase(language, result.facility.schedule.label) }),
  )
  return lines
}

export function localizedReasons(result: ScoredMatch, language: Language): string[] {
  if (language === "en") return result.reasons
  const mode = transportLabel(language, result.travel.mode)
  const fit = result.timeFit
  if (!result.slot || !fit.sessionKnown) {
    return [
      phrase(language, result.activity.detail),
      translate(language, "reason.unknownTravel", {
        mode,
        minutes: fit.outboundMinutes,
        left: fit.remainingMinutes,
      }),
      phrase(language, result.facility.schedule.detail),
      translate(language, "reason.rankOnly"),
    ]
  }
  const reasons = [
    phrase(language, result.activity.detail),
    translate(language, "reason.knownTravel", {
      mode,
      minutes: fit.outboundMinutes,
      exercise: fit.exerciseMinutes,
    }),
  ]
  if (!fit.fits) {
    reasons.push(translate(language, "reason.fictional"))
    return reasons
  }
  if (fit.remainingMinutes > result.slot.durationMinutes) {
    reasons.push(
      translate(language, "reason.slotShorter", {
        slot: result.slot.durationMinutes,
        left: fit.remainingMinutes,
      }),
    )
  } else if (fit.remainingMinutes < result.slot.durationMinutes) {
    reasons.push(
      translate(language, "reason.timeShorter", {
        slot: result.slot.durationMinutes,
        exercise: fit.exerciseMinutes,
      }),
    )
  } else {
    reasons.push(translate(language, "reason.same", { slot: result.slot.durationMinutes }))
  }
  reasons.push(translate(language, "reason.fictional"))
  if (result.facility.schedule.state === "seasonal-check") reasons.push(translate(language, "reason.ice"))
  return reasons
}

export function localizedTravelMethod(mode: TransportMode, language: Language, english: string): string {
  if (language === "en") return english
  const access = TRAVEL_MODEL.accessMinutes[mode]
  return (
    translate(language, "travel.method", { factor: TRAVEL_MODEL.detourFactor, speed: TRAVEL_MODEL.speedsKmh[mode] }) +
    (access > 0 ? translate(language, "travel.access", { minutes: access }) : "") +
    (mode === "car" ? translate(language, "travel.parking") : "") +
    translate(language, "travel.return")
  )
}

export function localizedExclusionText(
  exclusions: TimeExclusion[],
  activityId: ActivityId,
  maxOutingMinutes: number,
  minWorkoutMinutes: number,
  language: Language,
): string | null {
  if (language === "en") {
    return describeTimeExclusions(exclusions, activityId, maxOutingMinutes, minWorkoutMinutes)
  }
  if (exclusions.length === 0) return null
  const names = exclusions
    .map((item) => {
      const facility = facilities.find((place) => place.id === item.facilityId)
      return facility ? facilityTitle(facility.name, facility.localName, language) : item.facilityName
    })
    .join(", ")
  return translate(language, exclusions.length === 1 ? "gap.one" : "gap.many", {
    names,
    sport: sportLabel(language, activityId),
    workout: minWorkoutMinutes,
    outing: maxOutingMinutes,
  })
}

export function localizedActivityGap(activityId: ActivityId, language: Language): string {
  if (language === "en") return describeActivityGap(activityId)
  const activity = ACTIVITY_CATALOG[activityId]
  const key = activity.status === "needs-verification" ? "gap.unverified" : "gap.none"
  return translate(language, key, {
    sport: sportLabel(language, activityId),
    summary: phrase(language, activity.summary),
  })
}

export function demoStatusText(status: DemoSlotStatus, language: Language): string {
  if (status === "demo_available") return translate(language, "schedule.available")
  if (status === "demo_unavailable") return translate(language, "schedule.unavailable")
  return translate(language, "schedule.unknown")
}
