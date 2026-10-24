import type { Facility, TransportMode } from "../domain/types.ts"

const GOOGLE_DIRECTIONS = "https://www.google.com/maps/dir/"

const GOOGLE_TRAVEL_MODE = {
  walking: "walking",
  cycling: "bicycling",
  "public-transport": "transit",
  car: "driving",
} as const

type Origin = {
  latitude: number
  longitude: number
}

function finitePair(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
}

/**
 * Destination prefers a LIPAS coordinate. A published street address is the
 * fallback. Nothing is geocoded or invented here.
 */
function destinationValue(facility: Facility): string | null {
  if (
    facility.coordinateSource.provider === "LIPAS" &&
    finitePair(facility.latitude, facility.longitude)
  ) {
    return `${facility.latitude},${facility.longitude}`
  }
  const address = facility.address.trim()
  return address.length > 0 ? address : null
}

export function googleMapsDirectionsUrl(
  facility: Facility,
  transport: TransportMode,
  origin: Origin | null,
): string | null {
  const destination = destinationValue(facility)
  if (!destination) return null

  const params = new URLSearchParams()
  params.set("api", "1")
  params.set("destination", destination)
  params.set("travelmode", GOOGLE_TRAVEL_MODE[transport])
  if (origin && finitePair(origin.latitude, origin.longitude)) {
    params.set("origin", `${origin.latitude},${origin.longitude}`)
  }
  return `${GOOGLE_DIRECTIONS}?${params.toString()}`
}

/**
 * Opens Nysse's public journey planner. The path form is the one used by
 * https://reittiopas.tampere.fi (label::lat,lon). Coordinates come only from
 * the selected start and a LIPAS facility point. This does not call the
 * Digitransit routing API and does not invent a route.
 */
export function nysseJourneyUrl(facility: Facility, origin: Origin | null): string | null {
  if (!origin || !finitePair(origin.latitude, origin.longitude)) return null
  if (
    facility.coordinateSource.provider !== "LIPAS" ||
    !finitePair(facility.latitude, facility.longitude)
  ) {
    return null
  }
  const from = `::${origin.latitude},${origin.longitude}`
  const to = `::${facility.latitude},${facility.longitude}`
  return `https://reittiopas.tampere.fi/${encodeURIComponent(from)}/${encodeURIComponent(to)}`
}
