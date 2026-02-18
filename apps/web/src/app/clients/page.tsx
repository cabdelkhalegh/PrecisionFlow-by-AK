'use client';

import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');

  const { data, isLoading } = trpc.clients.list.useQuery({
    limit: 50,
    offset: 0,
    search: search || undefined,
    tier: tier || undefined,
  });

  type ClientItem = {
    id: string;
    name: string;
    company_name: string | null;
    email: string;
    tier: string | null;
    industry: string | null;
    [key: string]: unknown;
  };
  const clients: ClientItem[] = ((data as Record<string, unknown>)?.clients ?? []) as ClientItem[];

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your client relationships and portfolios
            </p>
          </div>
          <Link href="/clients/new">
            <Button>
              <span className="mr-2">+</span>
              New Client
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              options={[
                { value: '', label: 'All Tiers' },
                { value: 'platinum', label: 'Platinum' },
                { value: 'gold', label: 'Gold' },
                { value: 'silver', label: 'Silver' },
                { value: 'bronze', label: 'Bronze' },
              ]}
              value={tier}
              onChange={(e) => setTier(e.target.value)}
            />
          </div>
        </Card>

        {/* Clients List */}
        <Card>
          {isLoading ? (
            <div className="py-12 text-center text-gray-500">Loading clients...</div>
          ) : data?.clients.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600 mb-4">
                {search || tier ? 'Try adjusting your filters' : 'Get started by adding your first client'}
              </p>
              {!search && !tier && (
                <Link href="/clients/new">
                  <Button>Add First Client</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-gray-900">{client.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {client.company_name || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {client.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {client.tier ? (
                          <Badge
                            variant={
                              client.tier === 'platinum'
                                ? 'info'
                                : client.tier === 'gold'
                                  ? 'warning'
                                  : 'default'
                            }
                            size="sm"
                          >
                            {client.tier}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {client.industry || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data && data.total > data.clients.length && (
                <div className="border-t border-gray-200 px-6 py-4 text-center">
                  <p className="text-sm text-gray-600">
                    Showing {data.clients.length} of {data.total} clients
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
