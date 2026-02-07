'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCampaigns, useCampaignStatistics } from '@/hooks/useCampaigns'
import { CampaignCard } from '@/components/campaigns/CampaignCard'
import type { CampaignStatus, RiskLevel } from '@/../../packages/database/src/types'

export default function CampaignsPage() {
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | undefined>()
  const [riskFilter, setRiskFilter] = useState<RiskLevel | undefined>()

  const { data: campaigns, isLoading, error } = useCampaigns({
    status: statusFilter,
    risk_level: riskFilter,
  })

  const { data: stats } = useCampaignStatistics()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage all your marketing campaigns
              </p>
            </div>
            <Link
              href="/campaigns/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + New Campaign
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Campaigns</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Active</h3>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {stats.by_status.planning + stats.by_status.content_production + stats.by_status.monitoring}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">In Draft</h3>
              <p className="mt-2 text-3xl font-bold text-gray-600">
                {stats.by_status.draft}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">High Risk</h3>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {stats.by_risk.high + stats.by_risk.critical}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value as CampaignStatus || undefined)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Statuses</option>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <select
                value={riskFilter || ''}
                onChange={(e) => setRiskFilter(e.target.value as RiskLevel || undefined)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
                <option value="critical">Critical Risk</option>
              </select>
            </div>

            {(statusFilter || riskFilter) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter(undefined)
                    setRiskFilter(undefined)
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Campaign List */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading campaigns...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Error loading campaigns: {error.message}
            </p>
          </div>
        )}

        {campaigns && campaigns.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new campaign.
            </p>
            <div className="mt-6">
              <Link
                href="/campaigns/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                + New Campaign
              </Link>
            </div>
          </div>
        )}

        {campaigns && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
