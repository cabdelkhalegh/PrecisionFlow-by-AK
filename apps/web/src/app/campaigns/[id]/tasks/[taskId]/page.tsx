'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/Toast';

/* ──────────── Status helpers ──────────── */

const STATUS_FLOW = [
  'assigned',
  'script_submitted', 'script_approved',
  'draft_submitted', 'draft_approved',
  'final_submitted', 'approved', 'published',
];

const STATUS_COLORS: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
  assigned: 'default',
  script_submitted: 'info',
  script_approved: 'success',
  draft_submitted: 'info',
  draft_approved: 'success',
  final_submitted: 'info',
  approved: 'success',
  published: 'success',
  changes_requested: 'warning',
  cancelled: 'danger',
};

const GATE_CONFIG = [
  { gate: 'Script', submittedStatus: 'script_submitted', approvedStatus: 'script_approved', artifactType: 'script' as const },
  { gate: 'Draft', submittedStatus: 'draft_submitted', approvedStatus: 'draft_approved', artifactType: 'draft' as const },
  { gate: 'Final', submittedStatus: 'final_submitted', approvedStatus: 'approved', artifactType: 'final' as const },
];

/* ──────────── Page component ──────────── */

export default function ContentTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const campaignId = params?.id as string;
  const taskId = params?.taskId as string;

  const [reviewComment, setReviewComment] = useState('');
  const [changesComment, setChangesComment] = useState('');

  // Queries
  const { data: task, isLoading, refetch } = trpc.contentTasks.getById.useQuery(
    { id: taskId },
    { enabled: !!taskId }
  );

  const { data: artifacts, refetch: refetchArtifacts } = trpc.contentArtifacts.getByTask.useQuery(
    { content_task_id: taskId },
    { enabled: !!taskId }
  );

  // Mutations
  const approveScript = trpc.contentTasks.approveScript.useMutation({
    onSuccess: () => { showToast('Script approved!', 'success'); refetch(); },
    onError: () => showToast('Failed to approve script', 'error'),
  });
  const approveDraft = trpc.contentTasks.approveDraft.useMutation({
    onSuccess: () => { showToast('Draft approved!', 'success'); refetch(); },
    onError: () => showToast('Failed to approve draft', 'error'),
  });
  const approveFinal = trpc.contentTasks.approveFinal.useMutation({
    onSuccess: () => { showToast('Final approved!', 'success'); refetch(); },
    onError: () => showToast('Failed to approve final', 'error'),
  });
  const requestChanges = trpc.contentTasks.requestChanges.useMutation({
    onSuccess: () => { showToast('Changes requested', 'success'); refetch(); setChangesComment(''); },
    onError: () => showToast('Failed to request changes', 'error'),
  });
  const updateStatus = trpc.contentTasks.updateStatus.useMutation({
    onSuccess: () => { showToast('Status updated', 'success'); refetch(); },
    onError: () => showToast('Failed to update status', 'error'),
  });
  const approveArtifact = trpc.contentArtifacts.approve.useMutation({
    onSuccess: () => { showToast('Artifact approved', 'success'); refetchArtifacts(); },
    onError: () => showToast('Failed to approve artifact', 'error'),
  });
  const requestArtifactChanges = trpc.contentArtifacts.requestChanges.useMutation({
    onSuccess: () => { showToast('Changes requested for artifact', 'success'); refetchArtifacts(); setReviewComment(''); },
    onError: () => showToast('Failed to request changes', 'error'),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">Loading task...</div>
        </div>
      </AppLayout>
    );
  }

  if (!task) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Task not found</h2>
            <Button onClick={() => router.push(`/campaigns/${campaignId}`)}>
              Back to Campaign
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const taskAny = task as any;
  const currentStatusIndex = STATUS_FLOW.indexOf(taskAny.status);
  const allArtifacts = (artifacts || []) as any[];

  const handleGateApproval = (gate: string, approved: boolean) => {
    const comment = reviewComment || undefined;
    if (gate === 'Script') {
      approveScript.mutate({ id: taskId, approved, comments: comment });
    } else if (gate === 'Draft') {
      approveDraft.mutate({ id: taskId, approved, comments: comment });
    } else if (gate === 'Final') {
      approveFinal.mutate({ id: taskId, approved, comments: comment });
    }
    setReviewComment('');
  };

  const handleRequestChanges = () => {
    if (!changesComment.trim()) {
      showToast('Please provide revision notes', 'error');
      return;
    }
    requestChanges.mutate({ id: taskId, revision_notes: changesComment });
  };

  const handlePublish = () => {
    updateStatus.mutate({ id: taskId, status: 'published' });
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/campaigns/${campaignId}`)}
            className="text-sm text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Campaign
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{taskAny.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={STATUS_COLORS[taskAny.status] || 'default'}>
                  {taskAny.status?.replace(/_/g, ' ')}
                </Badge>
                <span className="text-sm text-gray-500 capitalize">
                  📱 {taskAny.deliverable_type?.replace(/_/g, ' ')}
                </span>
                {taskAny.payment_amount && (
                  <span className="text-sm font-medium text-gray-700">
                    💰 ${taskAny.payment_amount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            {taskAny.status === 'approved' && (
              <Button variant="primary" onClick={handlePublish}>
                🚀 Mark as Published
              </Button>
            )}
          </div>
        </div>

        {/* Status Pipeline */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Pipeline</h2>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {STATUS_FLOW.map((status, i) => {
              const isPast = i <= currentStatusIndex;
              const isCurrent = status === taskAny.status;
              return (
                <div key={status} className="flex items-center">
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isPast
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {status.replace(/_/g, ' ')}
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`w-4 h-0.5 mx-1 ${isPast ? 'bg-green-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
          {taskAny.status === 'changes_requested' && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Changes have been requested. The creator needs to resubmit.
              </p>
              {taskAny.feedback && (
                <p className="mt-1 text-sm text-yellow-700">
                  <strong>Feedback:</strong> {taskAny.feedback}
                </p>
              )}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Task details + Artifacts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Details */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Creator</h3>
                  <p className="text-gray-900">{taskAny.creator?.name || 'Unassigned'}</p>
                  {taskAny.creator?.primary_platform && (
                    <Badge size="sm" variant="info" className="mt-1">
                      {taskAny.creator.primary_platform}
                    </Badge>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Campaign</h3>
                  <p className="text-gray-900">{taskAny.campaign?.name || '—'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Final Deadline</h3>
                  <p className="text-gray-900">
                    {taskAny.deadline ? new Date(taskAny.deadline).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Status</h3>
                  <Badge variant={taskAny.payment_status === 'paid' ? 'success' : 'default'}>
                    {taskAny.payment_status || 'pending'}
                  </Badge>
                </div>
              </div>
              {taskAny.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-700">{taskAny.description}</p>
                </div>
              )}
            </Card>

            {/* Approval Gates */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Gates</h2>
              <div className="space-y-4">
                {GATE_CONFIG.map(({ gate, submittedStatus, approvedStatus, artifactType }) => {
                  const gateArtifacts = allArtifacts.filter(
                    (a: any) => a.artifact_type === artifactType
                  );
                  const latestArtifact = gateArtifacts.find((a: any) => a.is_latest);
                  const isSubmitted = currentStatusIndex >= STATUS_FLOW.indexOf(submittedStatus);
                  const isApproved = currentStatusIndex >= STATUS_FLOW.indexOf(approvedStatus);
                  const isWaitingApproval = taskAny.status === submittedStatus;
                  const deadlineField = `${artifactType}_deadline` as string;
                  const deadline = taskAny[deadlineField];

                  return (
                    <div
                      key={gate}
                      className={`p-4 rounded-lg border ${
                        isApproved
                          ? 'border-green-200 bg-green-50'
                          : isWaitingApproval
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {isApproved ? '✅' : isWaitingApproval ? '🔵' : '⬜'}
                          </span>
                          <h3 className="font-medium text-gray-900">Gate: {gate}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {deadline && (
                            <span className="text-xs text-gray-500">
                              Due: {new Date(deadline).toLocaleDateString()}
                            </span>
                          )}
                          {isApproved && <Badge size="sm" variant="success">Approved</Badge>}
                          {isWaitingApproval && <Badge size="sm" variant="info">Awaiting Review</Badge>}
                          {!isSubmitted && !isApproved && <Badge size="sm" variant="default">Pending</Badge>}
                        </div>
                      </div>

                      {/* Latest artifact for this gate */}
                      {latestArtifact && (
                        <div className="mt-2 p-3 bg-white rounded border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                📎 {latestArtifact.file_name || `${gate} v${latestArtifact.version}`}
                              </span>
                              {latestArtifact.text_content && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {latestArtifact.text_content}
                                </p>
                              )}
                            </div>
                            <Badge
                              size="sm"
                              variant={
                                latestArtifact.status === 'approved'
                                  ? 'success'
                                  : latestArtifact.status === 'changes_requested'
                                  ? 'warning'
                                  : 'default'
                              }
                            >
                              {latestArtifact.status}
                            </Badge>
                          </div>

                          {/* Artifact review actions */}
                          {latestArtifact.status === 'pending' && (
                            <div className="mt-3 flex gap-2">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                  approveArtifact.mutate({ id: latestArtifact.id })
                                }
                              >
                                ✅ Approve Artifact
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  requestArtifactChanges.mutate({
                                    id: latestArtifact.id,
                                    comments: reviewComment || 'Please revise',
                                  })
                                }
                              >
                                🔄 Request Changes
                              </Button>
                            </div>
                          )}
                          {latestArtifact.review_comments && (
                            <p className="mt-2 text-xs text-gray-500 italic">
                              Review: {latestArtifact.review_comments}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Gate-level approval action */}
                      {isWaitingApproval && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleGateApproval(gate, true)}
                            >
                              ✅ Approve {gate}
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleGateApproval(gate, false)}
                            >
                              ❌ Reject {gate}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Version history */}
                      {gateArtifacts.length > 1 && (
                        <div className="mt-2 text-xs text-gray-400">
                          {gateArtifacts.length} versions uploaded
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Request Changes form */}
            {!['approved', 'published', 'cancelled'].includes(taskAny.status) && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Changes</h2>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe what changes are needed..."
                  value={changesComment}
                  onChange={(e) => setChangesComment(e.target.value)}
                />
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    onClick={handleRequestChanges}
                    disabled={requestChanges.isLoading}
                  >
                    🔄 Request Changes
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right column: Sidebar */}
          <div className="space-y-6">
            {/* Deadlines */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Deadlines</h2>
              <div className="space-y-3">
                {[
                  { label: 'Script', date: taskAny.script_deadline, approvedAt: taskAny.script_approved_at },
                  { label: 'Draft', date: taskAny.draft_deadline, approvedAt: taskAny.draft_approved_at },
                  { label: 'Final', date: taskAny.final_deadline, approvedAt: taskAny.final_approved_at },
                  { label: 'Overall', date: taskAny.deadline, approvedAt: null },
                ].map(({ label, date, approvedAt }) =>
                  date ? (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{label}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(date).toLocaleDateString()}
                        </span>
                        {approvedAt && (
                          <div className="text-xs text-green-600">
                            ✅ {new Date(approvedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </Card>

            {/* Revision History */}
            {taskAny.revision_notes && taskAny.revision_notes.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Revision Notes</h2>
                <div className="space-y-2">
                  {(taskAny.revision_notes as string[]).map((note: string, i: number) => (
                    <div key={i} className="p-2 bg-yellow-50 border border-yellow-100 rounded text-sm text-yellow-800">
                      #{i + 1}: {note}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* All Artifacts */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📎 All Artifacts</h2>
              {allArtifacts.length === 0 ? (
                <p className="text-sm text-gray-500">No artifacts uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {allArtifacts.map((a: any) => (
                    <div
                      key={a.id}
                      className="p-2 border border-gray-100 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {a.artifact_type}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">v{a.version}</span>
                      </div>
                      <Badge
                        size="sm"
                        variant={
                          a.status === 'approved'
                            ? 'success'
                            : a.status === 'changes_requested'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {a.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
