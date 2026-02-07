import type { CampaignStatus } from '@/../../packages/database/src/types'

interface StatusBadgeProps {
  status: CampaignStatus
  className?: string
}

const statusConfig: Record<CampaignStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  planning: { label: 'Planning', color: 'bg-blue-100 text-blue-800' },
  brief_review: { label: 'Brief Review', color: 'bg-purple-100 text-purple-800' },
  strategy_approval: { label: 'Strategy Approval', color: 'bg-indigo-100 text-indigo-800' },
  creator_selection: { label: 'Creator Selection', color: 'bg-yellow-100 text-yellow-800' },
  content_production: { label: 'Content Production', color: 'bg-orange-100 text-orange-800' },
  content_approval: { label: 'Content Approval', color: 'bg-amber-100 text-amber-800' },
  publishing: { label: 'Publishing', color: 'bg-cyan-100 text-cyan-800' },
  monitoring: { label: 'Monitoring', color: 'bg-teal-100 text-teal-800' },
  reporting: { label: 'Reporting', color: 'bg-emerald-100 text-emerald-800' },
  closed: { label: 'Closed', color: 'bg-green-100 text-green-800' },
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}
    >
      {config.label}
    </span>
  )
}
