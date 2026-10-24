import type { DemoSlot } from "../domain/types.ts"
import { demoStatusLabel, formatDemoDate, formatDemoRange } from "../data/demoSchedule.ts"

type DemoScheduleProps = {
  slots: DemoSlot[]
  selectedId?: string | null
}

export function DemoSchedule({ slots, selectedId = null }: DemoScheduleProps) {
  const conditions = slots.find((slot) => slot.conditionsNote)?.conditionsNote ?? null
  return (
    <section className="demo-schedule" aria-label="Demo schedule">
      {slots.length === 0 ? (
        <p className="field-note">No demo slots fall inside this time window. Widen the hours you are free.</p>
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
              <span className="demo-slot-date">{formatDemoDate(slot.startTime)}</span>
              <span className="demo-slot-time">{formatDemoRange(slot)}</span>
              <span className="demo-slot-activity">
                {slot.spaceName} · {slot.durationMinutes} min
              </span>
              <span className="demo-slot-status">{demoStatusLabel(slot.status)}</span>
            </li>
          ))}
        </ul>
      )}
      {conditions ? <p className="field-note">{conditions}</p> : null}
    </section>
  )
}
