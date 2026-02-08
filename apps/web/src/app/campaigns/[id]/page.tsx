'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BriefUploadModal } from '@/components/briefs/BriefUploadModal';
import { BriefViewer } from '@/components/briefs/BriefViewer';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/Toast';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;
  const { showToast } = useToast();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Fetch campaign
  const { data: campaignData, isLoading: campaignLoading, refetch: refetchCampaign } = trpc.campaigns.getById.useQuery(
    { id: campaignId },
    { enabled: !!campaignId }
  );
  
  // Type cast to avoid type errors
  const campaign: any = campaignData;

  // Fetch client
  const { data: clientData } = trpc.clients.getById.useQuery(
    { id: campaign?.client_id || '' },
    { enabled: !!campaign?.client_id }
  );
  const client: any = clientData;

  // Fetch briefs
  const { data: briefsData, refetch: refetchBriefs } = trpc.briefs.listByCampaign.useQuery(
    { campaignId, limit: 50, offset: 0 },
    { enabled: !!campaignId }
  );

  // Fetch latest brief
  const { data: latestBrief, refetch: refetchLatestBrief } = trpc.briefs.getLatestByCampaign.useQuery(
    { campaignId },
    { enabled: !!campaignId }
  );

  const processAIMutation = trpc.briefs.processWithAI.useMutation();

  const handleProcessWithAI = async (briefId: string) => {
    try {
      await processAIMutation.mutateAsync({ id: briefId });
      showToast('Brief processed with AI successfully!', 'success');
      refetchLatestBrief();
      refetchCampaign();
    } catch (error) {
      console.error('AI processing error:', error);
      showToast('Failed to process brief with AI', 'error');
    }
  };

  const handleBriefUploadSuccess = () => {
    refetchBriefs();
    refetchLatestBrief();
    refetchCampaign();
  };

  if (campaignLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">Loading campaign...</div>
        </div>
      </AppLayout>
    );
  }

  if (!campaign) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign not found</h2>
            <Button onClick={() => router.push('/campaigns')}>Back to Campaigns</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'warning';
      case 'critical': return 'danger';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'internal_approval': return 'info';
      case 'client_review': return 'warning';
      case 'approved': return 'success';
      case 'in_execution': return 'info';
      case 'completed': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => router.push('/campaigns')}>
                Back
              </Button>
              <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
                📄 Upload Brief
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getStatusColor(campaign.status)}>
              {campaign.status.replace('_', ' ')}
            </Badge>
            <Badge variant={getRiskColor(campaign.risk_level)}>
              Risk: {campaign.risk_level}
            </Badge>
          </div>
        </div>

        {/* Campaign Overview */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Overview</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
              <p className="text-gray-900">{client?.name || 'Loading...'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Budget</h3>
              <p className="text-gray-900">
                ${campaign.total_budget?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
              <p className="text-gray-900">
                {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
              <p className="text-gray-900">
                {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            {campaign.tags && campaign.tags.length > 0 && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="default">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Latest Brief */}
        {latestBrief ? (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Brief</h2>
            <BriefViewer
              brief={latestBrief}
              onProcessWithAI={() => handleProcessWithAI(latestBrief.id)}
              isProcessing={processAIMutation.isLoading}
            />
          </div>
        ) : (
          <Card className="mb-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No brief uploaded yet</p>
              <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
                📄 Upload First Brief
              </Button>
            </div>
          </Card>
        )}

        {/* Brief History */}
        {briefsData && briefsData.briefs.length > 1 && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Brief History</h2>
            <div className="space-y-2">
              {briefsData.briefs.map((brief: any) => (
                <div
                  key={brief.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">Version {brief.version}</span>
                    <span className="text-gray-500 text-sm ml-3">
                      {new Date(brief.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {brief.is_latest && <Badge variant="info">Latest</Badge>}
                    {brief.is_approved && <Badge variant="success">Approved</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Upload Modal */}
        <BriefUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          campaignId={campaignId}
          onSuccess={handleBriefUploadSuccess}
        />
      </div>
    </AppLayout>
  );
}
