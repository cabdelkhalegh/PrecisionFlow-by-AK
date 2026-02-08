/**
 * Tests for briefs router
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { briefsRouter } from '../briefs';
import {
  createMockSupabaseClient,
  createMockUser,
  createMockBrief,
  createMockCampaign,
  mockSuccessResponse,
  mockErrorResponse,
} from '../../test/helpers';

// Mock the AI package
vi.mock('@tikit/ai', () => ({
  parseBrief: vi.fn().mockResolvedValue({
    objectives: ['Test objective'],
    target_audience: 'Test audience',
    deliverables: [
      {
        type: 'Instagram Post',
        quantity: 5,
        description: 'Product posts',
        deadline: '2024-06-01',
      },
    ],
    timeline: 'Q2 2024',
    budget: '$50,000',
    kpis: ['Engagement', 'Reach'],
    missing_info: [],
  }),
  calculateRiskLevel: vi.fn().mockReturnValue('low'),
}));

describe('Briefs Router', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockUser: ReturnType<typeof createMockUser>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockUser = createMockUser();
    vi.clearAllMocks();
  });

  describe('listByCampaign', () => {
    it('should list briefs for a campaign', async () => {
      const mockBriefs = [createMockBrief(), createMockBrief({ id: 'd0000000-0000-0000-0000-000000000002' })];
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue(
                  mockSuccessResponse(mockBriefs, 2)
                ),
              }),
            }),
          }),
        }),
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.listByCampaign({
        campaignId: 'b0000000-0000-0000-0000-000000000001',
        limit: 50,
        offset: 0,
      });

      expect(result.briefs).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue(
                  mockErrorResponse('Database error')
                ),
              }),
            }),
          }),
        }),
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await expect(
        caller.listByCampaign({
          campaignId: 'b0000000-0000-0000-0000-000000000001',
          limit: 50,
          offset: 0,
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('getLatestByCampaign', () => {
    it('should get the latest brief for a campaign', async () => {
      const mockBrief = createMockBrief({ is_latest: true });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse(mockBrief)
                ),
              }),
            }),
          }),
        }),
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.getLatestByCampaign({
        campaignId: 'b0000000-0000-0000-0000-000000000001',
      });

      expect(result).toBeTruthy();
      expect(result?.is_latest).toBe(true);
    });

    it('should return null if no latest brief exists', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockErrorResponse('Not found', 'PGRST116')
                ),
              }),
            }),
          }),
        }),
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.getLatestByCampaign({
        campaignId: 'b0000000-0000-0000-0000-000000000001',
      });

      expect(result).toBeNull();
    });
  });

  describe('getById', () => {
    it('should get a brief by ID', async () => {
      const mockBrief = createMockBrief();
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(
                mockSuccessResponse(mockBrief)
              ),
            }),
          }),
        }),
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.getById({ id: mockBrief.id });

      expect(result.id).toBe(mockBrief.id);
    });

    it('should throw NOT_FOUND for non-existent brief', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(
                mockErrorResponse('Not found', 'PGRST116')
              ),
            }),
          }),
        }),
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await expect(
        caller.getById({ id: 'f0000000-0000-0000-0000-000000000099' })
      ).rejects.toThrow('Not found');
    });
  });

  describe('upload', () => {
    it('should upload a new brief (version 1)', async () => {
      const newBrief = createMockBrief({ version: 1, is_latest: true });
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'briefs') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue(
                    mockSuccessResponse([])
                  ),
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse(newBrief)
                ),
              }),
            }),
          };
        }
        return {};
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.upload({
        campaignId: 'b0000000-0000-0000-0000-000000000001',
        rawContent: 'Test brief content',
      });

      expect(result.version).toBe(1);
      expect(result.is_latest).toBe(true);
    });

    it('should upload a new version and mark previous as not latest', async () => {
      const existingBrief = createMockBrief({ version: 1 });
      const newBrief = createMockBrief({ version: 2, is_latest: true });
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'briefs') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue(
                    mockSuccessResponse([existingBrief])
                  ),
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue(
                  mockSuccessResponse(null)
                ),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse(newBrief)
                ),
              }),
            }),
          };
        }
        return {};
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.upload({
        campaignId: 'b0000000-0000-0000-0000-000000000001',
        rawContent: 'Updated brief content',
      });

      expect(result.version).toBe(2);
      expect(result.is_latest).toBe(true);
    });

    it('should call from with briefs table on upload', async () => {
      const newBrief = createMockBrief();
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'briefs') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue(
                    mockSuccessResponse([])
                  ),
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse(newBrief)
                ),
              }),
            }),
          };
        }
        return {};
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await caller.upload({
        campaignId: 'b0000000-0000-0000-0000-000000000001',
        rawContent: 'Test content',
      });

      const fromCalls = (mockSupabase.from as any).mock.calls;
      const briefsCall = fromCalls.find(
        (call: any) => call[0] === 'briefs'
      );
      expect(briefsCall).toBeDefined();
    });
  });

  describe('processWithAI', () => {
    it('should process brief with AI and extract structured data', async () => {
      const brief = createMockBrief({ raw_content: 'Test brief content' });
      const processedBrief = createMockBrief({
        ...brief,
        structured_data: {
          objectives: ['Test objective'],
          target_audience: 'Test audience',
          deliverables: [],
          timeline: 'Q2 2024',
          budget: '$50,000',
          kpis: [],
          missing_info: [],
        },
      });
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'briefs') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(brief)
                  ),
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(processedBrief)
                  ),
                }),
              }),
            }),
          };
        }
        if (table === 'campaigns') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue(
                mockSuccessResponse(null)
              ),
            }),
          };
        }
        return {};
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.processWithAI({ id: brief.id });

      expect(result.structured_data).toBeTruthy();
    });

    it('should handle AI processing errors gracefully', async () => {
      const { parseBrief } = await import('@tikit/ai');
      vi.mocked(parseBrief).mockRejectedValueOnce(new Error('AI service unavailable'));

      const brief = createMockBrief({ raw_content: 'Test brief content' });
      const processedBrief = createMockBrief({
        ...brief,
        structured_data: {
          objectives: ['AI processing temporarily unavailable - please review manually'],
          target_audience: 'To be determined',
          deliverables: [],
          timeline: 'TBD',
          budget: 'TBD',
          kpis: [],
          missing_info: ['AI processing failed - manual review required'],
        },
      });
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'briefs') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(brief)
                  ),
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(processedBrief)
                  ),
                }),
              }),
            }),
          };
        }
        if (table === 'campaigns') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue(
                mockSuccessResponse(null)
              ),
            }),
          };
        }
        return {};
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.processWithAI({ id: brief.id });

      expect(result.structured_data).toBeTruthy();
      expect(result.structured_data.missing_info).toContain('AI processing failed - manual review required');
    });

    it('should throw error if brief has no content', async () => {
      const brief = createMockBrief({ raw_content: null });
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(
                mockSuccessResponse(brief)
              ),
            }),
          }),
        }),
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await expect(
        caller.processWithAI({ id: brief.id })
      ).rejects.toThrow('Brief has no raw content to process');
    });

    it('should update campaign risk level based on missing info', async () => {
      const brief = createMockBrief({ raw_content: 'Test content', campaign_id: 'b0000000-0000-0000-0000-000000000001' });
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'briefs') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(brief)
                  ),
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(brief)
                  ),
                }),
              }),
            }),
          };
        }
        if (table === 'campaigns') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue(
                mockSuccessResponse(null)
              ),
            }),
          };
        }
        return {};
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await caller.processWithAI({ id: brief.id });

      // Verify campaign update was called
      const fromCalls = (mockSupabase.from as any).mock.calls;
      const campaignCall = fromCalls.find((call: any) => call[0] === 'campaigns');
      expect(campaignCall).toBeDefined();
    });
  });

  describe('updateStructuredData', () => {
    it('should update brief with structured data', async () => {
      const structuredData = {
        objectives: ['Test objective'],
        target_audience: 'Test audience',
        deliverables: [
          {
            type: 'Instagram Post',
            quantity: 5,
            description: 'Test posts',
            deadline: '2024-06-01',
          },
        ],
        timeline: 'Q2 2024',
        budget: '$50,000',
        kpis: ['Engagement'],
        missing_info: [],
      };
      
      const updatedBrief = createMockBrief({ structured_data: structuredData });
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(
                mockSuccessResponse(updatedBrief)
              ),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse(updatedBrief)
                ),
              }),
            }),
          }),
        }),
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.updateStructuredData({
        id: 'd0000000-0000-0000-0000-000000000001',
        structuredData,
      });

      expect(result.structured_data).toEqual(structuredData);
    });
  });

  describe('approve', () => {
    it('should approve a brief', async () => {
      const approvedBrief = createMockBrief({
        is_approved: true,
        approved_by: mockUser.id,
      });
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(
                mockSuccessResponse(approvedBrief)
              ),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse(approvedBrief)
                ),
              }),
            }),
          }),
        }),
      });

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.approve({
        id: 'd0000000-0000-0000-0000-000000000001',
        comments: 'Looks good!',
      });

      expect(result.is_approved).toBe(true);
      expect(result.approved_by).toBe(mockUser.id);
    });
  });
});
