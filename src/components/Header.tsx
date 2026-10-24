import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"

export function Header() {
  const [open, setOpen] = useState(false)

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
          <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#14382c" />
            <path
              d="M8 22c6-1 8-8 16-10"
              fill="none"
              stroke="#d8f25a"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx="23" cy="11" r="2.2" fill="#d8f25a" />
          </svg>
          <span>
            <strong>FastMove</strong>
            <span className="wordmark-note">Tampere sports-facility finder</span>
          </span>
        </a>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
          <span className="visually-hidden">{open ? "Close menu" : "Open menu"}</span>
        </button>
        <nav id="site-nav" className={open ? "site-nav site-nav--open" : "site-nav"} aria-label="Page">
          <ul className="nav-list">
            <li>
              <a href="#explore" onClick={() => setOpen(false)}>
                Explore
              </a>
            </li>
            <li>
              <a href="#how-it-works" onClick={() => setOpen(false)}>
                How it works
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
