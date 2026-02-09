/**
 * Shortlists Router Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, createMockUser, createMockShortlistEntry, createMockCreator, mockSuccessResponse, mockErrorResponse } from '../../test/helpers';
import { shortlistsRouter } from '../shortlists';

describe('Shortlists Router', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockUser: ReturnType<typeof createMockUser>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockUser = createMockUser();
    vi.clearAllMocks();
  });

  describe('getByCampaign', () => {
    it('should get shortlist for a campaign', async () => {
      const entries = [
        createMockShortlistEntry(),
        createMockShortlistEntry({ id: 'g0000000-0000-0000-0000-000000000002', position: 2 }),
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(mockSuccessResponse(entries)),
            }),
          }),
        }),
      });

      const caller = shortlistsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getByCampaign({ campaign_id: 'b0000000-0000-0000-0000-000000000001' });

      expect(result).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith('campaign_shortlists');
    });

    it('should return empty array for campaigns with no shortlist', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(mockSuccessResponse([])),
            }),
          }),
        }),
      });

      const caller = shortlistsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getByCampaign({ campaign_id: 'b0000000-0000-0000-0000-000000000001' });

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(mockErrorResponse('Database error')),
            }),
          }),
        }),
      });

      const caller = shortlistsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await expect(caller.getByCampaign({ campaign_id: 'b0000000-0000-0000-0000-000000000001' })).rejects.toThrow('Failed to fetch shortlist');
    });
  });

  describe('addCreator', () => {
    it('should add creator to shortlist', async () => {
      const entry = createMockShortlistEntry();

      // First call: get max position
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockSuccessResponse([])),
            }),
          }),
        }),
      });

      // Second call: insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(entry)),
          }),
        }),
      });

      const caller = shortlistsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.addCreator({
        campaign_id: 'b0000000-0000-0000-0000-000000000001',
        creator_id: 'f0000000-0000-0000-0000-000000000001',
        proposed_rate: 500,
      });

      expect(result).toEqual(entry);
    });

    it('should auto-increment position when not provided', async () => {
      const existing = [{ position: 3 }];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockSuccessResponse(existing)),
            }),
          }),
        }),
      });

      const insertSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockShortlistEntry({ position: 4 }))),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        insert: insertSpy,
      });

      const caller = shortlistsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.addCreator({
        campaign_id: 'b0000000-0000-0000-0000-000000000001',
        creator_id: 'f0000000-0000-0000-0000-000000000001',
      });

      expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
        position: 4,
      }));
    });

    it('should throw on duplicate creator', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockSuccessResponse([])),
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'duplicate', code: '23505', details: '', hint: '' },
              count: null,
              status: 409,
              statusText: 'Conflict',
            }),
          }),
        }),
      });

      const caller = shortlistsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await expect(caller.addCreator({
        campaign_id: 'b0000000-0000-0000-0000-000000000001',
        creator_id: 'f0000000-0000-0000-0000-000000000001',
      })).rejects.toThrow('Creator already in shortlist');
    });
  });

  describe('removeCreator', () => {
    it('should soft-remove creator from shortlist', async () => {
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockShortlistEntry({ status: 'removed' }))),
              }),
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({ update: updateSpy });

      const caller = shortlistsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.removeCreator({
        campaign_id: 'b0000000-0000-0000-0000-000000000001',
        creator_id: 'f0000000-0000-0000-0000-000000000001',
      });

      expect(result.status).toBe('removed');
    });
  });

  describe('submit', () => {
    it('should submit shortlist for approval', async () => {
      const submitted = [createMockShortlistEntry({ status: 'submitted' })];

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue(mockSuccessResponse(submitted)),
              }),
            }),
          }),
        }),
      });

      const caller = shortlistsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.submit({ campaign_id: 'b0000000-0000-0000-0000-000000000001' });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('submitted');
    });
  });

  describe('approve', () => {
    it('should approve a shortlisted creator', async () => {
      const approved = createMockShortlistEntry({ status: 'approved' });

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockSuccessResponse(approved)),
                }),
              }),
            }),
          }),
        }),
      });

      const caller = shortlistsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.approve({
        campaign_id: 'b0000000-0000-0000-0000-000000000001',
        creator_id: 'f0000000-0000-0000-0000-000000000001',
        approved: true,
      });

      expect(result.status).toBe('approved');
    });

    it('should reject a shortlisted creator with feedback', async () => {
      const rejected = createMockShortlistEntry({ status: 'rejected', rejection_reason: 'Not a good fit' });

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockSuccessResponse(rejected)),
                }),
              }),
            }),
          }),
        }),
      });

      const caller = shortlistsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.approve({
        campaign_id: 'b0000000-0000-0000-0000-000000000001',
        creator_id: 'f0000000-0000-0000-0000-000000000001',
        approved: false,
        feedback: 'Not a good fit',
      });

      expect(result.status).toBe('rejected');
    });
  });
});
