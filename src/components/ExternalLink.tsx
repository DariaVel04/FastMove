import { URLS } from "../data/sources.ts"

type ExternalLinkProps = {
  href: string
  children: string
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}

export function TimmiLinks() {
  return (
    <p className="link-row">
      <ExternalLink href={URLS.timmiApp}>Open the Timmi calendar</ExternalLink>
      <ExternalLink href={URLS.timmiGuide}>Read the City of Tampere guide to Timmi</ExternalLink>
    </p>
  )
}
