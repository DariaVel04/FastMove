import { MapPin } from "lucide-react"
import type { MapOrigin, ScoredMatch } from "../domain/types.ts"
import { googleMapsDirectionsUrl } from "../lib/directions.ts"
import { ticketCoverageLabel } from "../lib/present.ts"
import {
  facilityTitle,
  kindLabel,
  localizedReasons,
  localizedSummary,
  localizedTravelMethod,
  transportLabel,
} from "../i18n/display.ts"
import { useI18n } from "../i18n/useI18n.ts"
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
  const { facility, activity, slot, windowSlots, travel, timeFit, score, isBest } = result
  const { language, t, text } = useI18n()
  const isExample = slot?.provenance.status === "demonstration"
  const confirmedMatch = isBest && slot !== null && !isExample
  const summary = localizedSummary(result, language)
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
      <h3>{facilityTitle(facility.name, facility.localName, language)}</h3>
      <p className="ticket-status">{text(ticketCoverageLabel(facility.programme.sourceUrl))}</p>
      {isExample ? (
        <div className="card-topline">
          <p className="badge badge--data">{t("card.demo")}</p>
        </div>
      ) : confirmedMatch ? (
        <p className="badge badge--best">{t("card.fits")}</p>
      ) : null}
      {isExample ? <p className="field-note">{t("card.demoNote")}</p> : null}
      {activity.dropInLimited ? <p className="field-note">{text(activity.detail)}</p> : null}
      {facility.coordinateSource.note.includes("Hall A has a separate point") ? (
        <p className="field-note">{t("card.hallB")}</p>
      ) : null}
      {facility.schedule.state === "seasonal-check" ? (
        <p className="field-note">{text(facility.schedule.detail)}</p>
      ) : null}
      <ul className="match-summary">
        {summary.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <div className="card-actions">
        {directionsUrl ? (
          <a className="directions-button" href={directionsUrl} target="_blank" rel="noreferrer">
            {t("link.directions")}
            <span className="visually-hidden"> {t("link.newTab")}</span>
          </a>
        ) : (
          <p className="field-note">
            {t("card.noDirections")}
          </p>
        )}
        <button type="button" className="secondary-button" onClick={() => onShowOnMap(facility.id)}>
          <MapPin aria-hidden="true" size={16} />
          {t("link.showMap")}
        </button>
        <ExternalLink href={facility.infoUrl}>{t("link.city")}</ExternalLink>
        {activity.timmiUrl ? (
          <ExternalLink href={activity.timmiUrl}>{t("link.timmiRoom")}</ExternalLink>
        ) : facility.schedule.state === "demonstration-examples" ? (
          <ExternalLink href={URLS.timmiApp}>{t("link.timmi")}</ExternalLink>
        ) : (
          <p className="field-note card-schedule-note">{t("card.sessionCity")}</p>
        )}
      </div>

      <details className="score-details">
        <summary>{t("card.more")}</summary>
        <p className="local-name">{language === "fi" ? facility.name : facility.localName}</p>
        <p className="location">
          {kindLabel(language, facility.kind)} · {facility.area} · {facility.address}
        </p>
        <p className="field-note">
          {transportLabel(language, travel.mode)} · {text(isExample ? "Demonstration examples" : facility.schedule.label)}
        </p>
        <DemoSchedule slots={windowSlots} selectedId={slot?.id ?? null} />
        <div className="reasons">
          <h4>{t("card.why")}</h4>
          <ul>
            {localizedReasons(result, language).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
        <p>
          {t("card.scores", {
            travel: Math.round(score.travelConvenience * 100),
            time: Math.round(score.timeFit * 100),
            confidence: Math.round(score.dataConfidence * 100),
            index: score.index,
          })}{" "}
          {timeFit.sessionKnown ? t("card.intervalDemo") : t("card.noLength")}{" "}
          {localizedTravelMethod(travel.mode, language, travel.method)}
        </p>
        <p className="data-status">
          {slot ? text(slot.provenance.summary) : text(facility.schedule.detail)}{" "}
          {t("card.source", {
            source: text(facility.programme.sourceName),
            updated: facility.programme.pageUpdated
              ? t("card.updated", { date: text(facility.programme.pageUpdated) })
              : "",
          })}{" "}
          {text(facility.coordinateSource.note)}
        </p>
      </details>
    </article>
  )
}
