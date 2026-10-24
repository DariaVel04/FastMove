import type { TransportMode, TravelEstimate } from "../domain/types.ts"

/**
 * Demonstration travel model. There is no routing service in this MVP.
 * Times are straight-line estimates, not journey plans from a transit API.
 */
export const TRAVEL_MODEL = {
  detourFactor: 1.3,
  speedsKmh: {
    walking: 5,
    cycling: 16,
    "public-transport": 22,
    car: 30,
  },
  /** Extra minutes added to each direction before rounding. Car does not add a parking allowance. */
  accessMinutes: {
    walking: 0,
    cycling: 1,
    "public-transport": 8,
    car: 0,
  },
  roundToMinutes: 5,
  minimumOneWayMinutes: 5,
} as const

const EARTH_KM = 6371

type Point = {
  latitude: number
  longitude: number
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function straightLineKm(from: Point, to: Point): number {
  const latitudeDelta = toRadians(to.latitude - from.latitude)
  const longitudeDelta = toRadians(to.longitude - from.longitude)
  const fromLatitude = toRadians(from.latitude)
  const toLatitude = toRadians(to.latitude)
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(haversine)))
}

/** Rounded straight-line label. Null when the distance is missing. */
export function formatStraightLineDistance(kilometres: number | null | undefined): string | null {
  if (kilometres == null || !Number.isFinite(kilometres) || kilometres < 0) return null
  if (kilometres < 1) {
    const metres = Math.round((kilometres * 1000) / 50) * 50
    return `About ${metres} m in a straight line`
  }
  const rounded = Math.round(kilometres * 10) / 10
  return `About ${rounded.toFixed(1)} km in a straight line`
}

export function estimateOneWayMinutes(straightLineKilometres: number, mode: TransportMode): number {
  const roadKm = straightLineKilometres * TRAVEL_MODEL.detourFactor
  const movingMinutes = (roadKm / TRAVEL_MODEL.speedsKmh[mode]) * 60
  const rawMinutes = movingMinutes + TRAVEL_MODEL.accessMinutes[mode]
  const rounded =
    Math.round(rawMinutes / TRAVEL_MODEL.roundToMinutes) * TRAVEL_MODEL.roundToMinutes
  return Math.max(TRAVEL_MODEL.minimumOneWayMinutes, rounded)
}

function methodText(mode: TransportMode): string {
  const speed = TRAVEL_MODEL.speedsKmh[mode]
  const access = TRAVEL_MODEL.accessMinutes[mode]
  const accessText =
    access > 0
      ? ` Each direction also adds ${access} minutes for access and waiting.`
      : ""
  const parkingText =
    mode === "car"
      ? " Parking time is not included, because parking is not published for these facilities."
      : ""
  return `Demonstration estimate: straight-line distance multiplied by ${TRAVEL_MODEL.detourFactor} for urban detours, then ${speed} km/h.${accessText}${parkingText} The return uses the same estimate. This is not a routed journey or live navigation.`
}

export function estimateTravel(from: Point, to: Point, mode: TransportMode): TravelEstimate {
  const straight = straightLineKm(from, to)
  const oneWay = estimateOneWayMinutes(straight, mode)
  return {
    mode,
    straightLineKm: straight,
    assumedRoadKm: straight * TRAVEL_MODEL.detourFactor,
    outboundMinutes: oneWay,
    returnMinutes: oneWay,
    roundTripMinutes: oneWay * 2,
    label: "demonstration-estimate",
    method: methodText(mode),
  }
}
