import { URLS } from "../data/sources.ts"
import { useI18n } from "../i18n/useI18n.ts"

type ExternalLinkProps = {
  href: string
  children: string
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  const { t } = useI18n()
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
      <span className="visually-hidden"> {t("link.newTab")}</span>
    </a>
  )
}

export function TimmiLinks() {
  const { t } = useI18n()
  return (
    <p className="link-row">
      <ExternalLink href={URLS.timmiApp}>{t("link.timmi")}</ExternalLink>
      <ExternalLink href={URLS.timmiGuide}>{t("link.timmiGuide")}</ExternalLink>
    </p>
  )
}
