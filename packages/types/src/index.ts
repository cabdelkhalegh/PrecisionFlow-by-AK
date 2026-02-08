import { z } from 'zod';

// User roles as defined in PRD
export const UserRole = z.enum([
  'campaign_manager',
  'director',
  'finance',
  'admin',
  'client',
  'influencer',
]);

export type UserRole = z.infer<typeof UserRole>;

// Campaign status states
export const CampaignStatus = z.enum([
  'draft',
  'brief_uploaded',
  'brief_approved',
  'strategy_pending',
  'strategy_approved',
  'creators_pending',
  'creators_approved',
  'in_progress',
  'content_review',
  'published',
  'completed',
  'closed',
]);

export type CampaignStatus = z.infer<typeof CampaignStatus>;

// Risk levels
export const RiskLevel = z.enum(['low', 'medium', 'high', 'critical']);

export type RiskLevel = z.infer<typeof RiskLevel>;

// Content artifact lifecycle states
export const ContentArtifactStatus = z.enum([
  'draft',
  'pending_approval',
  'revisions_requested',
  'approved',
  'published',
  'archived',
]);

export type ContentArtifactStatus = z.infer<typeof ContentArtifactStatus>;

// Approval status
export const ApprovalStatus = z.enum([
  'pending',
  'approved',
  'rejected',
  'overridden',
]);

export type ApprovalStatus = z.infer<typeof ApprovalStatus>;

export * from './campaign';
export * from './user';
