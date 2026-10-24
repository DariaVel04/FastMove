export type LocationRequestStatus = "granted" | "denied" | "unavailable" | "timeout" | "unsupported"

export type LocationRequestResult =
  | { status: "granted"; latitude: number; longitude: number }
  | { status: Exclude<LocationRequestStatus, "granted"> }

export const LOCATION_COPY = {
  why: "Used only to estimate this search. Coordinates are not shown or saved.",
  secure: "This works in supported browsers on a secure page, such as HTTPS or localhost.",
  needed: "Search stays off until location is enabled.",
  granted: "Location enabled",
  denied:
    "Location permission was denied. Allow location for this site in the browser, then press Use my location to try again. You can still browse facilities and the map.",
  unavailable:
    "Your location is unavailable right now. Check that location services are on, then press Use my location to try again.",
  timeout: "The location request timed out. Press Use my location to try again.",
  unsupported:
    "This browser cannot share a location. Use a browser with geolocation on HTTPS or localhost, or try again there. You can still browse facilities and the map.",
} as const

export function requestCurrentLocation(): Promise<LocationRequestResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ status: "unsupported" })
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          resolve({ status: "unavailable" })
          return
        }
        resolve({ status: "granted", latitude, longitude })
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) resolve({ status: "denied" })
        else if (error.code === error.TIMEOUT) resolve({ status: "timeout" })
        else resolve({ status: "unavailable" })
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
    )
  })
}
