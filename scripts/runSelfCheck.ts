import { readFileSync } from "node:fs"
import { runSelfCheck } from "../src/lib/selfCheck.ts"

runSelfCheck()

const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8")
if (!css.includes(".demo-slot") || !css.includes("grid-template-columns: 1fr")) {
  throw new Error("mobile schedule display")
}
