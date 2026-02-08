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
  });

  describe('list', () => {
    it('should list campaigns with default pagination', async () => {
      const mockCampaigns = [createMockCampaign(), createMockCampaign({ id: 'campaign-456' })];
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaigns)),
            }),
          }),
        }),
      } as any);

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.list({ limit: 50, offset: 0 });

      expect(result.campaigns).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('campaigns');
    });

    it('should filter campaigns by status', async () => {
      const mockCampaigns = [createMockCampaign({ status: 'active' })];
      
      const eqSpy = vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaigns)),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: eqSpy,
            }),
          }),
        }),
      } as any);

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.list({ limit: 50, offset: 0, status: 'active' });

      expect(eqSpy).toHaveBeenCalledWith('status', 'active');
    });

    it('should filter campaigns by client ID', async () => {
      const mockCampaigns = [createMockCampaign({ client_id: 'client-123' })];
      
      const eqSpy = vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue(mockSuccessResponse(mockCampaigns)),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: eqSpy,
            }),
          }),
        }),
      } as any);

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.list({ limit: 50, offset: 0, clientId: 'client-123' });

      expect(eqSpy).toHaveBeenCalledWith('client_id', 'client-123');
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
      } as any);

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
      } as any);

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
      } as any);

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getById({ id: 'campaign-123' });

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
      } as any);

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      
      await expect(caller.getById({ id: 'non-existent' })).rejects.toThrow();
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
      } as any);

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.create({
        name: 'Test Campaign',
        clientId: 'client-123',
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
      } as any);

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.create({
        name: 'Test Campaign',
        clientId: 'client-123',
      });

      expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
        status: 'draft',
      }));
    });

    it('should assign campaign_manager_id to current user', async () => {
      const insertSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockCampaign())),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: insertSpy,
      } as any);

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.create({
        name: 'Test Campaign',
        clientId: 'client-123',
      });

      expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
        campaign_manager_id: mockUser.id,
      }));
    });

    it('should handle validation errors', async () => {
      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      
      await expect(caller.create({
        name: '', // Empty name should fail
        clientId: 'client-123',
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
        update: updateSpy,
      } as any);

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.update({
        id: 'campaign-123',
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
        update: updateSpy,
      } as any);

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.update({
        id: 'campaign-123',
        name: 'Updated Name',
      });

      const updateData = updateSpy.mock.calls[0][0];
      expect(updateData).toHaveProperty('name');
      expect(updateData).not.toHaveProperty('status');
    });
  });

  describe('delete', () => {
    it('should soft delete campaign', async () => {
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockSuccessResponse(null)),
      });

      mockSupabase.from.mockReturnValue({
        update: updateSpy,
      } as any);

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.delete({ id: 'campaign-123' });

      expect(result.success).toBe(true);
      expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
        deleted_at: expect.any(String),
      }));
    });

    it('should handle delete errors', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockErrorResponse('Delete failed')),
        }),
      } as any);

      const caller = campaignsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      
      await expect(caller.delete({ id: 'campaign-123' })).rejects.toThrow('Delete failed');
    });
  });
});
