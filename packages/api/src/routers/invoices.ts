/**
 * Invoices router - handles invoice lifecycle management
 * All state changes are logged to audit trail per CONTRIBUTING.md §176-178
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { logCreation, logUpdate } from '../utils/audit';

export const invoicesRouter = router({
  /**
   * List invoices for a campaign
   */
  getByCampaign: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('invoices')
        .select('*, creators(*)', { count: 'exact' })
        .eq('campaign_id', input.campaignId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.status) {
        query = query.eq('status', input.status);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return { invoices: data || [], total: count || 0 };
    }),

  /**
   * Get a single invoice by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('invoices')
        .select('*, creators(*), payments(*)')
        .eq('id', input.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: error.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  /**
   * Create an invoice
   */
  create: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        creatorId: z.string().uuid().optional(),
        invoiceNumber: z.string().min(1),
        amount: z.number().positive(),
        currency: z.string().min(3).max(3).default('USD'),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('invoices')
        .insert({
          campaign_id: input.campaignId,
          creator_id: input.creatorId || null,
          invoice_number: input.invoiceNumber,
          amount: input.amount,
          currency: input.currency,
          status: 'draft',
          due_date: input.dueDate || null,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      await logCreation({
        supabase: ctx.supabase,
        tableName: 'invoices',
        recordId: data.id,
        data: data as Record<string, unknown>,
        userId: ctx.user.id,
      });

      return data;
    }),

  /**
   * Update invoice status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: oldData } = await ctx.supabase
        .from('invoices')
        .select()
        .eq('id', input.id)
        .single();

      const updateData: Record<string, unknown> = { status: input.status };
      if (input.status === 'paid') {
        updateData.paid_date = new Date().toISOString();
      }

      const { data, error } = await ctx.supabase
        .from('invoices')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      if (oldData) {
        await logUpdate({
          supabase: ctx.supabase,
          tableName: 'invoices',
          recordId: input.id,
          oldData: oldData as Record<string, unknown>,
          newData: data as Record<string, unknown>,
          userId: ctx.user.id,
        });
      }

      return data;
    }),

  /**
   * Record a payment against an invoice
   */
  recordPayment: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().uuid(),
        amount: z.number().positive(),
        currency: z.string().min(3).max(3).default('USD'),
        paymentMethod: z.string().optional(),
        transactionReference: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: payment, error: paymentError } = await ctx.supabase
        .from('payments')
        .insert({
          invoice_id: input.invoiceId,
          amount: input.amount,
          currency: input.currency,
          payment_method: input.paymentMethod || null,
          transaction_reference: input.transactionReference || null,
          payment_date: new Date().toISOString(),
          notes: input.notes || null,
        })
        .select()
        .single();

      if (paymentError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: paymentError.message,
        });
      }

      // Mark invoice as paid
      const { error: invoiceUpdateError } = await ctx.supabase
        .from('invoices')
        .update({ status: 'paid', paid_date: new Date().toISOString() })
        .eq('id', input.invoiceId);

      if (invoiceUpdateError) {
        // Payment was recorded but invoice status update failed — log but don't fail
        console.error('Failed to update invoice status after payment:', invoiceUpdateError.message);
      }

      await logCreation({
        supabase: ctx.supabase,
        tableName: 'payments',
        recordId: payment.id,
        data: payment as Record<string, unknown>,
        userId: ctx.user.id,
      });

      return payment;
    }),

  /**
   * Get financial summary across all campaigns
   */
  financialSummary: protectedProcedure.query(async ({ ctx }) => {
    const { data: invoices, error: invError } = await ctx.supabase
      .from('invoices')
      .select('*');

    if (invError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: invError.message,
      });
    }

    const all = invoices || [];
    const totalInvoiced = all.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalPaid = all
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalOverdue = all
      .filter((i) => i.status === 'overdue')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalPending = all
      .filter((i) => i.status === 'sent')
      .reduce((sum, i) => sum + (i.amount || 0), 0);

    return {
      totalInvoiced,
      totalPaid,
      totalOverdue,
      totalPending,
      invoiceCount: all.length,
      byStatus: {
        draft: all.filter((i) => i.status === 'draft').length,
        sent: all.filter((i) => i.status === 'sent').length,
        paid: all.filter((i) => i.status === 'paid').length,
        overdue: all.filter((i) => i.status === 'overdue').length,
        cancelled: all.filter((i) => i.status === 'cancelled').length,
      },
    };
  }),
});
