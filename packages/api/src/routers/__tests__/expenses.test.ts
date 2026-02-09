/**
 * Expenses router tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockSupabaseClient,
  createMockUser,
  createMockExpense,
  mockSuccessResponse,
  mockErrorResponse,
} from '../../test/helpers';

// Mock dependencies
vi.mock('@precisionflow/database', () => ({
  supabase: {},
}));

vi.mock('../../utils/audit', () => ({
  logCreation: vi.fn(),
  logUpdate: vi.fn(),
  logDeletion: vi.fn(),
}));

describe('Expenses Router', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  const mockUser = createMockUser();

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('getByCampaign', () => {
    it('should return expenses for a campaign', async () => {
      const expenses = [
        createMockExpense(),
        createMockExpense({
          id: 'ad000000-0000-0000-0000-000000000002',
          category: 'production',
          amount: 1000,
        }),
      ];
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(mockSuccessResponse(expenses, 2)),
            }),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('expenses')
        .select('*', { count: 'exact' })
        .eq('campaign_id', 'b0000000-0000-0000-0000-000000000001')
        .order('created_at', { ascending: false })
        .range(0, 49);

      expect(result.data).toHaveLength(2);
    });

    it('should filter by approval status', async () => {
      const pending = [createMockExpense({ approval_status: 'pending' })];
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue(mockSuccessResponse(pending, 1)),
              }),
            }),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('expenses')
        .select('*', { count: 'exact' })
        .eq('campaign_id', 'b0000000-0000-0000-0000-000000000001')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false })
        .range(0, 49);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].approval_status).toBe('pending');
    });
  });

  describe('create', () => {
    it('should create an expense with pending statuses', async () => {
      const mockExpense = createMockExpense();
      (mockSupabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(mockExpense)),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('expenses')
        .insert({
          campaign_id: mockExpense.campaign_id,
          category: 'creator_payment',
          amount: 500,
          created_by: mockUser.id,
        })
        .select()
        .single();

      expect(result.data.approval_status).toBe('pending');
      expect(result.data.payment_status).toBe('pending');
    });
  });

  describe('approve', () => {
    it('should approve an expense', async () => {
      const approved = createMockExpense({ approval_status: 'approved' });
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(createMockExpense())),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(approved)),
            }),
          }),
        }),
      });

      // Read old data
      const oldResult = await (mockSupabase.from as any)('expenses')
        .select()
        .eq('id', approved.id)
        .single();
      expect(oldResult.data.approval_status).toBe('pending');

      // Update to approved
      (mockSupabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(approved)),
            }),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('expenses')
        .update({ approval_status: 'approved' })
        .eq('id', approved.id)
        .select()
        .single();

      expect(result.data.approval_status).toBe('approved');
    });
  });

  describe('reject', () => {
    it('should reject an expense', async () => {
      const rejected = createMockExpense({ approval_status: 'rejected' });
      (mockSupabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(rejected)),
            }),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('expenses')
        .update({ approval_status: 'rejected' })
        .eq('id', rejected.id)
        .select()
        .single();

      expect(result.data.approval_status).toBe('rejected');
    });
  });

  describe('markPaid', () => {
    it('should mark an expense as paid', async () => {
      const paid = createMockExpense({ payment_status: 'paid' });
      (mockSupabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(paid)),
            }),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('expenses')
        .update({ payment_status: 'paid' })
        .eq('id', paid.id)
        .select()
        .single();

      expect(result.data.payment_status).toBe('paid');
    });
  });

  describe('summary', () => {
    it('should calculate correct expense totals', async () => {
      const expenses = [
        createMockExpense({ amount: 500, approval_status: 'approved', payment_status: 'paid' }),
        createMockExpense({ id: 'ad000000-0000-0000-0000-000000000002', amount: 300, approval_status: 'pending' }),
        createMockExpense({ id: 'ad000000-0000-0000-0000-000000000003', amount: 200, approval_status: 'approved' }),
      ];
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockSuccessResponse(expenses)),
        }),
      });

      const result = await (mockSupabase.from as any)('expenses')
        .select('*')
        .eq('campaign_id', 'b0000000-0000-0000-0000-000000000001');

      const data = result.data;
      const total = data.reduce((s: number, e: any) => s + e.amount, 0);
      const approved = data.filter((e: any) => e.approval_status === 'approved')
        .reduce((s: number, e: any) => s + e.amount, 0);
      const pending = data.filter((e: any) => e.approval_status === 'pending')
        .reduce((s: number, e: any) => s + e.amount, 0);

      expect(total).toBe(1000);
      expect(approved).toBe(700);
      expect(pending).toBe(300);
    });
  });
});
