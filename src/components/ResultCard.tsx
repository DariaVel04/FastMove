import type { MouseEvent } from "react"
import { MapPin } from "lucide-react"
import type { MapOrigin, ScoredMatch } from "../domain/types.ts"
import { URLS } from "../data/sources.ts"
import {
  facilityTitle,
  kindLabel,
  localizedDistance,
  localizedReasons,
  localizedSummary,
  localizedTravelMethod,
  transportLabel,
} from "../i18n/display.ts"
import { useI18n } from "../i18n/useI18n.ts"
import { googleMapsDirectionsUrl, nysseJourneyUrl } from "../lib/directions.ts"
import { ticketCoverageLabel } from "../lib/present.ts"
import { cardStatus } from "../lib/status.ts"
import { DemoSchedule } from "./DemoSchedule.tsx"
import { ExternalLink } from "./ExternalLink.tsx"
import { StatusBadge } from "./StatusBadge.tsx"

type ResultCardProps = {
  result: ScoredMatch
  selected: boolean
  directionsOrigin: MapOrigin | null
  onShowOnMap: (facilityId: string) => void
}

export function ResultCard({ result, selected, directionsOrigin, onShowOnMap }: ResultCardProps) {
  const { facility, activity, slot, windowSlots, travel, timeFit, score } = result
  const { language, t, text } = useI18n()
  const isExample = slot?.provenance.status === "demonstration"
  const summary = localizedSummary(result, language)
  const origin = directionsOrigin
    ? { latitude: directionsOrigin.latitude, longitude: directionsOrigin.longitude }
    : null
  const directionsUrl = googleMapsDirectionsUrl(facility, travel.mode, origin)
  const nysseUrl = travel.mode === "public-transport" ? nysseJourneyUrl(facility, origin) : null
  const distance = localizedDistance(travel.straightLineKm, language)
  const travelLine =
    timeFit.outboundMinutes === timeFit.returnMinutes
      ? t("card.travelSame", { minutes: timeFit.outboundMinutes })
      : t("card.travelSplit", { out: timeFit.outboundMinutes, back: timeFit.returnMinutes })
  const cardClass = ["result-card", selected ? "result-card--selected" : ""].filter(Boolean).join(" ")

  function focusMap(event: MouseEvent<HTMLElement>) {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest("a, button, summary, input, select, label")) return
    onShowOnMap(facility.id)
  }

  return (
    <article id={`result-${facility.id}`} className={cardClass} onClick={focusMap}>
      <div className="card-topline">
        <StatusBadge status={cardStatus(result)} />
        {isExample ? <p className="badge badge--data">{t("card.demo")}</p> : null}
      </div>
      <h3>
        <button type="button" className="card-title-button" onClick={() => onShowOnMap(facility.id)}>
          {facilityTitle(facility.name, facility.localName, language)}
        </button>
      </h3>
      <p className="ticket-status">{text(ticketCoverageLabel(facility.programme.sourceUrl))}</p>
      <ul className="scan-list">
        <li>{distance ?? t("card.distanceUnknown")}</li>
        <li>
          {transportLabel(language, travel.mode)} · {travelLine}
        </li>
        <li>
          {timeFit.sessionKnown
            ? t("card.workout", { minutes: timeFit.exerciseMinutes })
            : t("card.workoutUnknown")}
        </li>
      </ul>
      {isExample ? <p className="field-note">{t("card.demoNote")}</p> : null}
      {travel.mode === "public-transport" ? <p className="field-note">{t("card.nysseLimit")}</p> : null}
      {activity.dropInLimited ? <p className="field-note">{text(activity.detail)}</p> : null}
      {facility.coordinateSource.note.includes("Hall A has a separate point") ? (
        <p className="field-note">{t("card.hallB")}</p>
      ) : null}
      {facility.schedule.state === "seasonal-check" ? (
        <p className="field-note">{text(facility.schedule.detail)}</p>
      ) : null}
      {!directionsUrl ? <p className="field-note">{t("card.noDirections")}</p> : null}

      <div className="card-actions">
        {activity.timmiUrl ? (
          <ExternalLink className="secondary-button" href={activity.timmiUrl}>
            {t("link.timmiRoom")}
          </ExternalLink>
        ) : facility.schedule.state === "demonstration-examples" ? (
          <ExternalLink className="secondary-button" href={URLS.timmiApp}>
            {t("link.timmi")}
          </ExternalLink>
        ) : (
          <p className="field-note card-schedule-note">{t("card.sessionCity")}</p>
        )}
        <button type="button" className="secondary-button" onClick={() => onShowOnMap(facility.id)}>
          <MapPin aria-hidden="true" size={16} />
          {t("link.showMap")}
        </button>
        {nysseUrl ? (
          <ExternalLink className="secondary-button" href={nysseUrl}>
            {t("link.nysse")}
          </ExternalLink>
        ) : null}
      </div>

      <details className="score-details">
        <summary>{t("card.whyMatch")}</summary>
        <p className="local-name">{language === "fi" ? facility.name : facility.localName}</p>
        <p className="location">
          {kindLabel(language, facility.kind)} · {facility.area} · {facility.address}
        </p>
        <ul className="match-summary">
          {summary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="detail-actions">
          {directionsUrl ? (
            <a className="directions-button" href={directionsUrl} target="_blank" rel="noreferrer">
              {t("link.directions")}
              <span className="visually-hidden"> {t("link.newTab")}</span>
            </a>
          ) : null}
          <ExternalLink className="secondary-button" href={facility.infoUrl}>
            {t("link.city")}
          </ExternalLink>
        </div>
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
