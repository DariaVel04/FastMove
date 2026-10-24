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
