import { DEMO_NOTICE, URLS } from "../data/sources.ts"
import { ExternalLink } from "./ExternalLink.tsx"

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <p className="footer-brand">FastMove</p>
          <p>Find your spot. Make your move.</p>
        </div>
        <p>{DEMO_NOTICE}</p>
        <p>
          Facility coordinates are from LIPAS. The Tampere open-data portal does not publish these
          indoor halls. Its swimming-hall and outdoor-field datasets were checked and not used.
          Timmi availability is not read by this app.
        </p>
        <p className="link-row">
          <ExternalLink href={URLS.ticket}>Liikkuva Tampere ticket</ExternalLink>
          <ExternalLink href={URLS.ticketEnglish}>English ticket page</ExternalLink>
          <ExternalLink href={URLS.timmiApp}>Timmi calendar</ExternalLink>
          <ExternalLink href={URLS.timmiGuide}>Timmi guide</ExternalLink>
          <ExternalLink href={URLS.sportsShop}>Sports online shop</ExternalLink>
          <ExternalLink href={URLS.lipas}>LIPAS sports facilities</ExternalLink>
          <ExternalLink href={URLS.openData}>Tampere open data</ExternalLink>
        </p>
      </div>
    </footer>
  )
}
