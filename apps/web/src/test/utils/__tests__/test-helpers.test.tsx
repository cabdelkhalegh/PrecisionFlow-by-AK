import { describe, it, expect } from 'vitest'
import { renderWithProviders, mockData, mockSupabaseResponse, flushPromises } from '../test-helpers'

describe('Test Helpers', () => {
  describe('renderWithProviders', () => {
    it('renders components correctly', () => {
      const { getByText } = renderWithProviders(<div>Test Component</div>)
      expect(getByText('Test Component')).toBeInTheDocument()
    })
  })

  describe('mockData', () => {
    it('provides campaign mock data', () => {
      expect(mockData.campaign).toBeDefined()
      expect(mockData.campaign.id).toBe('campaign-1')
      expect(mockData.campaign.name).toBe('Summer Campaign 2026')
      expect(mockData.campaign.status).toBe('active')
    })

    it('provides client mock data', () => {
      expect(mockData.client).toBeDefined()
      expect(mockData.client.id).toBe('client-1')
      expect(mockData.client.name).toBe('Test Client')
      expect(mockData.client.email).toBe('client@example.com')
    })

    it('provides user mock data', () => {
      expect(mockData.user).toBeDefined()
      expect(mockData.user.id).toBe('user-1')
      expect(mockData.user.email).toBe('test@example.com')
      expect(mockData.user.role).toBe('campaign_manager')
    })
  })

  describe('mockSupabaseResponse', () => {
    it('creates successful response', () => {
      const data = { id: '1', name: 'Test' }
      const response = mockSupabaseResponse.success(data)
      
      expect(response.data).toEqual(data)
      expect(response.error).toBeNull()
    })

    it('creates error response', () => {
      const errorMessage = 'Database connection failed'
      const response = mockSupabaseResponse.error(errorMessage)
      
      expect(response.data).toBeNull()
      expect(response.error).toBeDefined()
      expect(response.error.message).toBe(errorMessage)
    })
  })

  describe('flushPromises', () => {
    it('resolves promises', async () => {
      let resolved = false
      Promise.resolve().then(() => {
        resolved = true
      })
      
      await flushPromises()
      expect(resolved).toBe(true)
    })
  })
})
