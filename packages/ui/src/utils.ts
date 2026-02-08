/**
 * Shared UI utilities
 */

import type { CampaignStatus, RiskLevel, ClientTier, ApprovalStatus, BadgeVariant } from './types';

/**
 * Get badge color variant for campaign status
 */
export function getStatusBadgeVariant(status: CampaignStatus): BadgeVariant {
  switch (status) {
    case 'draft':
      return 'default';
    case 'internal_approval':
      return 'info';
    case 'client_review':
      return 'warning';
    case 'approved':
      return 'success';
    case 'in_execution':
      return 'info';
    case 'completed':
      return 'success';
    case 'closed':
      return 'default';
    default:
      return 'default';
  }
}

/**
 * Get badge color variant for risk level
 */
export function getRiskBadgeVariant(risk: RiskLevel): BadgeVariant {
  switch (risk) {
    case 'low':
      return 'success';
    case 'medium':
      return 'warning';
    case 'high':
      return 'warning';
    case 'critical':
      return 'danger';
    default:
      return 'default';
  }
}

/**
 * Get badge color variant for client tier
 */
export function getTierBadgeVariant(tier: ClientTier): BadgeVariant {
  switch (tier) {
    case 'platinum':
      return 'info';
    case 'gold':
      return 'warning';
    case 'silver':
    case 'bronze':
      return 'default';
    default:
      return 'default';
  }
}

/**
 * Get badge color variant for approval status
 */
export function getApprovalBadgeVariant(status: ApprovalStatus): BadgeVariant {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'overridden':
      return 'info';
    default:
      return 'default';
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(d);
}
