/**
 * Test helper functions and mocks
 */

import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@tikit/database';

/**
 * Create a mock Supabase client for testing
 */
export function createMockSupabaseClient(): SupabaseClient<Database> {
  const mockClient = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    rpc: vi.fn(),
  };

  return mockClient as unknown as SupabaseClient<Database>;
}

/**
 * Create mock user for testing
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'test@example.com',
    role: 'authenticated',
    ...overrides,
  };
}

/**
 * Create mock campaign data
 */
export function createMockCampaign(overrides = {}) {
  return {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Test Campaign',
    client_id: 'c0000000-0000-0000-0000-000000000001',
    status: 'draft',
    budget: 10000,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    created_by: 'a0000000-0000-0000-0000-000000000001',
    ...overrides,
  };
}

/**
 * Create mock client data
 */
export function createMockClient(overrides = {}) {
  return {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Test Client',
    tier: 'gold',
    contact_email: 'client@example.com',
    contact_name: 'John Doe',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock brief data
 */
export function createMockBrief(overrides = {}) {
  return {
    id: 'd0000000-0000-0000-0000-000000000001',
    campaign_id: 'b0000000-0000-0000-0000-000000000001',
    raw_content: 'Test brief content',
    structured_data: {
      objectives: ['Increase brand awareness'],
      target_audience: 'Ages 18-35',
      deliverables: ['10 Instagram posts'],
    },
    risk_level: 'low',
    missing_info: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock audit log entry
 */
export function createMockAuditLog(overrides = {}) {
  return {
    id: 'e0000000-0000-0000-0000-000000000001',
    table_name: 'campaigns',
    record_id: 'b0000000-0000-0000-0000-000000000001',
    action: 'created',
    old_data: null,
    new_data: { name: 'Test Campaign' },
    user_id: 'a0000000-0000-0000-0000-000000000001',
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Setup mock successful database response
 */
export function mockSuccessResponse(data: any, count: number | null = null) {
  return {
    data,
    error: null,
    count,
    status: 200,
    statusText: 'OK',
  };
}

/**
 * Setup mock error database response
 */
export function mockErrorResponse(message: string, code = 'PGRST116') {
  return {
    data: null,
    error: {
      message,
      code,
      details: '',
      hint: '',
    },
    count: null,
    status: 400,
    statusText: 'Bad Request',
  };
}
