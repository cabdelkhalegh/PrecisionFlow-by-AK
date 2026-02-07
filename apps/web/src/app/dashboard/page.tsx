'use client';

import { trpc } from '@/lib/trpc';
import Link from 'next/link';

export default function DashboardPage() {
  const campaignsQuery = trpc.campaigns.list.useQuery({
    limit: 10,
    offset: 0,
  });

  const clientsQuery = trpc.clients.list.useQuery({
    limit: 10,
    offset: 0,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">TiKiT OS Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Campaign Execution & Intelligence Platform
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          <StatCard title="Active Briefs" value={0} loading={false} color="purple" />
          <StatCard title="Pending Approvals" value={0} loading={false} color="orange" />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/campaigns/new"
              className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-blue-500 hover:bg-blue-50"
            >
              <div className="text-2xl">📋</div>
              <div className="mt-2 font-medium text-gray-900">New Campaign</div>
            </Link>
            <Link
              href="/clients/new"
              className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-green-500 hover:bg-green-50"
            >
              <div className="text-2xl">👥</div>
              <div className="mt-2 font-medium text-gray-900">New Client</div>
            </Link>
            <Link
              href="/briefs/upload"
              className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-purple-500 hover:bg-purple-50"
            >
              <div className="text-2xl">📄</div>
              <div className="mt-2 font-medium text-gray-900">Upload Brief</div>
            </Link>
            <Link
              href="/approvals"
              className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-orange-500 hover:bg-orange-50"
            >
              <div className="text-2xl">✓</div>
              <div className="mt-2 font-medium text-gray-900">Approvals</div>
            </Link>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
            <Link href="/campaigns" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>
          {campaignsQuery.isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading campaigns...</div>
          ) : campaignsQuery.data?.campaigns.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No campaigns yet. Create your first campaign to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {campaignsQuery.data?.campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">
                      Status: <span className="capitalize">{campaign.status}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        campaign.risk_level === 'low'
                          ? 'bg-green-100 text-green-800'
                          : campaign.risk_level === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : campaign.risk_level === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {campaign.risk_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Clients</h2>
            <Link href="/clients" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>
          {clientsQuery.isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading clients...</div>
          ) : clientsQuery.data?.clients.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No clients yet. Add your first client to start managing campaigns!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clientsQuery.data?.clients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">{client.name}</h3>
                  {client.company_name && (
                    <p className="text-sm text-gray-500">{client.company_name}</p>
                  )}
                  {client.tier && (
                    <span
                      className={`mt-2 inline-block rounded px-2 py-1 text-xs font-medium ${
                        client.tier === 'platinum'
                          ? 'bg-purple-100 text-purple-800'
                          : client.tier === 'gold'
                            ? 'bg-yellow-100 text-yellow-800'
                            : client.tier === 'silver'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {client.tier}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
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
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      {loading ? (
        <div className="mt-2 text-3xl font-bold text-gray-400">...</div>
      ) : (
        <div className={`mt-2 text-3xl font-bold ${colorClasses[color]}`}>{value}</div>
      )}
    </div>
  );
}
