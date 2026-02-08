/**
 * Shared types for tRPC API responses
 * These types help TypeScript understand the shape of data returned from tRPC queries
 */

// Approval with joined campaigns and users data
export interface ApprovalWithRelations {
  id: string;
  campaign_id: string;
  approval_type: string;
  status: string;
  approver_id: string;
  requested_by: string;
  requested_at: string;
  responded_at: string | null;
  comments: string | null;
  request_notes?: string;
  approver_comments?: string;
  created_at: string;
  approved_at?: string;
  updated_at: string;
  metadata: any | null;
  campaigns?: {
    name: string;
    client_id?: string;
  };
  users?: {
    full_name?: string;
    email: string;
  };
}

// Campaign with client data
export interface CampaignWithClient {
  id: string;
  name: string;
  client_id: string;
  status: string;
  risk_level: string;
  total_budget: number | null;
  start_date: string | null;
  end_date: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    industry: string;
  } | null;
}

// Brief data
export interface Brief {
  id: string;
  campaign_id: string;
  version: number;
  raw_text: string | null;
  structured_data: any | null;
  ai_processed: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

// Re-export from API types
export type { AppRouter } from '@tikit/api';
