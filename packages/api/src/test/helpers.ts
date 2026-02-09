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
    deleted_at: null,
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
    deleted_at: null,
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
 * Create mock creator data
 */
export function createMockCreator(overrides = {}) {
  return {
    id: 'f0000000-0000-0000-0000-000000000001',
    name: 'Test Creator',
    email: 'creator@example.com',
    phone: '+1234567890',
    bio: 'Test creator bio',
    profile_image_url: null,
    instagram_handle: '@testcreator',
    tiktok_handle: '@testcreator',
    youtube_handle: null,
    twitter_handle: null,
    facebook_handle: null,
    instagram_followers: 50000,
    tiktok_followers: 100000,
    youtube_subscribers: null,
    twitter_followers: null,
    avg_engagement_rate: 4.5,
    avg_views: 25000,
    avg_likes: 2000,
    avg_comments: 150,
    primary_platform: 'tiktok',
    niche: ['fitness', 'lifestyle'],
    content_types: ['reel', 'story'],
    rate_card: { reel: 500, story: 200 },
    preferred_collaboration_types: ['sponsored_post'],
    country: 'US',
    city: 'Los Angeles',
    timezone: 'America/Los_Angeles',
    status: 'active',
    verified: false,
    notes: null,
    tags: ['fitness'],
    total_campaigns_completed: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    created_by: 'a0000000-0000-0000-0000-000000000001',
    ...overrides,
  };
}

/**
 * Create mock shortlist entry
 */
export function createMockShortlistEntry(overrides = {}) {
  return {
    id: 'g0000000-0000-0000-0000-000000000001',
    campaign_id: 'b0000000-0000-0000-0000-000000000001',
    creator_id: 'f0000000-0000-0000-0000-000000000001',
    position: 1,
    proposed_rate: 500,
    proposed_deliverables: ['1 TikTok reel', '2 Instagram stories'],
    internal_notes: 'Great fit for the campaign',
    status: 'draft',
    submitted_at: null,
    submitted_by: null,
    approved_by: null,
    approved_at: null,
    client_feedback: null,
    rejection_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    created_by: 'a0000000-0000-0000-0000-000000000001',
    ...overrides,
  };
}

/**
 * Create mock content task
 */
export function createMockContentTask(overrides = {}) {
  return {
    id: 'aa000000-0000-0000-0000-000000000001',
    campaign_id: 'b0000000-0000-0000-0000-000000000001',
    creator_id: 'f0000000-0000-0000-0000-000000000001',
    title: 'Test Content Task',
    description: 'Create a TikTok reel',
    deliverable_type: 'tiktok_video',
    requirements: { min_duration: 30 },
    quantity: 1,
    duration_seconds: 60,
    deadline: '2024-06-01T00:00:00.000Z',
    script_deadline: '2024-05-15T00:00:00.000Z',
    draft_deadline: '2024-05-22T00:00:00.000Z',
    final_deadline: '2024-05-29T00:00:00.000Z',
    payment_amount: 500,
    payment_status: 'pending',
    status: 'assigned',
    feedback: null,
    revision_notes: [],
    script_approved_at: null,
    script_approved_by: null,
    draft_approved_at: null,
    draft_approved_by: null,
    final_approved_at: null,
    final_approved_by: null,
    assigned_by: 'a0000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    created_by: 'a0000000-0000-0000-0000-000000000001',
    ...overrides,
  };
}

/**
 * Create mock content artifact
 */
export function createMockContentArtifact(overrides = {}) {
  return {
    id: 'ab000000-0000-0000-0000-000000000001',
    content_task_id: 'aa000000-0000-0000-0000-000000000001',
    artifact_type: 'script',
    file_url: 'https://storage.example.com/scripts/test.pdf',
    file_name: 'script_v1.pdf',
    file_size: 1024,
    file_type: 'application/pdf',
    text_content: 'Opening scene: Creator walks into frame...',
    duration_seconds: null,
    width: null,
    height: null,
    format: null,
    revision_notes: null,
    version: 1,
    is_latest: true,
    previous_version_id: null,
    status: 'pending',
    uploaded_by: 'a0000000-0000-0000-0000-000000000001',
    reviewed_at: null,
    reviewed_by: null,
    review_comments: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  };
}

/**
 * Create mock budget data
 */
export function createMockBudget(overrides = {}) {
  return {
    id: 'ac000000-0000-0000-0000-000000000001',
    campaign_id: 'b0000000-0000-0000-0000-000000000001',
    original_amount: 10000,
    current_amount: 10000,
    currency: 'USD',
    breakdown: { creator_fees: 6000, production: 2500, platform_fees: 1500 },
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock expense data
 */
export function createMockExpense(overrides = {}) {
  return {
    id: 'ad000000-0000-0000-0000-000000000001',
    campaign_id: 'b0000000-0000-0000-0000-000000000001',
    category: 'creator_payment',
    amount: 500,
    currency: 'USD',
    description: 'Creator fee for TikTok reel',
    receipt_url: null,
    approval_status: 'pending',
    payment_status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'a0000000-0000-0000-0000-000000000001',
    ...overrides,
  };
}

/**
 * Create mock invoice data
 */
export function createMockInvoice(overrides = {}) {
  return {
    id: 'ae000000-0000-0000-0000-000000000001',
    campaign_id: 'b0000000-0000-0000-0000-000000000001',
    creator_id: 'f0000000-0000-0000-0000-000000000001',
    invoice_number: 'INV-2024-001',
    amount: 1500,
    currency: 'USD',
    status: 'draft',
    due_date: '2024-06-30',
    paid_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock payment data
 */
export function createMockPayment(overrides = {}) {
  return {
    id: 'af000000-0000-0000-0000-000000000001',
    invoice_id: 'ae000000-0000-0000-0000-000000000001',
    amount: 1500,
    currency: 'USD',
    payment_method: 'bank_transfer',
    transaction_reference: 'TXN-12345',
    payment_date: new Date().toISOString(),
    notes: null,
    created_at: new Date().toISOString(),
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
