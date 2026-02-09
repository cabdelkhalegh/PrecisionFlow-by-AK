import { z } from 'zod';
import { protectedProcedure, directorProcedure, router } from '../trpc';
import { logCreation, logUpdate } from '../utils/audit';

// Approval type enum
const approvalTypeSchema = z.enum(['brief', 'strategy', 'shortlist', 'content', 'budget_revision']);

// Approval status enum
const approvalStatusSchema = z.enum(['pending', 'approved', 'rejected', 'overridden']);

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
        .select('*, campaigns(name, client_id), users!approvals_approver_id_fkey(full_name, email)')
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.campaignId) {
        query = query.eq('campaign_id', input.campaignId);
      }
      if (input.status) {
        query = query.eq('status', input.status);
      }
      if (input.type) {
        query = query.eq('approval_type', input.type);
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
      .eq('approver_id', ctx.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }),

  // Get approval by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('approvals')
        .select('*, campaigns(name, client_id), users!approvals_approver_id_fkey(full_name, email)')
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
        .select('*, users!approvals_approver_id_fkey(full_name, email)')
        .eq('campaign_id', input.campaignId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    }),

  // Create approval request
  create: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        approvalType: approvalTypeSchema,
        approverId: z.string().uuid(),
        requestNotes: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('approvals')
        .insert({
          campaign_id: input.campaignId,
          approval_type: input.approvalType,
          approver_id: input.approverId,
          status: 'pending',
          request_notes: input.requestNotes,
          metadata: input.metadata,
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
      // Verify user is the approver
      const { data: approval, error: fetchError } = await ctx.supabase
        .from('approvals')
        .select('*')
        .eq('id', input.id)
        .single();

      if (fetchError) throw new Error(fetchError.message);
      if (!approval) throw new Error('Approval not found');
      if (approval.approver_id !== ctx.user.id) {
        throw new Error('Only the designated approver can approve this request');
      }

      const { data, error } = await ctx.supabase
        .from('approvals')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approver_comments: input.comments,
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
      // Verify user is the approver
      const { data: approval, error: fetchError } = await ctx.supabase
        .from('approvals')
        .select('*')
        .eq('id', input.id)
        .single();

      if (fetchError) throw new Error(fetchError.message);
      if (!approval) throw new Error('Approval not found');
      if (approval.approver_id !== ctx.user.id) {
        throw new Error('Only the designated approver can reject this request');
      }

      const { data, error } = await ctx.supabase
        .from('approvals')
        .update({
          status: 'rejected',
          approved_at: new Date().toISOString(),
          approver_comments: input.reason,
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
          status: 'overridden',
          approved_at: new Date().toISOString(),
          approver_comments: `OVERRIDE: ${input.comments}`,
          override_status: input.newStatus,
          overridden_by: ctx.user.id,
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
      .eq('approver_id', ctx.user.id)
      .eq('status', 'pending');

    if (error) throw new Error(error.message);
    return count || 0;
  }),
});
