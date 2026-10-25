import { useEffect, useRef, useState } from "react"
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet"
import type { Facility, MapOrigin, ScoredMatch, TransportMode } from "../domain/types.ts"
import { facilities } from "../data/facilities.ts"
import { facilityTitle } from "../i18n/display.ts"
import { useI18n } from "../i18n/useI18n.ts"
import { cardNysseUrl } from "../lib/directions.ts"
import { fetchRoute, routeUrl, type RouteLine } from "../lib/route.ts"
import { ExternalLink } from "./ExternalLink.tsx"

type FacilityMapProps = {
  start: MapOrigin | null
  results: ScoredMatch[]
  transport: TransportMode
  focusTick: number
  selectedFacilityId: string | null
  hasSearched: boolean
  onSelect: (facilityId: string) => void
}

type MapCanvasProps = FacilityMapProps & {
  refitKey: string
  routeLine: RouteLine | null
  labelledId: string | null
}

type RouteState = { key: string; line: RouteLine | null }

function useRouteLine(start: MapOrigin | null, target: Facility | null, transport: TransportMode) {
  const key =
    start && target ? `${transport}:${start.latitude},${start.longitude}:${target.id}` : ""
  const url =
    start && target && target.coordinateSource.provider === "LIPAS" ? routeUrl(transport, start, target) : null
  const [state, setState] = useState<RouteState>({ key: "", line: null })

  useEffect(() => {
    if (!url) return
    const controller = new AbortController()
    fetchRoute(url, controller.signal)
      .then((line) => setState({ key, line }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ key, line: null })
      })
    return () => controller.abort()
  }, [key, url])

  if (!key) return { status: "none" as const, line: null }
  if (transport === "public-transport") return { status: "transit" as const, line: null }
  if (!url) return { status: "failed" as const, line: null }
  if (state.key !== key) return { status: "loading" as const, line: null }
  return state.line ? { status: "ok" as const, line: state.line } : { status: "failed" as const, line: null }
}

export function FacilityMap(props: FacilityMapProps) {
  const { language, t } = useI18n()
  const refitKey = `${props.hasSearched ? "searched" : "browse"}:${props.start?.id ?? "none"}:${props.results
    .map((result) => result.facility.id)
    .join(",")}`
  const target = props.hasSearched
    ? (facilities.find((facility) => facility.id === props.selectedFacilityId) ??
      props.results[0]?.facility ??
      null)
    : null
  const route = useRouteLine(props.hasSearched ? props.start : null, target, props.transport)
  const transitUrl =
    route.status === "transit" && target && props.start
      ? cardNysseUrl(target, "public-transport", props.start)
      : null

  return (
    <section className="map-section" aria-labelledby="map-title">
      <div className="section-heading">
        <h2 id="map-title">{t("map.title")}</h2>
        <p>{t("map.intro")}</p>
      </div>
      <div className="map-frame">
        <MapCanvas {...props} refitKey={refitKey} routeLine={route.line} labelledId={target?.id ?? null} />
      </div>
      {route.status !== "none" && target ? (
        <p className="route-status" role="status">
          <strong>{facilityTitle(target.name, target.localName, language)}</strong>{" "}
          {route.status === "loading"
            ? t("map.routeLoading")
            : route.status === "transit"
              ? t("map.routeTransit")
              : route.status === "failed"
                ? t("map.routeFailed")
                : route.line?.durationMinutes
                  ? t("map.routeOk", { minutes: route.line.durationMinutes })
                  : t("map.routeNoDuration")}
          {transitUrl ? (
            <>
              {" "}
              <ExternalLink href={transitUrl}>{t("link.nysse")}</ExternalLink>
            </>
          ) : null}
        </p>
      ) : null}
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
  focusTick,
  selectedFacilityId,
  hasSearched,
  onSelect,
  refitKey,
  routeLine,
  labelledId,
}: MapCanvasProps) {
  const { language, t, text } = useI18n()
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
      <MapController
        start={start}
        results={results}
        hasSearched={hasSearched}
        refitKey={refitKey}
        selectedFacilityId={selectedFacilityId}
        focusTick={focusTick}
      />
      {routeLine ? (
        <>
          <Polyline positions={routeLine.path} pathOptions={{ color: "#14382c", weight: 8, opacity: 0.9 }} />
          <Polyline positions={routeLine.path} pathOptions={{ color: "#d8f25a", weight: 4, opacity: 1 }} />
        </>
      ) : null}
      {start ? (
        <CircleMarker
          center={[start.latitude, start.longitude]}
          radius={8}
          pathOptions={{ color: "#f4efe6", weight: 3, fillColor: "#14382c", fillOpacity: 1 }}
        >
          <Tooltip direction="top" offset={[0, -8]} className="map-label">
            {start.id.startsWith("device-") ? t("origin.name") : text(start.name)}
          </Tooltip>
        </CircleMarker>
      ) : null}
      {facilities.map((facility) => {
        const match = results.find((result) => result.facility.id === facility.id)
        return (
          <FacilityMarker
            key={facility.id}
            name={facilityTitle(facility.name, facility.localName, language)}
            facility={facility}
            match={match}
            selected={selectedFacilityId === facility.id}
            labelled={labelledId === facility.id}
            onSelect={onSelect}
          />
        )
      })}
    </MapContainer>
  )
}

function FacilityMarker({
  name,
  facility,
  match,
  selected,
  labelled,
  onSelect,
}: {
  name: string
  facility: Facility
  match: ScoredMatch | undefined
  selected: boolean
  labelled: boolean
  onSelect: (facilityId: string) => void
}) {
  const demoMatch = match?.slot?.provenance.status === "demonstration"
  const isDemoHighlight = demoMatch === true && match?.isBest === true
  const fillColor = isDemoHighlight ? "#d8f25a" : demoMatch ? "#1e5340" : "#c8bfb2"
  const radius = selected ? 13 : isDemoHighlight ? 11 : demoMatch ? 9 : 6

  return (
    <CircleMarker
      center={[facility.latitude, facility.longitude]}
      radius={radius}
      pathOptions={{ color: selected ? "#d8f25a" : "#14382c", weight: selected ? 4 : 2, fillColor, fillOpacity: 1 }}
      eventHandlers={{ click: () => onSelect(facility.id) }}
    >
      <Tooltip
        key={labelled ? "pinned" : "hover"}
        direction="top"
        offset={[0, -radius]}
        permanent={labelled}
        className="map-label"
      >
        {name}
      </Tooltip>
    </CircleMarker>
  )
}

function MapController({
  start,
  results,
  hasSearched,
  refitKey,
  selectedFacilityId,
  focusTick,
}: {
  start: MapOrigin | null
  results: ScoredMatch[]
  hasSearched: boolean
  refitKey: string
  selectedFacilityId: string | null
  focusTick: number
}) {
  const map = useMap()
  const { t } = useI18n()
  const previousKey = useRef("")

  useEffect(() => {
    const root = map.getContainer()
    const zoomIn = root.querySelector(".leaflet-control-zoom-in")
    const zoomOut = root.querySelector(".leaflet-control-zoom-out")
    zoomIn?.setAttribute("title", t("map.zoomIn"))
    zoomIn?.setAttribute("aria-label", t("map.zoomIn"))
    zoomOut?.setAttribute("title", t("map.zoomOut"))
    zoomOut?.setAttribute("aria-label", t("map.zoomOut"))
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
    if (!selectedFacilityId || focusTick === 0) return
    const facility = facilities.find((item) => item.id === selectedFacilityId)
    if (!facility) return
    map.flyTo([facility.latitude, facility.longitude], Math.max(map.getZoom(), 15), { animate: false })
  }, [focusTick, map, selectedFacilityId])

  return null
}
