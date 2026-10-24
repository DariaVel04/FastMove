import { MapPin } from "lucide-react"
import type { MapOrigin, ScoredMatch } from "../domain/types.ts"
import { ACTIVITY_LABELS, FACILITY_KIND_LABELS, TRANSPORT_LABELS } from "../data/sources.ts"
import { googleMapsDirectionsUrl } from "../lib/directions.ts"
import { ExternalLink } from "./ExternalLink.tsx"
import { URLS } from "../data/sources.ts"

type ResultCardProps = {
  result: ScoredMatch
  selected: boolean
  directionsOrigin: MapOrigin | null
  onShowOnMap: (facilityId: string) => void
}

export function ResultCard({ result, selected, directionsOrigin, onShowOnMap }: ResultCardProps) {
  const { facility, activity, slot, travel, timeFit, score, reasons, isBest } = result
  const directionsUrl = googleMapsDirectionsUrl(
    facility,
    travel.mode,
    directionsOrigin
      ? { latitude: directionsOrigin.latitude, longitude: directionsOrigin.longitude }
      : null,
  )
  const cardClass = [
    "result-card",
    isBest ? "result-card--best" : "",
    selected ? "result-card--selected" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <article id={`result-${facility.id}`} className={cardClass}>
      <div className="card-topline">
        {isBest ? <p className="badge badge--best">Best match</p> : <p className="badge">Also fits</p>}
        <p className={slot ? "badge badge--data" : "badge badge--schedule"}>{facility.schedule.label}</p>
      </div>
      <h3>{facility.name}</h3>
      <p className="local-name">{facility.localName}</p>
      <p className="location">
        {FACILITY_KIND_LABELS[facility.kind]} · {facility.area} · {facility.address}
      </p>
      <p className="activity-line">
        {activity.spaceName.toLowerCase() === ACTIVITY_LABELS[activity.id].toLowerCase()
          ? ACTIVITY_LABELS[activity.id]
          : `${ACTIVITY_LABELS[activity.id]} · ${activity.spaceName}`}
      </p>

      <dl className="stats">
        <div>
          <dt>Travel time</dt>
          <dd>{timeFit.outboundMinutes} min each way</dd>
          <dd className="stat-note">Demonstration estimate · {TRANSPORT_LABELS[travel.mode]}</dd>
        </div>
        <div>
          <dt>{timeFit.sessionKnown ? "Exercise time" : "Session length"}</dt>
          <dd>{timeFit.sessionKnown ? `${timeFit.exerciseMinutes} min` : "Not confirmed"}</dd>
          <dd className="stat-note">
            {timeFit.sessionKnown
              ? "After the outbound and return journeys"
              : `About ${timeFit.remainingMinutes} minutes remain after the estimated journey.`}
          </dd>
        </div>
        <div>
          <dt>{slot ? "Illustrative availability" : "Schedule"}</dt>
          <dd>{slot ? slot.exampleWindow : facility.schedule.label}</dd>
          <dd className="stat-note">
            {slot ? `${slot.durationMinutes} min example slot` : "Not a live open status"}
          </dd>
        </div>
      </dl>

      <div className="reasons">
        <h4>Why this rank</h4>
        <ul>
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>

      <details className="score-details">
        <summary>How this rank was calculated</summary>
        <p>
          Incompatible facilities are removed first. Travel convenience scores{" "}
          {Math.round(score.travelConvenience * 100)} out of 100, time fit{" "}
          {Math.round(score.timeFit * 100)} out of 100, and data confidence{" "}
          {Math.round(score.dataConfidence * 100)} out of 100. Those factors are weighted 55%, 30%
          and 15%.{" "}
          {timeFit.sessionKnown
            ? "Data confidence stays at 30 because the slot is demonstration data."
            : "Time fit stays at 0 because the session length is unknown. Data confidence is not a claim that the place is open."}
        </p>
        <p>Ranking index {score.index}. This is an ordering aid, not a probability.</p>
        <p>{travel.method}</p>
      </details>

      <p className="data-status">
        {slot ? (
          <>
            <strong>Data status: demonstration.</strong> {slot.provenance.summary}{" "}
          </>
        ) : (
          <>
            <strong>Data status: {facility.schedule.label}.</strong> {facility.schedule.detail}{" "}
          </>
        )}
        Source: {facility.programme.sourceName}
        {facility.programme.pageUpdated ? `, page updated ${facility.programme.pageUpdated}` : ""}.
        Verification in Timmi: not checked. {facility.coordinateSource.note}
      </p>

      <div className="card-actions">
        {directionsUrl ? (
          <a className="directions-button" href={directionsUrl} target="_blank" rel="noreferrer">
            Get directions
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ) : (
          <p className="field-note">
            Directions are unavailable because this facility has no verified coordinates or address.
          </p>
        )}
        <button type="button" className="secondary-button" onClick={() => onShowOnMap(facility.id)}>
          <MapPin aria-hidden="true" size={16} />
          Show on map
        </button>
        <ExternalLink href={facility.infoUrl}>City of Tampere page</ExternalLink>
        {activity.timmiUrl ? (
          <ExternalLink href={activity.timmiUrl}>Check this room in Timmi</ExternalLink>
        ) : facility.schedule.state === "demonstration-examples" ? (
          <ExternalLink href={URLS.timmiApp}>Open the Timmi calendar</ExternalLink>
        ) : (
          <p className="field-note card-schedule-note">
            Session times are not loaded. Use the city page above to check them.
          </p>
        )}
      </div>
    </article>
  )
}
