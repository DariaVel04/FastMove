import { useEffect, useRef } from "react"
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet"
import type { ActivityId, Facility, MapOrigin, ScoredMatch } from "../domain/types.ts"
import { facilities } from "../data/facilities.ts"

type FacilityMapProps = {
  start: MapOrigin | null
  highlightedActivityId: ActivityId | null
  results: ScoredMatch[]
  selectedFacilityId: string | null
  hasSearched: boolean
  onSelect: (facilityId: string) => void
}

type MapCanvasProps = FacilityMapProps & {
  refitKey: string
}

export function FacilityMap(props: FacilityMapProps) {
  const refitKey = `${props.hasSearched ? "searched" : "browse"}:${props.start?.id ?? "none"}:${props.results
    .map((result) => result.facility.id)
    .join(",")}`

  return (
    <section className="map-section" aria-labelledby="map-title">
      <div className="section-heading">
        <h2 id="map-title">Map</h2>
        <p>Listed halls, pools and ice places. Matches are highlighted after a search.</p>
      </div>
      <div className="map-frame">
        <MapCanvas {...props} refitKey={refitKey} />
      </div>
      <ul className="legend">
        {props.start ? (
          <li>
            <span className="swatch swatch--start" /> Your location
          </li>
        ) : null}
        <li>
          <span className="swatch swatch--best" /> Best match
        </li>
        <li>
          <span className="swatch swatch--match" /> Other match
        </li>
        {props.highlightedActivityId ? (
          <li>
            <span className="swatch swatch--listed" /> Listed for this activity
          </li>
        ) : null}
        <li>
          <span className="swatch swatch--idle" /> Listed place
        </li>
      </ul>
      <p className="map-note">
        Interactive OpenStreetMap base map. Facility pins are LIPAS points retrieved on 24 October
        2026 under CC BY 4.0. They are facility points, not surveyed doors, and LIPAS does not
        confirm Liikkuva Tampere eligibility or live availability. Your location is shown only
        after you ask for it, and its coordinates are not printed. Travel lines are not drawn.
        Walking, cycling, public
        transport and car times are demonstration estimates, not live navigation. The car estimate
        does not include parking.
      </p>
    </section>
  )
}

function MapCanvas({
  start,
  highlightedActivityId,
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
            <strong>{start.name}</strong>
            <br />
            {start.detail}
            <br />
            {start.sourceNote}
          </Popup>
        </CircleMarker>
      ) : null}
      {facilities.map((facility) => {
        const match = results.find((result) => result.facility.id === facility.id)
        const listed =
          highlightedActivityId !== null &&
          facility.activities.some((activity) => activity.id === highlightedActivityId)
        return (
          <FacilityMarker
            key={facility.id}
            facility={facility}
            match={match}
            listed={listed}
            highlightedActivityId={highlightedActivityId}
            selected={selectedFacilityId === facility.id}
            onSelect={onSelect}
          />
        )
      })}
    </MapContainer>
  )
}

function describeMarker(
  facility: Facility,
  match: ScoredMatch | undefined,
  highlightedActivityId: ActivityId | null,
): string {
  if (match) {
    if (!match.timeFit.sessionKnown) {
      return `${match.activity.spaceName}. Demonstration travel estimate: ${match.timeFit.outboundMinutes} min each way. Session length is not confirmed. ${match.facility.schedule.label}.`
    }
    return `${match.activity.spaceName}. Demonstration estimate: ${match.timeFit.outboundMinutes} min each way, ${match.timeFit.exerciseMinutes} min to exercise.`
  }
  if (highlightedActivityId) {
    const rooms = facility.activities
      .filter((activity) => activity.id === highlightedActivityId)
      .map((activity) => activity.spaceName)
    if (rooms.length > 0) return `Listed for the selected activity: ${rooms.join("; ")}.`
  }
  const spaces = facility.activities.map((activity) => activity.spaceName).join(", ")
  const parts = [
    spaces ? `Supported in this dataset: ${spaces}.` : "",
    facility.otherDocumentedUses ?? "",
  ].filter(Boolean)
  return parts.join(" ") || facility.schedule.label
}

function FacilityMarker({
  facility,
  match,
  listed,
  highlightedActivityId,
  selected,
  onSelect,
}: {
  facility: Facility
  match: ScoredMatch | undefined
  listed: boolean
  highlightedActivityId: ActivityId | null
  selected: boolean
  onSelect: (facilityId: string) => void
}) {
  const isBest = match?.isBest === true
  const fillColor = isBest ? "#d8f25a" : match ? "#1e5340" : listed ? "#5f8f78" : "#c8bfb2"
  const radius = selected ? 13 : isBest ? 11 : match ? 9 : listed ? 8 : 6

  return (
    <CircleMarker
      center={[facility.latitude, facility.longitude]}
      radius={radius}
      pathOptions={{ color: "#14382c", weight: 2, fillColor, fillOpacity: 1 }}
      eventHandlers={{ click: () => onSelect(facility.id) }}
    >
      <Popup>
        <strong>{facility.name}</strong>
        <br />
        {facility.address}
        <br />
        {facility.coordinateSource.note}
        <br />
        {describeMarker(facility, match, listed ? highlightedActivityId : null)}
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
  const previousKey = useRef("")

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
