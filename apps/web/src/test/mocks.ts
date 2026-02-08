import { vi } from 'vitest';

/**
 * Mock tRPC client for testing
 * Provides mock implementations of all tRPC procedures
 */
export const createMockTRPCClient = () => ({
  campaigns: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  clients: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  briefs: {
    list: vi.fn(),
    getLatest: vi.fn(),
    getById: vi.fn(),
    upload: vi.fn(),
    processWithAI: vi.fn(),
    updateStructuredData: vi.fn(),
    approve: vi.fn(),
  },
  approvals: {
    list: vi.fn(),
    request: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    override: vi.fn(),
  },
});

/**
 * Mock successful campaign list response
 */
export const mockCampaignListResponse = {
  campaigns: [
    {
      id: 'campaign-1',
      name: 'Test Campaign 1',
      status: 'draft',
      client_id: 'client-1',
      risk_level: 'medium',
      budget: 10000,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      campaign_manager_id: 'user-1',
    },
    {
      id: 'campaign-2',
      name: 'Test Campaign 2',
      status: 'active',
      client_id: 'client-1',
      risk_level: 'low',
      budget: 20000,
      start_date: '2024-02-01',
      end_date: '2024-12-31',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      campaign_manager_id: 'user-1',
    },
  ],
  total: 2,
  page: 1,
  limit: 10,
};

/**
 * Mock successful client list response
 */
export const mockClientListResponse = {
  clients: [
    {
      id: 'client-1',
      name: 'Test Client 1',
      company: 'Test Company 1',
      tier: 'gold',
      email: 'client1@test.com',
      phone: '123-456-7890',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      account_manager_id: 'user-1',
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
};

/**
 * Mock tRPC error
 */
export const mockTRPCError = (code: string, message: string) => ({
  message,
  code,
  data: {
    code,
    httpStatus: code === 'NOT_FOUND' ? 404 : 500,
  },
});
