import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Create a new QueryClient for each test to avoid cache pollution
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * Wrapper component with all necessary providers for testing
 */
export function createWrapper(queryClient?: QueryClient) {
  const client = queryClient || createTestQueryClient()
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    )
  }
}

/**
 * Custom render function that wraps components with common providers
 * Useful for testing components that need context providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
) {
  const { queryClient, ...renderOptions } = options || {}
  return render(ui, { 
    wrapper: createWrapper(queryClient),
    ...renderOptions 
  })
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
