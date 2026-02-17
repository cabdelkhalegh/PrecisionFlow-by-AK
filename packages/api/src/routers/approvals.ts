import { z } from 'zod';
import { protectedProcedure, directorProcedure, router } from '../trpc';
import { logCreation, logUpdate } from '../utils/audit';

// Approval type enum - matches database schema
const approvalTypeSchema = z.enum(['campaign', 'brief', 'budget', 'content', 'expense']);

// Approval status enum - matches database schema
const approvalStatusSchema = z.enum(['pending', 'approved', 'rejected', 'override']);

export const approvalsRouter = router({
  // List all approvals (with filtering)
  list: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid().optional(),
        status: approvalStatusSchema.optional(),
        type: approvalTypeSchema.optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('approvals')
        .select('*, campaigns(name, client_id)')
        .order('requested_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.campaignId) {
        query = query.eq('campaign_id', input.campaignId);
      }
      if (input.status) {
        query = query.eq('status', input.status);
      }
      if (input.type) {
        query = query.eq('type', input.type);
      }

      const { data, error } = await query;

      if (error) throw new Error(error.message);
      return data || [];
    }),

  // Get pending approvals for current user
  getPendingForUser: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('approvals')
      .select('*, campaigns(name, client_id)')
      .eq('requested_by', ctx.user.id)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }),

  // Get approval by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('approvals')
        .select('*, campaigns(name, client_id)')
        .eq('id', input.id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  // Get approval history for a campaign
  getHistory: protectedProcedure
    .input(z.object({ campaignId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('approvals')
        .select('*')
        .eq('campaign_id', input.campaignId)
        .order('requested_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    }),

  // Create approval request
  create: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        type: approvalTypeSchema,
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('approvals')
        .insert({
          campaign_id: input.campaignId,
          type: input.type,
          requested_by: ctx.user.id,
          status: 'pending',
          comment: input.comment ?? null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Log creation to audit trail
      await logCreation({
        supabase: ctx.supabase,
        tableName: 'approvals',
        recordId: data.id,
        data: data as Record<string, unknown>,
        userId: ctx.user.id,
      });

      return data;
    }),

  // Approve
  approve: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: approval, error: fetchError } = await ctx.supabase
        .from('approvals')
        .select('*')
        .eq('id', input.id)
        .single();

      if (fetchError) throw new Error(fetchError.message);
      if (!approval) throw new Error('Approval not found');

      const { data, error } = await ctx.supabase
        .from('approvals')
        .update({
          status: 'approved' as const,
          approved_by: ctx.user.id,
          responded_at: new Date().toISOString(),
          comment: input.comments ?? null,
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Log update to audit trail
      await logUpdate({
        supabase: ctx.supabase,
        tableName: 'approvals',
        recordId: data.id,
        oldData: approval as Record<string, unknown>,
        newData: data as Record<string, unknown>,
        userId: ctx.user.id,
      });

      return data;
    }),

  // Reject
  reject: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        reason: z.string().min(1, 'Rejection reason is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: approval, error: fetchError } = await ctx.supabase
        .from('approvals')
        .select('*')
        .eq('id', input.id)
        .single();

      if (fetchError) throw new Error(fetchError.message);
      if (!approval) throw new Error('Approval not found');

      const { data, error } = await ctx.supabase
        .from('approvals')
        .update({
          status: 'rejected' as const,
          approved_by: ctx.user.id,
          responded_at: new Date().toISOString(),
          comment: input.reason,
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Log update to audit trail
      await logUpdate({
        supabase: ctx.supabase,
        tableName: 'approvals',
        recordId: data.id,
        oldData: approval as Record<string, unknown>,
        newData: data as Record<string, unknown>,
        userId: ctx.user.id,
      });

      return data;
    }),

  // Override (Directors only)
  override: directorProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        newStatus: z.enum(['approved', 'rejected']),
        comments: z.string().min(1, 'Override reason is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get old data for audit
      const { data: oldApproval } = await ctx.supabase
        .from('approvals')
        .select('*')
        .eq('id', input.id)
        .single();

      const { data, error } = await ctx.supabase
        .from('approvals')
        .update({
          status: 'override' as const,
          approved_by: ctx.user.id,
          responded_at: new Date().toISOString(),
          comment: `OVERRIDE (${input.newStatus}): ${input.comments}`,
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Log update to audit trail
      if (oldApproval) {
        await logUpdate({
          supabase: ctx.supabase,
          tableName: 'approvals',
          recordId: data.id,
          oldData: oldApproval as Record<string, unknown>,
          newData: data as Record<string, unknown>,
          userId: ctx.user.id,
        });
      }

      return data;
    }),

  // Count pending approvals for user
  countPending: protectedProcedure.query(async ({ ctx }) => {
    const { count, error } = await ctx.supabase
      .from('approvals')
      .select('*', { count: 'exact', head: true })
      .eq('requested_by', ctx.user.id)
      .eq('status', 'pending');

    if (error) throw new Error(error.message);
    return count || 0;
  }),
});
