import { useI18n } from "../i18n/useI18n.ts"
import { TimmiLinks } from "./ExternalLink.tsx"

export function TrustNotice() {
  const { t } = useI18n()
  return (
    <aside className="trust" aria-label={t("trust.label")}>
      <div className="shell trust-inner">
        <p className="trust-notice">{t("trust.notice")}</p>
        <details className="trust-more">
          <summary>{t("trust.more")}</summary>
          <p className="trust-extra">{t("trust.extra")}</p>
          <TimmiLinks />
        </details>
      </div>
    </aside>
  )
}
