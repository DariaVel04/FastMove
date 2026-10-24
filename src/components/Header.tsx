export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="wordmark" href="#top">
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
        <nav aria-label="Page">
          <ul className="nav-list">
            <li>
              <a href="#explore">Explore</a>
            </li>
            <li>
              <a href="#how-it-works">How it works</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
