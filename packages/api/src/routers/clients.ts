/**
 * Clients router - handles all client-related operations
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { logCreation, logUpdate, logDeletion } from '../utils/audit';

export const clientsRouter = router({
  /**
   * List clients for the authenticated user
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        tier: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      // Apply filters
      if (input.tier) {
        query = query.eq('tier', input.tier);
      }

      // Full-text search on name and company
      if (input.search) {
        query = query.or(
          `name.ilike.%${input.search}%,company_name.ilike.%${input.search}%`
        );
      }

      const { data, error, count } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return {
        clients: data || [],
        total: count || 0,
      };
    }),

  /**
   * Get a single client by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('clients')
        .select('*')
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
   * Create a new client
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        companyName: z.string().optional(),
        email: z.string().email(),
        phone: z.string().optional(),
        industry: z.string().optional(),
        website: z.string().url().optional(),
        tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
        address: z
          .object({
            street: z.string().optional(),
            city: z.string().optional(),
            country: z.string().optional(),
            postal_code: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('clients')
        .insert({
          name: input.name,
          company_name: input.companyName,
          email: input.email,
          phone: input.phone,
          industry: input.industry,
          website: input.website,
          tier: input.tier,
          address: input.address,
          account_manager_id: ctx.user.id,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Log creation
      await logCreation({
        supabase: ctx.supabase,
        tableName: 'clients',
        recordId: data.id,
        data: data as Record<string, unknown>,
        userId: ctx.user.id,
      });

      return data;
    }),

  /**
   * Update a client
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        companyName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        industry: z.string().optional(),
        website: z.string().url().optional(),
        tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
        address: z
          .object({
            street: z.string().optional(),
            city: z.string().optional(),
            country: z.string().optional(),
            postal_code: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      // Get old data for audit trail
      const { data: oldData } = await ctx.supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.companyName) updateData.company_name = updates.companyName;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.industry) updateData.industry = updates.industry;
      if (updates.website) updateData.website = updates.website;
      if (updates.tier) updateData.tier = updates.tier;
      if (updates.address) updateData.address = updates.address;

      const { data, error } = await ctx.supabase
        .from('clients')
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

      // Log client update to audit trail
      await logUpdate({
        supabase: ctx.supabase,
        tableName: 'clients',
        recordId: id,
        oldData: (oldData || {}) as Record<string, unknown>,
        newData: data as Record<string, unknown>,
        userId: ctx.user.id,
      });

      return data;
    }),

  /**
   * Delete a client (soft delete)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get old data for audit trail
      const { data: oldData } = await ctx.supabase
        .from('clients')
        .select('*')
        .eq('id', input.id)
        .is('deleted_at', null)
        .single();

      const { error } = await ctx.supabase
        .from('clients')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Log client deletion to audit trail
      await logDeletion({
        supabase: ctx.supabase,
        tableName: 'clients',
        recordId: input.id,
        data: (oldData || {}) as Record<string, unknown>,
        userId: ctx.user.id,
      });

      return { success: true };
    }),
});
