/**
 * Content Artifacts Router Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, createMockUser, createMockContentArtifact, mockSuccessResponse, mockErrorResponse } from '../../test/helpers';
import { contentArtifactsRouter } from '../contentArtifacts';

describe('ContentArtifacts Router', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockUser: ReturnType<typeof createMockUser>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockUser = createMockUser();
    vi.clearAllMocks();
  });

  describe('upload', () => {
    it('should upload a new artifact', async () => {
      const mockArtifact = createMockContentArtifact();

      // First call: get existing versions
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockSuccessResponse([])),
              }),
            }),
          }),
        }),
      });

      // Second call: insert new artifact
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(mockArtifact)),
          }),
        }),
      });

      // Third call: update task status (for script type)
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockSuccessResponse(null)),
        }),
      });

      const caller = contentArtifactsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.upload({
        content_task_id: 'aa000000-0000-0000-0000-000000000001',
        artifact_type: 'script',
        text_content: 'Opening scene: Creator walks into frame...',
      });

      expect(result).toEqual(mockArtifact);
    });

    it('should auto-increment version number', async () => {
      const existing = [{ id: 'ab000000-0000-0000-0000-000000000001', version: 2 }];

      // First call: get existing versions
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockSuccessResponse(existing)),
              }),
            }),
          }),
        }),
      });

      // Second call: mark old versions as not latest
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockSuccessResponse(null)),
          }),
        }),
      });

      // Third call: insert new version
      const insertSpy = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockContentArtifact({ version: 3 }))),
        }),
      });
      mockSupabase.from.mockReturnValueOnce({ insert: insertSpy });

      // Fourth call: update task status
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockSuccessResponse(null)),
        }),
      });

      const caller = contentArtifactsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.upload({
        content_task_id: 'aa000000-0000-0000-0000-000000000001',
        artifact_type: 'script',
        text_content: 'Updated script v3',
      });

      expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
        version: 3,
        is_latest: true,
        previous_version_id: 'ab000000-0000-0000-0000-000000000001',
      }));
    });

    it('should update task status for draft artifact', async () => {
      // Get existing versions
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockSuccessResponse([])),
              }),
            }),
          }),
        }),
      });

      // Insert
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockContentArtifact({ artifact_type: 'draft' }))),
          }),
        }),
      });

      // Update task status
      const updateTaskSpy = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockSuccessResponse(null)),
      });
      mockSupabase.from.mockReturnValueOnce({ update: updateTaskSpy });

      const caller = contentArtifactsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.upload({
        content_task_id: 'aa000000-0000-0000-0000-000000000001',
        artifact_type: 'draft',
        file_url: 'https://storage.example.com/drafts/video.mp4',
      });

      expect(updateTaskSpy).toHaveBeenCalledWith({ status: 'draft_submitted' });
    });
  });

  describe('getByTask', () => {
    it('should get all artifacts for a task', async () => {
      const artifacts = [
        createMockContentArtifact(),
        createMockContentArtifact({ id: 'ab000000-0000-0000-0000-000000000002', artifact_type: 'draft' }),
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(mockSuccessResponse(artifacts)),
            }),
          }),
        }),
      });

      const caller = contentArtifactsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getByTask({ content_task_id: 'aa000000-0000-0000-0000-000000000001' });

      expect(result).toHaveLength(2);
    });

    it('should filter artifacts by type', async () => {
      const eqSpy = vi.fn().mockResolvedValue(mockSuccessResponse([createMockContentArtifact()]));

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

      const caller = contentArtifactsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      await caller.getByTask({ content_task_id: 'aa000000-0000-0000-0000-000000000001', artifact_type: 'script' });

      expect(eqSpy).toHaveBeenCalledWith('artifact_type', 'script');
    });
  });

  describe('getLatest', () => {
    it('should get latest artifact of type', async () => {
      const latest = createMockContentArtifact({ version: 3, is_latest: true });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockSuccessResponse(latest)),
                }),
              }),
            }),
          }),
        }),
      });

      const caller = contentArtifactsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getLatest({
        content_task_id: 'aa000000-0000-0000-0000-000000000001',
        artifact_type: 'script',
      });

      expect(result?.version).toBe(3);
      expect(result?.is_latest).toBe(true);
    });

    it('should return null when no artifact exists', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Not found', code: 'PGRST116', details: '', hint: '' },
                    count: null,
                    status: 404,
                    statusText: 'Not Found',
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const caller = contentArtifactsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getLatest({
        content_task_id: 'aa000000-0000-0000-0000-000000000001',
        artifact_type: 'draft',
      });

      expect(result).toBeNull();
    });
  });

  describe('approve', () => {
    it('should approve an artifact', async () => {
      const approved = createMockContentArtifact({ status: 'approved' });

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse(approved)),
              }),
            }),
          }),
        }),
      });

      const caller = contentArtifactsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.approve({
        id: 'ab000000-0000-0000-0000-000000000001',
        comments: 'Looks great!',
      });

      expect((result as any).status).toBe('approved');
    });
  });

  describe('requestChanges', () => {
    it('should request changes on an artifact', async () => {
      const changed = createMockContentArtifact({ status: 'changes_requested' });

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockSuccessResponse(changed)),
              }),
            }),
          }),
        }),
      });

      const caller = contentArtifactsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.requestChanges({
        id: 'ab000000-0000-0000-0000-000000000001',
        comments: 'Fix the audio levels',
      });

      expect((result as any).status).toBe('changes_requested');
    });
  });

  describe('getVersionHistory', () => {
    it('should get full version history', async () => {
      const versions = [
        createMockContentArtifact({ version: 3, is_latest: true }),
        createMockContentArtifact({ id: 'ab000000-0000-0000-0000-000000000002', version: 2, is_latest: false }),
        createMockContentArtifact({ id: 'ab000000-0000-0000-0000-000000000003', version: 1, is_latest: false }),
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue(mockSuccessResponse(versions)),
              }),
            }),
          }),
        }),
      });

      const caller = contentArtifactsRouter.createCaller({ user: mockUser, supabase: mockSupabase });
      const result = await caller.getVersionHistory({
        content_task_id: 'aa000000-0000-0000-0000-000000000001',
        artifact_type: 'script',
      });

      expect(result).toHaveLength(3);
      expect(result[0].version).toBe(3);
      expect(result[0].is_latest).toBe(true);
    });
  });
});
