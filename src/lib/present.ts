import type { ScoredMatch, SortKey } from "../domain/types.ts"
import { ACTIVITY_LABELS, URLS } from "../data/sources.ts"
import { compareRelevance } from "./match.ts"
import { formatClock } from "./slotMatch.ts"
import { formatStraightLineDistance } from "./travel.ts"

export const RESULT_DEMO_NOTE =
  "Based on illustrative demo schedules — real availability is not verified. Check Timmi before you go."

export const DEMO_CARD_NOTE = "Illustrative schedule only — real availability is not verified."

/** Ticket membership comes from the facility programme URL, not from the place name. */
export function ticketCoverageLabel(sourceUrl: string | undefined): "Liikkuva Tampere ticket" | "Not covered by this ticket" {
  return sourceUrl === URLS.ticket ? "Liikkuva Tampere ticket" : "Not covered by this ticket"
}

/** Matching options are results with a demo interval that fits. Exclusions are not counted. */
export function countMatchingOptions(results: ScoredMatch[]): number {
  return results.filter(
    (result) => result.slot !== null && result.timeFit.fits && result.chosenInterval !== null,
  ).length
}

export function foundOptionsLabel(count: number): string {
  return `Found ${count} matching ${count === 1 ? "option" : "options"}`
}

export function matchSummaryLines(result: ScoredMatch): string[] {
  const lines: string[] = []
  const interval = result.chosenInterval
  if (interval && result.slot?.exampleWindow) {
    lines.push(`Demo interval: ${result.slot.exampleWindow}`)
    const partial =
      interval.usableStartMinutes !== interval.demoStartMinutes ||
      interval.usableEndMinutes !== interval.demoEndMinutes
    if (partial) {
      const demoDate = result.slot.exampleWindow.split(" · ")[0]
      lines.push(
        `Usable in your window: ${demoDate} · ${formatClock(interval.usableStartMinutes)}–${formatClock(interval.usableEndMinutes)}`,
      )
    }
  }
  lines.push(
    result.timeFit.sessionKnown
      ? `Suggested workout: ${result.timeFit.exerciseMinutes} min`
      : "Suggested workout: Not confirmed",
  )
  const sameLeg = result.timeFit.outboundMinutes === result.timeFit.returnMinutes
  const travel = sameLeg
    ? `Estimated travel: ${result.timeFit.outboundMinutes} min each way. Not a routed journey.`
    : `Estimated travel: ${result.timeFit.outboundMinutes} min out, ${result.timeFit.returnMinutes} min back. Not a routed journey.`
  const distance = formatStraightLineDistance(result.travel.straightLineKm)
  lines.push(distance ? `${distance}. ${travel}` : travel)
  const outing = result.timeFit.sessionKnown
    ? result.timeFit.outboundMinutes + result.timeFit.exerciseMinutes + result.timeFit.returnMinutes
    : null
  lines.push(outing === null ? "Total outing: Not confirmed" : `Total outing: ${outing} min`)
  lines.push(`Sport: ${ACTIVITY_LABELS[result.activity.id]}`)
  lines.push(
    result.slot?.provenance.status === "demonstration" ? "Status: DEMO DATA" : `Status: ${result.facility.schedule.label}`,
  )
  return lines
}

export const LONGER_VISIT_MINUTES = 45

export function presentMatches(
  results: ScoredMatch[],
  options: { sort: SortKey; minimumExerciseMinutes: number | null },
): ScoredMatch[] {
  const minimumExerciseMinutes = options.minimumExerciseMinutes
  const filtered =
    minimumExerciseMinutes === null
      ? results
      : results.filter((result) => result.timeFit.exerciseMinutes >= minimumExerciseMinutes)

  const byRelevance = [...filtered].sort(compareRelevance)
  const bestId = byRelevance.find((result) => result.slot?.provenance.status === "demonstration")?.facility.id
  const ordered =
    options.sort === "travel"
      ? [...filtered].sort(
          (left, right) =>
            left.timeFit.outboundMinutes - right.timeFit.outboundMinutes ||
            compareRelevance(left, right),
        )
      : byRelevance

  return ordered.map((result) => ({
    ...result,
    isBest: result.facility.id === bestId,
  }))
}
