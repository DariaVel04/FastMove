import type { FormEvent } from "react"
import { Bike, Bus, Car, Footprints } from "lucide-react"
import type { ActivityId, MaxOutingMinutes, MinWorkoutMinutes, SearchQuery, TransportMode } from "../domain/types.ts"
import { MAX_OUTING_OPTIONS, MIN_WORKOUT_OPTIONS, TRANSPORT_MODES } from "../domain/types.ts"
import { MANUAL_START_IDS, startingPoints } from "../data/startingPoints.ts"
import { ACTIVITY_GROUPS } from "../data/sources.ts"
import { groupLabel, sportLabel, transportLabel } from "../i18n/display.ts"
import { useI18n } from "../i18n/useI18n.ts"
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
  const { language, t, text } = useI18n()
  const locationStatus = locating ? t("location.finding") : locationMessage
  const timingError = validateSearchTiming(value)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <section className="hero shell" id="explore" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">{t("hero.eyebrow")}</p>
        <h1 id="hero-title">{t("hero.title")}</h1>
        <p className="lede">{t("hero.lede")}</p>
      </div>
      <form className="search-card" onSubmit={handleSubmit}>
        <fieldset>
          <label className="field" htmlFor="sport">
            {t("sport.label")}
            <select
              id="sport"
              name="sport"
              value={value.activityId}
              onChange={(event) => onChange({ ...value, activityId: event.target.value as ActivityId })}
            >
              {ACTIVITY_GROUPS.map((group) => (
                <optgroup key={group.label} label={groupLabel(language, group.label)}>
                  {group.ids.map((activityId) => (
                    <option key={activityId} value={activityId}>
                      {sportLabel(language, activityId)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </fieldset>

        <div className="search-grid">
          <fieldset>
            <legend>{t("when.legend")}</legend>
            <div className="time-grid">
              <label className="field" htmlFor="available-from">
                {t("when.from")}
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
                {t("when.until")}
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
            <legend>{t("outing.legend")}</legend>
            <div className="time-grid">
              <label className="field" htmlFor="max-outing">
                {t("outing.max")}
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
                      {t("outing.option", { minutes })}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field" htmlFor="min-workout">
                {t("workout.min")}
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
                      {t("workout.option", { minutes })}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {timingError ? (
              <p className="field-error" role="alert">
                {text(timingError)}
              </p>
            ) : (
              <p className="field-note">
                {t("outing.note")}
              </p>
            )}
            <p className="field-note" id="ticket-hours">
              {t("ticket.hours")}
            </p>
          </fieldset>

          <fieldset>
            <legend>{t("transport.legend")}</legend>
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
                      {transportLabel(language, mode)}
                    </span>
                  </label>
                )
              })}
            </div>
            <p className="field-note">
              {t("transport.note")}
            </p>
          </fieldset>
        </div>

        <label className="field" htmlFor="saved-start">
          {t("start.label")}
          <select
            id="saved-start"
            name="saved-start"
            value={manualStartId ?? ""}
            onChange={(event) => onManualStart(event.target.value || null)}
          >
            <option value="">{t("start.mine")}</option>
            {MANUAL_START_IDS.map((id) => {
              const point = startingPoints.find((item) => item.id === id)
              return point ? (
                <option key={point.id} value={point.id}>
                  {text(point.name)}
                </option>
              ) : null
            })}
          </select>
        </label>
        <p className="field-note">
          {t("start.note")}
        </p>

        <div className="location-row">
          <button
            className={locationReady ? "secondary-button" : "primary-button location-button"}
            type="button"
            onClick={onUseLocation}
            disabled={locating}
            aria-describedby="location-status"
          >
            {t("location.use")}
          </button>
          <p id="location-status" className="location-status" role="status">
            {locationStatus}
          </p>
        </div>
        <p className="field-note">{t("location.why")}</p>

        <button
          className="primary-button"
          type="submit"
          disabled={locating || timingError !== null}
          aria-describedby="location-status"
        >
          {locating ? t("location.finding") : locationReady ? t("search.ready") : t("search.needLocation")}
        </button>
      </form>
    </section>
  )
}
