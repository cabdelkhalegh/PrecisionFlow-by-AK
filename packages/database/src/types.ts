/**
 * TiKiT OS Database Types
 * Generated from Supabase schema
 */

// ============================================================================
// ENUMS
// ============================================================================

export type CampaignStatus =
  | 'draft'
  | 'planning'
  | 'brief_review'
  | 'strategy_approval'
  | 'creator_selection'
  | 'content_production'
  | 'content_approval'
  | 'publishing'
  | 'monitoring'
  | 'reporting'
  | 'closed'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type UserRole =
  | 'campaign_manager'
  | 'director'
  | 'finance'
  | 'admin'
  | 'client'
  | 'influencer'

export type UserStatus = 'active' | 'inactive' | 'suspended'

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'revisions_requested'

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface User {
  id: string // UUID
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  permissions: string[] // JSONB array
  organization_id: string | null // UUID
  status: UserStatus
  preferences: Record<string, any> // JSONB object
  created_at: string // timestamptz
  updated_at: string // timestamptz
  last_login_at: string | null // timestamptz
  deleted_at: string | null // timestamptz
}

export interface Client {
  id: string // UUID
  name: string
  email: string | null
  phone: string | null
  company: string | null
  address: Record<string, any> // JSONB object
  notes: string | null
  tags: string[] // JSONB array
  metadata: Record<string, any> // JSONB object
  created_by: string | null // UUID - references users
  created_at: string // timestamptz
  updated_at: string // timestamptz
  deleted_at: string | null // timestamptz
}

export interface Campaign {
  id: string // UUID
  name: string
  description: string | null
  client_id: string // UUID - references clients
  created_by: string // UUID - references users
  status: CampaignStatus
  risk_level: RiskLevel
  start_date: string | null // date
  end_date: string | null // date
  go_live_date: string | null // date
  budget_amount: number | null // decimal
  budget_currency: string // default 'USD'
  actual_spend: number // decimal, default 0
  objectives: string[] // JSONB array
  target_audience: Record<string, any> // JSONB object
  deliverables: Array<Record<string, any>> // JSONB array
  kpis: Array<Record<string, any>> // JSONB array
  tags: string[] // JSONB array
  metadata: Record<string, any> // JSONB object
  risk_flags: Array<Record<string, any>> // JSONB array
  missing_information: string[] // JSONB array
  created_at: string // timestamptz
  updated_at: string // timestamptz
  completed_at: string | null // timestamptz
  deleted_at: string | null // timestamptz
}

export interface CampaignMember {
  id: string // UUID
  campaign_id: string // UUID - references campaigns
  user_id: string // UUID - references users
  role: string
  permissions: string[] // JSONB array
  joined_at: string // timestamptz
  left_at: string | null // timestamptz
  metadata: Record<string, any> // JSONB object
}

export interface AuditLog {
  id: string // UUID
  action: string // 'INSERT' | 'UPDATE' | 'DELETE'
  entity_type: string // table name
  entity_id: string // UUID
  user_id: string | null // UUID - references users
  user_email: string | null
  user_role: string | null
  timestamp: string // timestamptz
  old_values: Record<string, any> | null // JSONB
  new_values: Record<string, any> | null // JSONB
  metadata: Record<string, any> // JSONB object
  campaign_id: string | null // UUID - references campaigns
  ip_address: string | null // inet
  user_agent: string | null
}

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>
export type CampaignInsert = Omit<Campaign, 'id' | 'created_at' | 'updated_at'>
export type CampaignMemberInsert = Omit<CampaignMember, 'id' | 'joined_at'>
export type AuditLogInsert = Omit<AuditLog, 'id' | 'timestamp'>

// ============================================================================
// UPDATE TYPES (for updating records)
// ============================================================================

export type UserUpdate = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
export type ClientUpdate = Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>
export type CampaignUpdate = Partial<Omit<Campaign, 'id' | 'created_at' | 'updated_at'>>
export type CampaignMemberUpdate = Partial<Omit<CampaignMember, 'id' | 'joined_at'>>

// ============================================================================
// DATABASE TYPE
// ============================================================================

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      clients: {
        Row: Client
        Insert: ClientInsert
        Update: ClientUpdate
      }
      campaigns: {
        Row: Campaign
        Insert: CampaignInsert
        Update: CampaignUpdate
      }
      campaign_members: {
        Row: CampaignMember
        Insert: CampaignMemberInsert
        Update: CampaignMemberUpdate
      }
      audit_logs: {
        Row: AuditLog
        Insert: AuditLogInsert
        Update: never // Audit logs are immutable
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      campaign_status: CampaignStatus
      risk_level: RiskLevel
      user_role: UserRole
      user_status: UserStatus
      approval_status: ApprovalStatus
    }
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
