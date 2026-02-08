/**
 * Smoke test to verify test infrastructure is working
 */

import { describe, it, expect, vi } from 'vitest';
import { createMockSupabaseClient, createMockUser, mockSuccessResponse } from '../../test/helpers';

describe('Test Infrastructure', () => {
  it('should run tests', () => {
    expect(true).toBe(true);
  });

  it('should create mock Supabase client', () => {
    const mockClient = createMockSupabaseClient();
    expect(mockClient).toBeDefined();
    expect(mockClient.from).toBeDefined();
    expect(mockClient.select).toBeDefined();
  });

  it('should create mock user', () => {
    const user = createMockUser();
    expect(user.id).toBe('test-user-id');
    expect(user.email).toBe('test@example.com');
  });

  it('should create mock success response', () => {
    const response = mockSuccessResponse({ id: '123' });
    expect(response.data).toEqual({ id: '123' });
    expect(response.error).toBeNull();
  });

  it('should support Vitest mocking', () => {
    const mockFn = vi.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });
});
