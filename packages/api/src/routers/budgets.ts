/**
 * Budgets router - handles budget allocation and tracking
 * All state changes are logged to audit trail per CONTRIBUTING.md §176-178
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { logCreation, logUpdate } from '../utils/audit';

export const budgetsRouter = router({
  /**
   * Get budget for a campaign
   */
  getByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('budgets')
        .select('*')
        .eq('campaign_id', input.campaignId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  /**
   * Create a budget for a campaign
   */
  create: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        originalAmount: z.number().positive(),
        currency: z.string().min(3).max(3).default('USD'),
        breakdown: z.record(z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('budgets')
        .insert({
          campaign_id: input.campaignId,
          original_amount: input.originalAmount,
          current_amount: input.originalAmount,
          currency: input.currency,
          breakdown: input.breakdown || null,
          status: 'draft',
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
        tableName: 'budgets',
        recordId: data.id,
        data: data as Record<string, unknown>,
        userId: ctx.user.id,
      });

      return data;
    }),

  /**
   * Update budget allocation
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        currentAmount: z.number().positive().optional(),
        breakdown: z.record(z.number()).optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const { data: oldData } = await ctx.supabase
        .from('budgets')
        .select()
        .eq('id', id)
        .single();

      const updateData: Record<string, unknown> = {};
      if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount;
      if (updates.breakdown !== undefined) updateData.breakdown = updates.breakdown;
      if (updates.status !== undefined) updateData.status = updates.status;

      const { data, error } = await ctx.supabase
        .from('budgets')
        .update(updateData)
        .eq('id', id)
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
          tableName: 'budgets',
          recordId: id,
          oldData: oldData as Record<string, unknown>,
          newData: data as Record<string, unknown>,
          userId: ctx.user.id,
        });
      }

      return data;
    }),

  /**
   * Get budget summary across all campaigns
   */
  summary: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('budgets')
      .select('*');

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }

    const budgets = data || [];
    const totalBudgeted = budgets.reduce((sum, b) => sum + (b.original_amount || 0), 0);
    const totalCurrent = budgets.reduce((sum, b) => sum + (b.current_amount || 0), 0);

    return {
      budgets,
      totalBudgeted,
      totalCurrent,
      totalVariance: totalBudgeted - totalCurrent,
      count: budgets.length,
    };
  }),
});
