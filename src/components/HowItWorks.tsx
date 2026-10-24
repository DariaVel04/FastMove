import { URLS } from "../data/sources.ts"
import { useI18n } from "../i18n/useI18n.ts"
import { ExternalLink } from "./ExternalLink.tsx"

export function HowItWorks() {
  const { t } = useI18n()
  const steps = [
    { title: t("how.step1.title"), text: t("how.step1.text") },
    { title: t("how.step2.title"), text: t("how.step2.text") },
    { title: t("how.step3.title"), text: t("how.step3.text") },
    { title: t("how.step4.title"), text: t("how.step4.text") },
  ]
  return (
    <section className="how shell" id="how-it-works" aria-labelledby="how-title">
      <div className="section-heading">
        <h2 id="how-title">{t("how.title")}</h2>
        <p>{t("how.intro")}</p>
      </div>
      <ol className="steps">
        {steps.map((step, index) => (
          <li key={step.title}>
            <span className="step-index">0{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
      <p className="how-links">
        <ExternalLink href={URLS.timmiApp}>{t("link.timmi")}</ExternalLink>
        <ExternalLink href={URLS.ticket}>{t("link.ticket")}</ExternalLink>
        <ExternalLink href={URLS.sportsShop}>{t("link.shopOpen")}</ExternalLink>
        <ExternalLink href={URLS.lipas}>{t("link.lipasBrowse")}</ExternalLink>
      </p>
    </section>
  )
}
