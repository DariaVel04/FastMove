import { facilities, unmatchedTicketRooms } from "../data/facilities.ts"
import { startingPoints } from "../data/startingPoints.ts"
import { ACTIVITY_CATALOG } from "../data/sources.ts"
import { fiPhrases } from "./phrases.ts"

const EXTRA = [
  "Fictional demonstration slot for this search. It is not a booking and it was not read from Timmi.",
  "The city page says this season has ended, so FastMove does not generate demo sessions that would look open.",
  "Session times are not loaded, so FastMove does not invent a free session.",
  "No sport is confirmed for this place, so a compatible demo schedule cannot be generated.",
  "Enter both times as hours and minutes.",
  "Available until must be later than available from on the same day.",
  "The minimum workout cannot be longer than the maximum outing.",
  "The minimum workout is longer than the time you are available.",
  "Liikkuva Tampere ticket",
  "Not covered by this ticket",
]

export function requiredPhrases(): string[] {
  const found = new Set<string>(EXTRA)
  const add = (value: string | null | undefined) => {
    if (!value || value.startsWith("http")) return
    found.add(value)
  }
  for (const facility of facilities) {
    add(facility.schedule.label)
    add(facility.schedule.detail)
    add(facility.coordinateSource.note)
    add(facility.programme.summary)
    add(facility.programme.sourceName)
    if (facility.programme.pageUpdated) add(facility.programme.pageUpdated)
    add(facility.otherDocumentedUses)
    for (const activity of facility.activities) {
      add(activity.spaceName)
      add(activity.detail)
    }
    for (const slot of facility.slots) {
      add(slot.provenance.summary)
      add(slot.provenance.sourceName)
    }
  }
  for (const room of unmatchedTicketRooms) {
    add(room.room)
    add(room.reason)
  }
  for (const point of startingPoints) {
    add(point.name)
    add(point.coordinateSource.note)
  }
  for (const activity of Object.values(ACTIVITY_CATALOG)) add(activity.summary)
  return [...found]
}

export function missingPhrases(): string[] {
  return requiredPhrases().filter((item) => fiPhrases[item] === undefined)
}
