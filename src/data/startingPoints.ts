import type { StartingPoint } from "../domain/types.ts"

/**
 * Starting points geocoded with OpenStreetMap Nominatim on 24 October 2026.
 * LIPAS does not publish these everyday start places, so they stay address geocodes.
 */
export const startingPoints: StartingPoint[] = [
  {
    id: "hervanta-campus",
    name: "Hervanta campus",
    address: "Korkeakoulunkatu 7, 33720 Tampere",
    latitude: 61.4498946,
    longitude: 23.8587571,
    coordinateSource: {
      provider: "OpenStreetMap Nominatim",
      retrievedOn: "2026-10-24",
      query: "Korkeakoulunkatu 7, Tampere",
      matchedName: "Kampusareena",
      note: "Kampusareena at Tampere University, Hervanta campus.",
    },
  },
  {
    id: "keskustori",
    name: "Keskustori",
    address: "Keskustori, Tampere",
    latitude: 61.4980164,
    longitude: 23.7608252,
    coordinateSource: {
      provider: "OpenStreetMap Nominatim",
      retrievedOn: "2026-10-24",
      query: "Keskustori, Tampere",
      matchedName: "Keskustori",
      note: "The central square.",
    },
  },
  {
    id: "railway-station",
    name: "Tampere railway station",
    address: "Rautatienkatu 25, 33100 Tampere",
    latitude: 61.4985679,
    longitude: 23.7730049,
    coordinateSource: {
      provider: "OpenStreetMap Nominatim",
      retrievedOn: "2026-10-24",
      query: "Tampere railway station",
      matchedName: "Tampereen rautatieasema",
      note: "OpenStreetMap building for the railway station.",
    },
  },
  {
    id: "kaleva-church",
    name: "Kaleva church",
    address: "Liisanpuisto 1, Tampere",
    latitude: 61.4991278,
    longitude: 23.7939626,
    coordinateSource: {
      provider: "OpenStreetMap Nominatim",
      retrievedOn: "2026-10-24",
      query: "Kalevan kirkko, Tampere",
      matchedName: "Kalevan kirkko",
      note: "Kaleva church.",
    },
  },
  {
    id: "tesoma",
    name: "Tesoma",
    address: "Tesoma, Tampere",
    latitude: 61.5033648,
    longitude: 23.6305262,
    coordinateSource: {
      provider: "OpenStreetMap Nominatim",
      retrievedOn: "2026-10-24",
      query: "Tesoma, Tampere",
      matchedName: "Tesoma",
      note: "A point in the Tesoma district, not a specific door.",
    },
  },
]

export const DEFAULT_STARTING_POINT_ID = "hervanta-campus"

/** Saved points a search can use when device location is off. Coordinates stay in this file. */
export const MANUAL_START_IDS = ["keskustori", "hervanta-campus", "tesoma"] as const
