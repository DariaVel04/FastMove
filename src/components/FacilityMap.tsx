import { useEffect, useRef } from "react"
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet"
import type { Facility, MapOrigin, ScoredMatch } from "../domain/types.ts"
import { facilities } from "../data/facilities.ts"
import { clockMinutes } from "../data/demoSchedule.ts"
import { facilityTitle, formatLocalizedClock, formatLocalizedDemoDate } from "../i18n/display.ts"
import { useI18n } from "../i18n/useI18n.ts"
import type { Language } from "../i18n/types.ts"
import type { MessageKey } from "../i18n/translations.ts"

type FacilityMapProps = {
  start: MapOrigin | null
  results: ScoredMatch[]
  selectedFacilityId: string | null
  hasSearched: boolean
  onSelect: (facilityId: string) => void
}

type MapCanvasProps = FacilityMapProps & {
  refitKey: string
}

export function FacilityMap(props: FacilityMapProps) {
  const { t } = useI18n()
  const refitKey = `${props.hasSearched ? "searched" : "browse"}:${props.start?.id ?? "none"}:${props.results
    .map((result) => result.facility.id)
    .join(",")}`

  return (
    <section className="map-section" aria-labelledby="map-title">
      <div className="section-heading">
        <h2 id="map-title">{t("map.title")}</h2>
        <p>{t("map.intro")}</p>
      </div>
      <div className="map-frame">
        <MapCanvas {...props} refitKey={refitKey} />
      </div>
      <ul className="legend">
        {props.start ? (
          <li>
            <span className="swatch swatch--start" /> {t("map.start")}
          </li>
        ) : null}
        <li>
          <span className="swatch swatch--best" /> {t("map.demo")}
        </li>
        <li>
          <span className="swatch swatch--match" /> {t("map.other")}
        </li>
        <li>
          <span className="swatch swatch--idle" /> {t("map.listed")}
        </li>
      </ul>
      <p className="map-note">{t("map.note")}</p>
    </section>
  )
}

function MapCanvas({
  start,
  results,
  selectedFacilityId,
  hasSearched,
  onSelect,
  refitKey,
}: MapCanvasProps) {
  return (
    <MapContainer
      center={start ? [start.latitude, start.longitude] : [facilities[0].latitude, facilities[0].longitude]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController start={start} results={results} hasSearched={hasSearched} refitKey={refitKey} selectedFacilityId={selectedFacilityId} />
      {start ? (
        <CircleMarker
          center={[start.latitude, start.longitude]}
          radius={8}
          pathOptions={{ color: "#f4efe6", weight: 3, fillColor: "#14382c", fillOpacity: 1 }}
        >
          <Popup>
            <StartPopup start={start} />
          </Popup>
        </CircleMarker>
      ) : null}
      {facilities.map((facility) => {
        const match = results.find((result) => result.facility.id === facility.id)
        return (
          <FacilityMarker
            key={facility.id}
            facility={facility}
            match={match}
            selected={selectedFacilityId === facility.id}
            onSelect={onSelect}
          />
        )
      })}
    </MapContainer>
  )
}

function StartPopup({ start }: { start: MapOrigin }) {
  const { t, text } = useI18n()
  const device = start.id.startsWith("device-")
  return (
    <>
      <strong>{device ? t("origin.name") : text(start.name)}</strong>
      <br />
      {device ? t("origin.detail") : start.detail}
      <br />
      {device ? t("origin.note") : text(start.sourceNote)}
    </>
  )
}

function describeMarker(
  facility: Facility,
  match: ScoredMatch | undefined,
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
  text: (english: string) => string,
): string {
  if (match) {
    const space = text(match.activity.spaceName)
    if (!match.timeFit.sessionKnown) {
      return t("map.unknownSession", {
        space,
        minutes: match.timeFit.outboundMinutes,
        schedule: text(match.facility.schedule.label),
      })
    }
    return t("map.knownSession", {
      space,
      minutes: match.timeFit.outboundMinutes,
      exercise: match.timeFit.exerciseMinutes,
    })
  }
  const spaces = facility.activities.map((activity) => text(activity.spaceName)).join(", ")
  const parts = [
    spaces ? t("map.supported", { spaces }) : "",
    facility.otherDocumentedUses ? text(facility.otherDocumentedUses) : "",
  ].filter(Boolean)
  return parts.join(" ") || text(facility.schedule.label)
}

function markerWhen(match: ScoredMatch | undefined, language: Language): string | null {
  if (!match?.slot?.exampleWindow) return null
  if (language === "en") return match.slot.exampleWindow
  const demo = match.windowSlots.find((slot) => slot.id === match.slot?.id)
  if (!demo) return match.slot.exampleWindow
  const start = formatLocalizedClock(clockMinutes(demo.startTime), language)
  const end = formatLocalizedClock(clockMinutes(demo.endTime), language)
  return `${formatLocalizedDemoDate(demo.startTime, language)} · ${start}–${end}`
}

function FacilityMarker({
  facility,
  match,
  selected,
  onSelect,
}: {
  facility: Facility
  match: ScoredMatch | undefined
  selected: boolean
  onSelect: (facilityId: string) => void
}) {
  const { language, t, text } = useI18n()
  const when = markerWhen(match, language)
  const demoMatch = match?.slot?.provenance.status === "demonstration"
  const isDemoHighlight = demoMatch === true && match?.isBest === true
  const fillColor = isDemoHighlight ? "#d8f25a" : demoMatch ? "#1e5340" : "#c8bfb2"
  const radius = selected ? 13 : isDemoHighlight ? 11 : demoMatch ? 9 : 6

  return (
    <CircleMarker
      center={[facility.latitude, facility.longitude]}
      radius={radius}
      pathOptions={{ color: "#14382c", weight: 2, fillColor, fillOpacity: 1 }}
      eventHandlers={{ click: () => onSelect(facility.id) }}
    >
      <Popup>
        <strong>{facilityTitle(facility.name, facility.localName, language)}</strong>
        <br />
        {facility.address}
        <br />
        {when ? (
          <>
            {t("map.demoInterval", { when })}
            <br />
          </>
        ) : null}
        {text(facility.coordinateSource.note)}
        <br />
        {describeMarker(facility, match, t, text)}
      </Popup>
    </CircleMarker>
  )
}

function MapController({
  start,
  results,
  hasSearched,
  refitKey,
  selectedFacilityId,
}: {
  start: MapOrigin | null
  results: ScoredMatch[]
  hasSearched: boolean
  refitKey: string
  selectedFacilityId: string | null
}) {
  const map = useMap()
  const { t } = useI18n()
  const previousKey = useRef("")

  useEffect(() => {
    const labelControls = () => {
      const root = map.getContainer()
      const zoomIn = root.querySelector(".leaflet-control-zoom-in")
      const zoomOut = root.querySelector(".leaflet-control-zoom-out")
      zoomIn?.setAttribute("title", t("map.zoomIn"))
      zoomIn?.setAttribute("aria-label", t("map.zoomIn"))
      zoomOut?.setAttribute("title", t("map.zoomOut"))
      zoomOut?.setAttribute("aria-label", t("map.zoomOut"))
      root.querySelectorAll(".leaflet-popup-close-button").forEach((button) => {
        button.setAttribute("title", t("map.closePopup"))
        button.setAttribute("aria-label", t("map.closePopup"))
      })
    }
    labelControls()
    map.on("popupopen", labelControls)
    return () => {
      map.off("popupopen", labelControls)
    }
  }, [map, t])

  useEffect(() => {
    if (previousKey.current === refitKey) return
    previousKey.current = refitKey
    const points = hasSearched && results.length > 0 ? results.map((result) => result.facility) : facilities
    const bounds = points.map((facility) => [facility.latitude, facility.longitude] as [number, number])
    if (start) bounds.push([start.latitude, start.longitude])
    map.fitBounds(bounds, { padding: [28, 28], animate: false })
  }, [hasSearched, map, refitKey, results, start])

  useEffect(() => {
    if (!selectedFacilityId) return
    const facility = facilities.find((item) => item.id === selectedFacilityId)
    if (!facility) return
    map.panTo([facility.latitude, facility.longitude])
  }, [map, selectedFacilityId])

  return null
}
