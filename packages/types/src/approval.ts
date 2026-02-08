/**
 * Approval-related types
 */

export type ApprovalType = 'brief' | 'strategy' | 'shortlist' | 'content' | 'budget_revision';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'overridden';

export interface Approval {
  id: string;
  campaign_id: string;
  approval_type: ApprovalType;
  status: ApprovalStatus;
  approver_id: string;
  approver_role: string;
  comments?: string;
  created_at: string;
  updated_at: string;
}
