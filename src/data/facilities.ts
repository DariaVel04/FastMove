import type { ActivityId, AvailabilitySlot, CoordinateSource, Facility, Provenance } from "../domain/types.ts"
import { PROGRAMME_PAGE_UPDATED, timmiRoomUrl, URLS } from "./sources.ts"
import { waterAndIceFacilities } from "./waterAndIce.ts"

const programme: Provenance = {
  status: "city-published",
  sourceName: "City of Tampere — Liikkuva Tampere ticket",
  sourceUrl: URLS.ticket,
  pageUpdated: PROGRAMME_PAGE_UPDATED,
  verifiedInTimmi: false,
  summary:
    "The facility belongs to the Liikkuva Tampere programme on the Finnish city page. Open slots are not listed there.",
}

const demonstrationSlot: Provenance = {
  status: "demonstration",
  sourceName: "FastMove demonstration timetable",
  verifiedInTimmi: false,
  summary:
    "Manually written example for this demo. It is not current availability and it was not read from Timmi.",
}

const liikkuvaSchedule = {
  state: "demonstration-examples",
  label: "Demonstration examples",
  detail: "Example windows are not opening hours and have not been checked in Timmi.",
} as const

function slot(
  id: string,
  activityId: AvailabilitySlot["activityId"],
  spaceName: string,
  durationMinutes: number,
  exampleWindow: string,
): AvailabilitySlot {
  return {
    id,
    activityId,
    spaceName,
    durationMinutes,
    exampleWindow,
    provenance: demonstrationSlot,
  }
}

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

/**
 * Programme membership and room links come from the Finnish Liikkuva Tampere page
 * (updated 15 October 2026). Coordinates come from the public LIPAS API v2,
 * city code 837, retrieved 24 October 2026. LIPAS does not decide ticket
 * eligibility. Demo slots are still examples.
 *
 * Tampere open data does not publish these indoor halls. Swimming pools,
 * ice halls and named outdoor rinks are appended from waterAndIce.ts.
 * Timmi has no documented availability API. Room links below are the guest
 * calendar URLs printed on the city page.
 */
export const facilities: Facility[] = [
  {
    id: "hervanta",
    name: "Hervanta Leisure Centre",
    localName: "Hervannan vapaa-aikakeskus",
    area: "Hervanta",
    address: "Lindforsinkatu 5, 33720 Tampere",
    ...lipasPoint(
      80465,
      61.4496683157539,
      23.8465228638537,
      "Hervannan vapaa-aikakeskus, palloilusali",
      "2024-06-17",
      "LIPAS point for the ball hall at Lindforsinkatu 5 (lipas-id 80465). Other rooms have their own points. This does not confirm ticket eligibility or a surveyed entrance.",
    ),
    activities: [
      {
        id: "gym",
        spaceName: "Hilkka gym",
        detail: "The Liikkuva Tampere ticket page lists Hilkka gym.",
        timmiUrl: timmiRoomUrl(18721),
      },
      {
        id: "functional-training",
        spaceName: "Functional training gym",
        detail: "The Liikkuva Tampere ticket page lists a functional training gym at Hervanta.",
        timmiUrl: timmiRoomUrl(18734),
      },
      {
        id: "martial-arts",
        spaceName: "Tauno martial arts hall and Pertsa tatami hall",
        detail:
          "The ticket page lists Tauno martial arts hall and Pertsa tatami hall. The link opens Tauno. Pertsa has no guest link on that page.",
        timmiUrl: timmiRoomUrl(18725),
      },
    ],
    otherDocumentedUses:
      "Pietilä hall is equipped for basketball, volleyball, futsal, badminton and pickleball, but the ticket page does not name Pietilä. Reima, Birgitta, Desiree and Eila are on the ticket without a named sport, so they are not matched.",
    slots: [
      slot("hervanta-gym", "gym", "Hilkka gym", 90, "Example 16:00–17:30"),
      slot("hervanta-functional", "functional-training", "Functional training gym", 60, "Example 18:00–19:00"),
      slot("hervanta-martial-arts", "martial-arts", "Tauno martial arts hall", 60, "Example 19:00–20:00"),
    ],
    infoUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/sisaliikuntapaikat/hervannan-vapaa-aikakeskus",
    kind: "sports-centre",
    schedule: liikkuvaSchedule,
    programme,
  },
  {
    id: "kaukajarvi",
    name: "Kaukajärvi Leisure Centre",
    localName: "Kaukajärven vapaa-aikatalo",
    area: "Kaukajärvi",
    address: "Käätykatu 8, 33710 Tampere",
    ...lipasPoint(
      79792,
      61.4699155341909,
      23.8735721508476,
      "Kaukajärven vapaa-aikatalon palloilusali",
      "2024-06-12",
      "LIPAS point for the ball hall at Käätykatu 8 (lipas-id 79792). The gym has a separate nearby point. This does not confirm ticket eligibility or a surveyed entrance.",
    ),
    activities: [
      {
        id: "gym",
        spaceName: "Lower gym",
        detail: "The Liikkuva Tampere ticket page lists the lower and upper gyms at Kaukajärvi.",
        timmiUrl: timmiRoomUrl(8674),
      },
      {
        id: "basketball",
        spaceName: "Ball sports hall",
        detail: "The City of Tampere says the Kaukajärvi ball hall suits basketball.",
        timmiUrl: timmiRoomUrl(5523),
      },
      {
        id: "volleyball",
        spaceName: "Ball sports hall",
        detail: "The City of Tampere says the Kaukajärvi ball hall suits volleyball.",
        timmiUrl: timmiRoomUrl(5523),
      },
    ],
    slots: [
      slot("kaukajarvi-gym", "gym", "Lower gym", 60, "Example 10:00–11:00"),
      slot("kaukajarvi-basketball", "basketball", "Ball sports hall", 90, "Example 17:00–18:30"),
      slot("kaukajarvi-volleyball", "volleyball", "Ball sports hall", 90, "Example 18:30–20:00"),
    ],
    infoUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/sisaliikuntapaikat/kaukajarven-vapaa-aikatalo",
    kind: "sports-centre",
    schedule: liikkuvaSchedule,
    programme,
  },
  {
    id: "naashalli",
    name: "Nääshalli",
    localName: "Nääshalli",
    area: "Amuri",
    address: "Näsijärvenkatu 8, 33210 Tampere",
    ...lipasPoint(
      78126,
      61.5029715466621,
      23.7476317588171,
      "Nääshallin kuntosali",
      "2024-06-13",
      "LIPAS point for the gym at Näsijärvenkatu 8 (lipas-id 78126). Table tennis and the other rooms have their own nearby points. This does not confirm ticket eligibility or a surveyed entrance.",
    ),
    activities: [
      {
        id: "gym",
        spaceName: "Gym",
        detail: "The Liikkuva Tampere ticket page lists a gym at Nääshalli.",
        timmiUrl: timmiRoomUrl(5588),
      },
      {
        id: "functional-training",
        spaceName: "Functional training gym",
        detail: "The Liikkuva Tampere ticket page lists a functional training gym at Nääshalli.",
        timmiUrl: timmiRoomUrl(17878),
      },
      {
        id: "table-tennis",
        spaceName: "Table tennis",
        detail: "The City of Tampere lists table tennis practice and competition space at Nääshalli.",
        timmiUrl: timmiRoomUrl(6868),
      },
      {
        id: "martial-arts",
        spaceName: "Aikido hall and budo halls 2–6",
        detail:
          "The ticket page lists an aikido hall and budo halls 2–6. The link opens the aikido hall. The budo halls have no guest links on that page.",
        timmiUrl: timmiRoomUrl(5696),
      },
    ],
    otherDocumentedUses:
      "The ticket also lists a sports hall. The city page does not name basketball, volleyball or badminton for that hall, so it is not matched.",
    slots: [
      slot("naashalli-gym", "gym", "Gym", 75, "Example 12:00–13:15"),
      slot("naashalli-functional", "functional-training", "Functional training gym", 60, "Example 13:30–14:30"),
      slot("naashalli-table-tennis", "table-tennis", "Table tennis", 120, "Example 15:00–17:00"),
      slot("naashalli-martial-arts", "martial-arts", "Aikido hall", 90, "Example 17:00–18:30"),
    ],
    infoUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/sisaliikuntapaikat/naashalli",
    kind: "sports-centre",
    schedule: liikkuvaSchedule,
    programme,
  },
  {
    id: "tampere-stadium",
    name: "Tampere Stadium",
    localName: "Tampereen stadion",
    area: "Ratina",
    address: "Ratinan rantatie 1, 33100 Tampere",
    ...lipasPoint(
      78224,
      61.4932304295541,
      23.7636252750788,
      "Tampereen stadionin kuntosali",
      "2024-06-13",
      "LIPAS point for the gym at Tampere Stadium (lipas-id 78224), not the outdoor pitch. This does not confirm ticket eligibility or a surveyed entrance.",
    ),
    activities: [
      {
        id: "gym",
        spaceName: "Gym",
        detail:
          "The Liikkuva Tampere ticket page lists this gym. The stadium page says the gym is intended for clubs and communities, and points individual visitors to other city gyms.",
        timmiUrl: timmiRoomUrl(5520),
      },
      {
        id: "floorball",
        spaceName: "Sports hall 1",
        detail: "The stadium page lists floorball goals in sports hall 1. Halls 1, 2 and 3 are on the ticket page.",
        timmiUrl: timmiRoomUrl(5531),
      },
      {
        id: "gymnastics",
        spaceName: "Sports halls 1–3",
        detail:
          "The stadium page groups halls 1–3 under team gymnastics and sports halls. The apparatus hall is a different room and is not on the ticket list. The ticket page does not give these halls one shared guest link.",
      },
    ],
    slots: [
      slot("stadium-gym", "gym", "Gym", 60, "Example 09:00–10:00"),
      slot("stadium-floorball", "floorball", "Sports hall 1", 45, "Example 10:15–11:00"),
      slot("stadium-gymnastics", "gymnastics", "Sports halls 1–3", 60, "Example 11:15–12:15"),
    ],
    infoUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/tampereen-stadion",
    kind: "sports-centre",
    schedule: liikkuvaSchedule,
    programme,
  },
  {
    id: "tesoma-ice",
    name: "Tesoma Ice Stadium",
    localName: "Tesoman jäähalli",
    area: "Tesoma",
    address: "Tuomarinkatu 7, 33310 Tampere",
    ...lipasPoint(
      529628,
      61.5106062357947,
      23.6151151894701,
      "Tesoman jäähalli 1",
      "2024-06-06",
      "LIPAS point for Tesoman jäähalli 1 at Tuomarinkatu 7 (lipas-id 529628). The ticket covers the gym at this address. LIPAS does not publish a separate gym point here, so the pin is the ice hall, not a surveyed gym door.",
    ),
    activities: [
      {
        id: "gym",
        spaceName: "Gym",
        detail: "The Liikkuva Tampere ticket page lists the gym at Tesoma Ice Stadium. The ticket does not cover the ice.",
        timmiUrl: timmiRoomUrl(5536),
      },
    ],
    slots: [slot("tesoma-ice-gym", "gym", "Gym", 90, "Example 11:00–12:30")],
    otherDocumentedUses:
      "The city ice-hall page says free public skating is offered at Tesoma Ice Hall in autumn and spring, generally from mid-August to the end of March, and that those sessions are stick-free unless stated otherwise. That skating is not the gym on the Liikkuva ticket, and this hall is not matched as ice hockey or figure skating. Tesoma ice hall 2 shifts are allocated by Sentteri Tampere Oy and are not matched either. FastMove does not know whether a session is on the ice today.",
    infoUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/jaahallit",
    kind: "sports-centre",
    schedule: liikkuvaSchedule,
    programme,
  },
  {
    id: "tesoma-ball",
    name: "Tesoma Sports Hall",
    localName: "Tesoman palloiluhalli",
    area: "Tesoma",
    address: "Tesoman valtatie 46, 33310 Tampere",
    ...lipasPoint(
      522571,
      61.5085136496175,
      23.6274816472255,
      "Tesoman palloiluhalli",
      "2024-06-10",
      "LIPAS point for Tesoman palloiluhalli (lipas-id 522571). The gym point is a few metres away. This does not confirm ticket eligibility or a surveyed entrance.",
    ),
    activities: [
      {
        id: "gym",
        spaceName: "Gym",
        detail: "The Liikkuva Tampere ticket page lists a gym at Tesoma Sports Hall.",
        timmiUrl: timmiRoomUrl(8510),
      },
      {
        id: "basketball",
        spaceName: "Ball games hall courts 1–3",
        detail:
          "The City of Tampere says Tesoma Sports Hall suits basketball. The ticket covers courts 1–3 and does not link a separate Timmi room for them.",
      },
      {
        id: "futsal",
        spaceName: "Ball games hall courts 1–3",
        detail:
          "The City of Tampere says Tesoma Sports Hall suits futsal. The ticket covers courts 1–3 and does not link a separate Timmi room for them.",
      },
      {
        id: "floorball",
        spaceName: "Ball games hall courts 1–3",
        detail:
          "The City of Tampere says Tesoma Sports Hall suits floorball. The ticket covers courts 1–3 and does not link a separate Timmi room for them.",
      },
    ],
    slots: [
      slot("tesoma-ball-gym", "gym", "Gym", 60, "Example 13:00–14:00"),
      slot(
        "tesoma-ball-basketball-short",
        "basketball",
        "Ball games hall, shorter example",
        45,
        "Example 14:00–14:45",
      ),
      slot(
        "tesoma-ball-basketball-long",
        "basketball",
        "Ball games hall, longer example",
        120,
        "Example 16:00–18:00",
      ),
      slot("tesoma-ball-futsal", "futsal", "Ball games hall courts 1–3", 90, "Example 18:00–19:30"),
      slot("tesoma-ball-floorball", "floorball", "Ball games hall courts 1–3", 90, "Example 19:30–21:00"),
    ],
    infoUrl: "https://www.tampere.fi/liikunta/liikuntapaikat/sisaliikuntapaikat/tesoman-palloiluhalli",
    kind: "sports-centre",
    schedule: liikkuvaSchedule,
    programme,
  },
  {
    id: "kauppi",
    name: "Kauppi Sports Center",
    localName: "Kauppi Sports Center",
    area: "Kauppi",
    address: "Kuntokatu 17, 33520 Tampere",
    ...lipasPoint(
      605616,
      61.508359247915244,
      23.807853852927423,
      "Kauppi Sports Center",
      "2023-06-20",
      "LIPAS sports-hall point for Kauppi Sports Center (lipas-id 605616). It is not the Well Gym record in the same building. This does not confirm ticket eligibility or a surveyed entrance.",
    ),
    activities: [],
    otherDocumentedUses:
      "The ticket covers ball-hall courts 1–3. It does not name the sport or link a Timmi room, and no city page confirming a sport for these courts was found, so they are not matched.",
    slots: [],
    infoUrl: URLS.ticket,
    kind: "sports-centre",
    schedule: liikkuvaSchedule,
    programme,
  },
  {
    id: "exhibition",
    name: "Tampere Exhibition and Sports Centre",
    localName: "Tampereen Messu- ja Urheilukeskus",
    area: "Härmälä",
    address: "Ilmailunkatu 20, 33900 Tampere",
    ...lipasPoint(
      88985,
      61.4648981049474,
      23.732429264912,
      "Tampereen messukeskuksen B-halli",
      "2017-09-08",
      "LIPAS point for B-hall (lipas-id 88985). Hall A has a separate point. The LIPAS event-date on this record is 8 September 2017. This does not confirm ticket eligibility or a surveyed entrance.",
    ),
    activities: [
      {
        id: "football",
        spaceName: "Hall A",
        detail:
          "The city page says hall A is a football and athletics training hall. The ticket covers hall A during the sports season. Hall B is described as an athletics hall, so it is not matched for football. The map pin is the LIPAS point for hall B. The ticket page does not link a Timmi room.",
      },
    ],
    otherDocumentedUses:
      "Hall B is on the ticket and is described as an athletics practice hall. Futsal and floorball courts are in D-hall, and another football field is in C-hall. C and D are not on the ticket list.",
    slots: [slot("exhibition-football", "football", "Hall A", 90, "Example 12:00–13:30")],
    infoUrl:
      "https://www.tampere.fi/liikunta/liikuntapaikat/sisaliikuntapaikat/tampereen-messu-ja-urheilukeskus",
    kind: "sports-centre",
    schedule: liikkuvaSchedule,
    programme,
  },
  ...waterAndIceFacilities,
]

export function facilitiesForActivity(activityId: ActivityId): Facility[] {
  return facilities.filter((facility) => facility.activities.some((activity) => activity.id === activityId))
}
