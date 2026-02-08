/**
 * Tests for clients router
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clientsRouter } from '../clients';
import {
  createMockSupabaseClient,
  createMockUser,
  createMockClient,
  mockSuccessResponse,
  mockErrorResponse,
} from '../../test/helpers';

describe('Clients Router', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockUser: ReturnType<typeof createMockUser>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    mockUser = createMockUser();
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should list clients with default pagination', async () => {
      const mockClients = [createMockClient(), createMockClient()];
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(
                mockSuccessResponse(mockClients, 2)
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

      expect(result.clients).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter clients by tier', async () => {
      const mockClients = [createMockClient({ tier: 'gold' })];
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue(
                  mockSuccessResponse(mockClients, 1)
                ),
              }),
            }),
          }),
        }),
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.list({
        limit: 50,
        offset: 0,
        tier: 'gold',
      });

      expect(result.clients).toHaveLength(1);
      expect(result.clients[0].tier).toBe('gold');
    });

    it('should search clients by name', async () => {
      const mockClients = [createMockClient({ name: 'Acme Corp' })];
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockReturnValue({
                or: vi.fn().mockResolvedValue(
                  mockSuccessResponse(mockClients, 1)
                ),
              }),
            }),
          }),
        }),
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.list({
        limit: 50,
        offset: 0,
        search: 'Acme',
      });

      expect(result.clients).toHaveLength(1);
    });

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(
                mockErrorResponse('Database error')
              ),
            }),
          }),
        }),
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await expect(
        caller.list({ limit: 50, offset: 0 })
      ).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should get a client by ID', async () => {
      const mockClient = createMockClient();
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(
                mockSuccessResponse(mockClient)
              ),
            }),
          }),
        }),
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.getById({ id: mockClient.id });

      expect(result.id).toBe(mockClient.id);
      expect(result.name).toBe(mockClient.name);
    });

    it('should throw NOT_FOUND for non-existent client', async () => {
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
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await expect(
        caller.getById({ id: 'non-existent-id' })
      ).rejects.toThrow('NOT_FOUND');
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const newClient = createMockClient({
        name: 'New Client',
        email: 'client@example.com',
      });
      
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(
              mockSuccessResponse(newClient)
            ),
          }),
        }),
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.create({
        name: 'New Client',
        email: 'client@example.com',
      });

      expect(result.name).toBe('New Client');
      expect(result.email).toBe('client@example.com');
    });

    it('should assign account manager on creation', async () => {
      const newClient = createMockClient({
        account_manager_id: mockUser.id,
      });
      
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(
              mockSuccessResponse(newClient)
            ),
          }),
        }),
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.create({
        name: 'New Client',
        email: 'client@example.com',
      });

      expect(result.account_manager_id).toBe(mockUser.id);
    });

    it('should handle validation errors', async () => {
      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await expect(
        caller.create({
          name: '',
          email: 'invalid-email',
        } as any)
      ).rejects.toThrow();
    });

    it('should create audit log on client creation', async () => {
      const newClient = createMockClient();
      
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(
              mockSuccessResponse(newClient)
            ),
          }),
        }),
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await caller.create({
        name: 'Test Client',
        email: 'test@example.com',
      });

      // Verify audit log was called
      const insertCalls = (mockSupabase.from as any).mock.calls;
      const auditLogCall = insertCalls.find(
        (call: any) => call[0] === 'audit_logs'
      );
      expect(auditLogCall).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updatedClient = createMockClient({
        name: 'Updated Name',
        tier: 'gold',
      });
      
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  mockSuccessResponse(updatedClient)
                ),
              }),
            }),
          }),
        }),
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.update({
        id: updatedClient.id,
        name: 'Updated Name',
        tier: 'gold',
      });

      expect(result.name).toBe('Updated Name');
      expect(result.tier).toBe('gold');
    });

    it('should create audit log on client update', async () => {
      const oldClient = createMockClient({ name: 'Old Name' });
      const updatedClient = createMockClient({ name: 'New Name' });
      
      // Mock getById to return old client
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'clients') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(oldClient)
                  ),
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue(
                      mockSuccessResponse(updatedClient)
                    ),
                  }),
                }),
              }),
            }),
          };
        }
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(
                mockSuccessResponse({})
              ),
            }),
          }),
        };
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await caller.update({
        id: oldClient.id,
        name: 'New Name',
      });

      // Verify audit log was called
      const fromCalls = (mockSupabase.from as any).mock.calls;
      const auditLogCall = fromCalls.find(
        (call: any) => call[0] === 'audit_logs'
      );
      expect(auditLogCall).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should soft delete a client', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockSuccessResponse(null)),
        }),
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      const result = await caller.delete({
        id: 'client-id',
      });

      expect(result.success).toBe(true);
    });

    it('should create audit log on client deletion', async () => {
      const oldClient = createMockClient();
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'clients') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    mockSuccessResponse(oldClient)
                  ),
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue(mockSuccessResponse(null)),
            }),
          };
        }
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(
                mockSuccessResponse({})
              ),
            }),
          }),
        };
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await caller.delete({ id: oldClient.id });

      // Verify audit log was called
      const fromCalls = (mockSupabase.from as any).mock.calls;
      const auditLogCall = fromCalls.find(
        (call: any) => call[0] === 'audit_logs'
      );
      expect(auditLogCall).toBeDefined();
    });

    it('should handle delete errors', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(
            mockErrorResponse('Delete failed')
          ),
        }),
      } as any);

      const caller = clientsRouter.createCaller({
        user: mockUser,
        supabase: mockSupabase,
      });

      await expect(
        caller.delete({ id: 'client-id' })
      ).rejects.toThrow('Delete failed');
    });
  });
});
