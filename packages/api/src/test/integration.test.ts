/**
 * Integration tests for Phase 2 - Core Campaign Management
 * Tests relationships between campaigns, clients, and briefs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { campaignsRouter } from '../routers/campaigns';
import { clientsRouter } from '../routers/clients';
import { briefsRouter } from '../routers/briefs';
import {
  createMockSupabaseClient,
  createMockUser,
  createMockCampaign,
  createMockClient,
  createMockBrief,
  mockSuccessResponse,
} from './helpers';

describe('Phase 2 Integration Tests', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockUser: ReturnType<typeof createMockUser>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockUser = createMockUser();
    vi.clearAllMocks();
  });

  describe('Campaign-Client Relationship', () => {
    it('should create campaign with valid client_id', async () => {
      const mockClient = createMockClient();
      const mockCampaign = createMockCampaign({ client_id: mockClient.id });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'campaigns') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse(mockCampaign)
                ),
              }),
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse({})
                ),
              }),
            }),
          };
        }
        return {};
      } as any);

      const caller = campaignsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.create({
        name: 'Test Campaign',
        clientId: mockClient.id,
        budget: 10000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(result.client_id).toBe(mockClient.id);
    });

    it('should list campaigns filtered by client', async () => {
      const mockClient = createMockClient();
      const mockCampaigns = [
        createMockCampaign({ client_id: mockClient.id }),
        createMockCampaign({ id: 'campaign-456', client_id: mockClient.id }),
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue(
                  mockSuccessResponse(mockCampaigns, 2)
                ),
              }),
            }),
          }),
        }),
      } as any);

      const caller = campaignsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.list({
        limit: 50,
        offset: 0,
        clientId: mockClient.id,
      });

      expect(result.campaigns).toHaveLength(2);
      expect(result.campaigns[0].client_id).toBe(mockClient.id);
    });
  });

  describe('Campaign-Brief Relationship', () => {
    it('should create brief linked to campaign', async () => {
      const mockCampaign = createMockCampaign();
      const mockBrief = createMockBrief({ campaign_id: mockCampaign.id });

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
                  mockSuccessResponse(mockBrief)
                ),
              }),
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse({})
                ),
              }),
            }),
          };
        }
        return {};
      } as any);

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.upload({
        campaignId: mockCampaign.id,
        rawContent: 'Test brief content',
      });

      expect(result.campaign_id).toBe(mockCampaign.id);
    });

    it('should get latest brief for campaign', async () => {
      const mockCampaign = createMockCampaign();
      const mockBrief = createMockBrief({
        campaign_id: mockCampaign.id,
        is_latest: true,
      });

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
      } as any);

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.getLatestByCampaign({
        campaignId: mockCampaign.id,
      });

      expect(result).toBeTruthy();
      expect(result?.campaign_id).toBe(mockCampaign.id);
      expect(result?.is_latest).toBe(true);
    });

    it('should update campaign risk when brief is processed', async () => {
      const mockCampaign = createMockCampaign({ risk_level: 'medium' });
      const mockBrief = createMockBrief({
        campaign_id: mockCampaign.id,
        raw_content: 'Test content',
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'briefs') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(mockBrief)
                  ),
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(mockBrief)
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
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse({})
                ),
              }),
            }),
          };
        }
        return {};
      } as any);

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await caller.processWithAI({ id: mockBrief.id });

      // Verify campaign update was called
      const fromCalls = (mockSupabase.from as any).mock.calls;
      const campaignCall = fromCalls.find((call: any) => call[0] === 'campaigns');
      expect(campaignCall).toBeDefined();
    });
  });

  describe('Audit Trail Integration', () => {
    it('should create audit log when campaign is created', async () => {
      const mockCampaign = createMockCampaign();

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'campaigns') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse(mockCampaign)
                ),
              }),
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse({
                    id: 'audit-123',
                    table_name: 'campaigns',
                    record_id: mockCampaign.id,
                    action: 'created',
                    user_id: mockUser.id,
                  })
                ),
              }),
            }),
          };
        }
        return {};
      } as any);

      const caller = campaignsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await caller.create({
        name: 'Test Campaign',
        clientId: 'client-123',
        budget: 10000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      const fromCalls = (mockSupabase.from as any).mock.calls;
      const auditLogCalls = fromCalls.filter((call: any) => call[0] === 'audit_logs');
      expect(auditLogCalls.length).toBeGreaterThan(0);
    });

    it('should create audit log when client is created', async () => {
      const mockClient = createMockClient();

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'clients') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse(mockClient)
                ),
              }),
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse({})
                ),
              }),
            }),
          };
        }
        return {};
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await caller.create({
        name: 'Test Client',
        email: 'client@example.com',
      });

      const fromCalls = (mockSupabase.from as any).mock.calls;
      const auditLogCalls = fromCalls.filter((call: any) => call[0] === 'audit_logs');
      expect(auditLogCalls.length).toBeGreaterThan(0);
    });

    it('should create audit log when brief is uploaded', async () => {
      const mockBrief = createMockBrief();

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
                  mockSuccessResponse(mockBrief)
                ),
              }),
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse({})
                ),
              }),
            }),
          };
        }
        return {};
      } as any);

      const caller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await caller.upload({
        campaignId: 'campaign-123',
        rawContent: 'Test content',
      });

      const fromCalls = (mockSupabase.from as any).mock.calls;
      const auditLogCalls = fromCalls.filter((call: any) => call[0] === 'audit_logs');
      expect(auditLogCalls.length).toBeGreaterThan(0);
    });

    it('should capture user and timestamp in audit logs', async () => {
      const mockCampaign = createMockCampaign();
      let capturedAuditLog: any = null;

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'campaigns') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse(mockCampaign)
                ),
              }),
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: vi.fn().mockImplementation((data: any) => {
              capturedAuditLog = data;
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse({})
                  ),
                }),
              };
            }),
          };
        }
        return {};
      } as any);

      const caller = campaignsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await caller.create({
        name: 'Test Campaign',
        clientId: 'client-123',
        budget: 10000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(capturedAuditLog).toBeTruthy();
      expect(capturedAuditLog.user_id).toBe(mockUser.id);
      expect(capturedAuditLog.timestamp).toBeTruthy();
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity between campaign and client', async () => {
      const mockClient = createMockClient();
      const mockCampaign = createMockCampaign({ client_id: mockClient.id });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'campaigns') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(mockCampaign)
                  ),
                }),
              }),
            }),
          };
        }
        if (table === 'clients') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(mockClient)
                  ),
                }),
              }),
            }),
          };
        }
        return {};
      } as any);

      const campaignCaller = campaignsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const clientCaller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const campaign = await campaignCaller.getById({ id: mockCampaign.id });
      const client = await clientCaller.getById({ id: campaign.client_id });

      expect(client.id).toBe(campaign.client_id);
    });

    it('should maintain referential integrity between campaign and brief', async () => {
      const mockCampaign = createMockCampaign();
      const mockBrief = createMockBrief({ campaign_id: mockCampaign.id });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'campaigns') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(mockCampaign)
                  ),
                }),
              }),
            }),
          };
        }
        if (table === 'briefs') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(mockBrief)
                  ),
                }),
              }),
            }),
          };
        }
        return {};
      } as any);

      const campaignCaller = campaignsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const briefCaller = briefsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const brief = await briefCaller.getById({ id: mockBrief.id });
      const campaign = await campaignCaller.getById({ id: brief.campaign_id });

      expect(campaign.id).toBe(brief.campaign_id);
    });
  });

  describe('Soft Delete Behavior', () => {
    it('should exclude soft-deleted campaigns from list', async () => {
      const activeCampaign = createMockCampaign();
      const deletedCampaign = createMockCampaign({
        id: 'campaign-deleted',
        deleted_at: '2024-01-01T00:00:00Z',
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(
                mockSuccessResponse([activeCampaign], 1)
              ),
            }),
          }),
        }),
      } as any);

      const caller = campaignsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.list({ limit: 50, offset: 0 });

      expect(result.campaigns).toHaveLength(1);
      expect(result.campaigns[0].deleted_at).toBeNull();
    });

    it('should exclude soft-deleted clients from list', async () => {
      const activeClient = createMockClient();

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(
                mockSuccessResponse([activeClient], 1)
              ),
            }),
          }),
        }),
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.list({ limit: 50, offset: 0 });

      expect(result.clients).toHaveLength(1);
      expect(result.clients[0].deleted_at).toBeFalsy();
    });
  });
});
