/**
 * Campaign-related types
 */

export type CampaignStatus =
  | 'draft'
  | 'brief_uploaded'
  | 'brief_structured'
  | 'brief_approved'
  | 'shortlist_building'
  | 'shortlist_approved'
  | 'in_production'
  | 'published'
  | 'closed'
  | 'cancelled';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Campaign {
  id: string;
  client_id: string;
  name: string;
  status: CampaignStatus;
  risk_level: RiskLevel;
  budget?: number;
  start_date?: string;
  end_date?: string;
  campaign_manager_id: string;
  created_at: string;
  updated_at: string;
}
