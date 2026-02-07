import Link from 'next/link'
import type { Campaign } from '@/../../packages/database/src/types'
import { StatusBadge } from './StatusBadge'
import { RiskBadge } from './RiskBadge'

interface CampaignCardProps {
  campaign: Campaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return 'Not set'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const budgetSpent = campaign.budget_amount && campaign.actual_spend
    ? Math.round((campaign.actual_spend / campaign.budget_amount) * 100)
    : 0

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {campaign.name}
            </h3>
            {campaign.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {campaign.description}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={campaign.status} />
          <RiskBadge level={campaign.risk_level} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Budget:</span>
            <p className="font-medium text-gray-900">
              {formatCurrency(campaign.budget_amount, campaign.budget_currency)}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Spent:</span>
            <p className="font-medium text-gray-900">
              {formatCurrency(campaign.actual_spend, campaign.budget_currency)}
              {budgetSpent > 0 && (
                <span className={`ml-1 text-xs ${budgetSpent > 90 ? 'text-red-600' : budgetSpent > 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                  ({budgetSpent}%)
                </span>
              )}
            </p>
          </div>
          {campaign.start_date && (
            <div>
              <span className="text-gray-500">Start:</span>
              <p className="font-medium text-gray-900">
                {formatDate(campaign.start_date)}
              </p>
            </div>
          )}
          {campaign.end_date && (
            <div>
              <span className="text-gray-500">End:</span>
              <p className="font-medium text-gray-900">
                {formatDate(campaign.end_date)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Created {formatDate(campaign.created_at)}
          </p>
        </div>
      </div>
    </Link>
  )
}
