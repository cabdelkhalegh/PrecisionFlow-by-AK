'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

export default function CampaignsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = trpc.campaigns.list.useQuery({
    limit: 50,
    offset: 0,
    status: statusFilter || undefined,
  });

  const campaigns = data?.campaigns || [];
  
  // Apply client-side filtering for risk and search
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesRisk = !riskFilter || campaign.risk_level === riskFilter;
    const matchesSearch = !search || campaign.name.toLowerCase().includes(search.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
      draft: 'default',
      internal_approval: 'info',
      client_review: 'warning',
      approved: 'success',
      in_execution: 'info',
      completed: 'success',
      closed: 'default',
    };
    return colors[status] || 'default';
  };

  const getRiskColor = (risk: string) => {
    const colors: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
      low: 'success',
      medium: 'warning',
      high: 'warning',
      critical: 'danger',
    };
    return colors[risk] || 'default';
  };

  const formatBudget = (budget: number | null) => {
    if (!budget) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(budget);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="mt-2 text-gray-600">
              Manage your influencer marketing campaigns
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push('/campaigns/new')}
          >
            + New Campaign
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Search campaigns"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
            />
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="internal_approval">Internal Approval</option>
              <option value="client_review">Client Review</option>
              <option value="approved">Approved</option>
              <option value="in_execution">In Execution</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </Select>
            <Select
              label="Risk Level"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="">All Risks</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
            <div className="flex items-end">
              <span className="text-sm text-gray-600">
                {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </Card>

        {/* Campaigns Table */}
        <Card>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading campaigns...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {search || statusFilter || riskFilter
                  ? 'No campaigns match your filters'
                  : 'No campaigns yet'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {!search && !statusFilter && !riskFilter &&
                  'Create your first campaign to get started'}
              </p>
              {!search && !statusFilter && !riskFilter && (
                <Button
                  variant="primary"
                  onClick={() => router.push('/campaigns/new')}
                  className="mt-4"
                >
                  Create Campaign
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign: any) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {campaign.clients?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(campaign.status)}>
                          {campaign.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getRiskColor(campaign.risk_level || 'low')}>
                          {campaign.risk_level || 'low'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatBudget(campaign.budget_total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/campaigns/${campaign.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
