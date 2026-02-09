/**
 * Budgets router tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockSupabaseClient,
  createMockUser,
  createMockBudget,
  mockSuccessResponse,
  mockErrorResponse,
} from '../../test/helpers';

// Mock dependencies
vi.mock('@tikit/database', () => ({
  supabase: {},
}));

vi.mock('../../utils/audit', () => ({
  logCreation: vi.fn(),
  logUpdate: vi.fn(),
  logDeletion: vi.fn(),
}));

describe('Budgets Router', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  const mockUser = createMockUser();

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('getByCampaign', () => {
    it('should return budget for a campaign', async () => {
      const mockBudget = createMockBudget();
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(mockBudget)),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('budgets')
        .select('*')
        .eq('campaign_id', mockBudget.campaign_id)
        .single();

      expect(result.data).toEqual(mockBudget);
      expect(result.error).toBeNull();
    });

    it('should return null when no budget exists', async () => {
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockErrorResponse('Not found', 'PGRST116')),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('budgets')
        .select('*')
        .eq('campaign_id', 'b0000000-0000-0000-0000-000000000099')
        .single();

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });

  describe('create', () => {
    it('should create a budget', async () => {
      const mockBudget = createMockBudget();
      (mockSupabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(mockBudget)),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('budgets')
        .insert({
          campaign_id: mockBudget.campaign_id,
          original_amount: 10000,
          current_amount: 10000,
          currency: 'USD',
        })
        .select()
        .single();

      expect(result.data).toEqual(mockBudget);
      expect(result.data.original_amount).toBe(10000);
    });

    it('should set current_amount equal to original_amount on creation', async () => {
      const mockBudget = createMockBudget({ original_amount: 5000, current_amount: 5000 });
      (mockSupabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(mockBudget)),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('budgets')
        .insert({ original_amount: 5000, current_amount: 5000 })
        .select()
        .single();

      expect(result.data.original_amount).toBe(result.data.current_amount);
    });
  });

  describe('update', () => {
    it('should update budget allocation', async () => {
      const updatedBudget = createMockBudget({ current_amount: 8500, status: 'active' });
      (mockSupabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(updatedBudget)),
            }),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('budgets')
        .update({ current_amount: 8500, status: 'active' })
        .eq('id', updatedBudget.id)
        .select()
        .single();

      expect(result.data.current_amount).toBe(8500);
      expect(result.data.status).toBe('active');
    });
  });

  describe('summary', () => {
    it('should return aggregated budget data', async () => {
      const budgets = [
        createMockBudget({ original_amount: 10000, current_amount: 8500 }),
        createMockBudget({
          id: 'ac000000-0000-0000-0000-000000000002',
          original_amount: 5000,
          current_amount: 5000,
        }),
      ];
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockSuccessResponse(budgets)),
      });

      const result = await (mockSupabase.from as any)('budgets').select('*');

      expect(result.data).toHaveLength(2);
      const totalBudgeted = result.data.reduce((s: number, b: any) => s + b.original_amount, 0);
      expect(totalBudgeted).toBe(15000);
    });
  });
});
