'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { CampaignService } from '@/../../packages/database/src/services'
import type { 
  Campaign, 
  CampaignStatus, 
  RiskLevel 
} from '@/../../packages/database/src/types'

// Initialize campaign service
const campaignService = new CampaignService(supabase)

// Query keys for React Query
export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters?: CampaignFilters) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  statistics: () => [...campaignKeys.all, 'statistics'] as const,
}

export interface CampaignFilters {
  status?: CampaignStatus
  risk_level?: RiskLevel
  client_id?: string
  limit?: number
  offset?: number
}

/**
 * Hook to fetch list of campaigns with optional filters
 */
export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: campaignKeys.list(filters),
    queryFn: async () => {
      const result = await campaignService.listCampaigns(filters)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data || []
    },
  })
}

/**
 * Hook to fetch a single campaign by ID
 */
export function useCampaign(id: string | null) {
  return useQuery({
    queryKey: campaignKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null
      const result = await campaignService.getCampaign(id)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    enabled: !!id, // Only run query if id exists
  })
}

/**
 * Hook to fetch campaign statistics
 */
export function useCampaignStatistics() {
  return useQuery({
    queryKey: campaignKeys.statistics(),
    queryFn: async () => {
      const result = await campaignService.getStatistics()
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data
    },
  })
}

/**
 * Hook to create a new campaign
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Parameters<typeof campaignService.createCampaign>[0]) => {
      const result = await campaignService.createCampaign(data)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    onSuccess: () => {
      // Invalidate and refetch campaigns list
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.statistics() })
    },
  })
}

/**
 * Hook to update a campaign
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string
      updates: Parameters<typeof campaignService.updateCampaign>[1]
    }) => {
      const result = await campaignService.updateCampaign(id, updates)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate specific campaign and list
      if (data) {
        queryClient.invalidateQueries({ queryKey: campaignKeys.detail(data.id) })
      }
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.statistics() })
    },
  })
}

/**
 * Hook to update campaign status
 */
export function useUpdateCampaignStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string
      status: CampaignStatus
    }) => {
      const result = await campaignService.updateStatus(id, status)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate specific campaign and list
      if (data) {
        queryClient.invalidateQueries({ queryKey: campaignKeys.detail(data.id) })
      }
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.statistics() })
    },
  })
}

/**
 * Hook to delete a campaign (soft delete)
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await campaignService.deleteCampaign(id)
      if (result.error) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    onSuccess: () => {
      // Invalidate campaigns list and statistics
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      queryClient.invalidateQueries({ queryKey: campaignKeys.statistics() })
    },
  })
}
