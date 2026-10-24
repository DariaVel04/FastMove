import { URLS } from "../data/sources.ts"
import { ExternalLink } from "./ExternalLink.tsx"

const steps = [
  {
    title: "Choose your activity",
    text: "Pick a sport, the hours you are free, the longest outing you can spare and the shortest workout you want. Press Use my location so the journey starts from where you are. Travel times are demonstration estimates.",
  },
  {
    title: "Find your match",
    text: "A confirmed slot has to sit inside your window, cover the minimum workout, and fit the outing after travel both ways. Example times stay labelled as examples.",
  },
  {
    title: "Verify in Timmi",
    text: "For a Liikkuva Tampere hall, open Timmi and confirm the session is free. The times in FastMove are examples. Pool and ice session times are not loaded — use the linked city page, and do not treat a seasonal rink as open today.",
  },
  {
    title: "Go exercise",
    text: "Buy a Liikkuva Tampere ticket and have it stamped at the venue. The ticket is for shared use, and a visit can last up to three hours.",
  },
]

export function HowItWorks() {
  return (
    <section className="how shell" id="how-it-works" aria-labelledby="how-title">
      <div className="section-heading">
        <h2 id="how-title">How it works</h2>
        <p>Choose your activity, find your match, verify in Timmi, then go exercise.</p>
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
        <ExternalLink href={URLS.timmiApp}>Open the Timmi calendar</ExternalLink>
        <ExternalLink href={URLS.ticket}>Read about the Liikkuva Tampere ticket</ExternalLink>
        <ExternalLink href={URLS.sportsShop}>Open the sports online shop</ExternalLink>
        <ExternalLink href={URLS.lipas}>Browse facilities in LIPAS</ExternalLink>
      </p>
    </section>
  )
}
