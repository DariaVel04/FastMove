import type { MapOrigin, ScheduleNote, ScoredMatch, SortKey, TimeExclusion, TransportMode } from "../domain/types.ts"
import { facilities, unmatchedTicketRooms } from "../data/facilities.ts"
import { URLS } from "../data/sources.ts"
import { countMatchingOptions, ticketCoverageLabel } from "../lib/present.ts"
import { googleMapsDirectionsUrl } from "../lib/directions.ts"
import { straightLineKm } from "../lib/travel.ts"
import { facilityTitle, localizedDistance } from "../i18n/display.ts"
import { useI18n } from "../i18n/useI18n.ts"
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
  const { language, t, text } = useI18n()
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
        <h2 id="results-title">{t("results.title")}</h2>
        <p>{t("results.subtitle")}</p>
      </div>

      {!hasSearched ? (
        <div className="empty-state">
          <h3>{t("results.waitingTitle")}</h3>
          <p>{t("results.waitingBody")}</p>
        </div>
      ) : (
        <>
          <p className="found-options">
            {matchCount === 1 ? t("results.foundOne") : t("results.foundMany", { count: matchCount })}
          </p>
          <p className="demo-notice">{t("results.demo")}</p>
          <div className="result-controls">
            <label className="field field--inline" htmlFor="sort-results">
              {t("results.sort")}
              <select
                id="sort-results"
                value={sort}
                onChange={(event) => onSortChange(event.target.value as SortKey)}
              >
                <option value="relevance">{t("results.relevance")}</option>
                <option value="travel">{t("results.travel")}</option>
              </select>
            </label>
          </div>

          {matchCount === 0 ? (
            <div className="empty-state" role="status">
              <p>{t("results.empty")}</p>
              {activityGapText ? <p>{activityGapText}</p> : null}
              <p className="link-row">
                <ExternalLink href={URLS.timmiApp}>{t("link.timmi")}</ExternalLink>
                <ExternalLink href={URLS.ticket}>{t("link.ticketPage")}</ExternalLink>
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
              <h3>{t("results.unconfirmedTitle")}</h3>
              <p className="field-note">{t("results.unconfirmedBody")}</p>
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
              <h3>{t("results.cautionTitle")}</h3>
              <p className="field-note">{t("results.cautionBody")}</p>
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
              <h3>{t("results.outsideTitle")}</h3>
              <p className="field-note">{t("results.outsideBody", { minutes: minWorkoutMinutes })}</p>
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
              <h3>{t("results.otherTitle")}</h3>
              <p className="field-note">{t("results.otherBody")}</p>
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
              {text(note.message)}
            </p>
          ))}
        </>
      )}
      <section className="unmatched-rooms" aria-labelledby="unmatched-title">
        <h3 id="unmatched-title">{t("results.unmatchedTitle")}</h3>
        <p className="field-note">{t("results.unmatchedBody")}</p>
        <ul className="unmatched-list">
          {unmatchedTicketRooms.map((room) => {
            const place = facilities.find((item) => item.name === room.facilityName)
            return (
              <li key={`${room.facilityName}-${room.room}`}>
                <strong>{place ? facilityTitle(place.name, place.localName, language) : room.facilityName}</strong>
                <span>{text(room.room)}</span>
                <span>{text(room.reason)}</span>
              </li>
            )
          })}
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
  const { language, t, text } = useI18n()
  const facility = facilities.find((item) => item.id === exclusion.facilityId)
  const distance =
    facility && directionsOrigin
      ? localizedDistance(straightLineKm(directionsOrigin, facility), language)
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
      <h3>{facility ? facilityTitle(facility.name, facility.localName, language) : exclusion.facilityName}</h3>
      <p className="ticket-status">{text("Not covered by this ticket")}</p>
      {facility?.schedule.state === "seasonal-check" ? (
        <p className="field-note">{text(facility.schedule.detail)}</p>
      ) : (
        <p className="field-note">{facility ? text(facility.schedule.detail) : t("card.noSession")}</p>
      )}
      <p className="field-note">
        {distance ? `${distance}. ` : null}
        {t("card.travelSplit", { out: exclusion.outboundMinutes, back: exclusion.returnMinutes })}
      </p>
      <div className="card-actions">
        {directionsUrl ? (
          <a className="directions-button" href={directionsUrl} target="_blank" rel="noreferrer">
            {t("link.directions")}
            <span className="visually-hidden"> {t("link.newTab")}</span>
          </a>
        ) : null}
        <button type="button" className="secondary-button" onClick={() => onShowOnMap(exclusion.facilityId)}>
          {t("link.showMap")}
        </button>
        {facility ? <ExternalLink href={facility.infoUrl}>{t("link.city")}</ExternalLink> : null}
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
  const { language, t, text } = useI18n()
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
      ? localizedDistance(straightLineKm(directionsOrigin, facility), language)
      : null

  return (
    <article
      id={`result-${exclusion.facilityId}`}
      className={selected ? "result-card result-card--selected" : "result-card"}
    >
      <h3>{facility ? facilityTitle(facility.name, facility.localName, language) : exclusion.facilityName}</h3>
      {facility ? <p className="ticket-status">{text(ticketCoverageLabel(facility.programme.sourceUrl))}</p> : null}
      <div className="card-topline">
        <p className="badge badge--data">{t("card.demo")}</p>
        <p className="badge badge--schedule">{t("card.miss")}</p>
      </div>
      <p className="field-note">{t("card.demoNote")}</p>
      {facility ? (
        <p className="location">
          {facility.area} · {facility.address}
        </p>
      ) : null}
      <dl className="stats">
        <div>
          <dt>{t("card.travelTitle")}</dt>
          <dd>
            {distance ? `${distance}. ` : null}
            {t("card.travelOut", { out: exclusion.outboundMinutes, back: exclusion.returnMinutes })}
          </dd>
          <dd className="stat-note">{distance ? t("card.distanceNote") : t("card.travelNote")}</dd>
        </div>
        <div>
          <dt>{t("card.leftTitle")}</dt>
          <dd>{t("workout.option", { minutes: remaining })}</dd>
          <dd className="stat-note">{t("card.leftNote", { minutes: minWorkoutMinutes })}</dd>
        </div>
      </dl>
      <DemoSchedule slots={exclusion.windowSlots} />
      <p className="data-status">{t("card.missExplain")}</p>
      <div className="card-actions">
        {directionsUrl ? (
          <a className="directions-button" href={directionsUrl} target="_blank" rel="noreferrer">
            {t("link.directions")}
            <span className="visually-hidden"> {t("link.newTab")}</span>
          </a>
        ) : null}
        <button type="button" className="secondary-button" onClick={() => onShowOnMap(exclusion.facilityId)}>
          {t("link.showMap")}
        </button>
        {facility ? <ExternalLink href={facility.infoUrl}>{t("link.city")}</ExternalLink> : null}
      </div>
    </article>
  )
}
