import type { ScoredMatch, SortKey } from "../domain/types.ts"
import { ACTIVITY_LABELS } from "../data/sources.ts"
import { compareRelevance } from "./match.ts"
import { formatClock } from "./slotMatch.ts"

export const RESULT_DEMO_NOTE =
  "Demo data — illustrative schedules only, not real facility availability."

/** Matching options are results with a demo interval that fits. Exclusions are not counted. */
export function countMatchingOptions(results: ScoredMatch[]): number {
  return results.filter(
    (result) => result.slot !== null && result.timeFit.fits && result.chosenInterval !== null,
  ).length
}

export function foundOptionsLabel(count: number): string {
  return `Found ${count} ${count === 1 ? "option" : "options"}`
}

export function matchSummaryLines(result: ScoredMatch): string[] {
  const lines: string[] = []
  const interval = result.chosenInterval
  if (interval) {
    lines.push(
      `Demo interval: ${formatClock(interval.demoStartMinutes)}–${formatClock(interval.demoEndMinutes)}`,
    )
    const partial =
      interval.usableStartMinutes !== interval.demoStartMinutes ||
      interval.usableEndMinutes !== interval.demoEndMinutes
    if (partial) {
      lines.push(
        `Usable in your window: ${formatClock(interval.usableStartMinutes)}–${formatClock(interval.usableEndMinutes)}`,
      )
    }
  }
  lines.push(`Sport: ${ACTIVITY_LABELS[result.activity.id]}`)
  const sameLeg = result.timeFit.outboundMinutes === result.timeFit.returnMinutes
  lines.push(
    sameLeg
      ? `Estimated travel: ${result.timeFit.outboundMinutes} min each way`
      : `Estimated travel: ${result.timeFit.outboundMinutes} min out, ${result.timeFit.returnMinutes} min back`,
  )
  lines.push(
    result.timeFit.sessionKnown
      ? `Suggested workout: ${result.timeFit.exerciseMinutes} min`
      : "Suggested workout: Not confirmed",
  )
  const outing = result.timeFit.sessionKnown
    ? result.timeFit.outboundMinutes + result.timeFit.exerciseMinutes + result.timeFit.returnMinutes
    : null
  lines.push(outing === null ? "Total outing: Not confirmed" : `Total outing: ${outing} min`)
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
  const bestId = byRelevance[0]?.facility.id
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
