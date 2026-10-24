import type { FormEvent } from "react"
import { Bike, Bus, Car, Footprints } from "lucide-react"
import type { ActivityId, MaxOutingMinutes, MinWorkoutMinutes, SearchQuery, TransportMode } from "../domain/types.ts"
import { MAX_OUTING_OPTIONS, MIN_WORKOUT_OPTIONS, TRANSPORT_MODES } from "../domain/types.ts"
import { MANUAL_START_IDS, startingPoints } from "../data/startingPoints.ts"
import { ACTIVITY_GROUPS, ACTIVITY_LABELS, TRANSPORT_LABELS } from "../data/sources.ts"
import { LOCATION_COPY } from "../lib/geolocation.ts"
import { validateSearchTiming } from "../lib/slotMatch.ts"

type HeroSearchProps = {
  value: SearchQuery
  locating: boolean
  locationReady: boolean
  locationMessage: string
  manualStartId: string | null
  onManualStart: (id: string | null) => void
  onChange: (next: SearchQuery) => void
  onUseLocation: () => void
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
  manualStartId,
  onManualStart,
  onChange,
  onUseLocation,
  onSubmit,
}: HeroSearchProps) {
  const locationStatus = locating ? "Finding your location…" : locationMessage
  const timingError = validateSearchTiming(value)

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
          Look for a Tampere sports slot inside the hours you are free, including the journey there
          and back.
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
        </fieldset>

        <div className="search-grid">
          <fieldset>
            <legend>When you are free</legend>
            <div className="time-grid">
              <label className="field" htmlFor="available-from">
                Available from
                <input
                  id="available-from"
                  name="available-from"
                  type="time"
                  required
                  value={value.availableFrom}
                  onChange={(event) => onChange({ ...value, availableFrom: event.target.value })}
                />
              </label>
              <label className="field" htmlFor="available-until">
                Available until
                <input
                  id="available-until"
                  name="available-until"
                  type="time"
                  required
                  value={value.availableUntil}
                  onChange={(event) => onChange({ ...value, availableUntil: event.target.value })}
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Outing limits</legend>
            <div className="time-grid">
              <label className="field" htmlFor="max-outing">
                Maximum total outing
                <select
                  id="max-outing"
                  name="max-outing"
                  aria-describedby="ticket-hours"
                  value={value.maxOutingMinutes}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      maxOutingMinutes: Number(event.target.value) as MaxOutingMinutes,
                    })
                  }
                >
                  {MAX_OUTING_OPTIONS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes} min, including travel both ways
                    </option>
                  ))}
                </select>
              </label>
              <label className="field" htmlFor="min-workout">
                Minimum workout
                <select
                  id="min-workout"
                  name="min-workout"
                  value={value.minWorkoutMinutes}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      minWorkoutMinutes: Number(event.target.value) as MinWorkoutMinutes,
                    })
                  }
                >
                  {MIN_WORKOUT_OPTIONS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes} min
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {timingError ? (
              <p className="field-error" role="alert">
                {timingError}
              </p>
            ) : (
              <p className="field-note">
                The workout has to fit inside the outing after the journey there and back. A longer
                window does not create a free slot.
              </p>
            )}
            <p className="field-note" id="ticket-hours">
              Liikkuva Tampere ticket: the facilities can be used for a maximum of 3 hours. The
              outing limit also counts the journey there and back. The suggested workout is only the
              time in the room.
            </p>
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

        <label className="field" htmlFor="saved-start">
          Start from
          <select
            id="saved-start"
            name="saved-start"
            value={manualStartId ?? ""}
            onChange={(event) => onManualStart(event.target.value || null)}
          >
            <option value="">My location, if I allow it</option>
            {MANUAL_START_IDS.map((id) => {
              const point = startingPoints.find((item) => item.id === id)
              return point ? (
                <option key={point.id} value={point.id}>
                  {point.name}
                </option>
              ) : null
            })}
          </select>
        </label>
        <p className="field-note">
          Saved points use coordinates already checked for this project. They are not your live position.
        </p>

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
          disabled={locating || timingError !== null}
          aria-describedby="location-status"
        >
          {locating
            ? "Finding your location…"
            : locationReady
              ? "Find matching facilities"
              : "Use my location to search"}
        </button>
      </form>
    </section>
  )
}
