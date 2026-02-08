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
        { id: '1', campaign_id: 'camp1', status: 'pending', approval_type: 'brief' },
        { id: '2', campaign_id: 'camp2', status: 'approved', approval_type: 'strategy' },
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
        { id: '1', campaign_id: 'camp1', status: 'pending' },
      ];

      mockSupabase.from().select().order().range().eq.mockResolvedValue(
        mockSuccessResponse(mockApprovals)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.list({ campaignId: 'camp1' });

      expect(result).toEqual(mockApprovals);
    });

    it('should filter by status', async () => {
      const mockApprovals = [
        { id: '1', status: 'approved' },
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
        { id: '1', approval_type: 'brief' },
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
        { id: '1', approver_id: mockUser.id, status: 'pending' },
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
      const mockApproval = { id: '1', campaign_id: 'camp1' };

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getById({ id: '1' });

      expect(result).toEqual(mockApproval);
    });
  });

  describe('getHistory', () => {
    it('should get approval history for campaign', async () => {
      const mockHistory = [
        { id: '1', campaign_id: 'camp1', status: 'approved' },
        { id: '2', campaign_id: 'camp1', status: 'rejected' },
      ];

      mockSupabase.from().select().eq().order.mockResolvedValue(
        mockSuccessResponse(mockHistory)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getHistory({ campaignId: 'camp1' });

      expect(result).toEqual(mockHistory);
    });
  });

  describe('create', () => {
    it('should create approval request', async () => {
      const mockApproval = {
        id: '1',
        campaign_id: 'camp1',
        approval_type: 'brief',
        approver_id: 'approver1',
        status: 'pending',
      };

      mockSupabase.from().insert().select().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.create({
        campaignId: 'camp1',
        approvalType: 'brief',
        approverId: 'approver1',
      });

      expect(result).toEqual(mockApproval);
    });

    it('should validate input', async () => {
      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });

      await expect(
        caller.create({
          campaignId: 'invalid-uuid',
          approvalType: 'brief',
          approverId: 'approver1',
        })
      ).rejects.toThrow();
    });

    it('should create audit log on create', async () => {
      const mockApproval = {
        id: '1',
        campaign_id: 'camp1',
        approval_type: 'brief',
        approver_id: 'approver1',
      };

      mockSupabase.from().insert().select().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.create({
        campaignId: 'camp1',
        approvalType: 'brief',
        approverId: 'approver1',
      });

      // Verify audit log was created
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  describe('approve', () => {
    it('should approve as designated approver', async () => {
      const mockApproval = {
        id: '1',
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
      const result = await caller.approve({ id: '1', comments: 'Looks good' });

      expect(result.status).toBe('approved');
    });

    it('should not allow non-approver to approve', async () => {
      const mockApproval = {
        id: '1',
        approver_id: 'someone-else',
        status: 'pending',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });

      await expect(
        caller.approve({ id: '1' })
      ).rejects.toThrow('Only the designated approver can approve this request');
    });

    it('should update status on approve', async () => {
      const mockApproval = {
        id: '1',
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
      await caller.approve({ id: '1' });

      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'approved' })
      );
    });

    it('should create audit log on approve', async () => {
      const mockApproval = {
        id: '1',
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
      await caller.approve({ id: '1' });

      // Verify audit log created
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  describe('reject', () => {
    it('should reject as designated approver', async () => {
      const mockApproval = {
        id: '1',
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
      const result = await caller.reject({ id: '1', reason: 'Not ready' });

      expect(result.status).toBe('rejected');
    });

    it('should not allow non-approver to reject', async () => {
      const mockApproval = {
        id: '1',
        approver_id: 'someone-else',
        status: 'pending',
      };

      mockSupabase.from().select().eq().single.mockResolvedValue(
        mockSuccessResponse(mockApproval)
      );

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });

      await expect(
        caller.reject({ id: '1', reason: 'Not ready' })
      ).rejects.toThrow('Only the designated approver can reject this request');
    });

    it('should require rejection reason', async () => {
      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });

      await expect(
        caller.reject({ id: '1', reason: '' })
      ).rejects.toThrow();
    });

    it('should create audit log on reject', async () => {
      const mockApproval = {
        id: '1',
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
      await caller.reject({ id: '1', reason: 'Not ready' });

      // Verify audit log created
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  describe('override', () => {
    it('should allow director to override', async () => {
      const mockApproval = {
        id: '1',
        status: 'pending',
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValue(
        mockSuccessResponse({ ...mockApproval, status: 'overridden' })
      );

      const caller = approvalsRouter.createCaller({ user: mockDirector, supabase: mockSupabase });
      const result = await caller.override({
        id: '1',
        newStatus: 'approved',
        comments: 'Override reason',
      });

      expect(result.status).toBe('overridden');
    });

    it('should not allow non-director to override', async () => {
      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });

      await expect(
        caller.override({
          id: '1',
          newStatus: 'approved',
          comments: 'Override reason',
        })
      ).rejects.toThrow();
    });

    it('should set override status', async () => {
      mockSupabase.from().update().eq().select().single.mockResolvedValue(
        mockSuccessResponse({ id: '1', status: 'overridden', override_status: 'approved' })
      );

      const caller = approvalsRouter.createCaller({ user: mockDirector, supabase: mockSupabase });
      await caller.override({
        id: '1',
        newStatus: 'approved',
        comments: 'Override reason',
      });

      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'overridden',
          override_status: 'approved',
        })
      );
    });

    it('should create audit log on override', async () => {
      mockSupabase.from().update().eq().select().single.mockResolvedValue(
        mockSuccessResponse({ id: '1', status: 'overridden' })
      );

      const caller = approvalsRouter.createCaller({ user: mockDirector, supabase: mockSupabase });
      await caller.override({
        id: '1',
        newStatus: 'approved',
        comments: 'Override reason',
      });

      // Verify audit log created
      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    });
  });

  describe('countPending', () => {
    it('should count pending approvals for user', async () => {
      mockSupabase.from().select().eq().eq.mockResolvedValue({
        count: 5,
        error: null,
      });

      const caller = approvalsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.countPending();

      expect(result).toBe(5);
    });
  });
});
