'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const { data: client, isLoading } = trpc.clients.getById.useQuery(
    { id: clientId },
    { enabled: !!clientId }
  );

  const { data: campaignsData } = trpc.campaigns.list.useQuery(
    { limit: 50, offset: 0, clientId },
    { enabled: !!clientId }
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">Loading client...</div>
        </div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Client not found</h2>
            <Button onClick={() => router.push('/clients')}>Back to Clients</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'info';
      case 'gold': return 'warning';
      case 'silver': return 'default';
      case 'bronze': return 'default';
      default: return 'default';
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => router.push('/clients')}>
                Back
              </Button>
              <Button variant="primary" onClick={() => router.push(`/clients/${clientId}/edit`)}>
                ✏️ Edit Client
              </Button>
            </div>
          </div>
          <Badge variant={getTierColor(client.tier ?? '')}>{(client.tier ?? '').toUpperCase()}</Badge>
        </div>

        {/* Client Information */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Company</h3>
              <p className="text-gray-900">{client.company_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Industry</h3>
              <p className="text-gray-900">{client.industry || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
              <p className="text-gray-900">{client.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
              <p className="text-gray-900">{client.phone || 'Not specified'}</p>
            </div>
            {client.website && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Website</h3>
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {client.website}
                </a>
              </div>
            )}
            {client.address && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                <p className="text-gray-900">
                  {typeof client.address === 'string' ? client.address : JSON.stringify(client.address)}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Campaigns */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Campaigns</h2>
            <Button
              variant="primary"
              onClick={() => router.push(`/campaigns/new?client=${clientId}`)}
            >
              + New Campaign
            </Button>
          </div>
          
          {campaignsData && campaignsData.campaigns.length > 0 ? (
            <div className="space-y-3">
              {campaignsData.campaigns.map((campaign: any) => (
                <div
                  key={campaign.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-500">
                        {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'No date'}
                        {' - '}
                        {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'No date'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{campaign.status}</Badge>
                      {campaign.risk_level && (
                        <Badge variant={campaign.risk_level === 'low' ? 'success' : 'warning'}>
                          {campaign.risk_level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No campaigns yet
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
