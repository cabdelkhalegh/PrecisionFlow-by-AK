import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  trpcMocks?: Record<string, any>;
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { trpcMocks, ...renderOptions } = options || {};
  
  // Set up tRPC mock data
  (globalThis as any).__trpcMockData = trpcMocks || {};

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Wait for a specified amount of time
 */
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create mock campaign data
 */
export function createMockCampaign(overrides?: any) {
  return {
    id: 'campaign-1',
    name: 'Test Campaign',
    status: 'draft',
    client_id: 'client-1',
    risk_level: 'medium',
    budget: 10000,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    campaign_manager_id: 'user-1',
    ...overrides,
  };
}

/**
 * Create mock client data
 */
export function createMockClient(overrides?: any) {
  return {
    id: 'client-1',
    name: 'Test Client',
    company: 'Test Company',
    tier: 'gold',
    email: 'client@test.com',
    phone: '123-456-7890',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    account_manager_id: 'user-1',
    ...overrides,
  };
}

/**
 * Create mock user data
 */
export function createMockUser(overrides?: any) {
  return {
    id: 'user-1',
    email: 'user@test.com',
    role: 'campaign_manager',
    ...overrides,
  };
}

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
