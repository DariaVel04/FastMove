import { CircleCheck, CircleDashed, ShieldAlert, Timer } from "lucide-react"
import type { CardStatus } from "../lib/status.ts"
import { useI18n } from "../i18n/useI18n.ts"

const ICONS = {
  potential: CircleCheck,
  "check-access": ShieldAlert,
  "insufficient-time": Timer,
  "no-demo-slot": CircleDashed,
} as const

export function StatusBadge({ status }: { status: CardStatus }) {
  const { t } = useI18n()
  const Icon = ICONS[status]
  const label = {
    potential: t("status.potential"),
    "check-access": t("status.check"),
    "insufficient-time": t("status.time"),
    "no-demo-slot": t("status.none"),
  }[status]
  return (
    <p className={`badge status-badge status-badge--${status}`}>
      <Icon aria-hidden="true" size={14} strokeWidth={2.4} />
      {label}
    </p>
  )
}
