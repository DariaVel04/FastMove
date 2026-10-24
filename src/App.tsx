import { useMemo, useState } from "react"
import type { MapOrigin, SearchQuery, SortKey } from "./domain/types.ts"
import { startingPoints } from "./data/startingPoints.ts"
import { requestCurrentLocation } from "./lib/geolocation.ts"
import { localizedActivityGap, localizedExclusionText } from "./i18n/display.ts"
import { useI18n } from "./i18n/useI18n.ts"
import { findMatches } from "./lib/match.ts"
import { presentMatches } from "./lib/present.ts"
import { validateSearchTiming } from "./lib/slotMatch.ts"
import { Footer } from "./components/Footer.tsx"
import { FacilityMap } from "./components/FacilityMap.tsx"
import { Header } from "./components/Header.tsx"
import { HeroSearch } from "./components/HeroSearch.tsx"
import { HowItWorks } from "./components/HowItWorks.tsx"
import { Recommendations } from "./components/Recommendations.tsx"
import { TrustNotice } from "./components/TrustNotice.tsx"

const initialQuery: SearchQuery = {
  activityId: "gym",
  availableFrom: "14:30",
  availableUntil: "19:30",
  maxOutingMinutes: 90,
  minWorkoutMinutes: 45,
  transport: "cycling",
  startingPointId: "hervanta-campus",
}

type SubmittedSearch = {
  query: SearchQuery
  origin: MapOrigin
}

type LocationCode = "needed" | "granted" | "denied" | "unavailable" | "timeout" | "unsupported"

type LocationFeedback = {
  code: LocationCode
  keptPrevious: boolean
}

function deviceOrigin(fix: { latitude: number; longitude: number }, generation: number): MapOrigin {
  return {
    id: `device-${generation}`,
    name: "Your location",
    detail: "Current location for this search",
    latitude: fix.latitude,
    longitude: fix.longitude,
    sourceNote:
      "Device location used only for this search. Coordinates are not shown or saved. This is not a surveyed address.",
  }
}

export default function App() {
  const { t, language } = useI18n()
  const [query, setQuery] = useState<SearchQuery>(initialQuery)
  const [submitted, setSubmitted] = useState<SubmittedSearch | null>(null)
  const [sort, setSort] = useState<SortKey>("relevance")
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null)
  const [focusTick, setFocusTick] = useState(0)
  const [deviceFix, setDeviceFix] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationGeneration, setLocationGeneration] = useState(0)
  const [locating, setLocating] = useState(false)
  const [locationFeedback, setLocationFeedback] = useState<LocationFeedback>({
    code: "needed",
    keptPrevious: false,
  })
  const [manualStartId, setManualStartId] = useState<string | null>(null)

  const formOrigin = deviceFix ? deviceOrigin(deviceFix, locationGeneration) : null
  const activeOrigin = submitted?.origin ?? formOrigin

  const outcome = useMemo(
    () => (submitted ? findMatches(submitted.query, submitted.origin) : null),
    [submitted],
  )
  const visible = useMemo(
    () =>
      outcome
        ? presentMatches(outcome.results, {
            sort,
            minimumExerciseMinutes: null,
          })
        : [],
    [outcome, sort],
  )

  function showResults(origin: MapOrigin) {
    setSubmitted({ query, origin })
    setSelectedFacilityId(null)
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    requestAnimationFrame(() => {
      document.getElementById("results")?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      })
    })
  }

  function manualOrigin(): MapOrigin | null {
    if (!manualStartId) return null
    const point = startingPoints.find((item) => item.id === manualStartId)
    if (!point) return null
    return {
      id: point.id,
      name: point.name,
      detail: point.address,
      latitude: point.latitude,
      longitude: point.longitude,
      sourceNote: point.coordinateSource.note,
    }
  }

  async function handleSubmit() {
    if (validateSearchTiming(query)) return
    const origin = manualOrigin() ?? formOrigin ?? (await handleUseLocation())
    if (!origin) return
    showResults(origin)
  }

  function scrollToId(id: string) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
    })
  }

  function handleShowOnMap(facilityId: string) {
    setSelectedFacilityId(facilityId)
    setFocusTick((tick) => tick + 1)
    scrollToId("map-title")
  }

  function handleSelectFromMap(facilityId: string) {
    setSelectedFacilityId(facilityId)
    scrollToId(`result-${facilityId}`)
  }

  async function handleUseLocation(): Promise<MapOrigin | null> {
    setLocating(true)
    const result = await requestCurrentLocation()
    setLocating(false)
    if (result.status !== "granted") {
      setLocationFeedback({ code: result.status, keptPrevious: deviceFix !== null })
      return deviceFix ? deviceOrigin(deviceFix, locationGeneration) : null
    }
    const fix = { latitude: result.latitude, longitude: result.longitude }
    const nextGeneration = locationGeneration + 1
    setDeviceFix(fix)
    setLocationGeneration(nextGeneration)
    setLocationFeedback({ code: "granted", keptPrevious: false })
    return deviceOrigin(fix, nextGeneration)
  }

  const locationMessage = `${t(
    locationFeedback.code === "needed"
      ? "location.needed"
      : locationFeedback.code === "granted"
        ? "location.granted"
        : locationFeedback.code === "denied"
          ? "location.denied"
          : locationFeedback.code === "timeout"
            ? "location.timeout"
            : locationFeedback.code === "unsupported"
              ? "location.unsupported"
              : "location.unavailable",
  )}${locationFeedback.keptPrevious ? ` ${t("location.kept")}` : ""}`
  const timeExclusionText =
    submitted && outcome
      ? localizedExclusionText(
          outcome.timeExclusions,
          submitted.query.activityId,
          submitted.query.maxOutingMinutes,
          submitted.query.minWorkoutMinutes,
          language,
        )
      : null
  const activityGapText =
    submitted && outcome && outcome.activitySupportedCount === 0
      ? localizedActivityGap(submitted.query.activityId, language)
      : null

  return (
    <div id="top">
      <a className="skip-link" href="#explore">
        {t("skip")}
      </a>
      <Header />
      <main>
        <HeroSearch
          value={query}
          locating={locating}
          locationReady={(deviceFix !== null || manualStartId !== null) && !locating}
          locationMessage={locationMessage}
          manualStartId={manualStartId}
          onManualStart={setManualStartId}
          onChange={setQuery}
          onUseLocation={() => {
            void handleUseLocation()
          }}
          onSubmit={handleSubmit}
        />
        <TrustNotice />
        <div className="workspace shell">
          <Recommendations
            hasSearched={submitted !== null}
            visible={visible}
            timeExclusionText={timeExclusionText}
            activityGapText={activityGapText}
            scheduleNotes={outcome?.scheduleNotes ?? []}
            timeExclusions={outcome?.timeExclusions ?? []}
            visitCautions={outcome?.visitCautions ?? []}
            minWorkoutMinutes={submitted?.query.minWorkoutMinutes ?? query.minWorkoutMinutes}
            transport={submitted?.query.transport ?? null}
            sort={sort}
            selectedFacilityId={selectedFacilityId}
            onSortChange={setSort}
            onShowOnMap={handleShowOnMap}
            directionsOrigin={submitted?.origin ?? null}
          />
          <FacilityMap
            start={activeOrigin}
            results={visible}
            linked={[...(outcome?.results ?? []), ...(outcome?.visitCautions ?? [])]}
            transport={submitted?.query.transport ?? query.transport}
            focusTick={focusTick}
            selectedFacilityId={selectedFacilityId}
            hasSearched={submitted !== null}
            onSelect={handleSelectFromMap}
          />
        </div>
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
