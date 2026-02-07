'use client'

import { use } from 'react'
import Link from 'next/link'
import { useCampaign, useDeleteCampaign, useUpdateCampaignStatus } from '@/hooks/useCampaigns'
import { StatusBadge } from '@/components/campaigns/StatusBadge'
import { RiskBadge } from '@/components/campaigns/RiskBadge'
import type { CampaignStatus } from '@/../../packages/database/src/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CampaignDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { data: campaign, isLoading, error } = useCampaign(id)
  const deleteMutation = useDeleteCampaign()
  const statusMutation = useUpdateCampaignStatus()

  const handleDelete = async () => {
    if (!campaign) return
    if (!confirm(\`Are you sure you want to delete "${campaign.name}"?\`)) return
    
    await deleteMutation.mutateAsync(campaign.id)
    // Redirect handled by mutation
  }

  const handleStatusChange = async (newStatus: CampaignStatus) => {
    if (!campaign) return
    await statusMutation.mutateAsync({ id: campaign.id, status: newStatus })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">Campaign not found</p>
          <Link
            href="/campaigns"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const budgetSpentPercentage = campaign.budget_amount
    ? Math.round((campaign.actual_spend / campaign.budget_amount) * 100)
    : 0

  const budgetColor =
    budgetSpentPercentage > 90
      ? 'text-red-600'
      : budgetSpentPercentage > 75
      ? 'text-yellow-600'
      : 'text-green-600'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            Dashboard
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/campaigns" className="text-blue-600 hover:text-blue-800">
            Campaigns
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{campaign.name}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {campaign.name}
              </h1>
              <div className="flex items-center gap-4">
                <StatusBadge status={campaign.status} />
                <RiskBadge level={campaign.risk_level} />
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={\`/campaigns/\${campaign.id}/edit\`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
              <div className="space-y-3">
                {campaign.description ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-900">{campaign.description}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No description provided</p>
                )}
              </div>
            </div>

            {/* Objectives */}
            {campaign.objectives && campaign.objectives.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Objectives</h2>
                <ul className="list-disc list-inside space-y-2">
                  {campaign.objectives.map((objective, index) => (
                    <li key={index} className="text-gray-900">
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deliverables */}
            {campaign.deliverables && campaign.deliverables.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Deliverables</h2>
                <div className="space-y-3">
                  {campaign.deliverables.map((deliverable, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <p className="font-medium text-gray-900">
                        {deliverable.name || deliverable.title || \`Deliverable \${index + 1}\`}
                      </p>
                      {deliverable.description && (
                        <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    \${campaign.budget_amount?.toLocaleString() || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Actual Spend</p>
                  <p className={\`text-xl font-semibold \${budgetColor}\`}>
                    \${campaign.actual_spend.toLocaleString()}
                    {campaign.budget_amount && (
                      <span className="text-sm ml-2">({budgetSpentPercentage}%)</span>
                    )}
                  </p>
                </div>
                {campaign.budget_amount && (
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={\`h-2 rounded-full \${
                          budgetSpentPercentage > 90
                            ? 'bg-red-600'
                            : budgetSpentPercentage > 75
                            ? 'bg-yellow-600'
                            : 'bg-green-600'
                        }\`}
                        style={{ width: \`\${Math.min(budgetSpentPercentage, 100)}%\` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="text-gray-900">
                    {campaign.start_date
                      ? new Date(campaign.start_date).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="text-gray-900">
                    {campaign.end_date
                      ? new Date(campaign.end_date).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
                {campaign.go_live_date && (
                  <div>
                    <p className="text-sm text-gray-600">Go Live Date</p>
                    <p className="text-gray-900">
                      {new Date(campaign.go_live_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Change */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Status</h2>
              <select
                value={campaign.status}
                onChange={(e) => handleStatusChange(e.target.value as CampaignStatus)}
                disabled={statusMutation.isPending}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="planning">Planning</option>
                <option value="brief_review">Brief Review</option>
                <option value="strategy_approval">Strategy Approval</option>
                <option value="creator_selection">Creator Selection</option>
                <option value="content_production">Content Production</option>
                <option value="content_approval">Content Approval</option>
                <option value="publishing">Publishing</option>
                <option value="monitoring">Monitoring</option>
                <option value="reporting">Reporting</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(campaign.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
