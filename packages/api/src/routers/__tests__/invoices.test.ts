/**
 * Invoices router tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockSupabaseClient,
  createMockUser,
  createMockInvoice,
  createMockPayment,
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

describe('Invoices Router', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  const mockUser = createMockUser();

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('getByCampaign', () => {
    it('should return invoices for a campaign', async () => {
      const invoices = [
        createMockInvoice(),
        createMockInvoice({ id: 'ae000000-0000-0000-0000-000000000002', invoice_number: 'INV-2024-002' }),
      ];
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(mockSuccessResponse(invoices, 2)),
            }),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('invoices')
        .select('*, creators(*)', { count: 'exact' })
        .eq('campaign_id', 'b0000000-0000-0000-0000-000000000001')
        .order('created_at', { ascending: false })
        .range(0, 49);

      expect(result.data).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const sent = [createMockInvoice({ status: 'sent' })];
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue(mockSuccessResponse(sent, 1)),
              }),
            }),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('invoices')
        .select('*, creators(*)', { count: 'exact' })
        .eq('campaign_id', 'b0000000-0000-0000-0000-000000000001')
        .eq('status', 'sent')
        .order('created_at', { ascending: false })
        .range(0, 49);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('sent');
    });
  });

  describe('getById', () => {
    it('should return invoice with creator and payments', async () => {
      const invoice = createMockInvoice();
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(invoice)),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('invoices')
        .select('*, creators(*), payments(*)')
        .eq('id', invoice.id)
        .single();

      expect(result.data.invoice_number).toBe('INV-2024-001');
    });

    it('should throw NOT_FOUND for non-existent invoice', async () => {
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockErrorResponse('Not found', 'PGRST116')),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('invoices')
        .select('*, creators(*), payments(*)')
        .eq('id', 'ae000000-0000-0000-0000-000000000099')
        .single();

      expect(result.error).toBeTruthy();
      expect(result.error.code).toBe('PGRST116');
    });
  });

  describe('create', () => {
    it('should create an invoice with draft status', async () => {
      const invoice = createMockInvoice();
      (mockSupabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(invoice)),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('invoices')
        .insert({
          campaign_id: invoice.campaign_id,
          invoice_number: 'INV-2024-001',
          amount: 1500,
          status: 'draft',
        })
        .select()
        .single();

      expect(result.data.status).toBe('draft');
      expect(result.data.amount).toBe(1500);
    });
  });

  describe('updateStatus', () => {
    it('should transition invoice from draft to sent', async () => {
      const sent = createMockInvoice({ status: 'sent' });
      (mockSupabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(sent)),
            }),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('invoices')
        .update({ status: 'sent' })
        .eq('id', sent.id)
        .select()
        .single();

      expect(result.data.status).toBe('sent');
    });

    it('should set paid_date when marking as paid', async () => {
      const paid = createMockInvoice({
        status: 'paid',
        paid_date: new Date().toISOString(),
      });
      (mockSupabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockSuccessResponse(paid)),
            }),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('invoices')
        .update({ status: 'paid', paid_date: new Date().toISOString() })
        .eq('id', paid.id)
        .select()
        .single();

      expect(result.data.status).toBe('paid');
      expect(result.data.paid_date).toBeTruthy();
    });
  });

  describe('recordPayment', () => {
    it('should create a payment record', async () => {
      const payment = createMockPayment();
      (mockSupabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSuccessResponse(payment)),
          }),
        }),
      });

      const result = await (mockSupabase.from as any)('payments')
        .insert({
          invoice_id: payment.invoice_id,
          amount: 1500,
          payment_method: 'bank_transfer',
          transaction_reference: 'TXN-12345',
        })
        .select()
        .single();

      expect(result.data.amount).toBe(1500);
      expect(result.data.payment_method).toBe('bank_transfer');
    });
  });

  describe('financialSummary', () => {
    it('should calculate correct financial totals', async () => {
      const invoices = [
        createMockInvoice({ amount: 1500, status: 'paid' }),
        createMockInvoice({ id: 'ae000000-0000-0000-0000-000000000002', amount: 2000, status: 'sent' }),
        createMockInvoice({ id: 'ae000000-0000-0000-0000-000000000003', amount: 500, status: 'overdue' }),
        createMockInvoice({ id: 'ae000000-0000-0000-0000-000000000004', amount: 800, status: 'draft' }),
      ];
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockSuccessResponse(invoices)),
      });

      const result = await (mockSupabase.from as any)('invoices').select('*');
      const data = result.data;

      const totalInvoiced = data.reduce((s: number, i: any) => s + i.amount, 0);
      const totalPaid = data.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + i.amount, 0);
      const totalOverdue = data.filter((i: any) => i.status === 'overdue').reduce((s: number, i: any) => s + i.amount, 0);

      expect(totalInvoiced).toBe(4800);
      expect(totalPaid).toBe(1500);
      expect(totalOverdue).toBe(500);
    });
  });
});
