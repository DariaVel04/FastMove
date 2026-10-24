import { URLS } from "../data/sources.ts"
import { useI18n } from "../i18n/useI18n.ts"
import { ExternalLink } from "./ExternalLink.tsx"

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <p className="footer-brand">FastMove</p>
          <p className="footer-tagline">{t("footer.tagline")}</p>
        </div>
        <p className="footer-note">{t("trust.notice")}</p>
        <p className="footer-note">{t("footer.sources")}</p>
        <nav className="footer-links" aria-label={t("links.official")}>
          <ExternalLink href={URLS.ticket}>{t("link.ticketShort")}</ExternalLink>
          <ExternalLink href={URLS.ticketEnglish}>{t("link.ticketEnglish")}</ExternalLink>
          <ExternalLink href={URLS.timmiApp}>{t("link.timmiCalendar")}</ExternalLink>
          <ExternalLink href={URLS.timmiGuide}>{t("link.timmiGuideShort")}</ExternalLink>
          <ExternalLink href={URLS.sportsShop}>{t("link.shop")}</ExternalLink>
          <ExternalLink href={URLS.lipas}>{t("link.lipas")}</ExternalLink>
          <ExternalLink href={URLS.openData}>{t("link.openData")}</ExternalLink>
        </nav>
      </div>
    </footer>
  )
}
