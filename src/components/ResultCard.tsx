import { MapPin } from "lucide-react"
import type { MapOrigin, ScoredMatch } from "../domain/types.ts"
import { FACILITY_KIND_LABELS, TRANSPORT_LABELS } from "../data/sources.ts"
import { googleMapsDirectionsUrl } from "../lib/directions.ts"
import { matchSummaryLines } from "../lib/present.ts"
import { ExternalLink } from "./ExternalLink.tsx"
import { DemoSchedule } from "./DemoSchedule.tsx"
import { URLS } from "../data/sources.ts"

type ResultCardProps = {
  result: ScoredMatch
  selected: boolean
  directionsOrigin: MapOrigin | null
  onShowOnMap: (facilityId: string) => void
}

export function ResultCard({ result, selected, directionsOrigin, onShowOnMap }: ResultCardProps) {
  const { facility, activity, slot, windowSlots, travel, timeFit, score, reasons, isBest } = result
  const isExample = slot?.provenance.status === "demonstration"
  const confirmedMatch = isBest && slot !== null && !isExample
  const summary = matchSummaryLines(result)
  const directionsUrl = googleMapsDirectionsUrl(
    facility,
    travel.mode,
    directionsOrigin
      ? { latitude: directionsOrigin.latitude, longitude: directionsOrigin.longitude }
      : null,
  )
  const cardClass = [
    "result-card",
    confirmedMatch ? "result-card--best" : "",
    selected ? "result-card--selected" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <article id={`result-${facility.id}`} className={cardClass}>
      {confirmedMatch ? <p className="badge badge--best">Fits your window</p> : null}
      <h3>{facility.name}</h3>
      <ul className="match-summary">
        {summary.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

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

      <details className="score-details">
        <summary>More details</summary>
        <p className="local-name">{facility.localName}</p>
        <p className="location">
          {FACILITY_KIND_LABELS[facility.kind]} · {facility.area} · {facility.address}
        </p>
        <p className="field-note">
          {TRANSPORT_LABELS[travel.mode]} · demonstration estimate. {isExample ? slot?.exampleWindow : facility.schedule.label}
        </p>
        <DemoSchedule slots={windowSlots} selectedId={slot?.id ?? null} />
        <div className="reasons">
          <h4>Why this rank</h4>
          <ul>
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
        <p>
          Travel convenience scores {Math.round(score.travelConvenience * 100)} out of 100, time fit{" "}
          {Math.round(score.timeFit * 100)} out of 100, and data confidence{" "}
          {Math.round(score.dataConfidence * 100)} out of 100. Ranking index {score.index}.{" "}
          {timeFit.sessionKnown
            ? "The interval is demonstration data."
            : "No session length is loaded."}{" "}
          {travel.method}
        </p>
        <p className="data-status">
          {slot ? slot.provenance.summary : facility.schedule.detail} Source: {facility.programme.sourceName}
          {facility.programme.pageUpdated ? `, page updated ${facility.programme.pageUpdated}` : ""}.
          Verification in Timmi: not checked. {facility.coordinateSource.note}
        </p>
      </details>
    </article>
  )
}
