/**
 * Expenses router - handles expense tracking and approval
 * All state changes are logged to audit trail per CONTRIBUTING.md §176-178
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { logCreation, logUpdate } from '../utils/audit';

export const expensesRouter = router({
  /**
   * List expenses for a campaign
   */
  getByCampaign: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        approvalStatus: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('expenses')
        .select('*', { count: 'exact' })
        .eq('campaign_id', input.campaignId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.approvalStatus) {
        query = query.eq('approval_status', input.approvalStatus);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return { expenses: data || [], total: count || 0 };
    }),

  /**
   * Create an expense
   */
  create: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        category: z.string().min(1),
        amount: z.number().positive(),
        currency: z.string().min(3).max(3).default('USD'),
        description: z.string().optional(),
        receiptUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('expenses')
        .insert({
          campaign_id: input.campaignId,
          category: input.category,
          amount: input.amount,
          currency: input.currency,
          description: input.description || null,
          receipt_url: input.receiptUrl || null,
          approval_status: 'pending',
          payment_status: 'pending',
          created_by: ctx.user.id,
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
        tableName: 'expenses',
        recordId: data.id,
        data: data as Record<string, unknown>,
        userId: ctx.user.id,
      });

      return data;
    }),

  /**
   * Approve an expense
   */
  approve: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: oldData } = await ctx.supabase
        .from('expenses')
        .select()
        .eq('id', input.id)
        .single();

      const { data, error } = await ctx.supabase
        .from('expenses')
        .update({ approval_status: 'approved' })
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
          tableName: 'expenses',
          recordId: input.id,
          oldData: oldData as Record<string, unknown>,
          newData: data as Record<string, unknown>,
          userId: ctx.user.id,
        });
      }

      return data;
    }),

  /**
   * Reject an expense
   */
  reject: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: oldData } = await ctx.supabase
        .from('expenses')
        .select()
        .eq('id', input.id)
        .single();

      const { data, error } = await ctx.supabase
        .from('expenses')
        .update({ approval_status: 'rejected' })
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
          tableName: 'expenses',
          recordId: input.id,
          oldData: oldData as Record<string, unknown>,
          newData: data as Record<string, unknown>,
          userId: ctx.user.id,
        });
      }

      return data;
    }),

  /**
   * Mark an expense as paid
   */
  markPaid: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: oldData } = await ctx.supabase
        .from('expenses')
        .select()
        .eq('id', input.id)
        .single();

      const { data, error } = await ctx.supabase
        .from('expenses')
        .update({ payment_status: 'paid' })
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
          tableName: 'expenses',
          recordId: input.id,
          oldData: oldData as Record<string, unknown>,
          newData: data as Record<string, unknown>,
          userId: ctx.user.id,
        });
      }

      return data;
    }),

  /**
   * Get expense summary for a campaign
   */
  summary: protectedProcedure
    .input(z.object({ campaignId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('expenses')
        .select('*')
        .eq('campaign_id', input.campaignId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      const expenses = data || [];
      const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const approvedAmount = expenses
        .filter((e) => e.approval_status === 'approved')
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const pendingAmount = expenses
        .filter((e) => e.approval_status === 'pending')
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const paidAmount = expenses
        .filter((e) => e.payment_status === 'paid')
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      const byCategory: Record<string, number> = {};
      for (const e of expenses) {
        byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0);
      }

      return {
        totalAmount,
        approvedAmount,
        pendingAmount,
        paidAmount,
        byCategory,
        count: expenses.length,
      };
    }),
});
