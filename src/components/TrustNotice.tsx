import { useI18n } from "../i18n/useI18n.ts"
import { TimmiLinks } from "./ExternalLink.tsx"

export function TrustNotice() {
  const { t } = useI18n()
  return (
    <aside className="trust" aria-label={t("trust.label")}>
      <div className="shell trust-inner">
        <p className="trust-kicker">{t("trust.kicker")}</p>
        <p className="trust-notice">{t("trust.notice")}</p>
        <p className="trust-extra">{t("trust.extra")}</p>
        <TimmiLinks />
      </div>
    </aside>
  )
}
