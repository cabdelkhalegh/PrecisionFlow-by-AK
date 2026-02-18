/**
 * Complete Database Type Definitions for PrecisionFlow
 * Updated to match application code expectations and migrations 001-013
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'director' | 'campaign_manager' | 'finance' | 'client'
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'director' | 'campaign_manager' | 'finance' | 'client'
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'director' | 'campaign_manager' | 'finance' | 'client'
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          company_name: string | null
          email: string
          phone: string | null
          industry: string | null
          website: string | null
          tier: 'bronze' | 'silver' | 'gold' | 'platinum' | null
          address: Json | null
          account_manager_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          company_name?: string | null
          email?: string
          phone?: string | null
          industry?: string | null
          website?: string | null
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null
          address?: Json | null
          account_manager_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          company_name?: string | null
          email?: string
          phone?: string | null
          industry?: string | null
          website?: string | null
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null
          address?: Json | null
          account_manager_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
        }
      }
      campaigns: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          status: string
          risk_level: string | null
          budget_total: number | null
          budget: number | null
          start_date: string | null
          end_date: string | null
          tags: string[] | null
          campaign_manager_id: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description?: string | null
          status?: string
          risk_level?: string | null
          budget_total?: number | null
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          tags?: string[] | null
          campaign_manager_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          description?: string | null
          status?: string
          risk_level?: string | null
          budget_total?: number | null
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          tags?: string[] | null
          campaign_manager_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
        }
      }
      briefs: {
        Row: {
          id: string
          campaign_id: string
          raw_content: string | null
          raw_file_url: string | null
          structured_data: Json | null
          version: number
          is_latest: boolean
          is_approved: boolean
          approved_by: string | null
          approved_at: string | null
          approval_comments: string | null
          uploaded_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          raw_content?: string | null
          raw_file_url?: string | null
          structured_data?: Json | null
          version?: number
          is_latest?: boolean
          is_approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          approval_comments?: string | null
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          raw_content?: string | null
          raw_file_url?: string | null
          structured_data?: Json | null
          version?: number
          is_latest?: boolean
          is_approved?: boolean
          approved_by?: string | null
          approved_at?: string | null
          approval_comments?: string | null
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
        }
      }
      approvals: {
        Row: {
          id: string
          campaign_id: string
          approval_type: string
          status: string
          approver_id: string
          approver_comments: string | null
          request_notes: string | null
          metadata: Json | null
          approved_at: string | null
          override_status: string | null
          overridden_by: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          approval_type: string
          status?: string
          approver_id: string
          approver_comments?: string | null
          request_notes?: string | null
          metadata?: Json | null
          approved_at?: string | null
          override_status?: string | null
          overridden_by?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          approval_type?: string
          status?: string
          approver_id?: string
          approver_comments?: string | null
          request_notes?: string | null
          metadata?: Json | null
          approved_at?: string | null
          override_status?: string | null
          overridden_by?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      creators: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          bio: string | null
          profile_image_url: string | null
          instagram_handle: string | null
          tiktok_handle: string | null
          youtube_handle: string | null
          twitter_handle: string | null
          facebook_handle: string | null
          instagram_followers: number | null
          tiktok_followers: number | null
          youtube_subscribers: number | null
          twitter_followers: number | null
          avg_engagement_rate: number | null
          avg_views: number | null
          avg_likes: number | null
          avg_comments: number | null
          primary_platform: string | null
          niche: string[] | null
          content_types: string[] | null
          rate_card: Json | null
          preferred_collaboration_types: string[] | null
          country: string | null
          city: string | null
          timezone: string | null
          status: string | null
          verified: boolean | null
          notes: string | null
          tags: string[] | null
          total_campaigns_completed: number | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          bio?: string | null
          profile_image_url?: string | null
          instagram_handle?: string | null
          tiktok_handle?: string | null
          youtube_handle?: string | null
          twitter_handle?: string | null
          facebook_handle?: string | null
          instagram_followers?: number | null
          tiktok_followers?: number | null
          youtube_subscribers?: number | null
          twitter_followers?: number | null
          avg_engagement_rate?: number | null
          avg_views?: number | null
          avg_likes?: number | null
          avg_comments?: number | null
          primary_platform?: string | null
          niche?: string[] | null
          content_types?: string[] | null
          rate_card?: Json | null
          preferred_collaboration_types?: string[] | null
          country?: string | null
          city?: string | null
          timezone?: string | null
          status?: string | null
          verified?: boolean | null
          notes?: string | null
          tags?: string[] | null
          total_campaigns_completed?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          bio?: string | null
          profile_image_url?: string | null
          instagram_handle?: string | null
          tiktok_handle?: string | null
          youtube_handle?: string | null
          twitter_handle?: string | null
          facebook_handle?: string | null
          instagram_followers?: number | null
          tiktok_followers?: number | null
          youtube_subscribers?: number | null
          twitter_followers?: number | null
          avg_engagement_rate?: number | null
          avg_views?: number | null
          avg_likes?: number | null
          avg_comments?: number | null
          primary_platform?: string | null
          niche?: string[] | null
          content_types?: string[] | null
          rate_card?: Json | null
          preferred_collaboration_types?: string[] | null
          country?: string | null
          city?: string | null
          timezone?: string | null
          status?: string | null
          verified?: boolean | null
          notes?: string | null
          tags?: string[] | null
          total_campaigns_completed?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      campaign_shortlists: {
        Row: {
          campaign_id: string
          creator_id: string
          position: number | null
          proposed_rate: number | null
          proposed_deliverables: string[] | null
          internal_notes: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          approved_by: string | null
          approved_at: string | null
          client_feedback: string | null
          rejection_reason: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          campaign_id: string
          creator_id: string
          position?: number | null
          proposed_rate?: number | null
          proposed_deliverables?: string[] | null
          internal_notes?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          client_feedback?: string | null
          rejection_reason?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          campaign_id?: string
          creator_id?: string
          position?: number | null
          proposed_rate?: number | null
          proposed_deliverables?: string[] | null
          internal_notes?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          client_feedback?: string | null
          rejection_reason?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      content_tasks: {
        Row: {
          id: string
          campaign_id: string
          creator_id: string | null
          title: string
          description: string | null
          deliverable_type: string | null
          requirements: Json | null
          quantity: number | null
          duration_seconds: number | null
          status: string
          deadline: string | null
          script_deadline: string | null
          draft_deadline: string | null
          final_deadline: string | null
          script_approved_at: string | null
          script_approved_by: string | null
          draft_approved_at: string | null
          draft_approved_by: string | null
          final_approved_at: string | null
          final_approved_by: string | null
          feedback: string | null
          revision_notes: Json | null
          payment_amount: number | null
          payment_status: string | null
          assigned_by: string | null
          created_by: string | null
          views: number | null
          engagement_rate: number | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          creator_id?: string | null
          title: string
          description?: string | null
          deliverable_type?: string | null
          requirements?: Json | null
          quantity?: number | null
          duration_seconds?: number | null
          status?: string
          deadline?: string | null
          script_deadline?: string | null
          draft_deadline?: string | null
          final_deadline?: string | null
          script_approved_at?: string | null
          script_approved_by?: string | null
          draft_approved_at?: string | null
          draft_approved_by?: string | null
          final_approved_at?: string | null
          final_approved_by?: string | null
          feedback?: string | null
          revision_notes?: Json | null
          payment_amount?: number | null
          payment_status?: string | null
          assigned_by?: string | null
          created_by?: string | null
          views?: number | null
          engagement_rate?: number | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          creator_id?: string | null
          title?: string
          description?: string | null
          deliverable_type?: string | null
          requirements?: Json | null
          quantity?: number | null
          duration_seconds?: number | null
          status?: string
          deadline?: string | null
          script_deadline?: string | null
          draft_deadline?: string | null
          final_deadline?: string | null
          script_approved_at?: string | null
          script_approved_by?: string | null
          draft_approved_at?: string | null
          draft_approved_by?: string | null
          final_approved_at?: string | null
          final_approved_by?: string | null
          feedback?: string | null
          revision_notes?: Json | null
          payment_amount?: number | null
          payment_status?: string | null
          assigned_by?: string | null
          created_by?: string | null
          views?: number | null
          engagement_rate?: number | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      content_artifacts: {
        Row: {
          id: string
          content_task_id: string
          artifact_type: string
          file_url: string | null
          text_content: string | null
          title: string | null
          description: string | null
          file_size: number | null
          mime_type: string | null
          format: string | null
          thumbnail_url: string | null
          metadata: Json | null
          version: number
          is_latest: boolean
          previous_version_id: string | null
          status: string
          reviewed_at: string | null
          reviewed_by: string | null
          review_comments: string | null
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_task_id: string
          artifact_type: string
          file_url?: string | null
          text_content?: string | null
          title?: string | null
          description?: string | null
          file_size?: number | null
          mime_type?: string | null
          format?: string | null
          thumbnail_url?: string | null
          metadata?: Json | null
          version?: number
          is_latest?: boolean
          previous_version_id?: string | null
          status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          review_comments?: string | null
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_task_id?: string
          artifact_type?: string
          file_url?: string | null
          text_content?: string | null
          title?: string | null
          description?: string | null
          file_size?: number | null
          mime_type?: string | null
          format?: string | null
          thumbnail_url?: string | null
          metadata?: Json | null
          version?: number
          is_latest?: boolean
          previous_version_id?: string | null
          status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          review_comments?: string | null
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          campaign_id: string
          original_amount: number
          current_amount: number
          currency: string
          breakdown: Json | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          original_amount: number
          current_amount: number
          currency?: string
          breakdown?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          original_amount?: number
          current_amount?: number
          currency?: string
          breakdown?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          campaign_id: string
          category: string
          amount: number
          currency: string
          description: string | null
          receipt_url: string | null
          approval_status: string
          payment_status: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          campaign_id: string
          category: string
          amount: number
          currency?: string
          description?: string | null
          receipt_url?: string | null
          approval_status?: string
          payment_status?: string
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          campaign_id?: string
          category?: string
          amount?: number
          currency?: string
          description?: string | null
          receipt_url?: string | null
          approval_status?: string
          payment_status?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      invoices: {
        Row: {
          id: string
          campaign_id: string
          creator_id: string | null
          invoice_number: string
          amount: number
          currency: string
          status: string
          due_date: string | null
          paid_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          creator_id?: string | null
          invoice_number: string
          amount: number
          currency?: string
          status?: string
          due_date?: string | null
          paid_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          creator_id?: string | null
          invoice_number?: string
          amount?: number
          currency?: string
          status?: string
          due_date?: string | null
          paid_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          currency: string
          payment_method: string | null
          transaction_reference: string | null
          payment_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          currency?: string
          payment_method?: string | null
          transaction_reference?: string | null
          payment_date?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          currency?: string
          payment_method?: string | null
          transaction_reference?: string | null
          payment_date?: string
          notes?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: string
          old_data: Json | null
          new_data: Json | null
          user_id: string | null
          timestamp: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: string
          old_data?: Json | null
          new_data?: Json | null
          user_id?: string | null
          timestamp?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: string
          old_data?: Json | null
          new_data?: Json | null
          user_id?: string | null
          timestamp?: string | null
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
