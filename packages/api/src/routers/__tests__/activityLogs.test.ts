/**
 * Activity Logs Router Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, createMockUser, createMockAuditLog, mockSuccessResponse, mockErrorResponse } from '../../test/helpers';
import { activityLogsRouter } from '../activityLogs';

describe('Activity Logs Router', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockUser: ReturnType<typeof createMockUser>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockUser = createMockUser();
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should list activity logs with default pagination', async () => {
      const mockLogs = [
        createMockAuditLog(),
        createMockAuditLog({ id: 'e0000000-0000-0000-0000-000000000002', table_name: 'clients' }),
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue(mockSuccessResponse(mockLogs, 2)),
          }),
        }),
      });

      const caller = activityLogsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.list({ limit: 30, offset: 0 });

      expect(result.logs).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should filter by table name', async () => {
      const eqSpy = vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue(mockSuccessResponse([createMockAuditLog()], 1)),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockReturnValue({
              eq: eqSpy,
            }),
          }),
        }),
      });

      const caller = activityLogsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.list({ limit: 30, offset: 0, tableName: 'campaigns' });

      expect(eqSpy).toHaveBeenCalledWith('table_name', 'campaigns');
    });

    it('should filter by operation', async () => {
      const eqSpy = vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue(mockSuccessResponse([createMockAuditLog()], 1)),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockReturnValue({
              eq: eqSpy,
            }),
          }),
        }),
      });

      const caller = activityLogsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.list({ limit: 30, offset: 0, operation: 'INSERT' });

      expect(eqSpy).toHaveBeenCalledWith('operation', 'INSERT');
    });

    it('should filter by record ID', async () => {
      const recordId = 'b0000000-0000-0000-0000-000000000001';
      const eqSpy = vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue(mockSuccessResponse([createMockAuditLog()], 1)),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockReturnValue({
              eq: eqSpy,
            }),
          }),
        }),
      });

      const caller = activityLogsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.list({ limit: 30, offset: 0, recordId });

      expect(eqSpy).toHaveBeenCalledWith('record_id', recordId);
    });

    it('should handle errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue(mockErrorResponse('Query failed')),
          }),
        }),
      });

      const caller = activityLogsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await expect(caller.list({ limit: 30, offset: 0 })).rejects.toThrow('Failed to fetch activity');
    });
  });

  describe('getByRecord', () => {
    it('should return audit history for a specific record', async () => {
      const mockLogs = [
        createMockAuditLog({ action: 'updated' }),
        createMockAuditLog({ id: 'e0000000-0000-0000-0000-000000000003', action: 'created' }),
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(mockSuccessResponse(mockLogs)),
            }),
          }),
        }),
      });

      const caller = activityLogsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getByRecord({
        tableName: 'campaigns',
        recordId: 'b0000000-0000-0000-0000-000000000001',
      });

      expect(result).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });

    it('should handle errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(mockErrorResponse('Not found')),
            }),
          }),
        }),
      });

      const caller = activityLogsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await expect(
        caller.getByRecord({ tableName: 'campaigns', recordId: 'b0000000-0000-0000-0000-000000000001' })
      ).rejects.toThrow('Failed to fetch record history');
    });
  });

  describe('summary', () => {
    it('should return counts grouped by table name', async () => {
      const mockData = [
        { table_name: 'campaigns' },
        { table_name: 'campaigns' },
        { table_name: 'clients' },
        { table_name: 'creators' },
        { table_name: 'creators' },
        { table_name: 'creators' },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(mockSuccessResponse(mockData)),
          }),
        }),
      });

      const caller = activityLogsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.summary();

      expect(result).toEqual({
        campaigns: 2,
        clients: 1,
        creators: 3,
      });
    });

    it('should return empty object when no logs', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(mockSuccessResponse([])),
          }),
        }),
      });

      const caller = activityLogsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.summary();

      expect(result).toEqual({});
    });

    it('should handle errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(mockErrorResponse('Server error')),
          }),
        }),
      });

      const caller = activityLogsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await expect(caller.summary()).rejects.toThrow('Failed to fetch activity summary');
    });
  });
});
