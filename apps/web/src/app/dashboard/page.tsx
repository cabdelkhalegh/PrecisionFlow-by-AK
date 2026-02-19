'use client';

import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  const campaignsQuery = trpc.campaigns.list.useQuery({
    limit: 10,
    offset: 0,
  });

  const clientsQuery = trpc.clients.list.useQuery({
    limit: 10,
    offset: 0,
  });

  type DashCampaign = { id: string; name: string; status: string; risk_level: string | null; [key: string]: unknown };
  type DashClient = { id: string; name: string; company_name: string | null; tier: string | null; [key: string]: unknown };
  const dashCampaigns: DashCampaign[] = ((campaignsQuery.data as Record<string, unknown>)?.campaigns ?? []) as DashCampaign[];
  const dashClients: DashClient[] = ((clientsQuery.data as Record<string, unknown>)?.clients ?? []) as DashClient[];

  const creatorsQuery = trpc.creators.list.useQuery({
    limit: 1,
    offset: 0,
    status: 'active',
  });

  const pendingApprovalsQuery = trpc.approvals.countPending.useQuery();

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Here&apos;s what&apos;s happening with your campaigns.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Campaigns"
            value={campaignsQuery.data?.total ?? 0}
            loading={campaignsQuery.isLoading}
            color="blue"
          />
          <StatCard
            title="Total Clients"
            value={clientsQuery.data?.total ?? 0}
            loading={clientsQuery.isLoading}
            color="green"
          />
          <StatCard
            title="Active Creators"
            value={creatorsQuery.data?.total ?? 0}
            loading={creatorsQuery.isLoading}
            color="purple"
          />
          <StatCard
            title="Pending Approvals"
            value={pendingApprovalsQuery.data ?? 0}
            loading={pendingApprovalsQuery.isLoading}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/campaigns/new"
              className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl">📋</div>
              <div className="mt-2 font-medium text-gray-900">New Campaign</div>
            </Link>
            <Link
              href="/clients/new"
              className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl">👥</div>
              <div className="mt-2 font-medium text-gray-900">New Client</div>
            </Link>
            <Link
              href="/creators/new"
              className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <div className="text-2xl">🎬</div>
              <div className="mt-2 font-medium text-gray-900">Add Creator</div>
            </Link>
            <Link
              href="/approvals"
              className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <div className="text-2xl">✓</div>
              <div className="mt-2 font-medium text-gray-900">Approvals</div>
            </Link>
          </div>
        </Card>

        {/* Recent Campaigns */}
        <Card className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
            <Link href="/campaigns" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>
          {campaignsQuery.isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading campaigns...</div>
          ) : dashCampaigns.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No campaigns yet. Create your first campaign to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {dashCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">
                      Status: <span className="capitalize">{campaign.status?.replace(/_/g, ' ')}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        campaign.risk_level === 'low'
                          ? 'success'
                          : campaign.risk_level === 'medium'
                            ? 'warning'
                            : campaign.risk_level === 'high'
                              ? 'warning'
                              : 'danger'
                      }
                    >
                      {campaign.risk_level}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Clients */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Clients</h2>
            <Link href="/clients" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>
          {clientsQuery.isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading clients...</div>
          ) : dashClients.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No clients yet. Add your first client to start managing campaigns!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900">{client.name}</h3>
                  {client.company_name && (
                    <p className="text-sm text-gray-500">{client.company_name}</p>
                  )}
                  {client.tier && (
                    <Badge
                      variant={
                        client.tier === 'platinum'
                          ? 'info'
                          : client.tier === 'gold'
                            ? 'warning'
                            : 'default'
                      }
                      size="sm"
                      className="mt-2"
                    >
                      {client.tier}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

function StatCard({
  title,
  value,
  loading,
  color,
}: {
  title: string;
  value: number;
  loading: boolean;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card>
      <div className="text-sm font-medium text-gray-600">{title}</div>
      {loading ? (
        <div className="mt-2 text-3xl font-bold text-gray-400">...</div>
      ) : (
        <div className={`mt-2 text-3xl font-bold ${colorClasses[color]}`}>{value}</div>
      )}
    </Card>
  );
}
