import type { RiskLevel } from '@/../../packages/database/src/types'

interface RiskBadgeProps {
  level: RiskLevel
  className?: string
}

const riskConfig: Record<RiskLevel, { label: string; color: string; icon: string }> = {
  low: { label: 'Low Risk', color: 'bg-green-100 text-green-800', icon: '🟢' },
  medium: { label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  high: { label: 'High Risk', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  critical: { label: 'Critical Risk', color: 'bg-red-100 text-red-800', icon: '🔴' },
}

export function RiskBadge({ level, className = '' }: RiskBadgeProps) {
  const config = riskConfig[level]

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}
      title={config.label}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}
