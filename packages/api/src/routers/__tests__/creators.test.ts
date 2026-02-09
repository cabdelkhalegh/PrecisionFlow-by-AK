/**
 * Creators Router Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, createMockUser, createMockCreator, mockSuccessResponse, mockErrorResponse } from '../../test/helpers';
import { creatorsRouter } from '../creators';

describe('Creators Router', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockUser: ReturnType<typeof createMockUser>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockUser = createMockUser();
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should list creators with default pagination', async () => {
      const mockCreators = [createMockCreator(), createMockCreator({ id: 'f0000000-0000-0000-0000-000000000002' })];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(mockSuccessResponse(mockCreators, 2)),
            }),
          }),
        }),
      });

      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.list({ limit: 20, offset: 0 });

      expect(result.creators).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('creators');
    });

    it('should filter creators by platform', async () => {
      const eqSpy = vi.fn().mockResolvedValue(mockSuccessResponse([createMockCreator()], 1));

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

      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.list({ limit: 20, offset: 0, platform: 'tiktok' });

      expect(eqSpy).toHaveBeenCalledWith('primary_platform', 'tiktok');
    });

    it('should filter creators by status', async () => {
      const eqSpy = vi.fn().mockResolvedValue(mockSuccessResponse([createMockCreator()], 1));

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

      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.list({ limit: 20, offset: 0, status: 'active' });

      expect(eqSpy).toHaveBeenCalledWith('status', 'active');
    });

    it('should search creators by name', async () => {
      const orSpy = vi.fn().mockResolvedValue(mockSuccessResponse([createMockCreator()], 1));

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                or: orSpy,
              }),
            }),
          }),
        }),
      });

      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.list({ limit: 20, offset: 0, search: 'Sarah' });

      expect(orSpy).toHaveBeenCalledWith(expect.stringContaining('Sarah'));
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

      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await expect(caller.list({ limit: 20, offset: 0 })).rejects.toThrow('Failed to fetch creators');
    });
  });

  describe('getById', () => {
    it('should get creator by ID', async () => {
      const mockCreator = createMockCreator();

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(mockCreator)),
            }),
          }),
        }),
      });

      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getById({ id: 'f0000000-0000-0000-0000-000000000001' });

      expect(result).toEqual(mockCreator);
      expect(mockSupabase.from).toHaveBeenCalledWith('creators');
    });

    it('should throw for non-existent creator', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockErrorResponse('Not found', 'PGRST116')),
            }),
          }),
        }),
      });

      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await expect(caller.getById({ id: 'f0000000-0000-0000-0000-000000000099' })).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create creator with valid data', async () => {
      const mockCreator = createMockCreator();

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(mockCreator)),
          }),
        }),
      });

      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.create({
        name: 'Test Creator',
        email: 'creator@example.com',
        primary_platform: 'tiktok',
        instagram_followers: 50000,
        tiktok_followers: 100000,
        niche: ['fitness', 'lifestyle'],
      });

      expect(result).toEqual(mockCreator);
    });

    it('should set created_by to current user', async () => {
      const insertSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockCreator())),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: insertSpy,
      });

      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.create({ name: 'New Creator' });

      expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
        created_by: mockUser.id,
      }));
    });

    it('should reject empty name', async () => {
      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await expect(caller.create({ name: '' } as any)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update creator fields', async () => {
      const updated = createMockCreator({ name: 'Updated Creator' });

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse(updated)),
              }),
            }),
          }),
        }),
      });

      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.update({
        id: 'f0000000-0000-0000-0000-000000000001',
        data: { name: 'Updated Creator' },
      });

      expect(result.name).toBe('Updated Creator');
    });
  });

  describe('delete', () => {
    it('should soft delete creator', async () => {
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockCreator({ deleted_at: new Date().toISOString() }))),
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        update: updateSpy,
      });

      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.delete({ id: 'f0000000-0000-0000-0000-000000000001' });

      expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
        deleted_at: expect.any(String),
      }));
    });
  });

  describe('search', () => {
    it('should search creators by query', async () => {
      const mockCreators = [createMockCreator()];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            or: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockSuccessResponse(mockCreators)),
            }),
          }),
        }),
      });

      const caller = creatorsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.search({ query: 'fitness', limit: 10 });

      expect(result).toHaveLength(1);
    });
  });
});
