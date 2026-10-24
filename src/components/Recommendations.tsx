import type { MapOrigin, ScheduleNote, ScoredMatch, SortKey, TimeExclusion, TransportMode } from "../domain/types.ts"
import { facilities, unmatchedTicketRooms } from "../data/facilities.ts"
import { URLS } from "../data/sources.ts"
import { countMatchingOptions, DEMO_CARD_NOTE, foundOptionsLabel, RESULT_DEMO_NOTE, ticketCoverageLabel } from "../lib/present.ts"
import { googleMapsDirectionsUrl } from "../lib/directions.ts"
import { formatStraightLineDistance, straightLineKm } from "../lib/travel.ts"
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
  visitCautions: ScoredMatch[]
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
  visitCautions,
  minWorkoutMinutes,
  transport,
  sort,
  selectedFacilityId,
  onSortChange,
  onShowOnMap,
  directionsOrigin,
}: RecommendationsProps) {
  const onTicket = (sourceUrl: string | undefined) =>
    ticketCoverageLabel(sourceUrl) === "Liikkuva Tampere ticket"
  const examples = visible.filter(
    (result) => result.slot !== null && result.timeFit.fits && onTicket(result.facility.programme.sourceUrl),
  )
  const unconfirmed = visible.filter(
    (result) => result.slot === null && onTicket(result.facility.programme.sourceUrl),
  )
  const otherPlaces = visible.filter((result) => !onTicket(result.facility.programme.sourceUrl))
  const ticketExclusions = timeExclusions.filter((exclusion) => {
    const facility = facilities.find((item) => item.id === exclusion.facilityId)
    return facility ? onTicket(facility.programme.sourceUrl) : false
  })
  const otherExclusions = timeExclusions.filter((exclusion) => {
    const facility = facilities.find((item) => item.id === exclusion.facilityId)
    return facility ? !onTicket(facility.programme.sourceUrl) : false
  })
  const matchCount = countMatchingOptions(examples)
  return (
    <section id="results" className="results" aria-labelledby="results-title" aria-live="polite">
      <div className="section-heading">
        <h2 id="results-title">Recommendations</h2>
        <p>Places that match the hours, outing and workout you entered.</p>
      </div>

      {!hasSearched ? (
        <div className="empty-state">
          <h3>Your matches will appear here.</h3>
          <p>
            Choose a sport, the hours you are free, how long the outing can be and the shortest
            workout you want. Then use your location or a saved start point. Results use illustrative
            schedules, not live bookings.
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
                These places support the activity in the city sources, but FastMove has no loaded
                session for them. Check the linked page before you go.
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

          {visitCautions.length > 0 ? (
            <div className="result-group">
              <h3>Not a standard drop-in</h3>
              <p className="field-note">
                The city page limits who can use this room. It is not listed as a normal suggestion.
              </p>
              <div className="result-list">
                {visitCautions.map((result) => (
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

          {ticketExclusions.length > 0 ? (
            <div className="result-group">
              <h3>Outside this outing</h3>
              <p className="field-note">
                These places support the selected sport. The estimated journey does not leave{" "}
                {minWorkoutMinutes} minutes to exercise. This is not a full booking calendar.
              </p>
              <div className="result-list">
                {ticketExclusions.map((exclusion) => (
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

          {otherPlaces.length > 0 || otherExclusions.length > 0 ? (
            <div className="result-group">
              <h3>Other places, not covered by this ticket</h3>
              <p className="field-note">
                These places are in the city sources. They are not Liikkuva Tampere ticket rooms, and
                FastMove does not invent a free session for them.
              </p>
              <div className="result-list">
                {otherPlaces.map((result) => (
                  <ResultCard
                    key={result.facility.id}
                    result={result}
                    selected={selectedFacilityId === result.facility.id}
                    onShowOnMap={onShowOnMap}
                    directionsOrigin={directionsOrigin}
                  />
                ))}
                {otherExclusions.map((exclusion) => (
                  <OtherPlace
                    key={exclusion.facilityId}
                    exclusion={exclusion}
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
      <section className="unmatched-rooms" aria-labelledby="unmatched-title">
        <h3 id="unmatched-title">Ticket facilities not yet matched</h3>
        <p className="field-note">
          These rooms are named in the project’s ticket records. FastMove has no confirmed sport,
          room match or coordinate for them, so they are not suggested.
        </p>
        <ul className="unmatched-list">
          {unmatchedTicketRooms.map((room) => (
            <li key={`${room.facilityName}-${room.room}`}>
              <strong>{room.facilityName}</strong>
              <span>{room.room}</span>
              <span>{room.reason}</span>
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}

function OtherPlace({
  exclusion,
  transport,
  directionsOrigin,
  selected,
  onShowOnMap,
}: {
  exclusion: TimeExclusion
  transport: TransportMode | null
  directionsOrigin: MapOrigin | null
  selected: boolean
  onShowOnMap: (facilityId: string) => void
}) {
  const facility = facilities.find((item) => item.id === exclusion.facilityId)
  const distance =
    facility && directionsOrigin
      ? formatStraightLineDistance(straightLineKm(directionsOrigin, facility))
      : null
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

  return (
    <article
      id={`result-${exclusion.facilityId}`}
      className={selected ? "result-card result-card--selected" : "result-card"}
    >
      <h3>{exclusion.facilityName}</h3>
      <p className="ticket-status">Not covered by this ticket</p>
      {facility?.schedule.state === "seasonal-check" ? (
        <p className="field-note">{facility.schedule.detail}</p>
      ) : (
        <p className="field-note">
          {facility?.schedule.detail ?? "Session times are not loaded. FastMove does not invent a free session."}
        </p>
      )}
      <p className="field-note">
        {distance ? `${distance}. ` : null}
        Estimated travel: {exclusion.outboundMinutes} min out, {exclusion.returnMinutes} min back. Not a
        routed journey.
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
  const distance =
    facility && directionsOrigin
      ? formatStraightLineDistance(straightLineKm(directionsOrigin, facility))
      : null

  return (
    <article
      id={`result-${exclusion.facilityId}`}
      className={selected ? "result-card result-card--selected" : "result-card"}
    >
      <h3>{exclusion.facilityName}</h3>
      {facility ? <p className="ticket-status">{ticketCoverageLabel(facility.programme.sourceUrl)}</p> : null}
      <div className="card-topline">
        <p className="badge badge--data">DEMO DATA</p>
        <p className="badge badge--schedule">Does not fit this outing</p>
      </div>
      <p className="field-note">{DEMO_CARD_NOTE}</p>
      {facility ? (
        <p className="location">
          {facility.area} · {facility.address}
        </p>
      ) : null}
      <dl className="stats">
        <div>
          <dt>Travel</dt>
          <dd>
            {distance ? `${distance}. ` : null}
            {exclusion.outboundMinutes} min out, {exclusion.returnMinutes} min back
          </dd>
          <dd className="stat-note">
            {distance
              ? "Approximate straight-line distance. Demonstration travel estimate. Not a routed journey."
              : "Demonstration travel estimate. Not a routed journey."}
          </dd>
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
