import type { MouseEvent } from "react"
import { MapPin } from "lucide-react"
import type { MapOrigin, ScoredMatch } from "../domain/types.ts"
import { URLS } from "../data/sources.ts"
import {
  facilityTitle,
  formatLocalizedClock,
  formatLocalizedDemoDate,
  kindLabel,
  localizedDistance,
  localizedReasons,
  localizedSummary,
  localizedTravelMethod,
  transportLabel,
} from "../i18n/display.ts"
import { useI18n } from "../i18n/useI18n.ts"
import { cardNysseUrl, googleMapsDirectionsUrl } from "../lib/directions.ts"
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
  /** "reachable": the hall overlaps the window but the trip does not fit the outing limit. */
  variant?: "match" | "reachable"
  maxOutingMinutes?: number
}

export function ResultCard({
  result,
  selected,
  directionsOrigin,
  onShowOnMap,
  variant = "match",
  maxOutingMinutes,
}: ResultCardProps) {
  const { facility, activity, slot, windowSlots, travel, timeFit, score, chosenInterval } = result
  const { language, t, text } = useI18n()
  const isExample = slot?.provenance.status === "demonstration"
  const onTicket = facility.programme.sourceUrl === URLS.ticket
  const summary = localizedSummary(result, language)
  const origin = directionsOrigin
    ? { latitude: directionsOrigin.latitude, longitude: directionsOrigin.longitude }
    : null
  const directionsUrl = googleMapsDirectionsUrl(facility, travel.mode, origin)
  const nysseUrl = cardNysseUrl(facility, travel.mode, origin)
  const distance = localizedDistance(travel.straightLineKm, language)
  const tripMinutes =
    timeFit.outboundMinutes === timeFit.returnMinutes
      ? t("card.tripSame", { minutes: timeFit.outboundMinutes })
      : t("card.tripSplit", { out: timeFit.outboundMinutes, back: timeFit.returnMinutes })
  const tripLine = [
    transportLabel(language, travel.mode),
    tripMinutes,
    distance,
    directionsOrigin
      ? t("card.fromStart", {
          name: directionsOrigin.id.startsWith("device-") ? t("origin.name") : text(directionsOrigin.name),
        })
      : null,
  ]
    .filter(Boolean)
    .join(" · ")
  const demoStart = slot ? windowSlots.find((demo) => demo.id === slot.id)?.startTime : undefined
  const clock = (minutes: number) => formatLocalizedClock(minutes, language)
  const partial =
    chosenInterval !== null &&
    (chosenInterval.usableStartMinutes !== chosenInterval.demoStartMinutes ||
      chosenInterval.usableEndMinutes !== chosenInterval.demoEndMinutes)
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
        <StatusBadge status={variant === "reachable" ? "long-trip" : cardStatus(result)} />
        {isExample ? <p className="badge badge--data">{t("card.demo")}</p> : null}
      </div>
      <h3>
        <button type="button" className="card-title-button" onClick={() => onShowOnMap(facility.id)}>
          {facilityTitle(facility.name, facility.localName, language)}
        </button>
      </h3>
      <p className="card-room">
        {text(activity.spaceName)} · {text(ticketCoverageLabel(facility.programme.sourceUrl))}
      </p>
      <div className="card-face">
        {chosenInterval && slot ? (
          <p className="card-hours">
            {isExample ? <span className="example-tag">{t("card.example")}</span> : null}
            <span>
              {t("card.hours", {
                date: demoStart ? formatLocalizedDemoDate(demoStart, language) : "",
                start: clock(chosenInterval.usableStartMinutes),
                end: clock(chosenInterval.usableEndMinutes),
              })}
            </span>
            <span>{t("card.inHall", { minutes: timeFit.exerciseMinutes })}</span>
          </p>
        ) : (
          <p className="card-hours">{t("card.workoutUnknown")}</p>
        )}
        {chosenInterval && partial ? (
          <p className="card-interval">
            {t("card.exampleInterval", {
              start: clock(chosenInterval.demoStartMinutes),
              end: clock(chosenInterval.demoEndMinutes),
            })}
          </p>
        ) : null}
        <p className="card-trip">{distance ? tripLine : `${tripLine} · ${t("card.distanceUnknown")}`}</p>
        {variant === "reachable" ? (
          <p className="card-reach">
            {t("card.reach", { minutes: timeFit.outboundMinutes, max: maxOutingMinutes ?? 0 })}
          </p>
        ) : null}
      </div>

      <div className="card-primary-actions">
        {directionsUrl ? (
          <a className="directions-button" href={directionsUrl} target="_blank" rel="noreferrer">
            {t("link.directions")}
            <span className="visually-hidden"> {t("link.newTab")}</span>
          </a>
        ) : null}
        {activity.timmiUrl ? (
          <ExternalLink className="secondary-button" href={activity.timmiUrl}>
            {t("link.timmiRoom")}
          </ExternalLink>
        ) : facility.schedule.state === "demonstration-examples" || onTicket ? (
          <ExternalLink className="secondary-button" href={URLS.timmiApp}>
            {t("link.timmi")}
          </ExternalLink>
        ) : (
          <p className="field-note card-schedule-note">{t("card.sessionCity")}</p>
        )}
      </div>
      {onTicket ? <p className="card-rule">{t("card.ticketRule")}</p> : null}

      {activity.dropInLimited ? <p className="field-note">{text(activity.detail)}</p> : null}
      {facility.schedule.state === "seasonal-check" ? (
        <p className="field-note">{text(facility.schedule.detail)}</p>
      ) : null}
      {!directionsUrl ? <p className="field-note">{t("card.noDirections")}</p> : null}

      <div className="card-links">
        <button type="button" className="link-button" onClick={() => onShowOnMap(facility.id)}>
          <MapPin aria-hidden="true" size={16} />
          {t("link.showMap")}
        </button>
        {nysseUrl ? (
          <ExternalLink className="link-button" href={nysseUrl}>
            {t("link.nysse")}
          </ExternalLink>
        ) : null}
      </div>
      {travel.mode === "public-transport" ? <p className="field-note">{t("card.nysseLimit")}</p> : null}

      <details className="score-details">
        <summary>{t("card.whyMatch")}</summary>
        {isExample ? <p className="field-note">{t("card.demoNote")}</p> : null}
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
