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
          <p>{t("footer.tagline")}</p>
        </div>
        <p>{t("trust.notice")}</p>
        <p>{t("footer.sources")}</p>
        <p className="link-row">
          <ExternalLink href={URLS.ticket}>{t("link.ticketShort")}</ExternalLink>
          <ExternalLink href={URLS.ticketEnglish}>{t("link.ticketEnglish")}</ExternalLink>
          <ExternalLink href={URLS.timmiApp}>{t("link.timmiCalendar")}</ExternalLink>
          <ExternalLink href={URLS.timmiGuide}>{t("link.timmiGuideShort")}</ExternalLink>
          <ExternalLink href={URLS.sportsShop}>{t("link.shop")}</ExternalLink>
          <ExternalLink href={URLS.lipas}>{t("link.lipas")}</ExternalLink>
          <ExternalLink href={URLS.openData}>{t("link.openData")}</ExternalLink>
        </p>
      </div>
    </footer>
  )
}
