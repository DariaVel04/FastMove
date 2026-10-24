import type { FormEvent } from "react"
import { Bike, Bus, Car, Footprints } from "lucide-react"
import type { ActivityId, AvailableMinutes, SearchQuery, TransportMode } from "../domain/types.ts"
import { AVAILABLE_MINUTES, TRANSPORT_MODES } from "../domain/types.ts"
import { facilitiesForActivity } from "../data/facilities.ts"
import { ACTIVITY_CATALOG, ACTIVITY_GROUPS, ACTIVITY_LABELS, TRANSPORT_LABELS } from "../data/sources.ts"
import { LOCATION_COPY } from "../lib/geolocation.ts"

type HeroSearchProps = {
  value: SearchQuery
  locating: boolean
  locationReady: boolean
  locationMessage: string
  exploreFacilities: boolean
  onChange: (next: SearchQuery) => void
  onUseLocation: () => void
  onExploreChange: (next: boolean) => void
  onSubmit: () => void
}

const transportIcons = {
  walking: Footprints,
  cycling: Bike,
  "public-transport": Bus,
  car: Car,
} as const

export function HeroSearch({
  value,
  locating,
  locationReady,
  locationMessage,
  exploreFacilities,
  onChange,
  onUseLocation,
  onExploreChange,
  onSubmit,
}: HeroSearchProps) {
  const activity = ACTIVITY_CATALOG[value.activityId]
  const locationStatus = locating ? "Finding your location…" : locationMessage
  const listed = facilitiesForActivity(value.activityId)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <section className="hero shell" id="explore" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">Find your spot. Make your move.</p>
        <h1 id="hero-title">Make time for movement.</h1>
        <p className="lede">
          Rank a Tampere sports facility that fits your activity and the minutes you still have
          after getting there and back.
        </p>
      </div>
      <form className="search-card" onSubmit={handleSubmit}>
        <fieldset>
          <label className="field" htmlFor="sport">
            Choose your sport
            <select
              id="sport"
              name="sport"
              value={value.activityId}
              onChange={(event) => onChange({ ...value, activityId: event.target.value as ActivityId })}
            >
              {ACTIVITY_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.ids.map((activityId) => (
                    <option key={activityId} value={activityId}>
                      {ACTIVITY_LABELS[activityId]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <p className="field-note">
            {activity.status === "needs-verification" ? "Needs verification. " : "City-listed. "}
            {activity.summary} {listed.length === 0 ? "No listed facility." : `${listed.length} listed.`}
          </p>
          <label className="check-field">
            <input
              type="checkbox"
              checked={exploreFacilities}
              onChange={(event) => onExploreChange(event.target.checked)}
            />
            Highlight facilities for this activity
          </label>
          {exploreFacilities ? (
            listed.length > 0 ? (
              <ul className="explore-list">
                {listed.map((facility) => {
                  const rooms = facility.activities.filter((item) => item.id === value.activityId)
                  return (
                    <li key={facility.id}>
                      {facility.name}: {rooms.map((room) => room.spaceName).join("; ")}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="field-note">No facility in this programme list confirms the activity.</p>
            )
          ) : null}
        </fieldset>

        <div className="search-grid">
          <fieldset>
            <legend>Available time</legend>
            <div className="choice-row">
              {AVAILABLE_MINUTES.map((minutes) => (
                <label className="choice" key={minutes}>
                  <input
                    type="radio"
                    name="available-time"
                    value={minutes}
                    checked={value.availableMinutes === minutes}
                    onChange={() =>
                      onChange({ ...value, availableMinutes: minutes as AvailableMinutes })
                    }
                  />
                  <span>{minutes} min</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Transport</legend>
            <div className="choice-row">
              {TRANSPORT_MODES.map((mode) => {
                const Icon = transportIcons[mode]
                return (
                  <label className="choice" key={mode}>
                    <input
                      type="radio"
                      name="transport"
                      value={mode}
                      checked={value.transport === mode}
                      onChange={() => onChange({ ...value, transport: mode as TransportMode })}
                    />
                    <span>
                      <Icon aria-hidden="true" size={16} strokeWidth={2} />
                      {TRANSPORT_LABELS[mode]}
                    </span>
                  </label>
                )
              })}
            </div>
            <p className="field-note">
              Travel times are separate demonstration estimates. Car does not include parking, and
              none of the modes are live navigation.
            </p>
          </fieldset>
        </div>

        <div className="location-row">
          <button
            className={locationReady ? "secondary-button" : "primary-button location-button"}
            type="button"
            onClick={onUseLocation}
            disabled={locating}
            aria-describedby="location-status"
          >
            Use my location
          </button>
          <p id="location-status" className="location-status" role="status">
            {locationStatus}
          </p>
        </div>
        <p className="field-note">{LOCATION_COPY.why}</p>

        <button
          className="primary-button"
          type="submit"
          disabled={!locationReady}
          aria-describedby="location-status"
        >
          Find my best match
        </button>
      </form>
    </section>
  )
}
