import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockSupabaseClient, createMockUser, mockSuccessResponse, mockErrorResponse } from '../../test/helpers';
import { approvalsRouter } from '../approvals';

describe('Approvals Router', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockUser: ReturnType<typeof createMockUser>;
  let mockDirector: ReturnType<typeof createMockUser>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockUser = createMockUser();
    mockDirector = createMockUser({ role: 'director' });
  });

  describe('list', () => {
    it('should list all approvals', async () => {
      const mockApprovals = [
        { id: 'aa000000-0000-0000-0000-000000000001', campaign_id: 'b0000000-0000-0000-0000-000000000011', status: 'pending', approval_type: 'brief' },
        { id: 'aa000000-0000-0000-0000-000000000002', campaign_id: 'b0000000-0000-0000-0000-000000000012', status: 'approved', approval_type: 'strategy' },
      ];

      mockSupabase.from().select().order().range.mockResolvedValue(
        mockSuccessResponse(mockApprovals)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.list({});

      expect(result).toEqual(mockApprovals);
    });

    it('should filter by campaign ID', async () => {
      const mockApprovals = [
        { id: 'aa000000-0000-0000-0000-000000000001', campaign_id: 'b0000000-0000-0000-0000-000000000011', status: 'pending' },
      ];

      mockSupabase.from().select().order().range().eq.mockResolvedValue(
        mockSuccessResponse(mockApprovals)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.list({ campaignId: 'b0000000-0000-0000-0000-000000000011' });

      expect(result).toEqual(mockApprovals);
    });

    it('should filter by status', async () => {
      const mockApprovals = [
        { id: 'aa000000-0000-0000-0000-000000000001', status: 'approved' },
      ];

      mockSupabase.from().select().order().range().eq.mockResolvedValue(
        mockSuccessResponse(mockApprovals)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.list({ status: 'approved' });

      expect(result).toEqual(mockApprovals);
    });

    it('should filter by approval type', async () => {
      const mockApprovals = [
        { id: 'aa000000-0000-0000-0000-000000000001', approval_type: 'brief' },
      ];

      mockSupabase.from().select().order().range().eq.mockResolvedValue(
        mockSuccessResponse(mockApprovals)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.list({ type: 'brief' });

      expect(result).toEqual(mockApprovals);
    });

    it('should handle pagination', async () => {
      mockSupabase.from().select().order().range.mockResolvedValue(
        mockSuccessResponse([])
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.list({ limit: 10, offset: 20 });

      expect(mockSupabase.from().select().order().range).toHaveBeenCalledWith(20, 29);
    });
  });

  describe('getPendingForUser', () => {
    it('should get pending approvals for current user', async () => {
      const mockApprovals = [
        { id: 'aa000000-0000-0000-0000-000000000001', approver_id: mockUser.id, status: 'pending' },
      ];

      mockSupabase.from().select().eq().eq().order.mockResolvedValue(
        mockSuccessResponse(mockApprovals)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getPendingForUser();

      expect(result).toEqual(mockApprovals);
    });
  });

  describe('getById', () => {
    it('should get approval by ID', async () => {
      const mockApproval = { id: 'aa000000-0000-0000-0000-000000000001', campaign_id: 'b0000000-0000-0000-0000-000000000011' };

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getById({ id: 'aa000000-0000-0000-0000-000000000001' });

      expect(result).toEqual(mockApproval);
    });
  });

  describe('getHistory', () => {
    it('should get approval history for campaign', async () => {
      const mockHistory = [
        { id: 'aa000000-0000-0000-0000-000000000001', campaign_id: 'b0000000-0000-0000-0000-000000000011', status: 'approved' },
        { id: 'aa000000-0000-0000-0000-000000000002', campaign_id: 'b0000000-0000-0000-0000-000000000011', status: 'rejected' },
      ];

      mockSupabase.from().select().eq().order.mockResolvedValue(
        mockSuccessResponse(mockHistory)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getHistory({ campaignId: 'b0000000-0000-0000-0000-000000000011' });

      expect(result).toEqual(mockHistory);
    });
  });

  describe('create', () => {
    it('should create approval request', async () => {
      const mockApproval = {
        id: 'aa000000-0000-0000-0000-000000000001',
        campaign_id: 'b0000000-0000-0000-0000-000000000011',
        approval_type: 'brief',
        approver_id: 'a0000000-0000-0000-0000-000000000011',
        status: 'pending',
      };

      mockSupabase.from().insert().select().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.create({
        campaignId: 'b0000000-0000-0000-0000-000000000011',
        approvalType: 'brief',
        approverId: 'a0000000-0000-0000-0000-000000000011',
      });

      expect(result).toEqual(mockApproval);
    });

    it('should validate input', async () => {
      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });

      await expect(
        caller.create({
          campaignId: 'invalid-uuid',
          approvalType: 'brief',
          approverId: 'a0000000-0000-0000-0000-000000000011',
        })
      ).rejects.toThrow();
    });

    it('should create audit log on create', async () => {
      const mockApproval = {
        id: 'aa000000-0000-0000-0000-000000000001',
        campaign_id: 'b0000000-0000-0000-0000-000000000011',
        approval_type: 'brief',
        approver_id: 'a0000000-0000-0000-0000-000000000011',
      };

      mockSupabase.from().insert().select().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.create({
        campaignId: 'b0000000-0000-0000-0000-000000000011',
        approvalType: 'brief',
        approverId: 'a0000000-0000-0000-0000-000000000011',
      });

      // Verify audit log was created
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  describe('approve', () => {
    it('should approve as designated approver', async () => {
      const mockApproval = {
        id: 'aa000000-0000-0000-0000-000000000001',
        approver_id: mockUser.id,
        status: 'pending',
      };

      const mockUpdated = {
        ...mockApproval,
        status: 'approved',
        approved_at: expect.any(String),
      };

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      mockSupabase.from().update().eq().select().single.mockResolvedValue(
        mockSuccessResponse(mockUpdated)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.approve({ id: 'aa000000-0000-0000-0000-000000000001', comments: 'Looks good' });

      expect(result.status).toBe('approved');
    });

    it('should not allow non-approver to approve', async () => {
      const mockApproval = {
        id: 'aa000000-0000-0000-0000-000000000001',
        approver_id: 'a0000000-0000-0000-0000-000000000099',
        status: 'pending',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });

      await expect(
        caller.approve({ id: 'aa000000-0000-0000-0000-000000000001' })
      ).rejects.toThrow('Only the designated approver can approve this request');
    });

    it('should update status on approve', async () => {
      const mockApproval = {
        id: 'aa000000-0000-0000-0000-000000000001',
        approver_id: mockUser.id,
        status: 'pending',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      mockSupabase.from().update().eq().select().single.mockResolvedValue(
        mockSuccessResponse({ ...mockApproval, status: 'approved' })
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.approve({ id: 'aa000000-0000-0000-0000-000000000001' });

      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approved' })
      );
    });

    it('should create audit log on approve', async () => {
      const mockApproval = {
        id: 'aa000000-0000-0000-0000-000000000001',
        approver_id: mockUser.id,
        status: 'pending',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      mockSupabase.from().update().eq().select().single.mockResolvedValue(
        mockSuccessResponse({ ...mockApproval, status: 'approved' })
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.approve({ id: 'aa000000-0000-0000-0000-000000000001' });

      // Verify audit log created
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  describe('reject', () => {
    it('should reject as designated approver', async () => {
      const mockApproval = {
        id: 'aa000000-0000-0000-0000-000000000001',
        approver_id: mockUser.id,
        status: 'pending',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      mockSupabase.from().update().eq().select().single.mockResolvedValue(
        mockSuccessResponse({ ...mockApproval, status: 'rejected' })
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.reject({ id: 'aa000000-0000-0000-0000-000000000001', reason: 'Not ready' });

      expect(result.status).toBe('rejected');
    });

    it('should not allow non-approver to reject', async () => {
      const mockApproval = {
        id: 'aa000000-0000-0000-0000-000000000001',
        approver_id: 'a0000000-0000-0000-0000-000000000099',
        status: 'pending',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });

      await expect(
        caller.reject({ id: 'aa000000-0000-0000-0000-000000000001', reason: 'Not ready' })
      ).rejects.toThrow('Only the designated approver can reject this request');
    });

    it('should require rejection reason', async () => {
      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });

      await expect(
        caller.reject({ id: 'aa000000-0000-0000-0000-000000000001', reason: '' })
      ).rejects.toThrow();
    });

    it('should create audit log on reject', async () => {
      const mockApproval = {
        id: 'aa000000-0000-0000-0000-000000000001',
        approver_id: mockUser.id,
        status: 'pending',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      mockSupabase.from().update().eq().select().single.mockResolvedValue(
        mockSuccessResponse({ ...mockApproval, status: 'rejected' })
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.reject({ id: 'aa000000-0000-0000-0000-000000000001', reason: 'Not ready' });

      // Verify audit log created
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  describe('override', () => {
    it('should allow director to override', async () => {
      const mockApproval = {
        id: 'aa000000-0000-0000-0000-000000000001',
        status: 'pending',
      };

      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse({ role: 'director' })),
              }),
            }),
          };
        }
        if (table === 'approvals') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse(mockApproval)),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockSuccessResponse({ ...mockApproval, status: 'overridden' })),
                }),
              }),
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockResolvedValue(mockSuccessResponse({})),
          };
        }
        return {};
      });

      const caller = approvalsRouter.createCaller({ user: mockDirector, supabase: mockSupabase });
      const result = await caller.override({
        id: 'aa000000-0000-0000-0000-000000000001',
        newStatus: 'approved',
        comments: 'Override reason',
      });

      expect(result.status).toBe('overridden');
    });

    it('should not allow non-director to override', async () => {
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse({ role: 'authenticated' })),
              }),
            }),
          };
        }
        return {};
      });

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });

      await expect(
        caller.override({
          id: 'aa000000-0000-0000-0000-000000000001',
          newStatus: 'approved',
          comments: 'Override reason',
        })
      ).rejects.toThrow();
    });

    it('should set override status', async () => {
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(
              mockSuccessResponse({ id: 'aa000000-0000-0000-0000-000000000001', status: 'overridden', override_status: 'approved' })
            ),
          }),
        }),
      });

      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse({ role: 'director' })),
              }),
            }),
          };
        }
        if (table === 'approvals') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse({ id: 'aa000000-0000-0000-0000-000000000001', status: 'pending' })),
              }),
            }),
            update: updateSpy,
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockResolvedValue(mockSuccessResponse({})),
          };
        }
        return {};
      });

      const caller = approvalsRouter.createCaller({ user: mockDirector, supabase: mockSupabase });
      await caller.override({
        id: 'aa000000-0000-0000-0000-000000000001',
        newStatus: 'approved',
        comments: 'Override reason',
      });

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'overridden',
          override_status: 'approved',
        })
      );
    });

    it('should create audit log on override', async () => {
      const mockApproval = {
        id: 'aa000000-0000-0000-0000-000000000001',
        status: 'pending',
      };

      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse({ role: 'director' })),
              }),
            }),
          };
        }
        if (table === 'approvals') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse(mockApproval)),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockSuccessResponse({ ...mockApproval, status: 'overridden' })),
                }),
              }),
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockResolvedValue(mockSuccessResponse({})),
          };
        }
        return {};
      });

      const caller = approvalsRouter.createCaller({ user: mockDirector, supabase: mockSupabase });
      await caller.override({
        id: 'aa000000-0000-0000-0000-000000000001',
        newStatus: 'approved',
        comments: 'Override reason',
      });

      // Verify audit log created
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  describe('countPending', () => {
    it('should count pending approvals for user', async () => {
      mockSupabase.from = vi.fn().mockImplementation((table: string) => {
        if (table === 'approvals') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  count: 5,
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.countPending();

      expect(result).toBe(5);
    });
  });
});
