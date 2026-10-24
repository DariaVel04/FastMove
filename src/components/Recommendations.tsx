import type { MapOrigin, ScheduleNote, ScoredMatch, SortKey, TimeExclusion, TransportMode } from "../domain/types.ts"
import { facilities } from "../data/facilities.ts"
import { URLS } from "../data/sources.ts"
import { countMatchingOptions, foundOptionsLabel, RESULT_DEMO_NOTE } from "../lib/present.ts"
import { googleMapsDirectionsUrl } from "../lib/directions.ts"
import { ExternalLink } from "./ExternalLink.tsx"
import { DemoSchedule } from "./DemoSchedule.tsx"
import { ResultCard } from "./ResultCard.tsx"

type RecommendationsProps = {
  hasSearched: boolean
  visible: ScoredMatch[]
  timeExclusionText: string | null
  activityGapText: string | null
  scheduleNotes: ScheduleNote[]
  timeExclusions: TimeExclusion[]
  minWorkoutMinutes: number
  transport: TransportMode | null
  sort: SortKey
  selectedFacilityId: string | null
  onSortChange: (sort: SortKey) => void
  onShowOnMap: (facilityId: string) => void
  directionsOrigin: MapOrigin | null
}

export function Recommendations({
  hasSearched,
  visible,
  timeExclusionText,
  activityGapText,
  scheduleNotes,
  timeExclusions,
  minWorkoutMinutes,
  transport,
  sort,
  selectedFacilityId,
  onSortChange,
  onShowOnMap,
  directionsOrigin,
}: RecommendationsProps) {
  const examples = visible.filter((result) => result.slot !== null && result.timeFit.fits)
  const unconfirmed = visible.filter((result) => result.slot === null)
  const matchCount = countMatchingOptions(visible)
  return (
    <section id="results" className="results" aria-labelledby="results-title" aria-live="polite">
      <div className="section-heading">
        <h2 id="results-title">Recommendations</h2>
        <p>Confirmed slots first. Examples and unloaded calendars stay separate.</p>
      </div>

      {!hasSearched ? (
        <div className="empty-state">
          <h3>Your matches will appear here.</h3>
          <p>
            Choose a sport, the hours you are free, how long the outing can be and the shortest
            workout you want. Then enable your location. Confirmed slots appear only when a schedule
            source provides them.
          </p>
        </div>
      ) : (
        <>
          <p className="found-options">{foundOptionsLabel(matchCount)}</p>
          <p className="demo-notice">{RESULT_DEMO_NOTE}</p>
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
          </div>

          {matchCount === 0 ? (
            <div className="empty-state" role="status">
              <p>No demo interval fits this search. This does not mean the facilities are fully booked.</p>
              {activityGapText ? <p>{activityGapText}</p> : null}
              <p className="link-row">
                <ExternalLink href={URLS.timmiApp}>Open the Timmi calendar</ExternalLink>
                <ExternalLink href={URLS.ticket}>Liikkuva Tampere ticket page</ExternalLink>
              </p>
            </div>
          ) : (
            <div className="result-list">
              {examples.map((result) => (
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

          {unconfirmed.length > 0 ? (
            <div className="result-group">
              <h3>Schedules not loaded</h3>
              <p className="field-note">
                These places support the activity in the city sources, but FastMove has no confirmed
                interval for them. Check the linked page before you go.
              </p>
              <div className="result-list">
                {unconfirmed.map((result) => (
                  <ResultCard
                    key={result.facility.id}
                    result={result}
                    selected={selectedFacilityId === result.facility.id}
                    onShowOnMap={onShowOnMap}
                    directionsOrigin={directionsOrigin}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {timeExclusions.length > 0 ? (
            <div className="result-group">
              <h3>Outside this outing</h3>
              <p className="field-note">
                These places support the selected sport. The estimated journey does not leave{" "}
                {minWorkoutMinutes} minutes to exercise. This is not a full booking calendar.
              </p>
              <div className="result-list">
                {timeExclusions.map((exclusion) => (
                  <OutingMiss
                    key={exclusion.facilityId}
                    exclusion={exclusion}
                    minWorkoutMinutes={minWorkoutMinutes}
                    transport={transport}
                    directionsOrigin={directionsOrigin}
                    selected={selectedFacilityId === exclusion.facilityId}
                    onShowOnMap={onShowOnMap}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {timeExclusionText ? <p className="exclusion-note">{timeExclusionText}</p> : null}
          {scheduleNotes.map((note) => (
            <p className="exclusion-note" key={note.facilityId}>
              {note.message}
            </p>
          ))}
        </>
      )}
    </section>
  )
}

function OutingMiss({
  exclusion,
  minWorkoutMinutes,
  transport,
  directionsOrigin,
  selected,
  onShowOnMap,
}: {
  exclusion: TimeExclusion
  minWorkoutMinutes: number
  transport: TransportMode | null
  directionsOrigin: MapOrigin | null
  selected: boolean
  onShowOnMap: (facilityId: string) => void
}) {
  const facility = facilities.find((item) => item.id === exclusion.facilityId)
  const directionsUrl =
    facility && transport
      ? googleMapsDirectionsUrl(
          facility,
          transport,
          directionsOrigin
            ? { latitude: directionsOrigin.latitude, longitude: directionsOrigin.longitude }
            : null,
        )
      : null
  const remaining =
    exclusion.bestRemainingMinutes < 0 ? 0 : exclusion.bestRemainingMinutes

  return (
    <article
      id={`result-${exclusion.facilityId}`}
      className={selected ? "result-card result-card--selected" : "result-card"}
    >
      <div className="card-topline">
        <p className="badge badge--schedule">Does not fit this outing</p>
      </div>
      <h3>{exclusion.facilityName}</h3>
      {facility ? (
        <p className="location">
          {facility.area} · {facility.address}
        </p>
      ) : null}
      <dl className="stats">
        <div>
          <dt>Travel</dt>
          <dd>
            {exclusion.outboundMinutes} min out, {exclusion.returnMinutes} min back
          </dd>
          <dd className="stat-note">Demonstration estimate</dd>
        </div>
        <div>
          <dt>Time left to exercise</dt>
          <dd>{remaining} min</dd>
          <dd className="stat-note">Minimum workout is {minWorkoutMinutes} min</dd>
        </div>
      </dl>
      <DemoSchedule slots={exclusion.windowSlots} />
      <p className="data-status">
        No demo-available slot in this window fits the outing. Raise the maximum outing, or lower the
        minimum workout, if this journey should be included. This is not a live booking calendar.
      </p>
      <div className="card-actions">
        {directionsUrl ? (
          <a className="directions-button" href={directionsUrl} target="_blank" rel="noreferrer">
            Get directions
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ) : null}
        <button type="button" className="secondary-button" onClick={() => onShowOnMap(exclusion.facilityId)}>
          Show on map
        </button>
        {facility ? <ExternalLink href={facility.infoUrl}>City of Tampere page</ExternalLink> : null}
      </div>
    </article>
  )
}
