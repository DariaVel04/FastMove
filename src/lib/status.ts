import type { ScoredMatch } from "../domain/types.ts"
import { ticketCoverageLabel } from "./present.ts"

export type CardStatus = "potential" | "check-access" | "insufficient-time" | "no-demo-slot"

const TICKET = "Liikkuva Tampere ticket"

/**
 * Green is a candidate from the data already loaded. It is not a confirmation
 * that a room is free. Red is only a time-budget miss. A missing schedule stays
 * neutral.
 */
export function cardStatus(result: ScoredMatch): CardStatus {
  if (!result.timeFit.fits) return "insufficient-time"
  if (!result.timeFit.sessionKnown || result.slot === null) return "no-demo-slot"
  const needsAccessCheck =
    result.activity.dropInLimited ||
    ticketCoverageLabel(result.facility.programme.sourceUrl) !== TICKET
  if (needsAccessCheck) return "check-access"
  return "potential"
}
