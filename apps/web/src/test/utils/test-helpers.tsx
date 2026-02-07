import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * Custom render function that wraps components with common providers
 * Useful for testing components that need context providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

/**
 * Mock data factory for testing
 */
export const mockData = {
  campaign: {
    id: 'campaign-1',
    name: 'Summer Campaign 2026',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  client: {
    id: 'client-1',
    name: 'Test Client',
    email: 'client@example.com',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  user: {
    id: 'user-1',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'campaign_manager',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
}

/**
 * Wait for element to appear in tests
 */
export const waitFor = async (callback: () => void, timeout = 1000) => {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    try {
      callback()
      return
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  callback() // Final attempt that will throw if it fails
}

/**
 * Test helper for async operations
 */
export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

/**
 * Mock Supabase responses
 */
export const mockSupabaseResponse = {
  success: <T,>(data: T) => ({
    data,
    error: null,
  }),
  error: (message: string) => ({
    data: null,
    error: { message },
  }),
}
