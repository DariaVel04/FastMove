import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { useI18n } from "../i18n/useI18n.ts"

export function Header() {
  const [open, setOpen] = useState(false)
  const { language, setLanguage, t } = useI18n()

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 426px)")
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    desktop.addEventListener("change", closeOnDesktop)
    window.addEventListener("keydown", closeOnEscape)
    return () => {
      desktop.removeEventListener("change", closeOnDesktop)
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [])

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="wordmark" href="#top" onClick={() => setOpen(false)}>
          <img className="mark" src={`${import.meta.env.BASE_URL}favicon.png`} alt="" width={36} height={36} />
          <span>
            <strong>FastMove</strong>
            <span className="wordmark-note">{t("header.note")}</span>
          </span>
        </a>
        <div className="header-tools">
          <div className="lang-switch" role="group" aria-label={t("language.label")}>
            <button
              type="button"
              aria-pressed={language === "en"}
              aria-label={t("language.english")}
              onClick={() => setLanguage("en")}
            >
              {t("language.en")}
            </button>
            <button
              type="button"
              aria-pressed={language === "fi"}
              aria-label={t("language.finnish")}
              onClick={() => setLanguage("fi")}
            >
              {t("language.fi")}
            </button>
          </div>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
            <span className="visually-hidden">{open ? t("header.close") : t("header.open")}</span>
          </button>
        </div>
        <nav id="site-nav" className={open ? "site-nav site-nav--open" : "site-nav"} aria-label={t("header.nav")}>
          <ul className="nav-list">
            <li>
              <a href="#explore" onClick={() => setOpen(false)}>
                {t("header.explore")}
              </a>
            </li>
            <li>
              <a href="#how-it-works" onClick={() => setOpen(false)}>
                {t("header.how")}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
