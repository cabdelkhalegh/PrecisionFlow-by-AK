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
import Link from 'next/link';

type TabKey = 'overview' | 'shortlist' | 'tasks';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;
  const { showToast } = useToast();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

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

  // Fetch shortlist
  const { data: shortlistData } = trpc.shortlists.getByCampaign.useQuery(
    { campaign_id: campaignId },
    { enabled: !!campaignId }
  );

  // Fetch content tasks
  const { data: tasksData } = trpc.contentTasks.getByCampaign.useQuery(
    { campaign_id: campaignId },
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

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'shortlist', label: 'Shortlist', count: shortlistData?.length ?? 0 },
    { key: 'tasks', label: 'Content Tasks', count: tasksData?.length ?? 0 },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => router.push('/campaigns')}>
                Back
              </Button>
              <Button variant="secondary" onClick={() => router.push(`/campaigns/${campaignId}/edit`)}>
                ✏️ Edit
              </Button>
              <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
                📄 Upload Brief
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getStatusColor(campaign.status)}>
              {campaign.status?.replace(/_/g, ' ')}
            </Badge>
            <Badge variant={getRiskColor(campaign.risk_level)}>
              Risk: {campaign.risk_level}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
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
                    ${campaign.budget_total?.toLocaleString() || '0'}
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
          </>
        )}

        {activeTab === 'shortlist' && (
          <ShortlistSection shortlist={shortlistData || []} campaignId={campaignId} />
        )}

        {activeTab === 'tasks' && (
          <ContentTasksSection tasks={tasksData || []} campaignId={campaignId} />
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

/* ───────────────────────────────────────────── */
/*  Shortlist Section                            */
/* ───────────────────────────────────────────── */
function ShortlistSection({ shortlist, campaignId }: { shortlist: any[]; campaignId: string }) {
  if (shortlist.length === 0) {
    return (
      <Card>
        <div className="py-12 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No creators shortlisted yet</h3>
          <p className="text-gray-600 mb-4">
            Browse creators and add them to this campaign&apos;s shortlist.
          </p>
          <Link href="/creators">
            <Button>Browse Creators</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const getShortlistStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'submitted': return 'info';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'removed': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Creator Shortlist ({shortlist.length})
        </h2>
        <Link href="/creators">
          <Button variant="secondary">+ Add Creator</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {shortlist.map((item: any) => (
          <Card key={`${item.campaign_id}-${item.creator_id}`} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Position */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {item.position || '—'}
                </div>
                {/* Creator info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {item.creator?.name || 'Unknown Creator'}
                    </span>
                    {item.creator?.primary_platform && (
                      <Badge size="sm" variant="info">{item.creator.primary_platform}</Badge>
                    )}
                  </div>
                  {item.proposed_deliverables && item.proposed_deliverables.length > 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      {item.proposed_deliverables.join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.proposed_rate && (
                  <span className="text-sm font-medium text-gray-700">
                    ${item.proposed_rate.toLocaleString()}
                  </span>
                )}
                <Badge variant={getShortlistStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            </div>
            {item.internal_notes && (
              <p className="mt-2 text-sm text-gray-500 italic border-t border-gray-100 pt-2">
                📝 {item.internal_notes}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────── */
/*  Content Tasks Section                        */
/* ───────────────────────────────────────────── */
function ContentTasksSection({ tasks, campaignId }: { tasks: any[]; campaignId: string }) {
  if (tasks.length === 0) {
    return (
      <Card>
        <div className="py-12 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content tasks yet</h3>
          <p className="text-gray-600">
            Content tasks will appear here once creators are assigned deliverables.
          </p>
        </div>
      </Card>
    );
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'default';
      case 'script_submitted': case 'draft_submitted': case 'final_submitted': return 'info';
      case 'script_approved': case 'draft_approved': return 'success';
      case 'changes_requested': return 'warning';
      case 'approved': case 'published': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  // Group tasks by status for the pipeline view
  const statusGroups = [
    { label: 'Assigned', statuses: ['assigned'] },
    { label: 'In Progress', statuses: ['script_submitted', 'script_approved', 'draft_submitted', 'draft_approved', 'changes_requested'] },
    { label: 'Final Review', statuses: ['final_submitted'] },
    { label: 'Complete', statuses: ['approved', 'published'] },
  ];

  return (
    <div className="space-y-6">
      {/* Pipeline Summary */}
      <div className="grid grid-cols-4 gap-4">
        {statusGroups.map((group) => {
          const count = tasks.filter((t: any) => group.statuses.includes(t.status)).length;
          return (
            <Card key={group.label}>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500">{group.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task: any) => (
          <Link key={task.id} href={`/campaigns/${campaignId}/tasks/${task.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                  <Badge size="sm" variant={getTaskStatusColor(task.status)}>
                    {task.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {task.creator && (
                    <span>
                      🎬 {task.creator.name}
                    </span>
                  )}
                  <span className="capitalize">
                    📱 {task.deliverable_type?.replace(/_/g, ' ')}
                  </span>
                  {task.deadline && (
                    <span>
                      📅 Due {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{task.description}</p>
                )}
              </div>
              <div className="ml-4 shrink-0 text-right">
                {task.payment_amount && (
                  <div className="text-sm font-medium text-gray-700">
                    ${task.payment_amount.toLocaleString()}
                  </div>
                )}
                {task.payment_status && (
                  <Badge
                    size="sm"
                    variant={task.payment_status === 'paid' ? 'success' : 'default'}
                    className="mt-1"
                  >
                    {task.payment_status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Deadline gates */}
            {(task.script_deadline || task.draft_deadline || task.final_deadline) && (
              <div className="mt-3 flex gap-4 border-t border-gray-100 pt-3">
                {task.script_deadline && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Script:</span>{' '}
                    {new Date(task.script_deadline).toLocaleDateString()}
                  </div>
                )}
                {task.draft_deadline && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Draft:</span>{' '}
                    {new Date(task.draft_deadline).toLocaleDateString()}
                  </div>
                )}
                {task.final_deadline && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Final:</span>{' '}
                    {new Date(task.final_deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
