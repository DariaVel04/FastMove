import type { ScoredMatch, SortKey } from "../domain/types.ts"
import { compareRelevance } from "./match.ts"

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
