import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { 
  useCampaigns, 
  useCampaign, 
  useCampaignStatistics,
  useCreateCampaign,
  useUpdateCampaign,
  useUpdateCampaignStatus,
  useDeleteCampaign,
} from '../useCampaigns'
import { createWrapper, createTestQueryClient } from '@/test/utils/test-helpers'
import type { Campaign, CampaignStatistics } from '@/../../packages/database/src/types'

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {},
}))

// Mock the CampaignService
const mockCampaignService = {
  listCampaigns: vi.fn(),
  getCampaign: vi.fn(),
  getStatistics: vi.fn(),
  createCampaign: vi.fn(),
  updateCampaign: vi.fn(),
  updateStatus: vi.fn(),
  deleteCampaign: vi.fn(),
}

vi.mock('@/../../packages/database/src/services', () => ({
  CampaignService: vi.fn(() => mockCampaignService),
}))

describe('useCampaigns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockCampaign: Campaign = {
    id: 'campaign-1',
    name: 'Test Campaign',
    description: 'Test Description',
    status: 'draft',
    risk_level: 'low',
    client_id: 'client-1',
    created_by: 'user-1',
    budget: 50000,
    actual_spend: 10000,
    start_date: '2026-06-01',
    end_date: '2026-08-31',
    objectives: null,
    target_audience: null,
    deliverables: null,
    kpis: null,
    risk_flags: null,
    missing_info: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    deleted_at: null,
  }

  describe('useCampaigns hook', () => {
    it('should fetch campaigns successfully', async () => {
      mockCampaignService.listCampaigns.mockResolvedValue({
        data: [mockCampaign],
        error: null,
      })

      const { result } = renderHook(() => useCampaigns(), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      
      expect(result.current.data).toEqual([mockCampaign])
      expect(mockCampaignService.listCampaigns).toHaveBeenCalledWith(undefined)
    })

    it('should fetch campaigns with status filter', async () => {
      mockCampaignService.listCampaigns.mockResolvedValue({
        data: [mockCampaign],
        error: null,
      })

      const { result } = renderHook(
        () => useCampaigns({ status: 'draft' }),
        { wrapper: createWrapper(createTestQueryClient()) }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      
      expect(mockCampaignService.listCampaigns).toHaveBeenCalledWith({ status: 'draft' })
    })

    it('should fetch campaigns with risk level filter', async () => {
      mockCampaignService.listCampaigns.mockResolvedValue({
        data: [mockCampaign],
        error: null,
      })

      const { result } = renderHook(
        () => useCampaigns({ risk_level: 'high' }),
        { wrapper: createWrapper(createTestQueryClient()) }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      
      expect(mockCampaignService.listCampaigns).toHaveBeenCalledWith({ risk_level: 'high' })
    })

    it('should handle error when fetching campaigns', async () => {
      mockCampaignService.listCampaigns.mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch campaigns' },
      })

      const { result } = renderHook(() => useCampaigns(), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
      
      expect(result.current.error).toBeTruthy()
    })

    it('should show loading state initially', () => {
      mockCampaignService.listCampaigns.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => useCampaigns(), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })
  })

  describe('useCampaign hook', () => {
    it('should fetch single campaign successfully', async () => {
      mockCampaignService.getCampaign.mockResolvedValue({
        data: mockCampaign,
        error: null,
      })

      const { result } = renderHook(() => useCampaign('campaign-1'), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      
      expect(result.current.data).toEqual(mockCampaign)
      expect(mockCampaignService.getCampaign).toHaveBeenCalledWith('campaign-1')
    })

    it('should return null for null id', async () => {
      const { result } = renderHook(() => useCampaign(null), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      
      expect(result.current.data).toBeNull()
      expect(mockCampaignService.getCampaign).not.toHaveBeenCalled()
    })

    it('should handle error when fetching campaign', async () => {
      mockCampaignService.getCampaign.mockResolvedValue({
        data: null,
        error: { message: 'Campaign not found' },
      })

      const { result } = renderHook(() => useCampaign('campaign-1'), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
      
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('useCampaignStatistics hook', () => {
    const mockStatistics: CampaignStatistics = {
      total: 10,
      by_status: {
        draft: 3,
        planning: 2,
        active: 5,
      },
      by_risk: {
        low: 6,
        medium: 3,
        high: 1,
        critical: 0,
      },
    }

    it('should fetch campaign statistics successfully', async () => {
      mockCampaignService.getStatistics.mockResolvedValue({
        data: mockStatistics,
        error: null,
      })

      const { result } = renderHook(() => useCampaignStatistics(), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      
      expect(result.current.data).toEqual(mockStatistics)
      expect(mockCampaignService.getStatistics).toHaveBeenCalled()
    })

    it('should handle error when fetching statistics', async () => {
      mockCampaignService.getStatistics.mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch statistics' },
      })

      const { result } = renderHook(() => useCampaignStatistics(), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
      
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('useCreateCampaign hook', () => {
    it('should create campaign successfully', async () => {
      mockCampaignService.createCampaign.mockResolvedValue({
        data: mockCampaign,
        error: null,
      })

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useCreateCampaign(), {
        wrapper: createWrapper(queryClient),
      })

      const newCampaign = {
        name: 'Test Campaign',
        client_id: 'client-1',
        created_by: 'user-1',
      }

      result.current.mutate(newCampaign)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      
      expect(result.current.data).toEqual(mockCampaign)
      expect(mockCampaignService.createCampaign).toHaveBeenCalledWith(newCampaign)
    })

    it('should handle error when creating campaign', async () => {
      mockCampaignService.createCampaign.mockResolvedValue({
        data: null,
        error: { message: 'Failed to create campaign' },
      })

      const { result } = renderHook(() => useCreateCampaign(), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      result.current.mutate({ name: 'Test', client_id: 'client-1', created_by: 'user-1' })

      await waitFor(() => expect(result.current.isError).toBe(true))
      
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('useUpdateCampaign hook', () => {
    it('should update campaign successfully', async () => {
      const updatedCampaign = { ...mockCampaign, name: 'Updated Campaign' }
      mockCampaignService.updateCampaign.mockResolvedValue({
        data: updatedCampaign,
        error: null,
      })

      const { result } = renderHook(() => useUpdateCampaign(), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      result.current.mutate({ id: 'campaign-1', updates: { name: 'Updated Campaign' } })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      
      expect(result.current.data).toEqual(updatedCampaign)
      expect(mockCampaignService.updateCampaign).toHaveBeenCalledWith(
        'campaign-1',
        { name: 'Updated Campaign' }
      )
    })

    it('should handle error when updating campaign', async () => {
      mockCampaignService.updateCampaign.mockResolvedValue({
        data: null,
        error: { message: 'Failed to update campaign' },
      })

      const { result } = renderHook(() => useUpdateCampaign(), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      result.current.mutate({ id: 'campaign-1', updates: { name: 'Updated' } })

      await waitFor(() => expect(result.current.isError).toBe(true))
      
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('useUpdateCampaignStatus hook', () => {
    it('should update campaign status successfully', async () => {
      const updatedCampaign = { ...mockCampaign, status: 'planning' as const }
      mockCampaignService.updateStatus.mockResolvedValue({
        data: updatedCampaign,
        error: null,
      })

      const { result } = renderHook(() => useUpdateCampaignStatus(), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      result.current.mutate({ id: 'campaign-1', status: 'planning' })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      
      expect(result.current.data).toEqual(updatedCampaign)
      expect(mockCampaignService.updateStatus).toHaveBeenCalledWith('campaign-1', 'planning')
    })

    it('should handle error when updating status', async () => {
      mockCampaignService.updateStatus.mockResolvedValue({
        data: null,
        error: { message: 'Invalid status transition' },
      })

      const { result } = renderHook(() => useUpdateCampaignStatus(), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      result.current.mutate({ id: 'campaign-1', status: 'planning' })

      await waitFor(() => expect(result.current.isError).toBe(true))
      
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('useDeleteCampaign hook', () => {
    it('should delete campaign successfully', async () => {
      mockCampaignService.deleteCampaign.mockResolvedValue({
        data: true,
        error: null,
      })

      const { result } = renderHook(() => useDeleteCampaign(), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      result.current.mutate('campaign-1')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      
      expect(result.current.data).toBe(true)
      expect(mockCampaignService.deleteCampaign).toHaveBeenCalledWith('campaign-1')
    })

    it('should handle error when deleting campaign', async () => {
      mockCampaignService.deleteCampaign.mockResolvedValue({
        data: null,
        error: { message: 'Failed to delete campaign' },
      })

      const { result } = renderHook(() => useDeleteCampaign(), {
        wrapper: createWrapper(createTestQueryClient()),
      })

      result.current.mutate('campaign-1')

      await waitFor(() => expect(result.current.isError).toBe(true))
      
      expect(result.current.error).toBeTruthy()
    })
  })
})
