import { ACTIVITY_IDS, AVAILABLE_MINUTES, TRANSPORT_MODES } from "../domain/types.ts"
import type { ActivityId, AvailableMinutes, TransportMode } from "../domain/types.ts"
import { facilitiesForActivity, facilities, unmatchedTicketRooms } from "../data/facilities.ts"
import { buildDemoSchedule, DEMO_SCHEDULE_PROFILES, describeDemoSlot, formatDemoDate, formatDemoRange, overlapsDailyWindow } from "../data/demoSchedule.ts"
import { ACTIVITY_CATALOG, ACTIVITY_GROUPS, DEMO_NOTICE, DEMO_SCHEDULE_NOTICE } from "../data/sources.ts"
import { startingPoints } from "../data/startingPoints.ts"
import { googleMapsDirectionsUrl } from "./directions.ts"
import { LOCATION_COPY } from "./geolocation.ts"
import { chooseNearestFittingDemo, findMatches } from "./match.ts"
import { countMatchingOptions, foundOptionsLabel, matchSummaryLines, presentMatches, RESULT_DEMO_NOTE, ticketCoverageLabel } from "./present.ts"
import { SCORE_WEIGHTS } from "./scoring.ts"
import { assessSlotAttendance, formatClock, parseClock, validateSearchTiming } from "./slotMatch.ts"
import { assessTimeFit, MIN_EXERCISE_MINUTES } from "./timefit.ts"
import { estimateTravel, formatStraightLineDistance, TRAVEL_MODEL } from "./travel.ts"

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
    assert(tesomaBall.slot !== null && tesomaBall.slot.exampleWindow.includes("24 Oct"), "Tesoma keeps today's fitting basketball example")
    assert(tesomaBall.slot !== null && tesomaBall.slot.durationMinutes !== 120, "a longer example on a later day does not replace today")
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
        result.slot === null &&
        result.windowSlots.length === 0 &&
        ticketCoverageLabel(result.facility.programme.sourceUrl) === "Not covered by this ticket",
    ),
    "pools stay outside the ticket and do not receive a fictional session",
  )
  assert(swim.results.length > 0, "indoor pools stay listed without an invented session")
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
    outdoor.results.every(
      (result) =>
        result.slot === null &&
        result.facility.schedule.detail.includes("does not know") &&
        result.reasons.some((reason) => reason.includes("does not know")),
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
  assert(LOCATION_COPY.needed.includes("saved start point"), "a saved start point can begin a search")
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
  const expectedUnknown = facilities
    .filter(
      (facility) => facility.schedule.state !== "demonstration-examples" || facility.activities.length === 0,
    )
    .map((facility) => facility.id)
    .sort()
  assert(
    unknownIds.join(",") === expectedUnknown.join(","),
    "places without a loaded session stay without generated slots",
  )
  assert(
    slots.every((slot) => !expectedUnknown.includes(slot.facilityId)),
    "pools, ice and unnamed rooms do not receive a fictional session",
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
    assert(facility?.schedule.state === "demonstration-examples", "generated slots stay on ticket demonstration schedules")
  }
  assert(
    slots.every((slot) => slot.startTime.slice(0, 10) >= "2026-10-24" && slot.startTime.slice(0, 10) <= "2026-10-30"),
    "slots cover the next 7 days",
  )
  const afternoon = slots.filter(
    (slot) => slot.sport === "basketball" && overlapsDailyWindow(slot, "14:30", "19:30"),
  )
  assert(afternoon.length > 0, "time window keeps afternoon basketball slots")
  const availableStarts = (facilityId: string, sport: string) =>
    [
      ...new Set(
        slots
          .filter((slot) => slot.facilityId === facilityId && slot.sport === sport && slot.status === "demo_available")
          .map((slot) => slot.startTime.slice(11)),
      ),
    ].sort()
  assert(
    availableStarts("kaukajarvi", "basketball").join() !== availableStarts("tesoma-ball", "basketball").join(),
    "the same sport has different demo times at different places",
  )
  assert(
    availableStarts("hervanta", "gym").join() !== availableStarts("hervanta", "martial-arts").join(),
    "different sports at one place have different demo times",
  )
  const schedulable = facilities.flatMap((facility) =>
    facility.schedule.state === "demonstration-examples" && facility.activities.length > 0
      ? facility.activities.map((activity) => `${facility.id}|${activity.id}`)
      : [],
  )
  const profileKeys = DEMO_SCHEDULE_PROFILES.map((item) => `${item.facilityId}|${item.sport}`)
  assert(
    JSON.stringify([...profileKeys].sort()) === JSON.stringify([...schedulable].sort()),
    "every listed activity has one demo profile, except closed and unnamed places",
  )
  assert(new Set(profileKeys).size === profileKeys.length, "profile keys are unique")
  const availableRanges = (facilityId: string, sport: string) =>
    [
      ...new Set(
        slots
          .filter((slot) => slot.facilityId === facilityId && slot.sport === sport && slot.status === "demo_available")
          .map((slot) => `${slot.startTime.slice(11)}-${slot.endTime.slice(11)}`),
      ),
    ].sort()
  for (let leftIndex = 0; leftIndex < DEMO_SCHEDULE_PROFILES.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < DEMO_SCHEDULE_PROFILES.length; rightIndex += 1) {
      const left = DEMO_SCHEDULE_PROFILES[leftIndex]
      const right = DEMO_SCHEDULE_PROFILES[rightIndex]
      if (left.facilityId !== right.facilityId && left.sport !== right.sport) continue
      const leftRanges = availableRanges(left.facilityId, left.sport)
      const rightRanges = availableRanges(right.facilityId, right.sport)
      const difference =
        leftRanges.filter((item) => !rightRanges.includes(item)).length +
        rightRanges.filter((item) => !leftRanges.includes(item)).length
      assert(
        difference >= 3,
        `${left.facilityId} ${left.sport} and ${right.facilityId} ${right.sport} need distinct demo schedules`,
      )
    }
  }
  const rebuilt = buildDemoSchedule(facilities, now)
  assert(JSON.stringify(rebuilt.slots) === JSON.stringify(slots), "the same date rebuilds the same demo schedule")
  assertNoSharedConflict(slots, "hervanta-ice-hall", [
    "Two hockey rinks",
    "Figure skating at Hervanta Ice Hall",
  ])
  assertNoSharedConflict(slots, "tampere-stadium", ["Sports hall 1", "Sports halls 1–3"])
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

  assert(
    RESULT_DEMO_NOTE ===
      "Based on illustrative demo schedules — real availability is not verified. Check Timmi before you go.",
    "short demo note",
  )
  assert(foundOptionsLabel(0) === "Found 0 matching options", "zero options")
  assert(foundOptionsLabel(1) === "Found 1 matching option", "one option")
  assert(foundOptionsLabel(2) === "Found 2 matching options", "two options")

  const counted = findMatches(
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
  const onFoot = findMatches(
    {
      activityId: "basketball",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 120,
      minWorkoutMinutes: 30,
      transport: "walking",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  const gym = findMatches(
    {
      activityId: "gym",
      availableFrom: "08:00",
      availableUntil: "22:00",
      maxOutingMinutes: 120,
      minWorkoutMinutes: 30,
      transport: "cycling",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  assert(countMatchingOptions(counted.results) === counted.results.length, "every returned basketball result is a match")
  assert(countMatchingOptions(counted.results) > 0, "basketball search has options")
  assert(
    counted.timeExclusions.every(
      (exclusion) => !counted.results.some((result) => result.facility.id === exclusion.facilityId),
    ),
    "out-of-outing facilities are not counted",
  )
  assert(countMatchingOptions(empty.results) === 0, "out-of-window search counts nothing")
  assert(countMatchingOptions(tightOuting.results) === 0, "a too-short outing counts nothing")
  assert(
    gym.results.every((result) => result.activity.id === "gym"),
    "a sport change does not keep the previous sport",
  )
  assert(countMatchingOptions(onFoot.results) <= countMatchingOptions(counted.results), "transport can only remove matches")
  const clippedSearch = findMatches(
    {
      activityId: "basketball",
      availableFrom: "14:30",
      availableUntil: "19:30",
      maxOutingMinutes: 180,
      minWorkoutMinutes: 45,
      transport: "cycling",
      startingPointId: "keskustori",
    },
    fixtureOrigin("keskustori"),
  )
  const partial = clippedSearch.results.find(
    (result) => result.chosenInterval !== null && result.timeFit.exerciseMinutes < (result.slot?.durationMinutes ?? 0),
  )
  assert(partial !== undefined && partial.chosenInterval !== null && partial.slot !== null, "a clipped demo interval")
  if (partial?.chosenInterval && partial.slot) {
    const summary = matchSummaryLines(partial)
    assert(summary.some((item) => item.startsWith("Demo interval:")), "demo interval label")
    assert(summary.some((item) => item.startsWith("Usable in your window:")), "usable period label")
    assert(summary.includes("Status: DEMO DATA"), "demo status")
    assert(
      partial.chosenInterval.usableEndMinutes - partial.chosenInterval.usableStartMinutes ===
        partial.timeFit.exerciseMinutes,
      "usable period matches the suggested workout",
    )
    assert(
      partial.chosenInterval.demoEndMinutes - partial.chosenInterval.demoStartMinutes === partial.slot.durationMinutes,
      "demo interval is the original row",
    )
  }

  const afternoonQueries = [
    ["14:30", "16:00"],
    ["15:00", "16:30"],
    ["16:00", "18:00"],
    ["17:00", "19:00"],
  ] as const
  for (const [from, until] of afternoonQueries) {
    const afternoonGym = findMatches(
      {
        activityId: "gym",
        availableFrom: from,
        availableUntil: until,
        maxOutingMinutes: 90,
        minWorkoutMinutes: 45,
        transport: "cycling",
        startingPointId: "hervanta-campus",
      },
      fixtureOrigin("hervanta-campus"),
    )
    const hervantaGym = afternoonGym.results.find((result) => result.facility.id === "hervanta")
    assert(hervantaGym !== undefined, `gym search ${from}–${until} finds Hervanta`)
    if (hervantaGym) {
      assert(hervantaGym.timeFit.fits, `gym search ${from}–${until} fits`)
      assert(hervantaGym.timeFit.exerciseMinutes >= 45, `gym search ${from}–${until} meets the workout`)
      assert(
        hervantaGym.timeFit.exerciseMinutes + hervantaGym.timeFit.roundTripMinutes <= 90,
        `gym search ${from}–${until} keeps both travel legs inside the outing`,
      )
      assert(hervantaGym.timeFit.outboundMinutes > 0 && hervantaGym.timeFit.returnMinutes > 0, "travel is not zero")
    }
  }

  const afternoonBasketball = findMatches(
    {
      activityId: "basketball",
      availableFrom: "14:30",
      availableUntil: "16:00",
      maxOutingMinutes: 90,
      minWorkoutMinutes: 45,
      transport: "cycling",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  assert(
    afternoonBasketball.results.some((result) => result.timeFit.exerciseMinutes >= 45),
    "14:30–16:00 basketball search finds a feasible demo workout",
  )

  const tenEachWay = assessSlotAttendance(
    {
      startMinutes: parseClock("14:30") ?? 0,
      endMinutes: parseClock("15:40") ?? 0,
      kind: "demo-interval",
      activityId: "gym",
      fixedSession: false,
    },
    {
      windowStart: parseClock("14:30") ?? 0,
      windowEnd: parseClock("16:00") ?? 0,
      maxOutingMinutes: 90,
      minWorkoutMinutes: 45,
      outboundMinutes: 10,
      returnMinutes: 10,
      selectedActivityId: "gym",
    },
  )
  assert(
    tenEachWay.fits &&
      tenEachWay.workoutMinutes !== null &&
      tenEachWay.workoutMinutes >= 45 &&
      tenEachWay.workoutMinutes <= 70,
    "10 minutes each way leaves a 45–70 minute demo workout",
  )
  assert(
    tenEachWay.outingMinutes === (tenEachWay.workoutMinutes ?? 0) + 20,
    "TimeFit adds outbound and return travel",
  )

  const centerGym = findMatches(
    {
      activityId: "gym",
      availableFrom: "14:30",
      availableUntil: "16:00",
      maxOutingMinutes: 90,
      minWorkoutMinutes: 45,
      transport: "cycling",
      startingPointId: "keskustori",
    },
    fixtureOrigin("keskustori"),
  )
  assert(
    centerGym.results.some((result) => result.facility.id === "naashalli"),
    "Keskustori gym search finds Nääshalli",
  )
  assert(
    !centerGym.results.some((result) => result.facility.id === "tampere-stadium"),
    "the stadium gym is not a normal suggestion",
  )
  assert(
    centerGym.visitCautions.some((result) => result.facility.id === "tampere-stadium"),
    "the stadium gym stays visible with its visitor limit",
  )
  const naashalli = centerGym.results.find((result) => result.facility.id === "naashalli")
  assert(naashalli?.chosenInterval != null && naashalli.slot != null, "Nääshalli has a chosen interval")
  if (naashalli?.chosenInterval && naashalli.slot) {
    const demoLength = naashalli.chosenInterval.demoEndMinutes - naashalli.chosenInterval.demoStartMinutes
    const usableLength = naashalli.chosenInterval.usableEndMinutes - naashalli.chosenInterval.usableStartMinutes
    const outing =
      naashalli.timeFit.outboundMinutes + naashalli.timeFit.exerciseMinutes + naashalli.timeFit.returnMinutes
    assert(demoLength === naashalli.slot.durationMinutes, "gym demo interval is the original row")
    assert(usableLength === naashalli.timeFit.exerciseMinutes, "gym usable window matches the workout")
    assert(outing === 90 && outing <= 90, "gym outing includes both journeys inside 90 minutes")
    assert(naashalli.timeFit.outboundMinutes > 0 && naashalli.timeFit.returnMinutes === naashalli.timeFit.outboundMinutes, "gym return matches the outbound estimate")
    const gymLines = matchSummaryLines(naashalli)
    const gymRow = naashalli.windowSlots.find((slot) => slot.id === naashalli.slot?.id)
    if (!gymRow) throw new Error("the gym card uses today's fitting row")
    assert(gymRow.startTime.startsWith("2026-10-24"), "the gym card uses today's fitting row")
    assert(
      naashalli.slot.exampleWindow === `${formatDemoDate(gymRow.startTime)} · ${formatDemoRange(gymRow)}`,
      "the printed gym date comes from the chosen slot",
    )
    assert(gymLines[0] === `Demo interval: ${naashalli.slot.exampleWindow}`, "the gym card shows that date")
    assert(!gymLines.some((line) => line.toLowerCase().includes("available today")), "another day is not called today")
    assert(gymLines.some((line) => line.startsWith("Suggested workout:")), "gym card states the workout")
    assert(gymLines.some((line) => line.includes("in a straight line")), "gym card states the straight-line distance")
    assert(formatStraightLineDistance(naashalli.travel.straightLineKm) !== null, "Nääshalli distance uses both coordinates")
  }
  const centerBasketball = findMatches(
    {
      activityId: "basketball",
      availableFrom: "14:30",
      availableUntil: "19:30",
      maxOutingMinutes: 180,
      minWorkoutMinutes: 45,
      transport: "cycling",
      startingPointId: "keskustori",
    },
    fixtureOrigin("keskustori"),
  )
  assert(centerBasketball.results.length === 2, "Keskustori basketball 180 finds two halls")
  for (const result of centerBasketball.results) {
    const interval = result.chosenInterval
    assert(interval !== null && result.slot !== null, "basketball result has a demo interval")
    if (!interval || !result.slot) continue
    const usableLength = interval.usableEndMinutes - interval.usableStartMinutes
    const outing = result.timeFit.outboundMinutes + result.timeFit.exerciseMinutes + result.timeFit.returnMinutes
    const chosenRow = result.windowSlots.find((slot) => slot.id === result.slot?.id)
    if (!chosenRow) throw new Error("basketball keeps today's fitting row")
    assert(chosenRow.startTime.startsWith("2026-10-24"), "basketball keeps today's fitting row")
    assert(
      result.slot.exampleWindow === `${formatDemoDate(chosenRow.startTime)} · ${formatDemoRange(chosenRow)}`,
      "the printed basketball date comes from the chosen slot",
    )
    assert(
      result.windowSlots.some(
        (slot) =>
          slot.status === "demo_available" &&
          slot.startTime > chosenRow.startTime &&
          slot.durationMinutes > chosenRow.durationMinutes,
      ),
      "a longer later basketball row does not replace today",
    )
    assert(usableLength === result.timeFit.exerciseMinutes, "usable basketball window matches the workout")
    assert(outing <= 180 && outing === result.timeFit.outboundMinutes + result.timeFit.exerciseMinutes + result.timeFit.returnMinutes, "both basketball journeys fit inside the 180 minute outing")
    assert(result.timeFit.outboundMinutes > 0 && result.timeFit.returnMinutes === result.timeFit.outboundMinutes, "unknown travel is not treated as zero")
    const lines = matchSummaryLines(result)
    assert(lines[0] === `Demo interval: ${result.slot.exampleWindow}`, "the card shows the chosen slot date and time")
    assert(lines.some((line) => line.startsWith("Usable in your window:")), "the card separates the usable period from the demo interval")
    assert(lines.some((line) => line.includes("in a straight line") && line.includes("Not a routed journey.")), "distance stays labelled as a straight line")
  }
  const shortBasketball = findMatches(
    {
      activityId: "basketball",
      availableFrom: "14:30",
      availableUntil: "19:30",
      maxOutingMinutes: 90,
      minWorkoutMinutes: 45,
      transport: "cycling",
      startingPointId: "keskustori",
    },
    fixtureOrigin("keskustori"),
  )
  assert(shortBasketball.results.length === 0, "a 90 minute basketball outing from Keskustori has no match")
  assert(shortBasketball.timeExclusions.length >= 2, "both halls stay outside the 90 minute outing")
  assert(formatStraightLineDistance(Number.NaN) === null, "a missing distance is not shown as zero")
  assert(formatStraightLineDistance(0.891) === "About 900 m in a straight line", "sub-kilometre distances round to 50 m")
  assert(formatStraightLineDistance(6.752) === "About 6.8 km in a straight line", "longer distances round to 0.1 km")

  const todayChoice = chooseNearestFittingDemo(
    [
      { startTime: "2026-10-24T14:35", durationMinutes: 85, workoutMinutes: 50 },
      { startTime: "2026-10-25T15:00", durationMinutes: 120, workoutMinutes: 110 },
    ],
    "2026-10-24",
  )
  assert(todayChoice?.startTime === "2026-10-24T14:35", "today wins when a later day has a longer workout")
  const laterChoice = chooseNearestFittingDemo(
    [
      { startTime: "2026-10-26T15:00", durationMinutes: 120, workoutMinutes: 110 },
      { startTime: "2026-10-28T16:00", durationMinutes: 90, workoutMinutes: 90 },
    ],
    "2026-10-24",
  )
  assert(laterChoice?.startTime === "2026-10-26T15:00", "with no slot today, the nearest fitting day is kept")
  const outingSkippedToday = chooseNearestFittingDemo(
    [{ startTime: "2026-10-26T17:20", durationMinutes: 75, workoutMinutes: 75 }],
    "2026-10-24",
  )
  assert(
    outingSkippedToday?.startTime === "2026-10-26T17:20",
    "a today row that failed the outing limit is not among the choices",
  )
  const eveningGym = findMatches(
    {
      activityId: "gym",
      availableFrom: "17:00",
      availableUntil: "19:30",
      maxOutingMinutes: 90,
      minWorkoutMinutes: 60,
      transport: "cycling",
      startingPointId: "keskustori",
    },
    fixtureOrigin("keskustori"),
  )
  const eveningNaas = eveningGym.results.find((result) => result.facility.id === "naashalli")
  assert(eveningNaas?.slot != null && !eveningNaas.slot.exampleWindow.includes("24 Oct"), "today's short gym row stays out of the outing")
  assert(eveningNaas?.slot?.exampleWindow.includes("26 Oct") === true, "the nearest later gym row is shown with its own date")
  const missingOriginChoice = findMatches(
    {
      activityId: "gym",
      availableFrom: "14:30",
      availableUntil: "16:00",
      maxOutingMinutes: 90,
      minWorkoutMinutes: 45,
      transport: "cycling",
      startingPointId: "keskustori",
    },
    { latitude: Number.NaN, longitude: 23.76 },
  )
  assert(missingOriginChoice.results.length === 0 && missingOriginChoice.confirmed.length === 0, "missing coordinates do not become a zero-travel match")
  const campusGyms = findMatches(
    {
      activityId: "gym",
      availableFrom: "14:30",
      availableUntil: "16:00",
      maxOutingMinutes: 90,
      minWorkoutMinutes: 45,
      transport: "cycling",
      startingPointId: "hervanta-campus",
    },
    fixtureOrigin("hervanta-campus"),
  )
  const hervantaGym = campusGyms.results.find((result) => result.facility.id === "hervanta")
  const kaukajarviGym = campusGyms.results.find((result) => result.facility.id === "kaukajarvi")
  assert(hervantaGym?.chosenInterval != null && kaukajarviGym?.chosenInterval != null, "both nearby gyms have a demo interval")
  if (hervantaGym?.chosenInterval && kaukajarviGym?.chosenInterval) {
    const hervantaLength = hervantaGym.chosenInterval.demoEndMinutes - hervantaGym.chosenInterval.demoStartMinutes
    const kaukajarviLength = kaukajarviGym.chosenInterval.demoEndMinutes - kaukajarviGym.chosenInterval.demoStartMinutes
    assert(hervantaGym.chosenInterval.demoStartMinutes !== kaukajarviGym.chosenInterval.demoStartMinutes, "nearby gym demo intervals start at different times")
    assert(hervantaLength !== kaukajarviLength, "nearby gym demo intervals have different lengths")
  }
  const ticketHall = facilities.find((facility) => facility.id === "hervanta")
  const pool = facilities.find((facility) => facility.id === "hervanta-swimming-hall")
  assert(ticketCoverageLabel(ticketHall?.programme.sourceUrl) === "Liikkuva Tampere ticket", "ticket halls keep the ticket label")
  assert(ticketCoverageLabel(pool?.programme.sourceUrl) === "Not covered by this ticket", "pools stay outside the ticket label")
  assert(unmatchedTicketRooms.some((room) => room.room === "Courts 1–3"), "Kauppi courts stay unmatched")
  assert(unmatchedTicketRooms.some((room) => room.room === "Hall B"), "Hall B stays unmatched")
}

function assertNoSharedConflict(
  slots: { facilityId: string; spaceName: string; startTime: string; endTime: string }[],
  facilityId: string,
  spaceNames: string[],
): void {
  const grouped = new Map<string, { startTime: string; endTime: string }[]>()
  for (const slot of slots) {
    if (slot.facilityId !== facilityId || !spaceNames.includes(slot.spaceName)) continue
    const day = slot.startTime.slice(0, 10)
    const list = grouped.get(day) ?? []
    list.push(slot)
    grouped.set(day, list)
  }
  for (const group of grouped.values()) {
    const ordered = [...group].sort((left, right) => left.startTime.localeCompare(right.startTime))
    for (let index = 1; index < ordered.length; index += 1) {
      assert(ordered[index - 1].endTime <= ordered[index].startTime, `${facilityId} shared rooms stay consistent`)
    }
  }
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
