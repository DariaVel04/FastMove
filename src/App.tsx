import { useMemo, useState } from "react"
import type { MapOrigin, SearchQuery, SortKey } from "./domain/types.ts"
import { LOCATION_COPY, requestCurrentLocation } from "./lib/geolocation.ts"
import { describeActivityGap, describeTimeExclusions, findMatches } from "./lib/match.ts"
import { LONGER_VISIT_MINUTES, presentMatches } from "./lib/present.ts"
import { Footer } from "./components/Footer.tsx"
import { FacilityMap } from "./components/FacilityMap.tsx"
import { Header } from "./components/Header.tsx"
import { HeroSearch } from "./components/HeroSearch.tsx"
import { HowItWorks } from "./components/HowItWorks.tsx"
import { Recommendations } from "./components/Recommendations.tsx"
import { TrustNotice } from "./components/TrustNotice.tsx"

const initialQuery: SearchQuery = {
  activityId: "basketball",
  availableMinutes: 90,
  transport: "cycling",
  startingPointId: "hervanta-campus",
}

type SubmittedSearch = {
  query: SearchQuery
  origin: MapOrigin
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
  const [query, setQuery] = useState<SearchQuery>(initialQuery)
  const [submitted, setSubmitted] = useState<SubmittedSearch | null>(null)
  const [sort, setSort] = useState<SortKey>("relevance")
  const [requireLongerVisit, setRequireLongerVisit] = useState(false)
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null)
  const [deviceFix, setDeviceFix] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationGeneration, setLocationGeneration] = useState(0)
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState<string>(LOCATION_COPY.needed)
  const [exploreFacilities, setExploreFacilities] = useState(false)

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
            minimumExerciseMinutes: requireLongerVisit ? LONGER_VISIT_MINUTES : null,
          })
        : [],
    [outcome, requireLongerVisit, sort],
  )

  function handleSubmit() {
    if (!formOrigin) {
      setLocationMessage(LOCATION_COPY.needed)
      return
    }
    setSubmitted({ query, origin: formOrigin })
    setSelectedFacilityId(null)
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    requestAnimationFrame(() => {
      document.getElementById("results")?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      })
    })
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
    scrollToId("map-title")
  }

  function handleSelectFromMap(facilityId: string) {
    setSelectedFacilityId(facilityId)
    scrollToId(`result-${facilityId}`)
  }

  async function handleUseLocation() {
    setLocating(true)
    const result = await requestCurrentLocation()
    setLocating(false)
    if (result.status !== "granted") {
      const problem = LOCATION_COPY[result.status]
      setLocationMessage(
        deviceFix ? `${problem} The last enabled location is still used for search.` : problem,
      )
      return
    }
    setDeviceFix({ latitude: result.latitude, longitude: result.longitude })
    setLocationGeneration((current) => current + 1)
    setLocationMessage(LOCATION_COPY.granted)
  }

  const timeExclusionText =
    submitted && outcome
      ? describeTimeExclusions(
          outcome.timeExclusions,
          submitted.query.activityId,
          submitted.query.availableMinutes,
        )
      : null
  const activityGapText =
    submitted && outcome && outcome.activitySupportedCount === 0
      ? describeActivityGap(submitted.query.activityId)
      : null

  return (
    <div id="top">
      <a className="skip-link" href="#explore">
        Skip to search
      </a>
      <Header />
      <main>
        <HeroSearch
          value={query}
          locating={locating}
          locationReady={deviceFix !== null && !locating}
          locationMessage={locationMessage}
          exploreFacilities={exploreFacilities}
          onChange={setQuery}
          onUseLocation={() => {
            void handleUseLocation()
          }}
          onExploreChange={setExploreFacilities}
          onSubmit={handleSubmit}
        />
        <TrustNotice />
        <div className="workspace shell">
          <Recommendations
            hasSearched={submitted !== null}
            visible={visible}
            matchedCount={outcome?.results.length ?? 0}
            timeExclusionText={timeExclusionText}
            activityGapText={activityGapText}
            scheduleNotes={outcome?.scheduleNotes ?? []}
            sort={sort}
            requireLongerVisit={requireLongerVisit}
            selectedFacilityId={selectedFacilityId}
            onSortChange={setSort}
            onRequireLongerVisitChange={setRequireLongerVisit}
            onShowOnMap={handleShowOnMap}
            directionsOrigin={submitted?.origin ?? null}
          />
          <FacilityMap
            start={activeOrigin}
            highlightedActivityId={exploreFacilities ? query.activityId : null}
            results={visible}
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
