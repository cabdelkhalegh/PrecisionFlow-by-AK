/**
 * Shared UI types
 */

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Campaign status type (shared between web and mobile)
export type CampaignStatus =
  | 'draft'
  | 'internal_approval'
  | 'client_review'
  | 'approved'
  | 'in_execution'
  | 'completed'
  | 'closed';

// Risk level type (shared between web and mobile)
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Client tier type
export type ClientTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// Approval status type
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'overridden';

// Approval type
export type ApprovalType = 'brief' | 'strategy' | 'shortlist' | 'content' | 'budget_revision';
