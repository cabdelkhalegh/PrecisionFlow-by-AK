/**
 * Campaign Service
 * 
 * Provides type-safe CRUD operations for campaigns with validation,
 * state management, and error handling.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { Database, Campaign, CampaignInsert, CampaignUpdate, CampaignStatus, RiskLevel } from '../types'

export class CampaignService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Create a new campaign
   */
  async createCampaign(data: CampaignInsert): Promise<{ data: Campaign | null; error: Error | null }> {
    try {
      // Validate required fields
      if (!data.name || data.name.trim().length === 0) {
        return { data: null, error: new Error('Campaign name is required') }
      }
      
      if (!data.client_id) {
        return { data: null, error: new Error('Client ID is required') }
      }

      if (!data.created_by) {
        return { data: null, error: new Error('Created by user ID is required') }
      }

      // Set defaults
      const campaignData: CampaignInsert = {
        ...data,
        status: data.status || 'draft',
        risk_level: data.risk_level || 'low',
      }

      const { data: campaign, error } = await this.supabase
        .from('campaigns')
        .insert(campaignData)
        .select()
        .single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data: campaign, error: null }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to create campaign') 
      }
    }
  }

  /**
   * Get a single campaign by ID
   */
  async getCampaign(id: string): Promise<{ data: Campaign | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to get campaign') 
      }
    }
  }

  /**
   * List campaigns with optional filters
   */
  async listCampaigns(filters?: {
    status?: CampaignStatus
    risk_level?: RiskLevel
    client_id?: string
    limit?: number
    offset?: number
  }): Promise<{ data: Campaign[] | null; error: Error | null }> {
    try {
      let query = this.supabase
        .from('campaigns')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.risk_level) {
        query = query.eq('risk_level', filters.risk_level)
      }

      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to list campaigns') 
      }
    }
  }

  /**
   * Update a campaign
   */
  async updateCampaign(
    id: string, 
    updates: CampaignUpdate
  ): Promise<{ data: Campaign | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data, error: null }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to update campaign') 
      }
    }
  }

  /**
   * Soft delete a campaign
   */
  async deleteCampaign(id: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('campaigns')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .is('deleted_at', null)

      if (error) {
        return { data: false, error: new Error(error.message) }
      }

      return { data: true, error: null }
    } catch (error) {
      return { 
        data: false, 
        error: error instanceof Error ? error : new Error('Failed to delete campaign') 
      }
    }
  }

  /**
   * Update campaign status with validation
   */
  async updateStatus(
    id: string, 
    newStatus: CampaignStatus
  ): Promise<{ data: Campaign | null; error: Error | null }> {
    try {
      // Get current campaign
      const { data: campaign, error: getError } = await this.getCampaign(id)
      if (getError || !campaign) {
        return { data: null, error: getError || new Error('Campaign not found') }
      }

      // Validate state transition (simplified - can be enhanced with full state machine)
      const validTransitions = this.getValidTransitions(campaign.status)
      if (!validTransitions.includes(newStatus)) {
        return { 
          data: null, 
          error: new Error(`Invalid status transition from ${campaign.status} to ${newStatus}`) 
        }
      }

      // Update status
      return await this.updateCampaign(id, { status: newStatus })
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to update status') 
      }
    }
  }

  /**
   * Get valid next states for a campaign status (simplified state machine)
   */
  private getValidTransitions(currentStatus: CampaignStatus): CampaignStatus[] {
    const transitions: Record<CampaignStatus, CampaignStatus[]> = {
      draft: ['planning', 'closed'],
      planning: ['brief_review', 'draft', 'closed'],
      brief_review: ['strategy_approval', 'planning', 'closed'],
      strategy_approval: ['creator_selection', 'brief_review', 'closed'],
      creator_selection: ['content_production', 'strategy_approval', 'closed'],
      content_production: ['content_approval', 'creator_selection', 'closed'],
      content_approval: ['publishing', 'content_production', 'closed'],
      publishing: ['monitoring', 'content_approval', 'closed'],
      monitoring: ['reporting', 'publishing', 'closed'],
      reporting: ['closed', 'monitoring'],
      closed: [], // Terminal state
    }

    return transitions[currentStatus] || []
  }

  /**
   * Calculate risk level based on campaign data (simplified)
   */
  calculateRiskLevel(campaign: Partial<Campaign>): RiskLevel {
    let riskScore = 0

    // Missing key information
    if (!campaign.description) riskScore += 1
    if (!campaign.objectives) riskScore += 1
    if (!campaign.target_audience) riskScore += 1
    if (!campaign.deliverables) riskScore += 1
    if (!campaign.budget_amount) riskScore += 1

    // Timeline risks
    if (campaign.start_date && campaign.end_date) {
      const start = new Date(campaign.start_date)
      const end = new Date(campaign.end_date)
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      if (duration < 7) riskScore += 2 // Very tight timeline
      if (duration < 14) riskScore += 1 // Tight timeline
    }

    // Budget risks
    if (campaign.budget_amount && campaign.actual_spend) {
      const spendPercentage = (campaign.actual_spend / campaign.budget_amount) * 100
      if (spendPercentage > 90) riskScore += 2
      if (spendPercentage > 75) riskScore += 1
    }

    // Determine risk level
    if (riskScore >= 5) return 'critical'
    if (riskScore >= 3) return 'high'
    if (riskScore >= 1) return 'medium'
    return 'low'
  }

  /**
   * Get campaign statistics
   */
  async getStatistics(): Promise<{
    data: {
      total: number
      by_status: Record<CampaignStatus, number>
      by_risk: Record<RiskLevel, number>
    } | null
    error: Error | null
  }> {
    try {
      const { data: campaigns, error } = await this.listCampaigns()
      
      if (error || !campaigns) {
        return { data: null, error: error || new Error('Failed to get campaigns') }
      }

      const stats = {
        total: campaigns.length,
        by_status: {} as Record<CampaignStatus, number>,
        by_risk: {} as Record<RiskLevel, number>,
      }

      // Initialize counters
      const statuses: CampaignStatus[] = [
        'draft', 'planning', 'brief_review', 'strategy_approval',
        'creator_selection', 'content_production', 'content_approval',
        'publishing', 'monitoring', 'reporting', 'closed'
      ]
      const risks: RiskLevel[] = ['low', 'medium', 'high', 'critical']

      statuses.forEach(status => stats.by_status[status] = 0)
      risks.forEach(risk => stats.by_risk[risk] = 0)

      // Count campaigns
      campaigns.forEach(campaign => {
        stats.by_status[campaign.status] = (stats.by_status[campaign.status] || 0) + 1
        stats.by_risk[campaign.risk_level] = (stats.by_risk[campaign.risk_level] || 0) + 1
      })

      return { data: stats, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to calculate statistics')
      }
    }
  }
}
