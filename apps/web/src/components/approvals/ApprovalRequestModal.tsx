'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useToast } from '../ui/Toast';
import { trpc } from '@/lib/trpc';

interface ApprovalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSuccess?: () => void;
}

export function ApprovalRequestModal({
  isOpen,
  onClose,
  campaignId,
  onSuccess,
}: ApprovalRequestModalProps) {
  const [approvalType, setApprovalType] = useState<string>('brief');
  const [approverId, setApproverId] = useState<string>('');
  const [requestNotes, setRequestNotes] = useState('');
  const { showToast } = useToast();

  // Fetch users who can be approvers (directors, finance, etc.)
  // For now, we'll use a placeholder - in production, you'd fetch from users API
  const approvers = [
    { id: '1', name: 'John Director', role: 'Director' },
    { id: '2', name: 'Jane Manager', role: 'Finance' },
  ];

  const createMutation = trpc.approvals.create.useMutation({
    onSuccess: () => {
      showToast('Approval request created successfully', 'success');
      onSuccess?.();
      handleClose();
    },
    onError: (error) => {
      showToast(error.message, 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!approverId) {
      showToast('Please select an approver', 'warning');
      return;
    }

    createMutation.mutate({
      campaignId,
      approvalType: approvalType as any,
      approverId,
      requestNotes: requestNotes || undefined,
    });
  };

  const handleClose = () => {
    setApprovalType('brief');
    setApproverId('');
    setRequestNotes('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Approval">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Approval Type"
          value={approvalType}
          onChange={(e) => setApprovalType(e.target.value)}
          required
          options={[
            { value: 'brief', label: 'Brief Approval' },
            { value: 'strategy', label: 'Strategy Approval' },
            { value: 'shortlist', label: 'Shortlist Approval' },
            { value: 'content', label: 'Content Approval' },
            { value: 'budget_revision', label: 'Budget Revision' },
          ]}
        />

        <Select
          label="Approver"
          value={approverId}
          onChange={(e) => setApproverId(e.target.value)}
          required
          options={[
            { value: '', label: 'Select an approver...' },
            ...approvers.map((approver) => ({
              value: approver.id,
              label: `${approver.name} (${approver.role})`,
            })),
          ]}
        />

        <Textarea
          label="Request Notes"
          value={requestNotes}
          onChange={(e) => setRequestNotes(e.target.value)}
          placeholder="Add any notes or context for the approver..."
          rows={4}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={createMutation.isLoading}
          >
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
