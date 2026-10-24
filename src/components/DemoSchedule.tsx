import type { DemoSlot } from "../domain/types.ts"
import { clockMinutes, formatDemoRange } from "../data/demoSchedule.ts"
import { demoStatusText, formatLocalizedClock, formatLocalizedDemoDate } from "../i18n/display.ts"
import { useI18n } from "../i18n/useI18n.ts"

type DemoScheduleProps = {
  slots: DemoSlot[]
  selectedId?: string | null
}

export function DemoSchedule({ slots, selectedId = null }: DemoScheduleProps) {
  const { language, t, text } = useI18n()
  const conditions = slots.find((slot) => slot.conditionsNote)?.conditionsNote ?? null
  return (
    <section className="demo-schedule" aria-label={t("schedule.label")}>
      {slots.length === 0 ? (
        <p className="field-note">{t("schedule.empty")}</p>
      ) : (
        <ul className="demo-slot-list">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className={[
                "demo-slot",
                slot.status === "demo_unavailable" ? "demo-slot--closed" : "demo-slot--illustrative",
                slot.id === selectedId ? "demo-slot--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="demo-slot-date">{formatLocalizedDemoDate(slot.startTime, language)}</span>
              <span className="demo-slot-time">
                {language === "en"
                  ? formatDemoRange(slot)
                  : `${formatLocalizedClock(clockMinutes(slot.startTime), language)}–${formatLocalizedClock(clockMinutes(slot.endTime), language)}`}
              </span>
              <span className="demo-slot-activity">
                {text(slot.spaceName)} · {slot.durationMinutes} min
              </span>
              <span className="demo-slot-status">{demoStatusText(slot.status, language)}</span>
            </li>
          ))}
        </ul>
      )}
      {conditions ? <p className="field-note">{text(conditions)}</p> : null}
    </section>
  )
}
