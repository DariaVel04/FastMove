import type { CoordinateSource, Facility, Provenance } from "../domain/types.ts"
import { URLS } from "./sources.ts"

/**
 * Places confirmed on City of Tampere pages and the public LIPAS API v2
 * (city code 837, retrieved 24 October 2026). Coordinates are LIPAS points.
 * Opening hours printed on the city pages are not copied. None of these
 * records is a live lane, ice or weather status.
 *
 * Private pools, Nokia Arena, Sentteri halls and the privately maintained
 * Näsijärvi and Tohloppi lake routes are omitted. About a hundred park
 * skating fields are described on the outdoor page and are not listed one by one.
 */

const notLoaded = "Schedule not loaded" as const
const seasonal = "Seasonal — check current conditions" as const
const seasonEnded = "Season ended on the city page" as const

function lipasPoint(
  lipasId: number,
  latitude: number,
  longitude: number,
  matchedName: string,
  recordEventDate: string,
  note: string,
): Pick<Facility, "latitude" | "longitude" | "coordinateSource"> {
  const coordinateSource: CoordinateSource = {
    provider: "LIPAS",
    retrievedOn: "2026-10-24",
    query: `lipas-id ${lipasId}`,
    matchedName,
    recordEventDate,
    sourceUrl: URLS.lipas,
    note,
  }
  return { latitude, longitude, coordinateSource }
}

function cityFact(
  sourceName: string,
  sourceUrl: string,
  pageUpdated: string,
  summary: string,
): Provenance {
  return {
    status: "city-published",
    sourceName,
    sourceUrl,
    pageUpdated,
    verifiedInTimmi: false,
    summary,
  }
}

const poolSource = "City of Tampere — swimming halls and outdoor pool"
const iceSource = "City of Tampere — ice halls"
const outdoorSource = "City of Tampere — skating fields and artificial ice"

export const waterAndIceFacilities: Facility[] = [
  {
    id: "tampere-swimming-centre",
    name: "Tampere Swimming Centre",
    localName: "Tampereen uintikeskus",
    area: "Kaleva",
    address: "Joukahaisenkatu 7 A, 33540 Tampere",
    ...lipasPoint(
      505972,
      61.4990968687062,
      23.8054817123693,
      "Tampereen uintikeskus",
      "2024-09-12",
      "LIPAS public indoor swimming pool (type 3110, lipas-id 505972) at Joukahaisenkatu 7A. The LIPAS event-date is 12 September 2024. This is not a surveyed door and not a live lane status.",
    ),
    kind: "swimming-pool",
    activities: [
      {
        id: "swimming",
        spaceName: "Indoor swimming pools",
        detail:
          "The city page describes an 8-lane 50 m pool that can be split, a teaching pool, a paddling pool and a cold pool. The LIPAS record also describes a 6-lane 25 m training pool and a diving pool in the extension. Free lanes are not loaded.",
      },
    ],
    slots: [],
    schedule: {
      state: "not-loaded",
      label: notLoaded,
      detail:
        "Opening hours are published on the Tampere Swimming Centre page. FastMove does not copy them and does not know which lanes are free.",
      sourceUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/tampereen-uintikeskus",
    },
    otherDocumentedUses:
      "The city page says there are disc-parking spaces in front of this hall. FastMove does not check whether a space is free.",
    infoUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/tampereen-uintikeskus",
    programme: cityFact(
      poolSource,
      "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/tampereen-uintikeskus",
      "17 September 2026",
      "Indoor swimming centre on the city swimming-hall page. Not part of the Liikkuva Tampere ticket list used for the halls.",
    ),
  },
  {
    id: "tesoma-swimming-hall",
    name: "Tesoma Swimming Hall",
    localName: "Tesoman uimahalli",
    area: "Tesoma",
    address: "Tuomarinkatu 7, 33310 Tampere",
    ...lipasPoint(
      505980,
      61.5099244757543,
      23.6162110486369,
      "Tesoman uimahalli",
      "2024-09-12",
      "LIPAS public indoor swimming pool (type 3110, lipas-id 505980). Same street as Tesoma Ice Hall, different LIPAS point and a different building use. The event-date is 12 September 2024. Not a live lane status.",
    ),
    kind: "swimming-pool",
    activities: [
      {
        id: "swimming",
        spaceName: "Indoor swimming pools",
        detail:
          "The city page describes a 6-lane 25 m pool, a children's pool, a spa pool, a cold pool and a diving pool with a 3 m platform and a 1 m springboard. This is the swimming hall, not the ice hall at the same street address.",
      },
    ],
    slots: [],
    schedule: {
      state: "not-loaded",
      label: notLoaded,
      detail:
        "Opening hours are published on the Tesoma Swimming Hall page. FastMove does not copy them and does not know which lanes are free.",
      sourceUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/tesoman-uimahalli",
    },
    otherDocumentedUses:
      "The city page also describes a gym at the swimming hall. It is not matched as a Liikkuva Tampere gym.",
    infoUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/tesoman-uimahalli",
    programme: cityFact(
      poolSource,
      "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/tesoman-uimahalli",
      "26 August 2026",
      "Indoor swimming hall on the city page. Not the Tesoma ice hall and not a Liikkuva Tampere ticket room.",
    ),
  },
  {
    id: "pyynikki-swimming-hall",
    name: "Pyynikki Swimming Hall",
    localName: "Pyynikin uimahalli",
    area: "Pyynikki",
    address: "Kortelahdenkatu 26, 33230 Tampere",
    ...lipasPoint(
      505947,
      61.4980302178021,
      23.7459661394345,
      "Pyynikin uimahalli",
      "2024-09-12",
      "LIPAS public indoor swimming pool (type 3110, lipas-id 505947) at Kortelahdenkatu 26. The event-date is 12 September 2024. Not a live lane status.",
    ),
    kind: "swimming-pool",
    activities: [
      {
        id: "swimming",
        spaceName: "Indoor swimming pools",
        detail:
          "The city page describes a 25 m pool with 6 lanes, a convertible pool, a paddling pool, a spa pool and a cold pool. Free lanes are not loaded.",
      },
    ],
    slots: [],
    schedule: {
      state: "not-loaded",
      label: notLoaded,
      detail:
        "Opening hours are published on the Pyynikki Swimming Hall page, which was updated 17 July 2026. FastMove does not copy them.",
      sourceUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/pyynikin-uimahalli",
    },
    infoUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/pyynikin-uimahalli",
    programme: cityFact(
      poolSource,
      "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/pyynikin-uimahalli",
      "17 July 2026",
      "Indoor swimming hall on the city page. Not a Liikkuva Tampere ticket room.",
    ),
  },
  {
    id: "hervanta-swimming-hall",
    name: "Hervanta Swimming Hall",
    localName: "Hervannan uimahalli",
    area: "Hervanta",
    address: "Torisevanraitti 7, 33720 Tampere",
    ...lipasPoint(
      505804,
      61.4532487664996,
      23.8431132519138,
      "Hervannan uimahalli",
      "2024-09-12",
      "LIPAS public indoor swimming pool (type 3110, lipas-id 505804) at Torisevanraitti 7. The event-date is 12 September 2024. Not a live lane status.",
    ),
    kind: "swimming-pool",
    activities: [
      {
        id: "swimming",
        spaceName: "Indoor swimming pools",
        detail:
          "The city page describes a 6-lane 25 m pool and a children's pool, including a lane used for water running. This is a swimming hall, not the Hervanta leisure centre.",
      },
    ],
    slots: [],
    schedule: {
      state: "not-loaded",
      label: notLoaded,
      detail:
        "Opening hours are published on the Hervanta Swimming Hall page. FastMove does not copy them and does not know which lanes are free.",
      sourceUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/hervannan-uimahalli",
    },
    otherDocumentedUses:
      "The city page also describes a gym at this hall. It is not matched as a Liikkuva Tampere gym.",
    infoUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/hervannan-uimahalli",
    programme: cityFact(
      poolSource,
      "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/hervannan-uimahalli",
      "9 October 2026",
      "Indoor swimming hall on the city page. Not the Hervanta leisure centre on the Liikkuva Tampere ticket.",
    ),
  },
  {
    id: "tampere-outdoor-pool",
    name: "Tampere Outdoor Pool",
    localName: "Tampereen maauimala",
    area: "Kaleva",
    address: "Joukahaisenkatu 7 B, 33540 Tampere",
    ...lipasPoint(
      602802,
      61.49927016014247,
      23.804076496888396,
      "Tampereen Maauimala",
      "2024-06-06",
      "LIPAS open-air pool (type 3210, lipas-id 602802) at Joukahaisenkatu 7 B, behind the swimming centre. The event-date is 6 June 2024. Not a live open status.",
    ),
    kind: "open-air-pool",
    activities: [
      {
        id: "swimming",
        spaceName: "Outdoor pools",
        detail:
          "The city page describes a 50 m pool, a children's pool, a paddling pool and a diving pool behind the swimming centre. It is an outdoor pool, not an indoor swimming hall.",
      },
    ],
    slots: [],
    schedule: {
      state: "published-closed",
      label: seasonEnded,
      detail:
        "Tampere Outdoor Pool is a swimming place, but the city page updated 21 October 2026 says the 2026 season has ended. It is not shown as available. Check that page before a later visit.",
      sourceUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/tampereen-maauimala",
    },
    infoUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/tampereen-maauimala",
    programme: cityFact(
      poolSource,
      "https://www.tampere.fi/liikunta/liikuntapaikat/uimahallit-ja-maauimala/tampereen-maauimala",
      "21 October 2026",
      "Outdoor pool on the city page. The same page says the 2026 season has ended.",
    ),
  },
  {
    id: "hakametsa-ice-hall",
    name: "Tampere Ice Hall",
    localName: "Tampereen jäähalli",
    area: "Hakametsä",
    address: "Keltinkatu 2, 33530 Tampere",
    ...lipasPoint(
      89868,
      61.495896954929,
      23.8241614974419,
      "Tampereen jäähalli (Hakametsän jäähalli 1)",
      "2024-06-06",
      "LIPAS competition ice arena (type 2520, lipas-id 89868) for Tampereen jäähalli. The event-date is 6 June 2024. Not a live ice status. The practice halls have their own points.",
    ),
    kind: "ice-arena",
    activities: [
      {
        id: "ice-hockey",
        spaceName: "Tampere Ice Hall",
        detail:
          "The city page describes Tampere Ice Hall, also called Hakametsä, as the country's first ice hall, built for the 1965 ice-hockey world championships. Private individuals are not granted booking shifts. Public skating is not listed for this hall.",
      },
    ],
    slots: [],
    schedule: {
      state: "not-loaded",
      label: notLoaded,
      detail:
        "The city ice-hall page publishes opening hours for this hall. FastMove does not copy them and does not know whether the ice is free.",
      sourceUrl: URLS.iceHalls,
    },
    otherDocumentedUses:
      "Figure skating is described for the practice hall at the same address, not for this hall. Hakametsä practice hall 3 shifts are allocated by Sentteri Tampere Oy and are not matched.",
    infoUrl: URLS.iceHalls,
    programme: cityFact(
      iceSource,
      URLS.iceHalls,
      "26 August 2026",
      "Ice hall on the city ice-hall page. Not a Liikkuva Tampere ticket room. Not matched as figure skating or public skating.",
    ),
  },
  {
    id: "hakametsa-practice-hall",
    name: "Tampere Practice Ice Hall",
    localName: "Tampereen harjoitusjäähalli",
    area: "Hakametsä",
    address: "Keltinkatu 2, 33530 Tampere",
    ...lipasPoint(
      89874,
      61.4952794263427,
      23.8259457479965,
      "Tampereen harjoitusjäähalli (Hakametsä 2)",
      "2024-06-06",
      "LIPAS competition ice arena (type 2520, lipas-id 89874) for the practice hall. The event-date is 6 June 2024. Not a live ice status. This is not the main Hakametsä hall point.",
    ),
    kind: "ice-arena",
    activities: [
      {
        id: "figure-skating",
        spaceName: "Practice ice hall",
        detail:
          "The city page says this practice hall, at the same address as Tampere Ice Hall, is especially for figure skaters and juniors, and is also used by students and the sports academy. It is not matched as ice hockey or as public skating.",
      },
    ],
    slots: [],
    schedule: {
      state: "not-loaded",
      label: notLoaded,
      detail:
        "Session times for this practice hall are not loaded. The city page says private individuals are not granted booking shifts at the ice halls.",
      sourceUrl: URLS.iceHalls,
    },
    infoUrl: URLS.iceHalls,
    programme: cityFact(
      iceSource,
      URLS.iceHalls,
      "26 August 2026",
      "Practice ice hall on the city page, described for figure skaters and juniors. Not matched as hockey.",
    ),
  },
  {
    id: "hervanta-ice-hall",
    name: "Hervanta Ice Hall",
    localName: "Hervannan jäähalli",
    area: "Hervanta",
    address: "Ruovedenkatu 1, 33720 Tampere",
    ...lipasPoint(
      89881,
      61.4547281926113,
      23.8370667563576,
      "Hervannan jäähalli",
      "2024-06-06",
      "LIPAS training ice arena (type 2510, lipas-id 89881) at Ruovedenkatu 1. The event-date is 6 June 2024. Not a live ice status.",
    ),
    kind: "ice-arena",
    activities: [
      {
        id: "ice-hockey",
        spaceName: "Two hockey rinks",
        detail:
          "The city page says Hervanta Ice Hall has two hockey rinks, also used by juniors, schools, daycare and companies. Free public skating at this hall is a separate stick-free session and is not matched as hockey.",
      },
      {
        id: "figure-skating",
        spaceName: "Figure skating at Hervanta Ice Hall",
        detail:
          "The city page says figure skaters use Hervanta Ice Hall. That is not a confirmed public figure-skating session. Stick-free public skating is a separate use and is not matched as figure skating.",
      },
    ],
    slots: [],
    schedule: {
      state: "not-loaded",
      label: notLoaded,
      detail:
        "The city page says free public skating here is generally from mid-August to the end of March, and stick-free unless stated otherwise. FastMove does not load the session clock and does not know if one is on today.",
      sourceUrl: URLS.iceHalls,
    },
    otherDocumentedUses:
      "Free public skating in autumn and spring is documented for this hall. It is stick-free unless the city says otherwise, so it is not shown as hockey or figure skating.",
    infoUrl: URLS.iceHalls,
    programme: cityFact(
      iceSource,
      URLS.iceHalls,
      "26 August 2026",
      "Ice hall on the city page with two hockey rinks and figure-skating use. Public skating sessions are not loaded.",
    ),
  },
  {
    id: "pyynikki-skating-field",
    name: "Pyynikki Skating Field",
    localName: "Pyynikin luistelukenttä",
    area: "Pyynikki",
    address: "F. E. Sillanpään katu 25, 33230 Tampere",
    ...lipasPoint(
      515039,
      61.4957309138592,
      23.7429058661042,
      "Pyynikin luistelukenttä",
      "2023-02-28",
      "LIPAS ice-skating field (type 1520, lipas-id 515039). The event-date is 28 February 2023. Not a confirmation that the ice is frozen today.",
    ),
    kind: "outdoor-ice-rink",
    activities: [
      {
        id: "outdoor-ice",
        spaceName: "Stick-free outdoor skating",
        detail:
          "The city page says a skating field is frozen at Pyynikki sports field in winter for people without sticks, daily 8:00–21:30 except during events. Those hours describe the field when it is frozen. They are not today's ice condition.",
      },
    ],
    slots: [],
    schedule: {
      state: "seasonal-check",
      label: seasonal,
      detail:
        "Seasonal — check current conditions. The city skating page says park fields are usable when they are lit in the evening and links a freezing-status view. FastMove does not know the weather or whether this field is frozen.",
      sourceUrl: URLS.outdoorIce,
    },
    infoUrl: URLS.outdoorIce,
    programme: cityFact(
      outdoorSource,
      URLS.outdoorIce,
      "25 May 2026",
      "Named outdoor skating field on the city page. Not an indoor ice hall and not confirmed open today.",
    ),
  },
  {
    id: "sorsapuisto-artificial-rink",
    name: "Sorsapuisto Artificial Ice",
    localName: "Sorsapuiston tekojäärata",
    area: "Kaleva",
    address: "Salhojankatu 56, 33540 Tampere",
    ...lipasPoint(
      608153,
      61.49600865834983,
      23.787121211026427,
      "Sorsapuiston tekojäärata",
      "2024-06-26",
      "LIPAS mechanically frozen open-air ice rink (type 1510, lipas-id 608153). The event-date is 26 June 2024. Not a live ice status. A separate enclosure is not this point.",
    ),
    kind: "outdoor-ice-rink",
    activities: [
      {
        id: "outdoor-ice",
        spaceName: "Public outdoor skating",
        detail:
          "The city page says the Sorsapuisto artificial rink and its enclosure, opened in November 2020, both have public skating sessions for everyone. This pin is the LIPAS rink, not the enclosure.",
      },
    ],
    slots: [],
    schedule: {
      state: "seasonal-check",
      label: seasonal,
      detail:
        "Seasonal — check current conditions. Session times are not loaded. FastMove does not know whether the ice is open today.",
      sourceUrl: URLS.outdoorIce,
    },
    infoUrl: URLS.outdoorIce,
    programme: cityFact(
      outdoorSource,
      URLS.outdoorIce,
      "25 May 2026",
      "Named artificial outdoor rink on the city skating page. Not confirmed open today.",
    ),
  },
  {
    id: "koulukatu-artificial-ice",
    name: "Koulukatu Artificial Ice",
    localName: "Koulukadun tekojää",
    area: "Pyynikki",
    address: "Koulukatu 20, 33200 Tampere",
    ...lipasPoint(
      76240,
      61.4926687507622,
      23.7473017175618,
      "Koulukadun tekojääkaukalo 1",
      "2025-09-17",
      "LIPAS mechanically frozen rink (type 1510, lipas-id 76240), the first Koulukatu enclosure. The event-date is 17 September 2025. A second enclosure, lipas-id 510210, is not this pin. Not a live ice status.",
    ),
    kind: "outdoor-ice-rink",
    activities: [
      {
        id: "outdoor-ice",
        spaceName: "Public skating with and without sticks",
        detail:
          "The city page says Koulukatu artificial ice is used for ice sports from November to March, with public skating for people with sticks and without sticks. November to March is the published season, not a date this ice is open.",
      },
    ],
    slots: [],
    schedule: {
      state: "seasonal-check",
      label: seasonal,
      detail:
        "Seasonal — check current conditions. FastMove does not know whether the November-to-March season is underway or whether the ice is skateable today.",
      sourceUrl: URLS.outdoorIce,
    },
    infoUrl: URLS.outdoorIce,
    programme: cityFact(
      outdoorSource,
      URLS.outdoorIce,
      "25 May 2026",
      "Named artificial outdoor ice on the city page. Not confirmed open today.",
    ),
  },
  {
    id: "ahvenisjarvi-public-rink",
    name: "Ahvenisjärvi Public Skating Rink",
    localName: "Ahvenisjärven tekojäärata",
    area: "Hervanta",
    address: "Kemianraitti 6, 33720 Tampere",
    ...lipasPoint(
      612918,
      61.446671348573766,
      23.84225462092636,
      "Ahvenisjärven tekojäärata",
      "2024-06-26",
      "LIPAS mechanically frozen rink (type 1510, lipas-id 612918). The event-date is 26 June 2024. The stick-game rink is a different point. Not a live ice status.",
    ),
    kind: "outdoor-ice-rink",
    activities: [
      {
        id: "outdoor-ice",
        spaceName: "Stick-free public skating",
        detail:
          "The city page says the newest artificial ice at Ahvenisjärvi sports park is only for free public skating. The stick-game rink on the same site is listed separately and is not this pin.",
      },
    ],
    slots: [],
    schedule: {
      state: "seasonal-check",
      label: seasonal,
      detail:
        "Seasonal — check current conditions. FastMove does not know whether this rink is frozen or open today.",
      sourceUrl: URLS.outdoorIce,
    },
    infoUrl: URLS.outdoorIce,
    programme: cityFact(
      outdoorSource,
      URLS.outdoorIce,
      "25 May 2026",
      "Stick-free public artificial rink named on the city skating page. Not confirmed open today.",
    ),
  },
  {
    id: "ahvenisjarvi-stick-rink",
    name: "Ahvenisjärvi Stick Rink",
    localName: "Ahvenisjärven kaukalo",
    area: "Hervanta",
    address: "Kemianraitti 6, 33720 Tampere",
    ...lipasPoint(
      612919,
      61.447423893230734,
      23.840394523337505,
      "Ahvenisjärven kaukalo",
      "2024-06-26",
      "LIPAS mechanically frozen rink (type 1510, lipas-id 612919), the stick rink. The event-date is 26 June 2024. Not the stick-free public rink and not a live ice status.",
    ),
    kind: "outdoor-ice-rink",
    activities: [
      {
        id: "outdoor-ice",
        spaceName: "Stick-game rink",
        detail:
          "The city page says Ahvenisjärvi also has a rink only for stick games. It is an outdoor rink, not an ice-hockey arena and not a figure-skating session.",
      },
    ],
    slots: [],
    schedule: {
      state: "seasonal-check",
      label: seasonal,
      detail:
        "Seasonal — check current conditions. FastMove does not know whether this stick rink is frozen or open today.",
      sourceUrl: URLS.outdoorIce,
    },
    infoUrl: URLS.outdoorIce,
    programme: cityFact(
      outdoorSource,
      URLS.outdoorIce,
      "25 May 2026",
      "Outdoor stick-game rink named on the city skating page. Not matched as ice hockey or figure skating, and not confirmed open today.",
    ),
  },
  {
    id: "lielahti-public-rink",
    name: "Lielahti Public Skating Ice",
    localName: "Lielahden tekojääkenttä",
    area: "Lielahti",
    address: "Teivaalantie 2, 33400 Tampere",
    ...lipasPoint(
      504350,
      61.522310755907284,
      23.668477886512754,
      "Lielahden tekojääkenttä",
      "2025-08-25",
      "LIPAS mechanically frozen rink (type 1510, lipas-id 504350), the Lielahti field. The event-date is 25 August 2025. A separate enclosure, lipas-id 501605, is not this pin. Not a live ice status.",
    ),
    kind: "outdoor-ice-rink",
    activities: [
      {
        id: "outdoor-ice",
        spaceName: "Free public skating",
        detail:
          "The city page says the lower field at Lielahti sports park is frozen in winter as artificial ice for free public skating. This pin is that field, not the separate enclosure recorded at the same address.",
      },
    ],
    slots: [],
    schedule: {
      state: "seasonal-check",
      label: seasonal,
      detail:
        "Seasonal — check current conditions. FastMove does not know whether this field is frozen today.",
      sourceUrl: URLS.outdoorIce,
    },
    infoUrl: URLS.outdoorIce,
    programme: cityFact(
      outdoorSource,
      URLS.outdoorIce,
      "25 May 2026",
      "Named outdoor public skating ice on the city page. Not confirmed open today.",
    ),
  },
]
