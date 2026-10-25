import { readFileSync } from "node:fs"

// The findMatches assertions read "today" from the clock. Pin it to the fixture day (Saturday 24 October 2026, 12:00 local).
const RealDate = Date
const FIXTURE_NOW = new RealDate(2026, 9, 24, 12, 0, 0).getTime()
class FixtureDate extends RealDate {
  constructor(...args: ConstructorParameters<typeof Date> | []) {
    if (args.length === 0) super(FIXTURE_NOW)
    else super(...(args as ConstructorParameters<typeof Date>))
  }
  static now() {
    return FIXTURE_NOW
  }
}
globalThis.Date = FixtureDate as DateConstructor

const { runSelfCheck } = await import("../src/lib/selfCheck.ts")
runSelfCheck()

const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8")
if (!css.includes(".demo-slot") || !css.includes("grid-template-columns: 1fr")) {
  throw new Error("mobile schedule display")
}
