import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

// Content task input schemas
const createContentTaskSchema = z.object({
  campaign_id: z.string().uuid(),
  creator_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  deliverable_type: z.enum([
    'instagram_post', 'instagram_story', 'instagram_reel',
    'tiktok_video', 'youtube_video', 'youtube_short',
    'twitter_post', 'facebook_post', 'blog_post', 'other'
  ]),
  requirements: z.record(z.any()).optional(),
  quantity: z.number().int().min(1).default(1),
  duration_seconds: z.number().int().min(0).optional(),
  deadline: z.string().datetime(),
  script_deadline: z.string().datetime().optional(),
  draft_deadline: z.string().datetime().optional(),
  final_deadline: z.string().datetime().optional(),
  payment_amount: z.number().min(0).optional(),
});

export const contentTasksRouter = router({
  // Create content task
  create: protectedProcedure
    .input(createContentTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase: db, user } = ctx;
      
      const { data, error } = await db
        .from('content_tasks')
        .insert({
          ...input,
          assigned_by: user.id,
          created_by: user.id,
          status: 'assigned',
          payment_status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw new Error(`Failed to create task: ${error.message}`);
      
      return data;
    }),
  
  // Get tasks by campaign
  getByCampaign: protectedProcedure
    .input(z.object({ 
      campaign_id: z.string().uuid(),
      status: z.enum([
        'assigned', 'script_submitted', 'script_approved', 
        'draft_submitted', 'draft_approved', 'changes_requested',
        'final_submitted', 'approved', 'published', 'cancelled'
      ]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      let query = db
        .from('content_tasks')
        .select(`
          *,
          creator:creators(name, primary_platform, profile_image_url),
          campaign:campaigns(name, status)
        `)
        .eq('campaign_id', input.campaign_id)
        .is('deleted_at', null)
        .order('deadline', { ascending: true });
      
      if (input.status) {
        query = query.eq('status', input.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
      
      return data || [];
    }),
  
  // Get tasks by creator
  getByCreator: protectedProcedure
    .input(z.object({ creator_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const { data, error } = await db
        .from('content_tasks')
        .select(`
          *,
          campaign:campaigns(name, status, client_id)
        `)
        .eq('creator_id', input.creator_id)
        .is('deleted_at', null)
        .order('deadline', { ascending: true });
      
      if (error) throw new Error(`Failed to fetch creator tasks: ${error.message}`);
      
      return data || [];
    }),
  
  // Get task by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const { data, error } = await db
        .from('content_tasks')
        .select(`
          *,
          creator:creators(*),
          campaign:campaigns(*),
          assigned_by_user:assigned_by(email)
        `)
        .eq('id', input.id)
        .is('deleted_at', null)
        .single();
      
      if (error) throw new Error(`Failed to fetch task: ${error.message}`);
      if (!data) throw new Error('Task not found');
      
      return data;
    }),
  
  // Update task status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum([
        'assigned', 'script_submitted', 'script_approved',
        'draft_submitted', 'draft_approved', 'changes_requested',
        'final_submitted', 'approved', 'published', 'cancelled'
      ]),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const updateData: any = { status: input.status };
      
      if (input.feedback) {
        updateData.feedback = input.feedback;
      }
      
      const { data, error } = await db
        .from('content_tasks')
        .update(updateData)
        .eq('id', input.id)
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to update task status: ${error.message}`);
      
      return data;
    }),
  
  // Approve script (Gate 1)
  approveScript: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      approved: z.boolean(),
      comments: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db, user } = ctx;
      
      const updateData: any = {
        status: input.approved ? 'script_approved' : 'changes_requested',
      };
      
      if (input.approved) {
        updateData.script_approved_at = new Date().toISOString();
        updateData.script_approved_by = user.id;
      }
      
      if (input.comments) {
        updateData.feedback = input.comments;
      }
      
      const { data, error } = await db
        .from('content_tasks')
        .update(updateData)
        .eq('id', input.id)
        .eq('status', 'script_submitted')
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to approve script: ${error.message}`);
      
      return data;
    }),
  
  // Approve draft (Gate 2)
  approveDraft: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      approved: z.boolean(),
      comments: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db, user } = ctx;
      
      const updateData: any = {
        status: input.approved ? 'draft_approved' : 'changes_requested',
      };
      
      if (input.approved) {
        updateData.draft_approved_at = new Date().toISOString();
        updateData.draft_approved_by = user.id;
      }
      
      if (input.comments) {
        updateData.feedback = input.comments;
      }
      
      const { data, error } = await db
        .from('content_tasks')
        .update(updateData)
        .eq('id', input.id)
        .eq('status', 'draft_submitted')
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to approve draft: ${error.message}`);
      
      return data;
    }),
  
  // Approve final (Gate 3)
  approveFinal: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      approved: z.boolean(),
      comments: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db, user } = ctx;
      
      const updateData: any = {
        status: input.approved ? 'approved' : 'changes_requested',
      };
      
      if (input.approved) {
        updateData.final_approved_at = new Date().toISOString();
        updateData.final_approved_by = user.id;
      }
      
      if (input.comments) {
        updateData.feedback = input.comments;
      }
      
      const { data, error } = await db
        .from('content_tasks')
        .update(updateData)
        .eq('id', input.id)
        .eq('status', 'final_submitted')
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to approve final: ${error.message}`);
      
      return data;
    }),
  
  // Request changes
  requestChanges: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      revision_notes: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      // Get current revision notes
      const { data: task } = await db
        .from('content_tasks')
        .select('revision_notes')
        .eq('id', input.id)
        .single();
      
      const existingNotes = Array.isArray(task?.revision_notes) ? (task.revision_notes as string[]) : [];
      const newNotes = [...existingNotes, input.revision_notes];
      
      const { data, error } = await db
        .from('content_tasks')
        .update({
          status: 'changes_requested',
          revision_notes: newNotes,
          feedback: input.revision_notes,
        })
        .eq('id', input.id)
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to request changes: ${error.message}`);
      
      return data;
    }),
});
