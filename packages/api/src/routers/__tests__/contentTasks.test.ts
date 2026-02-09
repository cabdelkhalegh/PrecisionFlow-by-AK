/**
 * Content Tasks Router Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, createMockUser, createMockContentTask, mockSuccessResponse, mockErrorResponse } from '../../test/helpers';
import { contentTasksRouter } from '../contentTasks';

describe('ContentTasks Router', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockUser: ReturnType<typeof createMockUser>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockUser = createMockUser();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a content task', async () => {
      const mockTask = createMockContentTask();

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(mockTask)),
          }),
        }),
      });

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.create({
        campaign_id: 'b0000000-0000-0000-0000-000000000001',
        creator_id: 'f0000000-0000-0000-0000-000000000001',
        title: 'Test Content Task',
        deliverable_type: 'tiktok_video',
        deadline: '2024-06-01T00:00:00.000Z',
      });

      expect(result).toEqual(mockTask);
      expect(mockSupabase.from).toHaveBeenCalledWith('content_tasks');
    });

    it('should set initial status to assigned', async () => {
      const insertSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockContentTask())),
        }),
      });

      mockSupabase.from.mockReturnValue({ insert: insertSpy });

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.create({
        campaign_id: 'b0000000-0000-0000-0000-000000000001',
        creator_id: 'f0000000-0000-0000-0000-000000000001',
        title: 'Test Task',
        deliverable_type: 'instagram_reel',
        deadline: '2024-06-01T00:00:00.000Z',
      });

      expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
        status: 'assigned',
        payment_status: 'pending',
        assigned_by: mockUser.id,
        created_by: mockUser.id,
      }));
    });

    it('should reject empty title', async () => {
      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await expect(caller.create({
        campaign_id: 'b0000000-0000-0000-0000-000000000001',
        creator_id: 'f0000000-0000-0000-0000-000000000001',
        title: '',
        deliverable_type: 'tiktok_video',
        deadline: '2024-06-01T00:00:00.000Z',
      } as any)).rejects.toThrow();
    });
  });

  describe('getByCampaign', () => {
    it('should get tasks for a campaign', async () => {
      const tasks = [createMockContentTask(), createMockContentTask({ id: 'aa000000-0000-0000-0000-000000000002' })];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(mockSuccessResponse(tasks)),
            }),
          }),
        }),
      });

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getByCampaign({ campaign_id: 'b0000000-0000-0000-0000-000000000001' });

      expect(result).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      const eqSpy = vi.fn().mockResolvedValue(mockSuccessResponse([createMockContentTask({ status: 'script_submitted' })]));

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                eq: eqSpy,
              }),
            }),
          }),
        }),
      });

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.getByCampaign({ campaign_id: 'b0000000-0000-0000-0000-000000000001', status: 'script_submitted' });

      expect(eqSpy).toHaveBeenCalledWith('status', 'script_submitted');
    });
  });

  describe('getById', () => {
    it('should get task by ID with related data', async () => {
      const task = createMockContentTask();

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(task)),
            }),
          }),
        }),
      });

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getById({ id: 'aa000000-0000-0000-0000-000000000001' });

      expect(result).toEqual(task);
    });

    it('should throw for non-existent task', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockErrorResponse('Not found')),
            }),
          }),
        }),
      });

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await expect(caller.getById({ id: 'aa000000-0000-0000-0000-000000000099' })).rejects.toThrow();
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      const updated = createMockContentTask({ status: 'script_approved' });

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

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.updateStatus({
        id: 'aa000000-0000-0000-0000-000000000001',
        status: 'script_approved',
      });

      expect(result.status).toBe('script_approved');
    });

    it('should include feedback when provided', async () => {
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockContentTask())),
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({ update: updateSpy });

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.updateStatus({
        id: 'aa000000-0000-0000-0000-000000000001',
        status: 'changes_requested',
        feedback: 'Please adjust the intro',
      });

      expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
        status: 'changes_requested',
        feedback: 'Please adjust the intro',
      }));
    });
  });

  describe('approveScript', () => {
    it('should approve script (Gate 1)', async () => {
      const approved = createMockContentTask({
        status: 'script_approved',
        script_approved_at: new Date().toISOString(),
      });

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

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.approveScript({
        id: 'aa000000-0000-0000-0000-000000000001',
        approved: true,
      });

      expect(result.status).toBe('script_approved');
    });

    it('should request changes when script not approved', async () => {
      const rejected = createMockContentTask({ status: 'changes_requested' });

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

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.approveScript({
        id: 'aa000000-0000-0000-0000-000000000001',
        approved: false,
        comments: 'Needs more detail in the intro',
      });

      expect(result.status).toBe('changes_requested');
    });
  });

  describe('approveDraft', () => {
    it('should approve draft (Gate 2)', async () => {
      const approved = createMockContentTask({ status: 'draft_approved' });

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

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.approveDraft({
        id: 'aa000000-0000-0000-0000-000000000001',
        approved: true,
      });

      expect(result.status).toBe('draft_approved');
    });
  });

  describe('approveFinal', () => {
    it('should approve final content (Gate 3)', async () => {
      const approved = createMockContentTask({ status: 'approved' });

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

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.approveFinal({
        id: 'aa000000-0000-0000-0000-000000000001',
        approved: true,
      });

      expect(result.status).toBe('approved');
    });
  });

  describe('requestChanges', () => {
    it('should request changes with revision notes', async () => {
      // First call: get existing notes
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse({ revision_notes: ['First note'] })),
          }),
        }),
      });

      // Second call: update with appended notes
      const updateSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockContentTask({ status: 'changes_requested' }))),
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValueOnce({ update: updateSpy });

      const caller = contentTasksRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.requestChanges({
        id: 'aa000000-0000-0000-0000-000000000001',
        revision_notes: 'Please fix the lighting',
      });

      expect(result.status).toBe('changes_requested');
      expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
        status: 'changes_requested',
        revision_notes: ['First note', 'Please fix the lighting'],
        feedback: 'Please fix the lighting',
      }));
    });
  });
});
