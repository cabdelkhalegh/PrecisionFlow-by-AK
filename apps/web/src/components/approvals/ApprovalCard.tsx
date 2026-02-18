'use client';

import { useState, useMemo, useCallback } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useToast } from '../ui/Toast';
import { trpc } from '@/lib/trpc';

interface ApprovalCardProps {
  approval: {
    id: string;
    approval_type: string;
    status: string;
    request_notes?: string;
    approver_comments?: string;
    created_at: string;
    approved_at?: string;
    campaigns?: {
      name: string;
    };
    users?: {
      full_name?: string;
      email: string;
    };
  };
  showActions?: boolean;
  onUpdate?: () => void;
}

// Move type labels outside component to avoid recreation
const TYPE_LABELS: Record<string, string> = {
  brief: 'Brief Approval',
  strategy: 'Strategy Approval',
  shortlist: 'Shortlist Approval',
  content: 'Content Approval',
  budget_revision: 'Budget Revision',
};

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  overridden: 'default',
};

export function ApprovalCard({ approval, showActions = false, onUpdate }: ApprovalCardProps) {
  const [comments, setComments] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const { showToast } = useToast();
  const utils = trpc.useUtils();

  const approveMutation = trpc.approvals.approve.useMutation({
    onSuccess: () => {
      showToast('Approval granted successfully', 'success');
      utils.approvals.invalidate();
      onUpdate?.();
      setShowCommentBox(false);
      setComments('');
    },
    onError: (error) => {
      showToast(error.message, 'error');
    },
  });

  const rejectMutation = trpc.approvals.reject.useMutation({
    onSuccess: () => {
      showToast('Approval rejected', 'info');
      utils.approvals.invalidate();
      onUpdate?.();
      setShowCommentBox(false);
      setComments('');
    },
    onError: (error) => {
      showToast(error.message, 'error');
    },
  });

  // Memoize callbacks to prevent unnecessary re-renders
  const handleApprove = useCallback(() => {
    approveMutation.mutate({ id: approval.id, comments });
  }, [approveMutation, approval.id, comments]);

  const handleReject = useCallback(() => {
    if (!comments.trim()) {
      showToast('Please provide a reason for rejection', 'warning');
      return;
    }
    rejectMutation.mutate({ id: approval.id, reason: comments });
  }, [rejectMutation, approval.id, comments, showToast]);

  // Memoize derived values to avoid recalculation on every render
  const typeLabel = useMemo(
    () => TYPE_LABELS[approval.approval_type] || approval.approval_type,
    [approval.approval_type]
  );

  const statusVariant = useMemo(
    () => STATUS_VARIANTS[approval.status] || 'default',
    [approval.status]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {typeLabel}
          </h3>
          {approval.campaigns && (
            <p className="text-sm text-gray-600 mt-1">
              Campaign: {approval.campaigns.name}
            </p>
          )}
        </div>
        <Badge variant={statusVariant}>
          {approval.status}
        </Badge>
      </div>

      {/* Request Notes */}
      {approval.request_notes && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Request Notes:</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            {approval.request_notes}
          </p>
        </div>
      )}

      {/* Approver Comments */}
      {approval.approver_comments && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Approver Comments:</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            {approval.approver_comments}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span>Created: {new Date(approval.created_at).toLocaleDateString()}</span>
        {approval.approved_at && (
          <span>Decided: {new Date(approval.approved_at).toLocaleDateString()}</span>
        )}
        {approval.users && (
          <span>Approver: {approval.users.full_name || approval.users.email}</span>
        )}
      </div>

      {/* Actions */}
      {showActions && approval.status === 'pending' && (
        <div className="border-t pt-4">
          {!showCommentBox ? (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowCommentBox(true);
                }}
                variant="primary"
                size="sm"
              >
                Approve
              </Button>
              <Button
                onClick={() => {
                  setShowCommentBox(true);
                }}
                variant="danger"
                size="sm"
              >
                Reject
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                label="Comments (required for rejection)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add your comments here..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  variant="primary"
                  size="sm"
                  loading={approveMutation.isPending}
                >
                  Confirm Approval
                </Button>
                <Button
                  onClick={handleReject}
                  variant="danger"
                  size="sm"
                  loading={rejectMutation.isPending}
                >
                  Confirm Rejection
                </Button>
                <Button
                  onClick={() => {
                    setShowCommentBox(false);
                    setComments('');
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
