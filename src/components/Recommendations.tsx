import type { MapOrigin, ScheduleNote, ScoredMatch, SortKey } from "../domain/types.ts"
import { LONGER_VISIT_MINUTES } from "../lib/present.ts"
import { ResultCard } from "./ResultCard.tsx"

type RecommendationsProps = {
  hasSearched: boolean
  visible: ScoredMatch[]
  matchedCount: number
  timeExclusionText: string | null
  activityGapText: string | null
  scheduleNotes: ScheduleNote[]
  sort: SortKey
  requireLongerVisit: boolean
  selectedFacilityId: string | null
  onSortChange: (sort: SortKey) => void
  onRequireLongerVisitChange: (next: boolean) => void
  onShowOnMap: (facilityId: string) => void
  directionsOrigin: MapOrigin | null
}

export function Recommendations({
  hasSearched,
  visible,
  matchedCount,
  timeExclusionText,
  activityGapText,
  scheduleNotes,
  sort,
  requireLongerVisit,
  selectedFacilityId,
  onSortChange,
  onRequireLongerVisitChange,
  onShowOnMap,
  directionsOrigin,
}: RecommendationsProps) {
  return (
    <section id="results" className="results" aria-labelledby="results-title" aria-live="polite">
      <div className="section-heading">
        <h2 id="results-title">Recommendations</h2>
        <p>Suitable facilities, ranked after the journey there and back.</p>
      </div>

      {!hasSearched ? (
        <div className="empty-state">
          <h3>Your matches will appear here.</h3>
          <p>
            Choose an activity, a time window and transport, then enable your location and select
            Find my best match. Activities that still need verification do not return a confirmed match.
            The map shows the listed places. Liikkuva Tampere halls use demonstration slots. Pools and ice places do not.
          </p>
        </div>
      ) : (
        <>
          <div className="result-controls">
            <label className="field field--inline" htmlFor="sort-results">
              Sort
              <select
                id="sort-results"
                value={sort}
                onChange={(event) => onSortChange(event.target.value as SortKey)}
              >
                <option value="relevance">Relevance</option>
                <option value="travel">Shortest travel</option>
              </select>
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                checked={requireLongerVisit}
                onChange={(event) => onRequireLongerVisitChange(event.target.checked)}
              />
              At least {LONGER_VISIT_MINUTES} minutes of exercise
            </label>
            <p className="result-count">
              Showing {visible.length} of {matchedCount} {matchedCount === 1 ? "match" : "matches"}
            </p>
          </div>

          {matchedCount === 0 ? (
            <div className="empty-state" role="status">
              <h3>No facility fits this search.</h3>
              {activityGapText ? <p>{activityGapText}</p> : null}
              {timeExclusionText ? <p>{timeExclusionText}</p> : null}
              {scheduleNotes.map((note) => (
                <p key={note.facilityId}>{note.message}</p>
              ))}
              {!activityGapText && !timeExclusionText && scheduleNotes.length === 0 ? (
                <p>No demonstration slot fits this search.</p>
              ) : null}
            </div>
          ) : visible.length === 0 ? (
            <div className="empty-state" role="status">
              <h3>No facility fits this filter.</h3>
              <p>
                Nothing in the current matches leaves {LONGER_VISIT_MINUTES} minutes to exercise.
                Clear the exercise-time filter to see shorter visits.
              </p>
            </div>
          ) : (
            <div className="result-list">
              {visible.map((result) => (
                <ResultCard
                  key={result.facility.id}
                  result={result}
                  selected={selectedFacilityId === result.facility.id}
                  onShowOnMap={onShowOnMap}
                  directionsOrigin={directionsOrigin}
                />
              ))}
            </div>
          )}

          {matchedCount > 0 && timeExclusionText ? (
            <p className="exclusion-note">{timeExclusionText}</p>
          ) : null}
          {matchedCount > 0
            ? scheduleNotes.map((note) => (
                <p className="exclusion-note" key={note.facilityId}>
                  {note.message}
                </p>
              ))
            : null}
        </>
      )}
    </section>
  )
}
