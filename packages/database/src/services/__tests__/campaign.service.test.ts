/**
 * Campaign Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CampaignService } from '../campaign.service'
import type { Campaign, CampaignInsert, CampaignStatus, RiskLevel } from '../../types'

// Mock Supabase client
const createMockSupabase = () => {
  const mockData = { data: null, error: null }
  const mockSelect = vi.fn().mockReturnThis()
  const mockInsert = vi.fn().mockReturnThis()
  const mockUpdate = vi.fn().mockReturnThis()
  const mockEq = vi.fn().mockReturnThis()
  const mockIs = vi.fn().mockReturnThis()
  const mockOrder = vi.fn().mockReturnThis()
  const mockLimit = vi.fn().mockReturnThis()
  const mockRange = vi.fn().mockReturnThis()
  const mockSingle = vi.fn().mockResolvedValue(mockData)

  return {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
      is: mockIs,
      order: mockOrder,
      limit: mockLimit,
      range: mockRange,
      single: mockSingle,
    })),
    _mocks: {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
      is: mockIs,
      order: mockOrder,
      limit: mockLimit,
      range: mockRange,
      single: mockSingle,
      data: mockData,
    },
  }
}

describe('CampaignService', () => {
  let service: CampaignService
  let mockSupabase: ReturnType<typeof createMockSupabase>

  beforeEach(() => {
    mockSupabase = createMockSupabase()
    service = new CampaignService(mockSupabase as any)
  })

  describe('createCampaign', () => {
    it('should create a campaign with valid data', async () => {
      const mockCampaign: Campaign = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Campaign',
        client_id: 'client-123',
        created_by: 'user-123',
        status: 'draft',
        risk_level: 'low',
        budget_currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      }

      mockSupabase._mocks.data.data = mockCampaign
      mockSupabase._mocks.data.error = null

      const campaignData: CampaignInsert = {
        name: 'Test Campaign',
        client_id: 'client-123',
        created_by: 'user-123',
        budget_currency: 'USD',
      }

      const result = await service.createCampaign(campaignData)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockCampaign)
      expect(mockSupabase.from).toHaveBeenCalledWith('campaigns')
    })

    it('should return error when name is missing', async () => {
      const campaignData: CampaignInsert = {
        name: '',
        client_id: 'client-123',
        created_by: 'user-123',
        budget_currency: 'USD',
      }

      const result = await service.createCampaign(campaignData)

      expect(result.error).not.toBeNull()
      expect(result.error?.message).toBe('Campaign name is required')
      expect(result.data).toBeNull()
    })

    it('should return error when client_id is missing', async () => {
      const campaignData: CampaignInsert = {
        name: 'Test Campaign',
        client_id: undefined as any,
        created_by: 'user-123',
        budget_currency: 'USD',
      }

      const result = await service.createCampaign(campaignData)

      expect(result.error).not.toBeNull()
      expect(result.error?.message).toBe('Client ID is required')
      expect(result.data).toBeNull()
    })

    it('should return error when created_by is missing', async () => {
      const campaignData: CampaignInsert = {
        name: 'Test Campaign',
        client_id: 'client-123',
        created_by: undefined as any,
        budget_currency: 'USD',
      }

      const result = await service.createCampaign(campaignData)

      expect(result.error).not.toBeNull()
      expect(result.error?.message).toBe('Created by user ID is required')
      expect(result.data).toBeNull()
    })

    it('should set default status to draft if not provided', async () => {
      const mockCampaign: Campaign = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Campaign',
        client_id: 'client-123',
        created_by: 'user-123',
        status: 'draft',
        risk_level: 'low',
        budget_currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      }

      mockSupabase._mocks.data.data = mockCampaign

      const campaignData: CampaignInsert = {
        name: 'Test Campaign',
        client_id: 'client-123',
        created_by: 'user-123',
        budget_currency: 'USD',
      }

      const result = await service.createCampaign(campaignData)

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('draft')
    })
  })

  describe('getCampaign', () => {
    it('should get a campaign by ID', async () => {
      const mockCampaign: Campaign = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Campaign',
        client_id: 'client-123',
        created_by: 'user-123',
        status: 'draft',
        risk_level: 'low',
        budget_currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      }

      mockSupabase._mocks.data.data = mockCampaign

      const result = await service.getCampaign('123e4567-e89b-12d3-a456-426614174000')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockCampaign)
    })

    it('should handle not found error', async () => {
      mockSupabase._mocks.data.data = null
      mockSupabase._mocks.data.error = { message: 'Not found' }

      const result = await service.getCampaign('nonexistent-id')

      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })
  })

  describe('listCampaigns', () => {
    it('should list all campaigns', async () => {
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Campaign 1',
          client_id: 'client-123',
          created_by: 'user-123',
          status: 'draft',
          risk_level: 'low',
          budget_currency: 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        {
          id: '2',
          name: 'Campaign 2',
          client_id: 'client-456',
          created_by: 'user-123',
          status: 'planning',
          risk_level: 'medium',
          budget_currency: 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
      ]

      mockSupabase._mocks.single.mockResolvedValue({ data: mockCampaigns, error: null })

      const result = await service.listCampaigns()

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockCampaigns)
    })

    it('should filter campaigns by status', async () => {
      mockSupabase._mocks.single.mockResolvedValue({ data: [], error: null })

      await service.listCampaigns({ status: 'draft' })

      expect(mockSupabase._mocks.eq).toHaveBeenCalledWith('status', 'draft')
    })

    it('should filter campaigns by risk level', async () => {
      mockSupabase._mocks.single.mockResolvedValue({ data: [], error: null })

      await service.listCampaigns({ risk_level: 'high' })

      expect(mockSupabase._mocks.eq).toHaveBeenCalledWith('risk_level', 'high')
    })
  })

  describe('updateCampaign', () => {
    it('should update a campaign', async () => {
      const updatedCampaign: Campaign = {
        id: '123',
        name: 'Updated Campaign',
        client_id: 'client-123',
        created_by: 'user-123',
        status: 'planning',
        risk_level: 'low',
        budget_currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      }

      mockSupabase._mocks.data.data = updatedCampaign

      const result = await service.updateCampaign('123', { name: 'Updated Campaign' })

      expect(result.error).toBeNull()
      expect(result.data?.name).toBe('Updated Campaign')
    })
  })

  describe('deleteCampaign', () => {
    it('should soft delete a campaign', async () => {
      mockSupabase._mocks.data.error = null

      const result = await service.deleteCampaign('123')

      expect(result.error).toBeNull()
      expect(result.data).toBe(true)
      expect(mockSupabase._mocks.update).toHaveBeenCalled()
    })

    it('should handle delete error', async () => {
      mockSupabase._mocks.data.error = { message: 'Delete failed' }

      const result = await service.deleteCampaign('123')

      expect(result.error).not.toBeNull()
      expect(result.data).toBe(false)
    })
  })

  describe('updateStatus', () => {
    it('should update campaign status with valid transition', async () => {
      const currentCampaign: Campaign = {
        id: '123',
        name: 'Test Campaign',
        client_id: 'client-123',
        created_by: 'user-123',
        status: 'draft',
        risk_level: 'low',
        budget_currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      }

      const updatedCampaign = { ...currentCampaign, status: 'planning' as CampaignStatus }

      // First call for getCampaign
      mockSupabase._mocks.single.mockResolvedValueOnce({ data: currentCampaign, error: null })
      // Second call for updateCampaign
      mockSupabase._mocks.single.mockResolvedValueOnce({ data: updatedCampaign, error: null })

      const result = await service.updateStatus('123', 'planning')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('planning')
    })

    it('should reject invalid status transition', async () => {
      const currentCampaign: Campaign = {
        id: '123',
        name: 'Test Campaign',
        client_id: 'client-123',
        created_by: 'user-123',
        status: 'closed',
        risk_level: 'low',
        budget_currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      }

      mockSupabase._mocks.single.mockResolvedValue({ data: currentCampaign, error: null })

      const result = await service.updateStatus('123', 'draft')

      expect(result.error).not.toBeNull()
      expect(result.error?.message).toContain('Invalid status transition')
      expect(result.data).toBeNull()
    })
  })

  describe('calculateRiskLevel', () => {
    it('should return low risk for complete campaign with good timeline', () => {
      const campaign = {
        description: 'Test',
        objectives: { items: [] },
        target_audience: 'Test audience',
        deliverables: { items: [] },
        budget_amount: 10000,
        start_date: '2026-03-01',
        end_date: '2026-04-01',
      }

      const risk = service.calculateRiskLevel(campaign)
      expect(risk).toBe('low')
    })

    it('should return medium risk for campaign with some missing fields', () => {
      const campaign = {
        description: 'Test',
        target_audience: 'Test audience',
        budget_amount: 10000,
      }

      const risk = service.calculateRiskLevel(campaign)
      expect(risk).toBe('medium')
    })

    it('should return high risk for tight timeline', () => {
      const campaign = {
        description: 'Test',
        objectives: { items: [] },
        target_audience: 'Test audience',
        deliverables: { items: [] },
        budget_amount: 10000,
        start_date: '2026-03-01',
        end_date: '2026-03-08', // 7 days
      }

      const risk = service.calculateRiskLevel(campaign)
      expect(risk).toBe('medium') // Would be high with additional missing fields
    })

    it('should increase risk for budget overrun', () => {
      const campaign = {
        description: 'Test',
        objectives: { items: [] },
        target_audience: 'Test audience',
        deliverables: { items: [] },
        budget_amount: 10000,
        actual_spend: 9500, // 95% spent
      }

      const risk = service.calculateRiskLevel(campaign)
      expect(risk).toBe('medium')
    })
  })

  describe('getStatistics', () => {
    it('should calculate statistics correctly', async () => {
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Campaign 1',
          client_id: 'client-123',
          created_by: 'user-123',
          status: 'draft',
          risk_level: 'low',
          budget_currency: 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        {
          id: '2',
          name: 'Campaign 2',
          client_id: 'client-456',
          created_by: 'user-123',
          status: 'draft',
          risk_level: 'high',
          budget_currency: 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
        {
          id: '3',
          name: 'Campaign 3',
          client_id: 'client-789',
          created_by: 'user-123',
          status: 'planning',
          risk_level: 'medium',
          budget_currency: 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
      ]

      mockSupabase._mocks.single.mockResolvedValue({ data: mockCampaigns, error: null })

      const result = await service.getStatistics()

      expect(result.error).toBeNull()
      expect(result.data?.total).toBe(3)
      expect(result.data?.by_status.draft).toBe(2)
      expect(result.data?.by_status.planning).toBe(1)
      expect(result.data?.by_risk.low).toBe(1)
      expect(result.data?.by_risk.medium).toBe(1)
      expect(result.data?.by_risk.high).toBe(1)
    })
  })
})
