/**
 * Complete Database Type Definitions for PrecisionFlow
 * Auto-generated types for Supabase database schema
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
          tier: 'bronze' | 'silver' | 'gold' | 'platinum'
          contact_email: string | null
          contact_phone: string | null
          account_manager_id: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
          contact_email?: string | null
          contact_phone?: string | null
          account_manager_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum'
          contact_email?: string | null
          contact_phone?: string | null
          account_manager_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'cancelled'
          budget: number | null
          start_date: string | null
          end_date: string | null
          risk_level: 'low' | 'medium' | 'high' | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description?: string | null
          status?: 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'cancelled'
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          risk_level?: 'low' | 'medium' | 'high' | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          description?: string | null
          status?: 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'cancelled'
          budget?: number | null
          start_date?: string | null
          end_date?: string | null
          risk_level?: 'low' | 'medium' | 'high' | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string
        }
      }
      briefs: {
        Row: {
          id: string
          campaign_id: string
          raw_content: string
          structured_data: Json | null
          ai_extracted: boolean
          extraction_status: 'pending' | 'processing' | 'completed' | 'failed' | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          campaign_id: string
          raw_content: string
          structured_data?: Json | null
          ai_extracted?: boolean
          extraction_status?: 'pending' | 'processing' | 'completed' | 'failed' | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          campaign_id?: string
          raw_content?: string
          structured_data?: Json | null
          ai_extracted?: boolean
          extraction_status?: 'pending' | 'processing' | 'completed' | 'failed' | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      approvals: {
        Row: {
          id: string
          campaign_id: string
          type: 'campaign' | 'brief' | 'budget' | 'content' | 'expense'
          status: 'pending' | 'approved' | 'rejected' | 'override'
          requested_by: string
          approved_by: string | null
          comment: string | null
          requested_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          type: 'campaign' | 'brief' | 'budget' | 'content' | 'expense'
          status?: 'pending' | 'approved' | 'rejected' | 'override'
          requested_by: string
          approved_by?: string | null
          comment?: string | null
          requested_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          type?: 'campaign' | 'brief' | 'budget' | 'content' | 'expense'
          status?: 'pending' | 'approved' | 'rejected' | 'override'
          requested_by?: string
          approved_by?: string | null
          comment?: string | null
          requested_at?: string
          responded_at?: string | null
        }
      }
      creators: {
        Row: {
          id: string
          name: string
          email: string | null
          bio: string | null
          instagram_handle: string | null
          tiktok_handle: string | null
          youtube_handle: string | null
          twitter_handle: string | null
          avg_engagement_rate: number | null
          primary_platform: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          bio?: string | null
          instagram_handle?: string | null
          tiktok_handle?: string | null
          youtube_handle?: string | null
          twitter_handle?: string | null
          avg_engagement_rate?: number | null
          primary_platform?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          bio?: string | null
          instagram_handle?: string | null
          tiktok_handle?: string | null
          youtube_handle?: string | null
          twitter_handle?: string | null
          avg_engagement_rate?: number | null
          primary_platform?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      campaign_shortlists: {
        Row: {
          id: string
          campaign_id: string
          creator_id: string
          position: number
          proposed_rate: number | null
          status: 'draft' | 'submitted' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          creator_id: string
          position?: number
          proposed_rate?: number | null
          status?: 'draft' | 'submitted' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          creator_id?: string
          position?: number
          proposed_rate?: number | null
          status?: 'draft' | 'submitted' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
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
          status: string
          script_deadline: string | null
          draft_deadline: string | null
          final_deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          creator_id?: string | null
          title: string
          description?: string | null
          deliverable_type?: string | null
          status?: string
          script_deadline?: string | null
          draft_deadline?: string | null
          final_deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          creator_id?: string | null
          title?: string
          description?: string | null
          deliverable_type?: string | null
          status?: string
          script_deadline?: string | null
          draft_deadline?: string | null
          final_deadline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_artifacts: {
        Row: {
          id: string
          content_task_id: string
          artifact_type: 'script' | 'draft' | 'final' | 'thumbnail' | 'caption' | 'other'
          file_url: string | null
          text_content: string | null
          version: number
          is_latest: boolean
          approval_status: 'pending' | 'approved' | 'changes_requested' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_task_id: string
          artifact_type: 'script' | 'draft' | 'final' | 'thumbnail' | 'caption' | 'other'
          file_url?: string | null
          text_content?: string | null
          version?: number
          is_latest?: boolean
          approval_status?: 'pending' | 'approved' | 'changes_requested' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_task_id?: string
          artifact_type?: 'script' | 'draft' | 'final' | 'thumbnail' | 'caption' | 'other'
          file_url?: string | null
          text_content?: string | null
          version?: number
          is_latest?: boolean
          approval_status?: 'pending' | 'approved' | 'changes_requested' | 'rejected'
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
          approval_status: 'pending' | 'approved' | 'rejected'
          payment_status: 'pending' | 'paid' | 'cancelled'
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
          approval_status?: 'pending' | 'approved' | 'rejected'
          payment_status?: 'pending' | 'paid' | 'cancelled'
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
          approval_status?: 'pending' | 'approved' | 'rejected'
          payment_status?: 'pending' | 'paid' | 'cancelled'
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
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
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
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
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
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
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
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data: Json | null
          new_data: Json | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          user_id?: string | null
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
