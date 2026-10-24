import type { ActivityId, FacilityKind } from "../domain/types.ts"

/**
 * Destinations checked on 24 October 2026.
 * The Finnish ticket page is the authority for the Liikkuva Tampere programme.
 */
export const URLS = {
  ticket:
    "https://www.tampere.fi/liikunta/liikuntatilojen-kayttovuorot-ja-varaaminen/liikkuva-tampere-lippu",
  ticketEnglish:
    "https://www.tampere.fi/en/sports-and-exercise/booking-sports-and-other-facilities/liikkuva-tampere-ticket",
  timmiGuide:
    "https://www.tampere.fi/liikunta/liikuntatilojen-kayttovuorot-ja-varaaminen/timmi-varausjarjestelma",
  /** Calendar root linked from the Finnish ticket page. Not an availability API. */
  timmiApp: "https://timmi.tampere.fi/WebTimmi/#/",
  lipas: "https://www.lipas.fi/liikuntapaikat",
  openData: "https://data.tampere.fi/fi/",
  /** Online shop linked from the Finnish ticket page. */
  sportsShop: "https://osteri.pusatec.fi/tampere-sport",
  swimmingHalls: "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala",
  iceHalls: "https://www.tampere.fi/liikunta/liikuntapaikat/jaahallit",
  outdoorIce: "https://www.tampere.fi/liikunta/liikuntapaikat/luistelukentat-ja-tekojaat",
} as const

/** The Finnish ticket page prints "Päivitetty 15.10.2026". This is that date, not a slot update. */
export const PROGRAMME_PAGE_UPDATED = "15 October 2026"

export const DEMO_NOTICE =
  "Demonstration availability only. Always check the current booking status in Timmi before purchasing a Liikkuva Tampere ticket."

export const DEMO_SCHEDULE_NOTICE =
  "Demo schedules are fictional examples created to demonstrate FastMove’s search and matching features. They do not represent actual facility bookings or availability. Check the official facility schedule before visiting."

/** Shown when a search has no booking intervals. Not a claim that halls are full. */
export const NO_CONFIRMED_SLOTS =
  "No matching confirmed slots were found in the available data. FastMove does not read Timmi bookings, so this does not mean every facility is fully booked. Open the official calendar, or change your window, maximum outing or minimum workout."

export const ACTIVITY_LABELS = {
  gym: "Gym / Fitness",
  "functional-training": "Functional Training",
  badminton: "Badminton",
  tennis: "Tennis",
  "table-tennis": "Table Tennis",
  basketball: "Basketball",
  volleyball: "Volleyball",
  football: "Football",
  futsal: "Futsal",
  floorball: "Floorball",
  swimming: "Swimming",
  "figure-skating": "Figure Skating",
  "ice-hockey": "Ice Hockey",
  "outdoor-ice": "Public Outdoor Ice Rinks",
  gymnastics: "Gymnastics",
  "martial-arts": "Martial Arts",
  "other-indoor": "Other Indoor Sports",
} as const

/** Display order for the sport control. Football and futsal stay separate because the city pages do. */
export const ACTIVITY_GROUPS = [
  { label: "Fitness", ids: ["gym", "functional-training"] },
  { label: "Racket Sports", ids: ["badminton", "tennis", "table-tennis"] },
  { label: "Ball Sports", ids: ["basketball", "volleyball", "football", "futsal", "floorball"] },
  { label: "Water Sports", ids: ["swimming"] },
  { label: "Ice Sports", ids: ["figure-skating", "ice-hockey", "outdoor-ice"] },
  { label: "Other", ids: ["gymnastics", "martial-arts", "other-indoor"] },
] as const satisfies readonly { label: string; ids: readonly ActivityId[] }[]

export const FACILITY_KIND_LABELS = {
  "sports-centre": "Sports centre",
  "swimming-pool": "Swimming pool",
  "open-air-pool": "Outdoor swimming pool",
  "ice-arena": "Ice arena",
  "outdoor-ice-rink": "Outdoor ice rink",
} as const satisfies Record<FacilityKind, string>

/**
 * city-listed: at least one ticket room is named for this activity.
 * needs-verification: shown in the filter, never returned as a confirmed match.
 */
export const ACTIVITY_CATALOG = {
  gym: {
    status: "city-listed",
    summary: "Named gyms on the Liikkuva Tampere ticket page.",
  },
  "functional-training": {
    status: "city-listed",
    summary: "Functional training gyms named at Hervanta and Nääshalli.",
  },
  basketball: {
    status: "city-listed",
    summary: "Ball halls the city says suit basketball and that the ticket includes.",
  },
  volleyball: {
    status: "city-listed",
    summary: "The Kaukajärvi ball hall, which the city says suits volleyball.",
  },
  badminton: {
    status: "needs-verification",
    summary:
      "Hervanta’s Pietilä hall is equipped for badminton, but the ticket page does not name Pietilä.",
  },
  "table-tennis": {
    status: "city-listed",
    summary: "Table tennis space named at Nääshalli.",
  },
  tennis: {
    status: "needs-verification",
    summary: "These sources do not name a tennis court in the programme.",
  },
  floorball: {
    status: "city-listed",
    summary:
      "Tesoma Sports Hall, which the city names for floorball, and Stadium hall 1, which lists floorball goals.",
  },
  football: {
    status: "city-listed",
    summary:
      "Exhibition Centre hall A, described for football. The ticket covers hall A during the sports season.",
  },
  futsal: {
    status: "city-listed",
    summary:
      "Tesoma Sports Hall, which the city names for futsal. Exhibition D-hall has futsal courts, but D-hall is not on the ticket list.",
  },
  "martial-arts": {
    status: "city-listed",
    summary: "Martial arts and tatami rooms named on the ticket page at Hervanta and Nääshalli.",
  },
  gymnastics: {
    status: "city-listed",
    summary:
      "Stadium halls 1–3, published under the city’s team-gymnastics and sports-hall heading. The apparatus hall is not on the ticket.",
  },
  swimming: {
    status: "city-listed",
    summary:
      "Four indoor swimming halls on the City of Tampere swimming-hall pages. The outdoor pool is separate: the city page updated 21 October 2026 says its 2026 season has ended, so it is not recommended as available. Opening hours and free lanes are not copied here.",
  },
  "figure-skating": {
    status: "city-listed",
    summary:
      "The Hakametsä practice hall, which the city says is especially for figure skaters, and Hervanta Ice Hall, where the city says figure skaters train. A hockey rink is not treated as figure skating. Session times are not loaded.",
  },
  "ice-hockey": {
    status: "city-listed",
    summary:
      "Tampere Ice Hall at Hakametsä, and Hervanta Ice Hall, which the city says has two hockey rinks. Stick-free public skating is not matched as hockey. Session times are not loaded.",
  },
  "outdoor-ice": {
    status: "city-listed",
    summary:
      "Named public outdoor sites on the city skating page. Every one is seasonal — check current conditions. FastMove does not list every park field, and it does not include the privately maintained lake routes.",
  },
  "other-indoor": {
    status: "needs-verification",
    summary:
      "These sources do not name another indoor sport beyond the activities in this list.",
  },
} as const

export const TRANSPORT_LABELS = {
  walking: "Walking",
  cycling: "Cycling",
  "public-transport": "Public transport",
  car: "Car",
} as const

/**
 * Guest-browse links published on the City of Tampere ticket page.
 * The room id is copied from that page. FastMove does not read the calendar.
 */
export function timmiRoomUrl(roomId: number): string {
  return `https://timmi.tampere.fi/WebTimmi/login.do?loginName=GUEST&password=NO&roomId=${roomId}&adminAreaId=68`
}
