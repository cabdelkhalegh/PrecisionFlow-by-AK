/**
 * Briefs router - handles all brief-related operations
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const briefsRouter = router({
  /**
   * List briefs for a campaign
   */
  listByCampaign: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error, count } = await ctx.supabase
        .from('briefs')
        .select('*', { count: 'exact' })
        .eq('campaign_id', input.campaignId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return {
        briefs: data || [],
        total: count || 0,
      };
    }),

  /**
   * Get the latest brief for a campaign
   */
  getLatestByCampaign: protectedProcedure
    .input(z.object({ campaignId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('briefs')
        .select('*')
        .eq('campaign_id', input.campaignId)
        .eq('is_latest', true)
        .is('deleted_at', null)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data || null;
    }),

  /**
   * Get a single brief by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('briefs')
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
   * Upload a new brief (raw content or file URL)
   */
  upload: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        rawContent: z.string().optional(),
        rawFileUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current version number
      const { data: existingBriefs } = await ctx.supabase
        .from('briefs')
        .select('version')
        .eq('campaign_id', input.campaignId)
        .order('version', { ascending: false })
        .limit(1);

      const nextVersion = existingBriefs && existingBriefs.length > 0 
        ? existingBriefs[0].version + 1 
        : 1;

      // Mark previous briefs as not latest
      if (nextVersion > 1) {
        await ctx.supabase
          .from('briefs')
          .update({ is_latest: false })
          .eq('campaign_id', input.campaignId)
          .eq('is_latest', true);
      }

      // Create new brief
      const { data, error } = await ctx.supabase
        .from('briefs')
        .insert({
          campaign_id: input.campaignId,
          raw_content: input.rawContent,
          raw_file_url: input.rawFileUrl,
          version: nextVersion,
          is_latest: true,
          uploaded_by: ctx.user.id,
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  /**
   * Process brief with AI (parse and extract structured data)
   * Note: This will be implemented when @tikit/ai package is available
   */
  processWithAI: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get the brief
      const { data: brief, error: briefError } = await ctx.supabase
        .from('briefs')
        .select('*')
        .eq('id', input.id)
        .is('deleted_at', null)
        .single();

      if (briefError) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Brief not found',
        });
      }

      if (!brief.raw_content) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Brief has no raw content to process',
        });
      }

      // TODO: Import and use @tikit/ai package when dependencies are installed
      // For now, return a placeholder response
      // const { parseBrief, calculateRiskLevel } = await import('@tikit/ai');
      // const structuredData = await parseBrief(brief.raw_content);
      // const riskLevel = calculateRiskLevel(structuredData.missing_info);

      // Placeholder structured data
      const structuredData = {
        objectives: ['Increase brand awareness'],
        target_audience: 'To be determined',
        deliverables: [],
        timeline: 'TBD',
        budget: 'TBD',
        kpis: [],
        missing_info: ['Budget details', 'Specific timeline', 'Deliverables list'],
      };

      // Update brief with structured data
      const { data: updatedBrief, error: updateError } = await ctx.supabase
        .from('briefs')
        .update({
          structured_data: structuredData,
        })
        .eq('id', input.id)
        .select()
        .single();

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: updateError.message,
        });
      }

      // Calculate and update campaign risk level
      const riskLevel = 'medium'; // Placeholder
      await ctx.supabase
        .from('campaigns')
        .update({ risk_level: riskLevel })
        .eq('id', brief.campaign_id);

      return updatedBrief;
    }),

  /**
   * Update brief with structured data (from AI processing)
   */
  updateStructuredData: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        structuredData: z.object({
          objectives: z.array(z.string()),
          target_audience: z.string(),
          deliverables: z.array(
            z.object({
              type: z.string(),
              quantity: z.number(),
              description: z.string(),
              deadline: z.string().optional(),
            })
          ),
          timeline: z.string(),
          budget: z.string(),
          kpis: z.array(z.string()),
          missing_info: z.array(z.string()).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('briefs')
        .update({
          structured_data: input.structuredData,
        })
        .eq('id', input.id)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  /**
   * Approve a brief
   */
  approve: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('briefs')
        .update({
          is_approved: true,
          approved_by: ctx.user.id,
          approved_at: new Date().toISOString(),
          approval_comments: input.comments,
        })
        .eq('id', input.id)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),
});
