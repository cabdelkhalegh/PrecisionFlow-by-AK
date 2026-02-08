import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

// Creator input schemas
const createCreatorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  profile_image_url: z.string().url().optional(),
  
  // Social handles
  instagram_handle: z.string().optional(),
  tiktok_handle: z.string().optional(),
  youtube_handle: z.string().optional(),
  twitter_handle: z.string().optional(),
  facebook_handle: z.string().optional(),
  
  // Platform stats
  instagram_followers: z.number().int().min(0).optional(),
  tiktok_followers: z.number().int().min(0).optional(),
  youtube_subscribers: z.number().int().min(0).optional(),
  twitter_followers: z.number().int().min(0).optional(),
  
  // Engagement
  avg_engagement_rate: z.number().min(0).max(100).optional(),
  avg_views: z.number().int().min(0).optional(),
  avg_likes: z.number().int().min(0).optional(),
  avg_comments: z.number().int().min(0).optional(),
  
  // Classification
  primary_platform: z.enum(['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'other']).optional(),
  niche: z.array(z.string()).optional(),
  content_types: z.array(z.string()).optional(),
  
  // Business
  rate_card: z.record(z.number()).optional(),
  preferred_collaboration_types: z.array(z.string()).optional(),
  
  // Location
  country: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
  
  // Status
  status: z.enum(['active', 'inactive', 'blacklisted']).optional(),
  verified: z.boolean().optional(),
  
  // Additional
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const updateCreatorSchema = createCreatorSchema.partial();

export const creatorsRouter = router({
  // List creators with filtering
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      search: z.string().optional(),
      platform: z.enum(['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'other']).optional(),
      niche: z.string().optional(),
      status: z.enum(['active', 'inactive', 'blacklisted']).optional(),
      minFollowers: z.number().optional(),
      minEngagement: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      let query = db
        .from('creators')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);
      
      // Apply filters
      if (input.search) {
        query = query.or(`name.ilike.%${input.search}%,bio.ilike.%${input.search}%,instagram_handle.ilike.%${input.search}%`);
      }
      
      if (input.platform) {
        query = query.eq('primary_platform', input.platform);
      }
      
      if (input.niche) {
        query = query.contains('niche', [input.niche]);
      }
      
      if (input.status) {
        query = query.eq('status', input.status);
      }
      
      if (input.minFollowers) {
        // Check all platform follower counts - use array join for cleaner code
        const followerConditions = [
          `instagram_followers.gte.${input.minFollowers}`,
          `tiktok_followers.gte.${input.minFollowers}`,
          `youtube_subscribers.gte.${input.minFollowers}`,
          `twitter_followers.gte.${input.minFollowers}`
        ];
        query = query.or(followerConditions.join(','));
      }
      
      if (input.minEngagement) {
        query = query.gte('avg_engagement_rate', input.minEngagement);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw new Error(`Failed to fetch creators: ${error.message}`);
      
      return {
        creators: data || [],
        total: count || 0,
      };
    }),
  
  // Get creator by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const { data, error } = await db
        .from('creators')
        .select('*')
        .eq('id', input.id)
        .is('deleted_at', null)
        .single();
      
      if (error) throw new Error(`Failed to fetch creator: ${error.message}`);
      if (!data) throw new Error('Creator not found');
      
      return data;
    }),
  
  // Create creator
  create: protectedProcedure
    .input(createCreatorSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase: db, user } = ctx;
      
      const { data, error } = await db
        .from('creators')
        .insert({
          ...input,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw new Error(`Failed to create creator: ${error.message}`);
      
      return data;
    }),
  
  // Update creator
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateCreatorSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const { data, error } = await db
        .from('creators')
        .update(input.data)
        .eq('id', input.id)
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to update creator: ${error.message}`);
      
      return data;
    }),
  
  // Soft delete creator
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const { data, error } = await db
        .from('creators')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to delete creator: ${error.message}`);
      
      return data;
    }),
  
  // Search creators (advanced)
  search: protectedProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const { data, error } = await db
        .from('creators')
        .select('id, name, primary_platform, instagram_followers, tiktok_followers, youtube_subscribers, avg_engagement_rate, profile_image_url, niche')
        .is('deleted_at', null)
        .or(`name.ilike.%${input.query}%,bio.ilike.%${input.query}%,instagram_handle.ilike.%${input.query}%,tiktok_handle.ilike.%${input.query}%`)
        .limit(input.limit);
      
      if (error) throw new Error(`Failed to search creators: ${error.message}`);
      
      return data || [];
    }),
  
  // Get creator performance metrics
  getPerformance: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      // Get creator's completed tasks with pagination (limit to last 100 for performance)
      const { data: tasks, error, count } = await db
        .from('content_tasks')
        .select('views, engagement_rate, created_at', { count: 'exact' })
        .eq('creator_id', input.id)
        .in('status', ['approved', 'published'])
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw new Error(`Failed to fetch performance: ${error.message}`);
      
      // Calculate aggregate metrics in a single pass
      let totalViews = 0;
      let totalEngagement = 0;
      const taskCount = tasks?.length || 0;
      const recentTasks = tasks?.slice(0, 5) || [];
      
      tasks?.forEach(t => {
        totalViews += t.views || 0;
        totalEngagement += t.engagement_rate || 0;
      });
      
      return {
        totalTasksCompleted: taskCount, // Number of tasks analyzed (limited to 100)
        averageViews: taskCount > 0 ? Math.round(totalViews / taskCount) : 0,
        averageEngagementRate: taskCount > 0 ? parseFloat((totalEngagement / taskCount).toFixed(2)) : 0,
        recentTasks,
      };
    }),
});
