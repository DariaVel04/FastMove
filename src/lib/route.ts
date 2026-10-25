import type { TransportMode } from "../domain/types.ts"

type Point = { latitude: number; longitude: number }

export type RouteLine = {
  /** Leaflet order: [lat, lon]. */
  path: [number, number][]
  durationMinutes: number | null
}

/**
 * FOSSGIS OSRM servers with separate foot, bike and car profiles. The public demo
 * at router.project-osrm.org answers foot and bike requests with car timings,
 * so it is not used. No key is needed. Public transport is not drawn: that is
 * a Nysse journey, and FastMove only links to the Nysse planner.
 */
const PROFILE_HOST: Partial<Record<TransportMode, string>> = {
  walking: "https://routing.openstreetmap.de/routed-foot",
  cycling: "https://routing.openstreetmap.de/routed-bike",
  car: "https://routing.openstreetmap.de/routed-car",
}

export const ROUTE_TIMEOUT_MS = 8000

export function routeUrl(mode: TransportMode, from: Point, to: Point): string | null {
  const host = PROFILE_HOST[mode]
  if (!host) return null
  const coords = [from, to].map((point) => [point.longitude, point.latitude])
  if (!coords.flat().every(Number.isFinite)) return null
  const path = coords.map(([lon, lat]) => `${lon},${lat}`).join(";")
  return `${host}/route/v1/driving/${path}?overview=full&geometries=geojson`
}

/** Returns null unless the response carries a line with at least two points. */
export function parseRoute(json: unknown): RouteLine | null {
  if (!json || typeof json !== "object") return null
  const body = json as { code?: unknown; routes?: unknown }
  if (body.code !== "Ok" || !Array.isArray(body.routes) || body.routes.length === 0) return null
  const route = body.routes[0] as { duration?: unknown; geometry?: { type?: unknown; coordinates?: unknown } }
  const geometry = route.geometry
  if (!geometry || geometry.type !== "LineString" || !Array.isArray(geometry.coordinates)) return null
  const path: [number, number][] = []
  for (const coordinate of geometry.coordinates) {
    if (!Array.isArray(coordinate) || coordinate.length < 2) return null
    const [lon, lat] = coordinate
    if (typeof lon !== "number" || typeof lat !== "number" || !Number.isFinite(lon) || !Number.isFinite(lat)) {
      return null
    }
    path.push([lat, lon])
  }
  if (path.length < 2) return null
  const durationMinutes =
    typeof route.duration === "number" && Number.isFinite(route.duration) && route.duration > 0
      ? Math.max(1, Math.round(route.duration / 60))
      : null
  return { path, durationMinutes }
}

const cache = new Map<string, RouteLine>()

/** `url` comes from routeUrl. A slow server falls back to the estimate after ROUTE_TIMEOUT_MS. */
export async function fetchRoute(url: string, signal: AbortSignal): Promise<RouteLine | null> {
  const cached = cache.get(url)
  if (cached) return cached
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(ROUTE_TIMEOUT_MS)]) })
  if (!response.ok) return null
  const line = parseRoute(await response.json())
  if (line) cache.set(url, line)
  return line
}
