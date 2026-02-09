'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { trpc } from '@/lib/trpc';

export default function ReportsPage() {
  // Fetch data for reports
  const { data: campaignsData, isLoading: loadingCampaigns } = trpc.campaigns.list.useQuery({
    limit: 100,
    offset: 0,
  });
  const { data: clientsData, isLoading: loadingClients } = trpc.clients.list.useQuery({
    limit: 100,
    offset: 0,
  });
  const { data: approvalsData, isLoading: loadingApprovals } = trpc.approvals.list.useQuery({});
  const { data: creatorsData, isLoading: loadingCreators } = trpc.creators.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const campaigns = campaignsData?.campaigns || [];
  const clients = clientsData?.clients || [];
  const approvals = (approvalsData || []) as any[];
  const creators = creatorsData?.creators || [];

  const isLoading = loadingCampaigns || loadingClients || loadingApprovals || loadingCreators;

  // Calculate metrics
  const totalBudget = campaigns.reduce((sum: number, c: any) => sum + (c.budget_total || 0), 0);
  const avgBudget = campaigns.length > 0 ? totalBudget / campaigns.length : 0;

  const statusCounts = campaigns.reduce((acc: Record<string, number>, c: any) => {
    const status = c.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskCounts = campaigns.reduce((acc: Record<string, number>, c: any) => {
    const risk = c.risk_level || 'unassessed';
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const approvalStatusCounts = approvals.reduce((acc: Record<string, number>, a: any) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const approvalTypeCounts = approvals.reduce((acc: Record<string, number>, a: any) => {
    acc[a.approval_type] = (acc[a.approval_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clientTiers = clients.reduce((acc: Record<string, number>, cl: any) => {
    const tier = cl.tier || 'untiered';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const platformCounts = creators.reduce((acc: Record<string, number>, cr: any) => {
    const platform = cr.primary_platform || 'unspecified';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeCreators = creators.filter((cr: any) => cr.status === 'active').length;
  const avgFollowers = creators.length > 0
    ? Math.round(creators.reduce((sum: number, cr: any) =>
        sum + (cr.instagram_followers || 0) + (cr.tiktok_followers || 0) + (cr.youtube_subscribers || 0), 0
      ) / creators.length)
    : 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const formatNumber = (n: number) =>
    new Intl.NumberFormat('en-US').format(n);

  const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      draft: 'default', internal_approval: 'info', client_review: 'warning',
      approved: 'success', in_execution: 'info', completed: 'success', closed: 'default',
      pending: 'warning', rejected: 'danger', overridden: 'default',
      low: 'success', medium: 'warning', high: 'danger', critical: 'danger',
    };
    return map[status] || 'default';
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">Overview of your campaign operations</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Campaigns', value: campaigns.length, icon: '📋' },
            { label: 'Total Budget', value: formatCurrency(totalBudget), icon: '💰' },
            { label: 'Avg Budget', value: formatCurrency(avgBudget), icon: '📊' },
            { label: 'Active Creators', value: activeCreators, icon: '🎬' },
            { label: 'Total Clients', value: clients.length, icon: '👥' },
            { label: 'Pending Approvals', value: approvalStatusCounts['pending'] || 0, icon: '⏳' },
            { label: 'Total Approvals', value: approvals.length, icon: '✓' },
            { label: 'Avg Followers', value: formatNumber(avgFollowers), icon: '👁' },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <div className="text-center">
                <div className="text-2xl mb-1">{kpi.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <div className="text-sm text-gray-500">{kpi.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campaign Status Distribution */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Status</h3>
            {Object.entries(statusCounts).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(statusCounts)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([status, count]) => {
                    const percentage = campaigns.length > 0 ? ((count as number) / campaigns.length) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(status)}>
                              {status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{count as number}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No campaigns yet</p>
            )}
          </Card>

          {/* Risk Distribution */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
            {Object.entries(riskCounts).length > 0 ? (
              <div className="space-y-3">
                {['low', 'medium', 'high', 'critical', 'unassessed']
                  .filter(risk => riskCounts[risk])
                  .map((risk) => {
                    const count = riskCounts[risk] || 0;
                    const percentage = campaigns.length > 0 ? (count / campaigns.length) * 100 : 0;
                    const colors: Record<string, string> = {
                      low: 'bg-green-500', medium: 'bg-yellow-500',
                      high: 'bg-orange-500', critical: 'bg-red-500', unassessed: 'bg-gray-400',
                    };
                    return (
                      <div key={risk}>
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={getStatusColor(risk)}>{risk}</Badge>
                          <span className="text-sm font-medium text-gray-700">{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`${colors[risk] || 'bg-gray-400'} h-2 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No risk data yet</p>
            )}
          </Card>

          {/* Approval Pipeline */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Pipeline</h3>
            {approvals.length > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {Object.entries(approvalStatusCounts)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([status, count]) => {
                      const percentage = (count as number / approvals.length) * 100;
                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant={getStatusColor(status)}>{status}</Badge>
                            <span className="text-sm font-medium text-gray-700">{count as number}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">By Type</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(approvalTypeCounts).map(([type, count]) => (
                    <span key={type} className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm">
                      {type.replace(/_/g, ' ')}
                      <span className="font-semibold">{count as number}</span>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center py-8">No approvals yet</p>
            )}
          </Card>

          {/* Creator Platform Mix */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator Platforms</h3>
            {creators.length > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {Object.entries(platformCounts)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([platform, count]) => {
                      const percentage = (count as number / creators.length) * 100;
                      const icons: Record<string, string> = {
                        instagram: '📸', tiktok: '🎵', youtube: '▶️',
                        twitter: '🐦', facebook: '📘', other: '🌐',
                      };
                      return (
                        <div key={platform}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {icons[platform] || '🌐'} {platform}
                            </span>
                            <span className="text-sm font-medium text-gray-700">{count as number}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{creators.length}</div>
                      <div className="text-sm text-gray-500">Total Creators</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{activeCreators}</div>
                      <div className="text-sm text-gray-500">Active</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center py-8">No creators yet</p>
            )}
          </Card>

          {/* Client Tiers */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Tiers</h3>
            {clients.length > 0 ? (
              <div className="space-y-3">
                {['platinum', 'gold', 'silver', 'bronze', 'untiered']
                  .filter(tier => clientTiers[tier])
                  .map((tier) => {
                    const count = clientTiers[tier] || 0;
                    const percentage = (count / clients.length) * 100;
                    const colors: Record<string, string> = {
                      platinum: 'bg-purple-500', gold: 'bg-yellow-500',
                      silver: 'bg-gray-400', bronze: 'bg-orange-600', untiered: 'bg-gray-300',
                    };
                    return (
                      <div key={tier}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 capitalize">{tier}</span>
                          <span className="text-sm font-medium text-gray-700">{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`${colors[tier] || 'bg-gray-400'} h-2 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No clients yet</p>
            )}
          </Card>

          {/* Top Campaigns by Budget */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Campaigns by Budget</h3>
            {campaigns.length > 0 ? (
              <div className="space-y-2">
                {[...campaigns]
                  .sort((a: any, b: any) => (b.budget_total || 0) - (a.budget_total || 0))
                  .slice(0, 5)
                  .map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{c.name}</span>
                        <Badge variant={getStatusColor(c.status)}>
                          {c.status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {c.budget_total ? formatCurrency(c.budget_total) : '—'}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No campaigns yet</p>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
