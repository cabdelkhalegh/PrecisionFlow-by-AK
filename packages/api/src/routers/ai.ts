/**
 * AI Router — PrecisionFlow Advanced AI Engine
 * Exposes all AI capabilities through type-safe tRPC procedures
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { logCreation } from '../utils/audit';

export const aiRouter = router({
  /**
   * Generate campaign strategy from brief data
   */
  generateStrategy: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch campaign
      const { data: campaign, error: campaignError } = await ctx.supabase
        .from('campaigns')
        .select('*')
        .eq('id', input.campaignId)
        .is('deleted_at', null)
        .single();

      if (campaignError || !campaign) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
      }

      // Fetch latest brief
      const { data: brief } = await ctx.supabase
        .from('briefs')
        .select('*')
        .eq('campaign_id', input.campaignId)
        .eq('is_latest', true)
        .is('deleted_at', null)
        .single();

      if (!brief?.structured_data) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Campaign needs an AI-processed brief before generating strategy',
        });
      }

      // Fetch client info
      const { data: client } = await ctx.supabase
        .from('clients')
        .select('name, industry, tier')
        .eq('id', campaign.client_id)
        .single();

      // Count previous campaigns for this client
      const { count: prevCampaigns } = await ctx.supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', campaign.client_id)
        .is('deleted_at', null);

      const structuredData = brief.structured_data as {
        objectives?: string[];
        target_audience?: string;
        deliverables?: Array<{ type: string; quantity: number; description: string; deadline?: string }>;
        timeline?: string;
        budget?: string;
        kpis?: string[];
      };

      let strategy;
      try {
        const { generateStrategy } = await import('@precisionflow/ai');
        strategy = await generateStrategy({
          briefData: {
            objectives: structuredData.objectives || [],
            target_audience: structuredData.target_audience || '',
            deliverables: structuredData.deliverables || [],
            timeline: structuredData.timeline || '',
            budget: structuredData.budget || '',
            kpis: structuredData.kpis || [],
          },
          clientInfo: client ? {
            name: client.name,
            industry: client.industry || undefined,
            tier: client.tier || undefined,
            previousCampaigns: prevCampaigns || 0,
          } : undefined,
          campaignName: campaign.name,
        });
      } catch (aiError) {
        console.error('AI strategy generation error:', aiError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate strategy. Please try again.',
        });
      }

      // Store strategy in campaign metadata
      const { data: updated, error: updateError } = await ctx.supabase
        .from('campaigns')
        .update({
          metadata: {
            ...(campaign.metadata as Record<string, unknown> || {}),
            ai_strategy: strategy,
            ai_strategy_generated_at: new Date().toISOString(),
            ai_strategy_generated_by: ctx.user.id,
          },
        })
        .eq('id', input.campaignId)
        .select()
        .single();

      if (updateError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message });
      }

      await logCreation({
        supabase: ctx.supabase,
        tableName: 'campaigns',
        recordId: input.campaignId,
        data: { action: 'ai_strategy_generated', strategy_summary: strategy.executive_summary },
        userId: ctx.user.id,
      });

      return { strategy, campaign: updated };
    }),

  /**
   * Get stored strategy for a campaign
   */
  getStrategy: protectedProcedure
    .input(z.object({ campaignId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: campaign, error } = await ctx.supabase
        .from('campaigns')
        .select('metadata')
        .eq('id', input.campaignId)
        .is('deleted_at', null)
        .single();

      if (error || !campaign) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
      }

      const metadata = campaign.metadata as Record<string, unknown> | null;
      return {
        strategy: metadata?.ai_strategy || null,
        generatedAt: metadata?.ai_strategy_generated_at || null,
      };
    }),

  /**
   * Match creators against campaign requirements
   */
  matchCreators: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        creatorIds: z.array(z.string().uuid()).min(1).max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch campaign + brief
      const { data: campaign, error: campaignError } = await ctx.supabase
        .from('campaigns')
        .select('*')
        .eq('id', input.campaignId)
        .is('deleted_at', null)
        .single();

      if (campaignError || !campaign) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
      }

      const { data: brief } = await ctx.supabase
        .from('briefs')
        .select('structured_data')
        .eq('campaign_id', input.campaignId)
        .eq('is_latest', true)
        .is('deleted_at', null)
        .single();

      if (!brief?.structured_data) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Campaign needs an AI-processed brief before matching creators',
        });
      }

      // Fetch creators
      const { data: creators, error: creatorsError } = await ctx.supabase
        .from('creators')
        .select('*')
        .in('id', input.creatorIds)
        .is('deleted_at', null);

      if (creatorsError || !creators?.length) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No creators found' });
      }

      const structuredData = brief.structured_data as {
        objectives?: string[];
        target_audience?: string;
        deliverables?: Array<{ type: string; quantity: number; description: string }>;
        budget?: string;
      };

      let matchResult;
      try {
        const { matchCreators } = await import('@precisionflow/ai');
        matchResult = await matchCreators(
          creators.map((c) => ({
            id: c.id,
            name: c.name,
            primary_platform: c.primary_platform || undefined,
            niche: c.niche || undefined,
            instagram_followers: c.instagram_followers || undefined,
            tiktok_followers: c.tiktok_followers || undefined,
            youtube_subscribers: c.youtube_subscribers || undefined,
            twitter_followers: c.twitter_followers || undefined,
            avg_engagement_rate: c.avg_engagement_rate ? Number(c.avg_engagement_rate) : undefined,
            avg_views: c.avg_views || undefined,
            content_types: c.content_types || undefined,
            rate_card: c.rate_card as Record<string, number> | undefined,
            bio: c.bio || undefined,
            country: c.country || undefined,
            city: c.city || undefined,
            total_campaigns_completed: c.total_campaigns_completed || undefined,
          })),
          {
            campaignName: campaign.name,
            objectives: structuredData.objectives || [],
            targetAudience: structuredData.target_audience || '',
            deliverables: structuredData.deliverables || [],
            budget: structuredData.budget || '',
          }
        );
      } catch (aiError) {
        console.error('AI creator matching error:', aiError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to match creators. Please try again.',
        });
      }

      return matchResult;
    }),

  /**
   * Predict performance for a content piece
   */
  predictPerformance: protectedProcedure
    .input(
      z.object({
        creatorId: z.string().uuid(),
        contentType: z.string(),
        contentDescription: z.string().optional(),
        durationSeconds: z.number().optional(),
        campaignId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch creator
      const { data: creator, error: creatorError } = await ctx.supabase
        .from('creators')
        .select('*')
        .eq('id', input.creatorId)
        .is('deleted_at', null)
        .single();

      if (creatorError || !creator) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Creator not found' });
      }

      // Fetch campaign
      const { data: campaign } = await ctx.supabase
        .from('campaigns')
        .select('name, budget_total')
        .eq('id', input.campaignId)
        .single();

      // Fetch client info
      let industry: string | undefined;
      if (campaign) {
        const { data: campaignFull } = await ctx.supabase
          .from('campaigns')
          .select('client_id')
          .eq('id', input.campaignId)
          .single();
        if (campaignFull) {
          const { data: client } = await ctx.supabase
            .from('clients')
            .select('industry')
            .eq('id', campaignFull.client_id)
            .single();
          industry = client?.industry || undefined;
        }
      }

      // Fetch campaign brief objectives
      const { data: brief } = await ctx.supabase
        .from('briefs')
        .select('structured_data')
        .eq('campaign_id', input.campaignId)
        .eq('is_latest', true)
        .is('deleted_at', null)
        .single();

      const structuredData = brief?.structured_data as { objectives?: string[] } | null;

      let prediction;
      try {
        const { predictPerformance } = await import('@precisionflow/ai');
        const platformFollowers = {
          instagram: creator.instagram_followers || 0,
          tiktok: creator.tiktok_followers || 0,
          youtube: creator.youtube_subscribers || 0,
          twitter: creator.twitter_followers || 0,
        };
        const platform = (creator.primary_platform || 'instagram') as keyof typeof platformFollowers;
        const followers = platformFollowers[platform] || 0;

        prediction = await predictPerformance({
          creator: {
            name: creator.name,
            platform: creator.primary_platform || 'instagram',
            followers,
            avg_engagement_rate: Number(creator.avg_engagement_rate) || 0,
            avg_views: creator.avg_views || undefined,
            avg_likes: creator.avg_likes || undefined,
            avg_comments: creator.avg_comments || undefined,
            niche: creator.niche || undefined,
          },
          content: {
            type: input.contentType,
            description: input.contentDescription,
            duration_seconds: input.durationSeconds,
          },
          campaign: {
            name: campaign?.name || 'Unknown Campaign',
            industry,
            budget: campaign?.budget_total ? `$${campaign.budget_total}` : undefined,
            objectives: structuredData?.objectives,
          },
        });
      } catch (aiError) {
        console.error('AI prediction error:', aiError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to predict performance. Please try again.',
        });
      }

      return prediction;
    }),

  /**
   * Predict aggregate campaign performance
   */
  predictCampaignPerformance: protectedProcedure
    .input(z.object({ campaignId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: campaign, error: campaignError } = await ctx.supabase
        .from('campaigns')
        .select('*')
        .eq('id', input.campaignId)
        .is('deleted_at', null)
        .single();

      if (campaignError || !campaign) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
      }

      // Fetch brief
      const { data: brief } = await ctx.supabase
        .from('briefs')
        .select('structured_data')
        .eq('campaign_id', input.campaignId)
        .eq('is_latest', true)
        .is('deleted_at', null)
        .single();

      const structuredData = brief?.structured_data as { objectives?: string[] } | null;

      // Fetch shortlisted creators with their details
      const { data: shortlists } = await ctx.supabase
        .from('campaign_shortlists')
        .select('creator_id, proposed_rate, proposed_deliverables')
        .eq('campaign_id', input.campaignId)
        .in('status', ['approved', 'submitted', 'draft'])
        .is('deleted_at', null);

      if (!shortlists?.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Campaign needs shortlisted creators for performance prediction',
        });
      }

      const creatorIds = shortlists.map(s => s.creator_id);
      const { data: creators } = await ctx.supabase
        .from('creators')
        .select('*')
        .in('id', creatorIds)
        .is('deleted_at', null);

      // Fetch content tasks for deliverable info
      const { data: tasks } = await ctx.supabase
        .from('content_tasks')
        .select('creator_id, deliverable_type, quantity')
        .eq('campaign_id', input.campaignId)
        .is('deleted_at', null);

      let prediction;
      try {
        const { predictCampaignPerformance } = await import('@precisionflow/ai');

        const creatorData = (creators || []).map(c => {
          const shortlist = shortlists.find(s => s.creator_id === c.id);
          const creatorTasks = (tasks || []).filter(t => t.creator_id === c.id);
          const platformFollowers = {
            instagram: c.instagram_followers || 0,
            tiktok: c.tiktok_followers || 0,
            youtube: c.youtube_subscribers || 0,
            twitter: c.twitter_followers || 0,
          };
          const platform = (c.primary_platform || 'instagram') as keyof typeof platformFollowers;

          return {
            name: c.name,
            platform: c.primary_platform || 'instagram',
            followers: platformFollowers[platform] || 0,
            avg_engagement_rate: Number(c.avg_engagement_rate) || 0,
            proposed_rate: shortlist?.proposed_rate ? Number(shortlist.proposed_rate) : undefined,
            deliverables: creatorTasks.map(t => ({
              type: t.deliverable_type,
              quantity: t.quantity || 1,
            })),
          };
        });

        prediction = await predictCampaignPerformance({
          campaignName: campaign.name,
          totalBudget: campaign.budget_total ? `$${campaign.budget_total}` : 'Not set',
          objectives: structuredData?.objectives || [],
          creators: creatorData,
        });
      } catch (aiError) {
        console.error('AI campaign prediction error:', aiError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to predict campaign performance. Please try again.',
        });
      }

      return prediction;
    }),

  /**
   * Review content with AI
   */
  reviewContent: protectedProcedure
    .input(
      z.object({
        contentTaskId: z.string().uuid(),
        content: z.string().min(1),
        contentType: z.enum(['script', 'draft', 'caption', 'final']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch task + campaign + brief
      const { data: task, error: taskError } = await ctx.supabase
        .from('content_tasks')
        .select('*, campaigns(*)')
        .eq('id', input.contentTaskId)
        .is('deleted_at', null)
        .single();

      if (taskError || !task) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Content task not found' });
      }

      const campaignData = task.campaigns as { id: string; name: string; client_id: string } | null;

      // Fetch brief for context
      const { data: brief } = await ctx.supabase
        .from('briefs')
        .select('structured_data')
        .eq('campaign_id', campaignData?.id || task.campaign_id)
        .eq('is_latest', true)
        .is('deleted_at', null)
        .single();

      const structuredData = brief?.structured_data as {
        objectives?: string[];
        target_audience?: string;
      } | null;

      // Fetch creator name
      const { data: creator } = await ctx.supabase
        .from('creators')
        .select('name')
        .eq('id', task.creator_id)
        .single();

      let review;
      try {
        const { reviewContent } = await import('@precisionflow/ai');
        review = await reviewContent({
          content: input.content,
          contentType: input.contentType,
          platform: task.deliverable_type || 'instagram_post',
          briefContext: {
            objectives: structuredData?.objectives || [],
            targetAudience: structuredData?.target_audience || '',
          },
          creatorName: creator?.name,
          campaignName: campaignData?.name,
        });
      } catch (aiError) {
        console.error('AI content review error:', aiError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to review content. Please try again.',
        });
      }

      return review;
    }),

  /**
   * Analyze campaign risk with AI
   */
  analyzeRisk: protectedProcedure
    .input(z.object({ campaignId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: campaign, error: campaignError } = await ctx.supabase
        .from('campaigns')
        .select('*')
        .eq('id', input.campaignId)
        .is('deleted_at', null)
        .single();

      if (campaignError || !campaign) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
      }

      // Fetch all related data
      const [tasksResult, approvalsResult, shortlistsResult, expensesResult] = await Promise.all([
        ctx.supabase
          .from('content_tasks')
          .select('title, status, deadline, creator_id, deliverable_type')
          .eq('campaign_id', input.campaignId)
          .is('deleted_at', null),
        ctx.supabase
          .from('approvals')
          .select('approval_type, status, created_at, approver_id')
          .eq('campaign_id', input.campaignId)
          .is('deleted_at', null),
        ctx.supabase
          .from('campaign_shortlists')
          .select('creator_id')
          .eq('campaign_id', input.campaignId)
          .is('deleted_at', null),
        ctx.supabase
          .from('expenses')
          .select('amount, approval_status')
          .eq('campaign_id', input.campaignId),
      ]);

      // Get creator names
      const creatorIds = [
        ...new Set([
          ...(tasksResult.data || []).map(t => t.creator_id).filter(Boolean),
          ...(shortlistsResult.data || []).map(s => s.creator_id),
        ]),
      ];

      const { data: creators } = creatorIds.length
        ? await ctx.supabase.from('creators').select('id, name').in('id', creatorIds)
        : { data: [] };

      const creatorNameMap = new Map((creators || []).map(c => [c.id, c.name]));

      // Compute creator task stats
      const creatorStats = new Map<string, { assigned: number; completed: number; name: string }>();
      for (const task of tasksResult.data || []) {
        if (!task.creator_id) continue;
        const stats = creatorStats.get(task.creator_id) || {
          assigned: 0,
          completed: 0,
          name: creatorNameMap.get(task.creator_id) || 'Unknown',
        };
        stats.assigned++;
        if (['approved', 'published'].includes(task.status)) stats.completed++;
        creatorStats.set(task.creator_id, stats);
      }

      // Compute expense totals
      const expenses = expensesResult.data || [];
      const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const expenseApproved = expenses.filter(e => e.approval_status === 'approved').reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const expensePending = expenses.filter(e => e.approval_status === 'pending').reduce((sum, e) => sum + Number(e.amount || 0), 0);

      let riskAnalysis;
      try {
        const { analyzeRisk } = await import('@precisionflow/ai');
        riskAnalysis = await analyzeRisk({
          campaign: {
            name: campaign.name,
            status: campaign.status,
            startDate: campaign.start_date || undefined,
            endDate: campaign.end_date || undefined,
            budgetTotal: campaign.budget_total ? Number(campaign.budget_total) : undefined,
            actualSpent: campaign.actual_spent ? Number(campaign.actual_spent) : undefined,
            riskLevel: campaign.risk_level || undefined,
          },
          tasks: (tasksResult.data || []).map(t => ({
            title: t.title,
            status: t.status,
            deadline: t.deadline || undefined,
            creatorName: t.creator_id ? creatorNameMap.get(t.creator_id) : undefined,
            deliverableType: t.deliverable_type || undefined,
          })),
          approvals: (approvalsResult.data || []).map(a => ({
            type: a.approval_type,
            status: a.status,
            createdAt: a.created_at || undefined,
          })),
          creators: Array.from(creatorStats.values()).map(s => ({
            name: s.name,
            tasksAssigned: s.assigned,
            tasksCompleted: s.completed,
          })),
          expenses: {
            total: expenseTotal,
            approved: expenseApproved,
            pending: expensePending,
          },
        });
      } catch (aiError) {
        console.error('AI risk analysis error:', aiError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze risk. Please try again.',
        });
      }

      // Update campaign risk level based on AI analysis
      await ctx.supabase
        .from('campaigns')
        .update({
          risk_level: riskAnalysis.risk_level,
          metadata: {
            ...(campaign.metadata as Record<string, unknown> || {}),
            ai_risk_analysis: riskAnalysis,
            ai_risk_analyzed_at: new Date().toISOString(),
          },
        })
        .eq('id', input.campaignId);

      return riskAnalysis;
    }),

  /**
   * Extract post-campaign learnings
   */
  extractLearnings: protectedProcedure
    .input(z.object({ campaignId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data: campaign, error: campaignError } = await ctx.supabase
        .from('campaigns')
        .select('*')
        .eq('id', input.campaignId)
        .is('deleted_at', null)
        .single();

      if (campaignError || !campaign) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
      }

      // Fetch brief for objectives/KPIs
      const { data: brief } = await ctx.supabase
        .from('briefs')
        .select('structured_data')
        .eq('campaign_id', input.campaignId)
        .eq('is_latest', true)
        .is('deleted_at', null)
        .single();

      const structuredData = brief?.structured_data as {
        objectives?: string[];
        kpis?: string[];
      } | null;

      // Fetch client industry
      const { data: client } = await ctx.supabase
        .from('clients')
        .select('industry')
        .eq('id', campaign.client_id)
        .single();

      // Fetch content tasks with performance data
      const { data: tasks } = await ctx.supabase
        .from('content_tasks')
        .select('*')
        .eq('campaign_id', input.campaignId)
        .is('deleted_at', null);

      // Get creator IDs and details
      const creatorIds = [...new Set((tasks || []).map(t => t.creator_id).filter(Boolean))];
      const { data: creators } = creatorIds.length
        ? await ctx.supabase.from('creators').select('*').in('id', creatorIds)
        : { data: [] };

      const creatorMap = new Map((creators || []).map(c => [c.id, c]));

      // Build creator performance data
      const creatorPerformance = creatorIds.map(cid => {
        const c = creatorMap.get(cid);
        const creatorTasks = (tasks || []).filter(t => t.creator_id === cid);
        const completedTasks = creatorTasks.filter(t => ['approved', 'published'].includes(t.status));

        return {
          name: c?.name || 'Unknown',
          platform: c?.primary_platform || 'unknown',
          followers: c?.instagram_followers || c?.tiktok_followers || c?.youtube_subscribers || 0,
          tasksCompleted: completedTasks.length,
          totalTasks: creatorTasks.length,
          totalViews: completedTasks.reduce((sum, t) => sum + (t.views || 0), 0),
          totalLikes: completedTasks.reduce((sum, t) => sum + (t.likes || 0), 0),
          totalComments: completedTasks.reduce((sum, t) => sum + (t.comments || 0), 0),
          engagementRate: Number(c?.avg_engagement_rate) || 0,
          paymentAmount: creatorTasks.reduce((sum, t) => sum + Number(t.payment_amount || 0), 0),
          onTimeDelivery: creatorTasks.every(t => {
            if (!t.deadline) return true;
            if (t.status === 'cancelled') return true;
            return ['approved', 'published'].includes(t.status);
          }),
        };
      });

      let learnings;
      try {
        const { extractLearnings } = await import('@precisionflow/ai');
        learnings = await extractLearnings({
          campaign: {
            name: campaign.name,
            industry: client?.industry || undefined,
            startDate: campaign.start_date || undefined,
            endDate: campaign.end_date || undefined,
            budgetTotal: campaign.budget_total ? Number(campaign.budget_total) : undefined,
            actualSpent: campaign.actual_spent ? Number(campaign.actual_spent) : undefined,
            status: campaign.status,
            objectives: structuredData?.objectives,
            kpis: structuredData?.kpis,
          },
          creators: creatorPerformance,
          contentTasks: (tasks || []).map(t => ({
            title: t.title,
            deliverableType: t.deliverable_type,
            status: t.status,
            creatorName: creatorMap.get(t.creator_id)?.name || 'Unknown',
            views: t.views || undefined,
            likes: t.likes || undefined,
            comments: t.comments || undefined,
            shares: t.shares || undefined,
            engagementRate: t.engagement_rate ? Number(t.engagement_rate) : undefined,
          })),
          totalReach: (tasks || []).reduce((sum, t) => sum + (t.views || 0), 0),
          totalEngagements: (tasks || []).reduce((sum, t) => sum + (t.likes || 0) + (t.comments || 0) + (t.shares || 0), 0),
        });
      } catch (aiError) {
        console.error('AI learning extraction error:', aiError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to extract learnings. Please try again.',
        });
      }

      // Store learnings in campaign metadata
      await ctx.supabase
        .from('campaigns')
        .update({
          metadata: {
            ...(campaign.metadata as Record<string, unknown> || {}),
            ai_learnings: learnings,
            ai_learnings_extracted_at: new Date().toISOString(),
          },
        })
        .eq('id', input.campaignId);

      return learnings;
    }),

  /**
   * AI Chat — natural language queries about campaigns
   */
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(2000),
        history: z
          .array(
            z.object({
              role: z.enum(['user', 'assistant']),
              content: z.string(),
            })
          )
          .max(20)
          .default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Gather context data for the AI
      const [campaignsResult, clientsResult, creatorsResult, budgetResult, invoiceResult] =
        await Promise.all([
          ctx.supabase
            .from('campaigns')
            .select('id, name, status, client_id, budget_total, actual_spent, risk_level, start_date, end_date')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(20),
          ctx.supabase
            .from('clients')
            .select('id, name, tier')
            .is('deleted_at', null)
            .limit(20),
          ctx.supabase
            .from('creators')
            .select('id, name, primary_platform, instagram_followers, tiktok_followers, youtube_subscribers, avg_engagement_rate')
            .is('deleted_at', null)
            .eq('status', 'active')
            .limit(20),
          ctx.supabase.from('budgets').select('original_amount, current_amount'),
          ctx.supabase.from('invoices').select('amount, status'),
        ]);

      // Get client names for campaigns
      const clientIds = [...new Set((campaignsResult.data || []).map(c => c.client_id).filter(Boolean))];
      const { data: clientNames } = clientIds.length
        ? await ctx.supabase.from('clients').select('id, name').in('id', clientIds)
        : { data: [] };
      const clientNameMap = new Map((clientNames || []).map(c => [c.id, c.name]));

      // Get pending approvals count
      const { count: pendingApprovals } = await ctx.supabase
        .from('approvals')
        .select('*', { count: 'exact', head: true })
        .eq('approver_id', ctx.user.id)
        .eq('status', 'pending')
        .is('deleted_at', null);

      // Get user info
      const { data: userData } = await ctx.supabase
        .from('users')
        .select('full_name, role')
        .eq('id', ctx.user.id)
        .single();

      // Compute financial summary
      const totalBudgeted = (budgetResult.data || []).reduce((s, b) => s + Number(b.original_amount || 0), 0);
      const totalSpent = (budgetResult.data || []).reduce((s, b) => s + Number(b.current_amount || 0), 0);
      const invoices = invoiceResult.data || [];
      const totalInvoiced = invoices.reduce((s, i) => s + Number(i.amount || 0), 0);
      const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount || 0), 0);

      let chatResponse;
      try {
        const { chat } = await import('@precisionflow/ai');
        chatResponse = await chat(input.message, {
          campaigns: (campaignsResult.data || []).map(c => ({
            id: c.id,
            name: c.name,
            status: c.status,
            clientName: clientNameMap.get(c.client_id) || undefined,
            budget: c.budget_total ? Number(c.budget_total) : undefined,
            spent: c.actual_spent ? Number(c.actual_spent) : undefined,
            riskLevel: c.risk_level || undefined,
            startDate: c.start_date || undefined,
            endDate: c.end_date || undefined,
          })),
          clients: (clientsResult.data || []).map(c => ({
            id: c.id,
            name: c.name,
            tier: c.tier || undefined,
          })),
          creators: (creatorsResult.data || []).map(c => ({
            id: c.id,
            name: c.name,
            platform: c.primary_platform || undefined,
            followers: c.instagram_followers || c.tiktok_followers || c.youtube_subscribers || undefined,
            engagementRate: c.avg_engagement_rate ? Number(c.avg_engagement_rate) : undefined,
          })),
          financialSummary: {
            totalBudgeted,
            totalSpent,
            totalInvoiced,
            totalPaid,
          },
          pendingApprovals: pendingApprovals || 0,
          userName: userData?.full_name || ctx.user.email || undefined,
          userRole: userData?.role || undefined,
        }, input.history);
      } catch (aiError) {
        console.error('AI chat error:', aiError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI assistant is temporarily unavailable. Please try again.',
        });
      }

      return chatResponse;
    }),
});
