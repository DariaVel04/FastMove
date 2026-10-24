import { ACTIVITY_IDS, AVAILABLE_MINUTES, TRANSPORT_MODES } from "../domain/types.ts"
import type { ActivityId, AvailableMinutes, TransportMode } from "../domain/types.ts"
import { facilitiesForActivity, facilities } from "../data/facilities.ts"
import { buildDemoSchedule, describeDemoSlot, overlapsDailyWindow } from "../data/demoSchedule.ts"
import { ACTIVITY_CATALOG, ACTIVITY_GROUPS, DEMO_NOTICE, DEMO_SCHEDULE_NOTICE } from "../data/sources.ts"
import { startingPoints } from "../data/startingPoints.ts"
import { googleMapsDirectionsUrl } from "./directions.ts"
import { LOCATION_COPY } from "./geolocation.ts"
import { findMatches } from "./match.ts"
import { presentMatches } from "./present.ts"
import { SCORE_WEIGHTS } from "./scoring.ts"
import { assessSlotAttendance, formatClock, parseClock, validateSearchTiming } from "./slotMatch.ts"
import { assessTimeFit, MIN_EXERCISE_MINUTES } from "./timefit.ts"
import { estimateTravel, TRAVEL_MODEL } from "./travel.ts"

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

export function runSelfCheck(): void {
  const weightSum =
    SCORE_WEIGHTS.travelConvenience + SCORE_WEIGHTS.timeFit + SCORE_WEIGHTS.dataConfidence
  assert(Math.abs(weightSum - 1) < 0.0001, "score weights must sum to 1")
  assert(
    DEMO_NOTICE ===
      "Demonstration availability only. Always check the current booking status in Timmi before purchasing a Liikkuva Tampere ticket.",
    "trust notice changed",
  )

  const capped = assessTimeFit(180, 10, 45)
  assert(capped.remainingMinutes === 160, "remaining time")
  assert(capped.exerciseMinutes === 45, "slot duration must cap exercise")
  assert(capped.fits, "capped visit should fit")

  const tooShort = assessTimeFit(60, 20, 90)
  assert(tooShort.remainingMinutes === 20, "short remaining")
  assert(tooShort.fits === false, "under 30 minutes must be excluded")

  const impossible = assessTimeFit(60, 40, 120)
  assert(impossible.fits === false, "round trip longer than the window must fail")

  checkSlotAttendance()
  checkDemoSchedule()
  assert(parseClock("14:30") === 14 * 60 + 30, "clock parse")
  assert(formatClock(14 * 60 + 30) === "14:30", "clock format")
  assert(
    validateSearchTiming({
      availableFrom: "14:30",
      availableUntil: "19:30",
      maxOutingMinutes: 90,
      minWorkoutMinutes: 45,
    }) === null,
    "the example window is valid",
  )
  assert(
    validateSearchTiming({
      availableFrom: "14:30",
      availableUntil: "19:30",
      maxOutingMinutes: 60,
      minWorkoutMinutes: 90,
    }) !== null,
    "minimum workout cannot exceed the outing",
  )

  for (const activityId of ACTIVITY_IDS) {
    for (const availableMinutes of AVAILABLE_MINUTES) {
      for (const transport of TRANSPORT_MODES) {
        for (const start of startingPoints) {
          checkQuery(activityId, availableMinutes, transport, start.id)
        }
      }
    }
  }

  const campusBasketball = findMatches(
    {
      activityId: "basketball",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 180,
      minWorkoutMinutes: 30,
      transport: "cycling",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  assert(
    campusBasketball.results.every((result) => result.facility.id !== "hervanta"),
    "Hervanta basketball is not on the ticket room list",
  )
  assert(
    campusBasketball.confirmed.length === 0,
    "example basketball windows are not confirmed slots",
  )
  const kaukajarviBasketball = campusBasketball.results.find(
    (result) => result.facility.id === "kaukajarvi",
  )
  assert(kaukajarviBasketball !== undefined, "Kaukajärvi basketball should fit from campus")
  if (kaukajarviBasketball) {
    assert(kaukajarviBasketball.slot !== null, "basketball keeps an example slot")
    if (kaukajarviBasketball.slot) {
      assert(
        kaukajarviBasketball.timeFit.remainingMinutes > kaukajarviBasketball.slot.durationMinutes,
        "expected the Kaukajärvi slot to be shorter than the time remaining",
      )
      assert(
        kaukajarviBasketball.timeFit.exerciseMinutes === kaukajarviBasketball.slot.durationMinutes,
        "exercise time must stop at the recorded slot",
      )
    }
  }

  const tesomaBasketball = findMatches(
    {
      activityId: "basketball",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 180,
      minWorkoutMinutes: 30,
      transport: "walking",
      startingPointId: "tesoma",
    },
    fixtureOrigin("tesoma"),
  )
  const tesomaBall = tesomaBasketball.results.find((result) => result.facility.id === "tesoma-ball")
  assert(tesomaBall !== undefined, "Tesoma Sports Hall should fit from Tesoma")
  if (tesomaBall) {
    assert(tesomaBall.slot !== null && tesomaBall.slot.durationMinutes === 120, "the longer example slot should be chosen")
    assert(tesomaBall.timeFit.exerciseMinutes > 45, "the 45-minute example must not cap a longer fit")
  }

  for (const start of startingPoints) {
    for (const availableMinutes of AVAILABLE_MINUTES) {
      for (const transport of TRANSPORT_MODES) {
        const gap = findMatches(
          {
            activityId: "badminton",
            availableFrom: "08:00",
            availableUntil: "22:00",
            maxOutingMinutes: availableMinutes,
            minWorkoutMinutes: 30,
            transport,
            startingPointId: start.id,
          },
          { latitude: start.latitude, longitude: start.longitude },
        )
        assert(gap.results.length === 0, "badminton is not documented for these facilities")
        assert(gap.confirmed.length === 0, "an unsupported sport has no confirmed slots")
        assert(gap.activitySupportedCount === 0, "badminton support count")
      }
    }
  }

  const sample = findMatches(
    {
      activityId: "basketball",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 120,
      minWorkoutMinutes: 30,
      transport: "cycling",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  const again = findMatches(
    {
      activityId: "basketball",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 120,
      minWorkoutMinutes: 30,
      transport: "cycling",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  assert(JSON.stringify(sample) === JSON.stringify(again), "matching must be deterministic")

  assert(
    sameIds("basketball", ["kaukajarvi", "tesoma-ball"]),
    "basketball facilities",
  )
  assert(sameIds("volleyball", ["kaukajarvi"]), "volleyball facilities")
  assert(sameIds("football", ["exhibition"]), "football facilities")
  assert(sameIds("futsal", ["tesoma-ball"]), "futsal facilities")
  assert(sameIds("floorball", ["tampere-stadium", "tesoma-ball"]), "floorball facilities")
  assert(sameIds("gymnastics", ["tampere-stadium"]), "gymnastics facilities")
  assert(sameIds("martial-arts", ["hervanta", "naashalli"]), "martial arts facilities")
  assert(sameIds("functional-training", ["hervanta", "naashalli"]), "functional training facilities")
  assert(sameIds("badminton", []), "badminton stays unverified")
  assert(sameIds("tennis", []), "tennis stays unverified")
  assert(sameIds("other-indoor", []), "other indoor stays unverified")
  assert(
    sameIds("swimming", [
      "hervanta-swimming-hall",
      "pyynikki-swimming-hall",
      "tampere-outdoor-pool",
      "tampere-swimming-centre",
      "tesoma-swimming-hall",
    ]),
    "swimming facilities",
  )
  assert(sameIds("ice-hockey", ["hakametsa-ice-hall", "hervanta-ice-hall"]), "hockey facilities")
  assert(
    sameIds("figure-skating", ["hakametsa-practice-hall", "hervanta-ice-hall"]),
    "figure skating facilities",
  )
  assert(
    sameIds("outdoor-ice", [
      "ahvenisjarvi-public-rink",
      "ahvenisjarvi-stick-rink",
      "koulukatu-artificial-ice",
      "lielahti-public-rink",
      "pyynikki-skating-field",
      "sorsapuisto-artificial-rink",
    ]),
    "outdoor ice facilities",
  )

  const grouped = ACTIVITY_GROUPS.flatMap((group) => group.ids)
  assert(grouped.length === ACTIVITY_IDS.length, "every sport is in the dropdown")
  assert(new Set(grouped).size === grouped.length, "dropdown sports are unique")

  for (const activityId of ACTIVITY_IDS) {
    const listed = facilitiesForActivity(activityId)
    if (ACTIVITY_CATALOG[activityId].status === "needs-verification") {
      assert(listed.length === 0, `${activityId} must not be a confirmed facility match`)
    } else {
      assert(listed.length > 0, `${activityId} needs a listed facility`)
      const demonstrationOnly = listed.every(
        (facility) => facility.schedule.state === "demonstration-examples",
      )
      if (demonstrationOnly) {
        assert(
          listed.every((facility) => facility.slots.some((slot) => slot.activityId === activityId)),
          `${activityId} needs a demonstration slot`,
        )
      }
    }
  }

  const swim = findMatches(
    {
      activityId: "swimming",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 180,
      minWorkoutMinutes: 30,
      transport: "cycling",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  assert(
    swim.results.every((result) => result.facility.kind === "swimming-pool"),
    "swimming matches stay indoor pools",
  )
  assert(
    swim.results.every(
      (result) =>
        result.slot?.provenance.status === "demonstration" &&
        result.windowSlots.every((slot) => slot.isDemo && slot.sport === "swimming"),
    ),
    "pool matches use demo swimming slots only",
  )
  assert(swim.results.length > 0, "indoor pools have demo slots that can fit")
  assert(
    swim.scheduleNotes.some((note) => note.facilityId === "tampere-outdoor-pool"),
    "the ended outdoor-pool season is explained",
  )
  assert(
    !swim.results.some((result) => result.facility.id === "tampere-outdoor-pool"),
    "a closed outdoor pool is not recommended as available",
  )

  const hockey = findMatches(
    {
      activityId: "ice-hockey",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 180,
      minWorkoutMinutes: 30,
      transport: "car",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  assert(
    hockey.results.every((result) => result.facility.kind === "ice-arena"),
    "hockey stays on ice arenas",
  )
  assert(
    hockey.results.every(
      (result) => result.facility.id !== "tesoma-ice" && result.facility.id !== "hakametsa-practice-hall",
    ),
    "hockey does not absorb the Tesoma gym hall or the figure-skating practice hall",
  )

  const skating = findMatches(
    {
      activityId: "figure-skating",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 180,
      minWorkoutMinutes: 30,
      transport: "car",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  assert(
    skating.results.every(
      (result) => result.facility.id !== "hakametsa-ice-hall" && result.facility.id !== "tesoma-ice",
    ),
    "figure skating does not absorb the hockey hall or the Tesoma gym",
  )

  const outdoor = findMatches(
    {
      activityId: "outdoor-ice",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 180,
      minWorkoutMinutes: 30,
      transport: "car",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  assert(
    outdoor.results.every(
      (result) =>
        result.facility.kind === "outdoor-ice-rink" && result.facility.schedule.state === "seasonal-check",
    ),
    "outdoor rinks stay seasonal",
  )
  assert(
    outdoor.results.every((result) =>
      result.reasons.some((reason) => reason.includes("does not treat the place as available right now")),
    ),
    "outdoor rinks are not claimed open now",
  )

  const campus = startingPoints.find((point) => point.id === "hervanta-campus")
  const tesomaHall = facilities.find((facility) => facility.id === "tesoma-ball")
  assert(campus !== undefined && tesomaHall !== undefined, "travel fixtures")
  if (campus && tesomaHall) {
    const onFoot = estimateTravel(campus, tesomaHall, "walking")
    const onBike = estimateTravel(campus, tesomaHall, "cycling")
    const onTransit = estimateTravel(campus, tesomaHall, "public-transport")
    const byCar = estimateTravel(campus, tesomaHall, "car")
    assert(byCar.outboundMinutes < onBike.outboundMinutes, "car is faster than cycling on this trip")
    assert(onBike.outboundMinutes !== onTransit.outboundMinutes, "cycling and transit differ")
    assert(onFoot.outboundMinutes > byCar.outboundMinutes, "walking is slower than car")
    assert(TRAVEL_MODEL.speedsKmh.car > TRAVEL_MODEL.speedsKmh.cycling, "car speed is separate")
    assert(byCar.method.includes("Parking time is not included"), "car estimate withholds parking")
    assert(!byCar.method.toLowerCase().includes("parking is available"), "no parking claim")
    assert(byCar.label === "demonstration-estimate", "car stays an estimate")
  }

  const omittedOrigin = findMatches({
    activityId: "basketball",
    availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 90,
      minWorkoutMinutes: 30,
    transport: "cycling",
    startingPointId: "hervanta-campus",
  })
  assert(omittedOrigin.results.length === 0, "a stored campus id must not invent the user's location")
  assert(omittedOrigin.confirmed.length === 0, "empty confirmed results when location is missing")

  const missingOrigin = findMatches(
    {
      activityId: "basketball",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 90,
      minWorkoutMinutes: 30,
      transport: "car",
      startingPointId: "hervanta-campus",
    },
    null,
  )
  assert(missingOrigin.results.length === 0, "missing origin produces no invented journey")
  assert(missingOrigin.confirmed.length === 0, "empty confirmed results for a null origin")

  const nearTesoma = findMatches(
    {
      activityId: "basketball",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 60,
      minWorkoutMinutes: 30,
      transport: "car",
      startingPointId: "hervanta-campus",
    },
    { latitude: 61.5085136496175, longitude: 23.6274816472255 },
  )
  const tesomaFromHere = nearTesoma.results.find((result) => result.facility.id === "tesoma-ball")
  assert(tesomaFromHere !== undefined, "a nearby origin can match Tesoma")
  if (tesomaFromHere) {
    assert(tesomaFromHere.travel.mode === "car", "origin search keeps the selected mode")
    assert(tesomaFromHere.timeFit.outboundMinutes === 5, "nearby car estimate uses the minimum")
  }

  assert(LOCATION_COPY.granted === "Location enabled", "enabled status")
  assert(LOCATION_COPY.denied.includes("try again"), "denied location can be retried")
  assert(LOCATION_COPY.denied.includes("browse"), "denied location keeps browsing usable")
  assert(LOCATION_COPY.needed.includes("stays off"), "search waits for a real location")
  assert(!/\d+\.\d+/.test(LOCATION_COPY.granted), "granted copy does not print coordinates")
  assert(!/\d+\.\d+/.test(LOCATION_COPY.why), "location explanation does not print coordinates")
  if (tesomaHall) {
    const origin = { latitude: 61.498111, longitude: 23.760222 }
    const walkingUrl = googleMapsDirectionsUrl(tesomaHall, "walking", origin)
    const cyclingUrl = googleMapsDirectionsUrl(tesomaHall, "cycling", origin)
    const transitUrl = googleMapsDirectionsUrl(tesomaHall, "public-transport", origin)
    const drivingUrl = googleMapsDirectionsUrl(tesomaHall, "car", origin)
    assert(walkingUrl !== null && cyclingUrl !== null && transitUrl !== null && drivingUrl !== null, "directions urls")
    const walking = new URL(walkingUrl ?? "")
    assert(walking.origin + walking.pathname === "https://www.google.com/maps/dir/", "directions endpoint")
    assert(walking.searchParams.get("api") === "1", "directions api")
    assert(walking.searchParams.get("travelmode") === "walking", "walking mode")
    assert(new URL(cyclingUrl ?? "").searchParams.get("travelmode") === "bicycling", "cycling mode")
    assert(new URL(transitUrl ?? "").searchParams.get("travelmode") === "transit", "transit mode")
    assert(new URL(drivingUrl ?? "").searchParams.get("travelmode") === "driving", "driving mode")
    assert(
      walking.searchParams.get("destination") === `${tesomaHall.latitude},${tesomaHall.longitude}`,
      "directions use the LIPAS point",
    )
    assert(walking.searchParams.get("origin") === "61.498111,23.760222", "directions origin")
    const withoutOrigin = googleMapsDirectionsUrl(tesomaHall, "car", null)
    assert(withoutOrigin !== null && !new URL(withoutOrigin).searchParams.has("origin"), "origin is optional")
    const unverified = googleMapsDirectionsUrl(
      {
        ...tesomaHall,
        latitude: Number.NaN,
        longitude: Number.NaN,
        address: "   ",
        coordinateSource: { ...tesomaHall.coordinateSource, provider: "OpenStreetMap Nominatim" },
      },
      "car",
      origin,
    )
    assert(unverified === null, "missing verified destination does not invent a route")
    const addressOnly = googleMapsDirectionsUrl(
      {
        ...tesomaHall,
        coordinateSource: { ...tesomaHall.coordinateSource, provider: "OpenStreetMap Nominatim" },
      },
      "walking",
      null,
    )
    assert(
      addressOnly !== null && new URL(addressOnly).searchParams.get("destination") === tesomaHall.address,
      "address fallback does not use an unverified coordinate",
    )
  }

  const byTravel = presentMatches(sample.results, { sort: "travel", minimumExerciseMinutes: null })
  for (let index = 1; index < byTravel.length; index += 1) {
    assert(
      byTravel[index].timeFit.outboundMinutes >= byTravel[index - 1].timeFit.outboundMinutes,
      "travel sort",
    )
  }
  const byRelevance = presentMatches(sample.results, {
    sort: "relevance",
    minimumExerciseMinutes: null,
  })
  if (byRelevance.length > 0) {
    assert(byRelevance[0].isBest, "the first relevance result is the best match")
  }

  console.log("FastMove checks passed.")
  console.log("Sample basketball, 120 min, cycling, Hervanta campus:")
  for (const result of byRelevance) {
    console.log(
      `  ${result.facility.name}: travel ${result.timeFit.outboundMinutes} min, exercise ${result.timeFit.exerciseMinutes} min, slot ${result.slot?.durationMinutes ?? "none"} min, index ${result.score.index}`,
    )
  }
  if (sample.timeExclusions.length > 0) {
    console.log(
      `  Excluded for time: ${sample.timeExclusions.map((item) => item.facilityName).join(", ")}`,
    )
  }
}

function checkSlotAttendance(): void {
  const windowStart = parseClock("14:30") ?? 0
  const windowEnd = parseClock("19:30") ?? 0
  const base = {
    windowStart,
    windowEnd,
    maxOutingMinutes: 90,
    minWorkoutMinutes: 45,
    outboundMinutes: 15,
    returnMinutes: 15,
    selectedActivityId: "basketball" as const,
  }
  const valid = assessSlotAttendance(
    {
      startMinutes: parseClock("15:00") ?? 0,
      endMinutes: parseClock("16:00") ?? 0,
      kind: "confirmed-bookable",
      activityId: "basketball",
      fixedSession: false,
    },
    base,
  )
  assert(valid.fits, "a 60-minute slot with 15 minutes each way fits a 90-minute outing")
  assert(valid.workoutMinutes === 60, "the whole 60-minute slot is usable")
  assert(valid.outingMinutes === 90, "outing includes both journeys")
  assert(valid.workoutStart === parseClock("15:00"), "workout starts at the slot")
  assert(valid.workoutEnd === parseClock("16:00"), "workout ends at the slot")

  const outside = assessSlotAttendance(
    {
      startMinutes: parseClock("20:00") ?? 0,
      endMinutes: parseClock("21:00") ?? 0,
      kind: "confirmed-bookable",
      activityId: "basketball",
      fixedSession: false,
    },
    base,
  )
  assert(outside.status === "outside-window" && outside.fits === false, "a slot after the window is excluded")

  const short = assessSlotAttendance(
    {
      startMinutes: parseClock("15:00") ?? 0,
      endMinutes: parseClock("15:30") ?? 0,
      kind: "confirmed-public-session",
      activityId: "basketball",
      fixedSession: true,
    },
    base,
  )
  assert(short.status === "workout-too-short" && short.fits === false, "a 30-minute session misses a 45-minute workout")

  const returnIgnored = assessSlotAttendance(
    {
      startMinutes: parseClock("15:00") ?? 0,
      endMinutes: parseClock("16:00") ?? 0,
      kind: "confirmed-bookable",
      activityId: "basketball",
      fixedSession: false,
    },
    { ...base, maxOutingMinutes: 75, minWorkoutMinutes: 60 },
  )
  assert(
    returnIgnored.status === "outing-too-long" && returnIgnored.fits === false,
    "a slot that fits only without the return journey is rejected",
  )

  const unknownTravel = assessSlotAttendance(
    {
      startMinutes: parseClock("15:00") ?? 0,
      endMinutes: parseClock("16:00") ?? 0,
      kind: "confirmed-bookable",
      activityId: "basketball",
      fixedSession: false,
    },
    { ...base, outboundMinutes: null, returnMinutes: null },
  )
  assert(unknownTravel.status === "travel-unknown" && unknownTravel.fits === false, "unknown travel is not a fit")
  assert(unknownTravel.workoutMinutes === null, "unknown travel is not treated as zero")

  const unknownSchedule = assessSlotAttendance(
    {
      startMinutes: parseClock("15:00") ?? 0,
      endMinutes: parseClock("16:00") ?? 0,
      kind: "unknown",
      activityId: "basketball",
      fixedSession: false,
    },
    base,
  )
  assert(unknownSchedule.status === "schedule-unknown" && unknownSchedule.fits === false, "unknown schedule is not free")

  const demonstration = assessSlotAttendance(
    {
      startMinutes: parseClock("15:00") ?? 0,
      endMinutes: parseClock("16:00") ?? 0,
      kind: "demonstration",
      activityId: "basketball",
      fixedSession: false,
    },
    base,
  )
  assert(demonstration.status === "demonstration-only" && demonstration.fits === false, "demonstration times are not bookings")

  const hours = assessSlotAttendance(
    {
      startMinutes: parseClock("08:00") ?? 0,
      endMinutes: parseClock("21:00") ?? 0,
      kind: "opening-hours",
      activityId: "basketball",
      fixedSession: false,
    },
    { ...base, maxOutingMinutes: 180 },
  )
  assert(hours.status === "opening-hours-not-a-slot" && hours.fits === false, "opening hours are not a free slot")

  const otherSport = assessSlotAttendance(
    {
      startMinutes: parseClock("15:00") ?? 0,
      endMinutes: parseClock("16:00") ?? 0,
      kind: "confirmed-bookable",
      activityId: "volleyball",
      fixedSession: false,
    },
    base,
  )
  assert(otherSport.status === "sport-incompatible" && otherSport.fits === false, "a different sport is excluded")
}

function checkDemoSchedule(): void {
  assert(
    DEMO_SCHEDULE_NOTICE ===
      "Demo schedules are fictional examples created to demonstrate FastMove’s search and matching features. They do not represent actual facility bookings or availability. Check the official facility schedule before visiting.",
    "demo schedule notice",
  )
  const now = new Date(2026, 9, 24, 12, 0, 0)
  const { slots, coverage } = buildDemoSchedule(facilities, now)
  assert(coverage.length === facilities.length, "every facility has a schedule state")
  for (const facility of facilities) {
    assert(Boolean(facility.schedule.state), "stored schedule state")
    assert(
      coverage.some((item) => item.facilityId === facility.id),
      "schedule coverage",
    )
  }
  const unknownIds = coverage
    .filter((item) => item.state === "unknown")
    .map((item) => item.facilityId)
    .sort()
  assert(
    unknownIds.join(",") === "kauppi,tampere-outdoor-pool",
    "unnamed and closed places stay without generated slots",
  )
  assert(slots.length > 0 && slots.every((slot) => slot.isDemo), "every generated slot is marked as demo")
  assert(
    slots.every((slot) => slot.sourceLabel === "DEMO DATA — NOT LIVE AVAILABILITY"),
    "demo source label",
  )
  assert(new Set(slots.map((slot) => slot.id)).size === slots.length, "demo slot ids are unique")
  assert(slots.some((slot) => slot.status === "demo_available"), "demo available periods")
  assert(slots.some((slot) => slot.status === "demo_unavailable"), "demo unavailable periods")
  for (const slot of slots) {
    assert(slot.startTime < slot.endTime, "slot start precedes end")
    const facility = facilities.find((item) => item.id === slot.facilityId)
    assert(
      facility !== undefined && facility.activities.some((activity) => activity.id === slot.sport),
      "sport compatibility",
    )
    if (slot.sport === "swimming") assert(facility?.kind === "swimming-pool", "swimming slots stay in pools")
    if (slot.facilityId === "hakametsa-ice-hall") assert(slot.sport === "ice-hockey", "hockey hall is not figure skating")
    if (facility?.kind === "outdoor-ice-rink") {
      assert(slot.conditionsNote !== null && slot.conditionsNote.includes("not verified"), "outdoor ice stays unverified")
    }
  }
  assert(
    slots.every((slot) => slot.startTime.slice(0, 10) >= "2026-10-24" && slot.startTime.slice(0, 10) <= "2026-10-30"),
    "slots cover the next 7 days",
  )
  const afternoon = slots.filter(
    (slot) => slot.sport === "basketball" && overlapsDailyWindow(slot, "14:30", "19:30"),
  )
  assert(afternoon.length > 0, "time window keeps afternoon basketball slots")
  assert(
    slots.filter((slot) => slot.sport === "basketball" && overlapsDailyWindow(slot, "05:00", "06:00")).length === 0,
    "date and time filtering",
  )
  const byResource = new Map<string, typeof slots>()
  for (const slot of slots) {
    const key = `${slot.facilityId}|${slot.spaceName}|${slot.startTime.slice(0, 10)}`
    const list = byResource.get(key) ?? []
    list.push(slot)
    byResource.set(key, list)
  }
  for (const group of byResource.values()) {
    const ordered = [...group].sort((left, right) => left.startTime.localeCompare(right.startTime))
    for (let index = 1; index < ordered.length; index += 1) {
      assert(ordered[index - 1].endTime <= ordered[index].startTime, "one resource does not overlap itself")
    }
  }

  const empty = findMatches(
    {
      activityId: "basketball",
      availableFrom: "05:00",
      availableUntil: "06:00",
      maxOutingMinutes: 180,
      minWorkoutMinutes: 30,
      transport: "cycling",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  assert(empty.results.length === 0 && empty.confirmed.length === 0, "empty results")

  const longWorkout = findMatches(
    {
      activityId: "basketball",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 180,
      minWorkoutMinutes: 90,
      transport: "cycling",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  assert(
    longWorkout.results.every((result) => (result.slot?.durationMinutes ?? 0) >= 90),
    "minimum workout duration",
  )

  const tightOuting = findMatches(
    {
      activityId: "basketball",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 45,
      minWorkoutMinutes: 30,
      transport: "cycling",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  assert(tightOuting.results.length === 0, "maximum total outing includes return travel")

  const unknownTravel = assessSlotAttendance(
    {
      startMinutes: 15 * 60,
      endMinutes: 16 * 60,
      kind: "demo-interval",
      activityId: "basketball",
      fixedSession: false,
    },
    {
      windowStart: 14 * 60 + 30,
      windowEnd: 19 * 60 + 30,
      maxOutingMinutes: 90,
      minWorkoutMinutes: 45,
      outboundMinutes: null,
      returnMinutes: null,
      selectedActivityId: "basketball",
    },
  )
  assert(unknownTravel.status === "travel-unknown" && unknownTravel.fits === false, "unknown travel estimates")

  const line = describeDemoSlot(slots[0])
  assert(line.includes("min") && line.includes("Demo"), "schedule row names duration and demo status")
}

function fixtureOrigin(id: string): { latitude: number; longitude: number } {
  const point = startingPoints.find((item) => item.id === id)
  if (!point) throw new Error(`missing fixture origin ${id}`)
  return { latitude: point.latitude, longitude: point.longitude }
}

function sameIds(activityId: ActivityId, expected: string[]): boolean {
  const actual = facilitiesForActivity(activityId)
    .map((facility) => facility.id)
    .sort()
  return JSON.stringify(actual) === JSON.stringify([...expected].sort())
}

function checkQuery(
  activityId: ActivityId,
  availableMinutes: AvailableMinutes,
  transport: TransportMode,
  startingPointId: string,
): void {
  const outcome = findMatches(
    {
      activityId,
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: availableMinutes,
      minWorkoutMinutes: 30,
      transport,
      startingPointId,
    },
    fixtureOrigin(startingPointId),
  )
  assert(outcome.confirmed.length === 0, "facility data does not invent confirmed slots")
  const seen = new Set<string>()

  for (const result of outcome.results) {
    assert(!seen.has(result.facility.id), "one result per facility")
    seen.add(result.facility.id)
    assert(
      result.facility.activities.some((activity) => activity.id === activityId),
      "activity filter",
    )
    assert(result.timeFit.outboundMinutes === result.timeFit.returnMinutes, "symmetric return")
    assert(
      result.timeFit.remainingMinutes ===
        availableMinutes - result.timeFit.outboundMinutes - result.timeFit.returnMinutes,
      "remaining time formula",
    )
    if (result.slot) {
      assert(result.slot.activityId === activityId, "slot activity")
      assert(result.slot.provenance.status === "demonstration", "slots stay demonstration data")
      assert(result.slot.provenance.verifiedInTimmi === false, "slots are not verified")
      assert(result.timeFit.sessionKnown, "a recorded slot has a known session")
      assert(
        result.timeFit.exerciseMinutes <=
          Math.min(result.timeFit.remainingMinutes, result.slot.durationMinutes),
        "exercise cap",
      )
      assert(result.timeFit.exerciseMinutes <= result.slot.durationMinutes, "slot cap")
    } else {
      assert(result.timeFit.sessionKnown === false, "an unscheduled visit is labelled unknown")
      assert(
        result.timeFit.exerciseMinutes === result.timeFit.remainingMinutes,
        "unknown session keeps the time left after travel",
      )
      assert(result.score.timeFit === 0, "unknown session does not score as exercise time")
      assert(
        result.facility.schedule.state === "not-loaded" || result.facility.schedule.state === "seasonal-check",
        "unknown schedule stays unknown",
      )
    }
    assert(result.travel.mode === transport, "result uses the selected transport")
    assert(result.travel.label === "demonstration-estimate", "travel stays an estimate")
    assert(result.timeFit.exerciseMinutes >= MIN_EXERCISE_MINUTES, "minimum exercise")
    assert(!result.facility.id || facilities.some((facility) => facility.id === result.facility.id), "known facility")
  }

  for (const exclusion of outcome.timeExclusions) {
    assert(!seen.has(exclusion.facilityId), "excluded facilities are not also matched")
  }
}
