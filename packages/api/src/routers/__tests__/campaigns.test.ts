/**
 * Campaigns Router Tests
 * Tests all campaign CRUD operations with audit trail verification
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, createMockUser, createMockCampaign, createMockClient, mockSuccessResponse, mockErrorResponse } from '../../test/helpers';
import { campaignsRouter } from '../campaigns';

describe('Campaigns Router', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockUser: ReturnType<typeof createMockUser>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockUser = createMockUser();
    vi.clearAllMocks();
    
    // Setup default audit log mock (successful insertion)
    mockSupabase.from = vi.fn((table) => {
      if (table === 'audit_logs') {
        return {
          insert: vi.fn().mockResolvedValue(mockSuccessResponse({})),
        } as any;
      }
      return mockSupabase.from.mock.results[0].value;
    });
  });

  describe('list', () => {
    it('should list campaigns with default pagination', async () => {
      const mockCampaigns = [createMockCampaign(), createMockCampaign({ id: 'b0000000-0000-0000-0000-000000000002' })];
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaigns)),
            }),
          }),
        }),
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.list({ limit: 50, offset: 0 });

      expect(result.campaigns).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('campaigns');
    });

    it('should filter campaigns by status', async () => {
      const mockCampaigns = [createMockCampaign({ status: 'active' })];
      
      const eqSpy = vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaigns));

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                eq: eqSpy,
              }),
            }),
          }),
        }),
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.list({ limit: 50, offset: 0, status: 'active' });

      expect(eqSpy).toHaveBeenCalledWith('status', 'active');
    });

    it('should filter campaigns by client ID', async () => {
      const mockCampaigns = [createMockCampaign({ client_id: 'c0000000-0000-0000-0000-000000000001' })];
      
      const eqSpy = vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaigns));

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                eq: eqSpy,
              }),
            }),
          }),
        }),
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.list({ limit: 50, offset: 0, clientId: 'c0000000-0000-0000-0000-000000000001' });

      expect(eqSpy).toHaveBeenCalledWith('client_id', 'c0000000-0000-0000-0000-000000000001');
    });

    it('should exclude soft-deleted campaigns', async () => {
      const isSpy = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue(mockSuccessResponse([])),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: isSpy,
        }),
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.list({ limit: 50, offset: 0 });

      expect(isSpy).toHaveBeenCalledWith('deleted_at', null);
    });

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(mockErrorResponse('Database error')),
            }),
          }),
        }),
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      
      await expect(caller.list({ limit: 50, offset: 0 })).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should get campaign by ID', async () => {
      const mockCampaign = createMockCampaign();
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaign)),
            }),
          }),
        }),
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getById({ id: 'b0000000-0000-0000-0000-000000000001' });

      expect(result).toEqual(mockCampaign);
      expect(mockSupabase.from).toHaveBeenCalledWith('campaigns');
    });

    it('should throw NOT_FOUND for non-existent campaign', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockErrorResponse('Not found', 'PGRST116')),
            }),
          }),
        }),
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      
      await expect(caller.getById({ id: 'f0000000-0000-0000-0000-000000000099' })).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create campaign with valid data', async () => {
      const mockCampaign = createMockCampaign();
      
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaign)),
          }),
        }),
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.create({
        name: 'Test Campaign',
        clientId: 'c0000000-0000-0000-0000-000000000001',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        budgetTotal: 10000,
        tags: ['marketing', 'social'],
      });

      expect(result).toEqual(mockCampaign);
      expect(mockSupabase.from).toHaveBeenCalledWith('campaigns');
    });

    it('should set status to draft for new campaigns', async () => {
      const insertSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockCampaign())),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: insertSpy,
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.create({
        name: 'Test Campaign',
        clientId: 'c0000000-0000-0000-0000-000000000001',
      });

      expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
        status: 'draft',
      }));
    });

    it('should assign created_by to current user', async () => {
      const insertSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockCampaign())),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: insertSpy,
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.create({
        name: 'Test Campaign',
        clientId: 'c0000000-0000-0000-0000-000000000001',
      });

      expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
        created_by: mockUser.id,
      }));
    });

    it('should handle validation errors', async () => {
      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      
      await expect(caller.create({
        name: '', // Empty name should fail
        clientId: 'c0000000-0000-0000-0000-000000000001',
      } as any)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update campaign fields', async () => {
      const mockCampaign = createMockCampaign({ name: 'Updated Campaign' });
      
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaign)),
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaign)),
          }),
        }),
        update: updateSpy,
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.update({
        id: 'b0000000-0000-0000-0000-000000000001',
        name: 'Updated Campaign',
        status: 'active',
      });

      expect(result).toEqual(mockCampaign);
      expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Updated Campaign',
        status: 'active',
      }));
    });

    it('should only update provided fields', async () => {
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockCampaign())),
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockCampaign())),
          }),
        }),
        update: updateSpy,
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.update({
        id: 'b0000000-0000-0000-0000-000000000001',
        name: 'Updated Name',
      });

      const updateData = updateSpy.mock.calls[0][0];
      expect(updateData).toHaveProperty('name');
      expect(updateData).not.toHaveProperty('status');
    });
  });

  describe('delete', () => {
    it('should soft delete campaign', async () => {
      const mockCampaign = createMockCampaign();
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockSuccessResponse(null)),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaign)),
          }),
        }),
        update: updateSpy,
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.delete({ id: 'b0000000-0000-0000-0000-000000000001' });

      expect(result.success).toBe(true);
      expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
        deleted_at: expect.any(String),
      }));
    });

    it('should handle delete errors', async () => {
      const mockCampaign = createMockCampaign();
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaign)),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockErrorResponse('Delete failed')),
        }),
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      
      await expect(caller.delete({ id: 'b0000000-0000-0000-0000-000000000001' })).rejects.toThrow('Delete failed');
    });
  });

  describe('Audit Trail', () => {
    it('should create audit log when creating campaign', async () => {
      const mockCampaign = createMockCampaign();
      const auditInsertSpy = vi.fn().mockResolvedValue(mockSuccessResponse({}));
      
      mockSupabase.from = vi.fn((table) => {
        if (table === 'campaigns') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaign)),
              }),
            }),
          } as any;
        }
        if (table === 'audit_logs') {
          return {
            insert: auditInsertSpy,
          } as any;
        }
        return {} as any;
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.create({
        name: 'Test Campaign',
        clientId: 'c0000000-0000-0000-0000-000000000001',
      });

      expect(auditInsertSpy).toHaveBeenCalledWith(expect.objectContaining({
        table_name: 'campaigns',
        record_id: mockCampaign.id,
        action: 'INSERT',
        user_id: mockUser.id,
      }));
    });

    it('should create audit log when updating campaign', async () => {
      const mockCampaign = createMockCampaign();
      const auditInsertSpy = vi.fn().mockResolvedValue(mockSuccessResponse({}));
      
      mockSupabase.from = vi.fn((table) => {
        if (table === 'campaigns') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaign)),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue(mockSuccessResponse({ ...mockCampaign, name: 'Updated' })),
                  }),
                }),
              }),
            }),
          } as any;
        }
        if (table === 'audit_logs') {
          return {
            insert: auditInsertSpy,
          } as any;
        }
        return {} as any;
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.update({
        id: 'b0000000-0000-0000-0000-000000000001',
        name: 'Updated',
      });

      expect(auditInsertSpy).toHaveBeenCalledWith(expect.objectContaining({
        table_name: 'campaigns',
        record_id: 'b0000000-0000-0000-0000-000000000001',
        action: 'UPDATE',
        user_id: mockUser.id,
      }));
    });

    it('should create audit log when deleting campaign', async () => {
      const mockCampaign = createMockCampaign();
      const auditInsertSpy = vi.fn().mockResolvedValue(mockSuccessResponse({}));
      
      mockSupabase.from = vi.fn((table) => {
        if (table === 'campaigns') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaign)),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue(mockSuccessResponse(null)),
            }),
          } as any;
        }
        if (table === 'audit_logs') {
          return {
            insert: auditInsertSpy,
          } as any;
        }
        return {} as any;
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.delete({ id: 'b0000000-0000-0000-0000-000000000001' });

      expect(auditInsertSpy).toHaveBeenCalledWith(expect.objectContaining({
        table_name: 'campaigns',
        record_id: 'b0000000-0000-0000-0000-000000000001',
        action: 'DELETE',
        user_id: mockUser.id,
      }));
    });

    it('should not fail campaign creation if audit log fails', async () => {
      const mockCampaign = createMockCampaign();
      
      mockSupabase.from = vi.fn((table) => {
        if (table === 'campaigns') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaign)),
              }),
            }),
          } as any;
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockRejectedValue(new Error('Audit log failed')),
          } as any;
        }
        return {} as any;
      });

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      
      // Should still succeed even if audit log fails
      const result = await caller.create({
        name: 'Test Campaign',
        clientId: 'c0000000-0000-0000-0000-000000000001',
      });

      expect(result).toEqual(mockCampaign);
    });
  });
});
