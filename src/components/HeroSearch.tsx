import { useState, type FormEvent } from "react"
import { Bike, Bus, Car, Footprints } from "lucide-react"
import type { ActivityId, MaxOutingMinutes, MinWorkoutMinutes, SearchQuery, TransportMode } from "../domain/types.ts"
import { MAX_OUTING_OPTIONS, MIN_WORKOUT_OPTIONS, TRANSPORT_MODES } from "../domain/types.ts"
import { MANUAL_START_IDS, startingPoints } from "../data/startingPoints.ts"
import { ACTIVITY_GROUPS } from "../data/sources.ts"
import { groupLabel, sportLabel, transportLabel } from "../i18n/display.ts"
import { useI18n } from "../i18n/useI18n.ts"
import { formatClock, parseClock, validateSearchTiming } from "../lib/slotMatch.ts"

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
  const [preset, setPreset] = useState<"now" | "evening" | "custom">("custom")
  const [timesOpen, setTimesOpen] = useState(
    () => window.matchMedia("(min-width: 960px)").matches,
  )

  function applyNow() {
    const now = new Date()
    const fromMinutes = now.getHours() * 60 + now.getMinutes()
    const from = formatClock(fromMinutes)
    const untilMinutes = parseClock(value.availableUntil)
    const proposed = Math.min(23 * 60 + 59, fromMinutes + 240)
    const until =
      untilMinutes !== null && untilMinutes > fromMinutes ? value.availableUntil : formatClock(proposed)
    onChange({ ...value, availableFrom: from, availableUntil: until })
    setPreset("now")
    setTimesOpen(false)
  }

  function applyEvening() {
    const untilMinutes = parseClock(value.availableUntil)
    const until = untilMinutes !== null && untilMinutes > 17 * 60 ? value.availableUntil : "21:00"
    onChange({ ...value, availableFrom: "17:00", availableUntil: until })
    setPreset("evening")
    setTimesOpen(false)
  }

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
            <div className="preset-row" role="group" aria-label={t("when.legend")}>
              <button type="button" aria-pressed={preset === "now"} onClick={applyNow}>
                {t("when.now")}
              </button>
              <button type="button" aria-pressed={preset === "evening"} onClick={applyEvening}>
                {t("when.evening")}
              </button>
              <button
                type="button"
                aria-pressed={preset === "custom"}
                aria-label={
                  preset === "custom" && !timesOpen
                    ? t("when.applied", { from: value.availableFrom, until: value.availableUntil })
                    : undefined
                }
                onClick={() => {
                  setPreset("custom")
                  setTimesOpen(true)
                }}
              >
                {preset === "custom" && !timesOpen
                  ? `${value.availableFrom}–${value.availableUntil}`
                  : t("when.custom")}
              </button>
            </div>
            {preset === "custom" && timesOpen ? (
              <div className="time-grid">
                <label className="field" htmlFor="available-from">
                  {t("when.from")}
                  <input
                    id="available-from"
                    name="available-from"
                    type="time"
                    required
                    value={value.availableFrom}
                    onChange={(event) => {
                      setPreset("custom")
                      onChange({ ...value, availableFrom: event.target.value })
                    }}
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
                    onChange={(event) => {
                      setPreset("custom")
                      onChange({ ...value, availableUntil: event.target.value })
                    }}
                  />
                </label>
              </div>
            ) : preset === "custom" ? null : (
              <p className="field-note">
                {t("when.applied", { from: value.availableFrom, until: value.availableUntil })}
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend className="visually-hidden">{t("outing.legend")}</legend>
            <details className="advanced-filters">
              <summary>
                {t("outing.advanced")} · {value.maxOutingMinutes} / {value.minWorkoutMinutes} min
              </summary>
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
            <p className="field-note">{t("outing.note")}</p>
            <p className="field-note" id="ticket-hours">
              {t("ticket.hours")}
            </p>
            <p className="field-note">{t("transport.note")}</p>
            <p className="field-note">{t("start.note")}</p>
            <p className="field-note" id="location-why">
              {t("location.why")}
            </p>
            </details>
            {timingError ? (
              <p className="field-error" role="alert">
                {text(timingError)}
              </p>
            ) : null}
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
            <p className="field-note">{t("transport.short")}</p>
          </fieldset>
        </div>

        <div className="start-row">
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
          <button
            className="secondary-button location-button"
            type="button"
            onClick={onUseLocation}
            disabled={locating}
            aria-busy={locating}
            aria-describedby="location-status location-why"
          >
            {t("location.use")}
          </button>
        </div>
        <p
          id="location-status"
          className={!locating && locationMessage === t("location.saved") ? "visually-hidden" : "location-status"}
          role="status"
        >
          {locationStatus}
        </p>

        <button
          className="primary-button search-submit"
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
