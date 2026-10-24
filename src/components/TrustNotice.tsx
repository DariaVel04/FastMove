import { DEMO_NOTICE } from "../data/sources.ts"
import { TimmiLinks } from "./ExternalLink.tsx"

export function TrustNotice() {
  return (
    <aside className="trust" aria-label="Availability notice">
      <div className="shell trust-inner">
        <p className="trust-kicker">Trust layer</p>
        <p className="trust-notice">{DEMO_NOTICE}</p>
        <p className="trust-extra">
          Swimming pools and ice places are separate from that ticket. Their hours are not copied
          here, and an outdoor rink is not shown as open right now.
        </p>
        <TimmiLinks />
      </div>
    </aside>
  )
}
