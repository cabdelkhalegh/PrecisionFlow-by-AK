/**
 * Campaign router - handles all campaign-related operations
 * All state changes are logged to audit trail per CONTRIBUTING.md §176-178
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { logCreation, logUpdate, logDeletion } from '../utils/audit';

export const campaignsRouter = router({
  /**
   * List campaigns for the authenticated user
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['draft', 'pending_approval', 'approved', 'active', 'completed', 'cancelled']).optional(),
        clientId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('campaigns')
        .select('*, clients(*)', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      // Apply filters
      if (input.status) {
        query = query.eq('status', input.status);
      }

      if (input.clientId) {
        query = query.eq('client_id', input.clientId);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return {
        campaigns: data || [],
        total: count || 0,
      };
    }),

  /**
   * Get a single campaign by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('campaigns')
        .select('*, clients(*)')
        .eq('id', input.id)
        .is('deleted_at', null)
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
   * Create a new campaign
   * Creates audit log entry per CONTRIBUTING.md requirements
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        clientId: z.string().uuid(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        budgetTotal: z.number().positive().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('campaigns')
        .insert({
          name: input.name,
          client_id: input.clientId,
          created_by: ctx.user.id,
          start_date: input.startDate,
          end_date: input.endDate,
          budget: input.budgetTotal,
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

      // Log campaign creation to audit trail
      await logCreation({
        supabase: ctx.supabase,
        tableName: 'campaigns',
        recordId: data.id,
        data: data as Record<string, unknown>,
        userId: ctx.user.id,
      });

      return data;
    }),

  /**
   * Update a campaign
   * Creates audit log entry per CONTRIBUTING.md requirements
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        budgetTotal: z.number().positive().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // Get old data for audit trail
      const { data: oldData } = await ctx.supabase
        .from('campaigns')
        .select()
        .eq('id', id)
        .single();

      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.status) updateData.status = updates.status;
      if (updates.startDate) updateData.start_date = updates.startDate;
      if (updates.endDate) updateData.end_date = updates.endDate;
      if (updates.budgetTotal) updateData.budget_total = updates.budgetTotal;
      if (updates.tags) updateData.tags = updates.tags;

      const { data, error } = await ctx.supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Log campaign update to audit trail
      if (oldData) {
        await logUpdate({
          supabase: ctx.supabase,
          tableName: 'campaigns',
          recordId: id,
          oldData: oldData as Record<string, unknown>,
          newData: data as Record<string, unknown>,
          userId: ctx.user.id,
        });
      }

      return data;
    }),

  /**
   * Delete a campaign (soft delete)
   * Creates audit log entry per CONTRIBUTING.md requirements
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get data before deletion for audit trail
      const { data: oldData } = await ctx.supabase
        .from('campaigns')
        .select()
        .eq('id', input.id)
        .single();

      const { error } = await ctx.supabase
        .from('campaigns')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Log campaign deletion to audit trail
      if (oldData) {
        await logDeletion({
          supabase: ctx.supabase,
          tableName: 'campaigns',
          recordId: input.id,
          data: oldData as Record<string, unknown>,
          userId: ctx.user.id,
        });
      }

      return { success: true };
    }),
});
