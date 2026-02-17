import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

// Content artifact input schemas
const uploadArtifactSchema = z.object({
  content_task_id: z.string().uuid(),
  artifact_type: z.enum(['script', 'draft', 'final', 'thumbnail', 'caption', 'other']),
  file_url: z.string().url().optional(),
  file_name: z.string().optional(),
  file_size: z.number().int().min(0).optional(),
  file_type: z.string().optional(),
  text_content: z.string().optional(),
  duration_seconds: z.number().int().min(0).optional(),
  width: z.number().int().min(0).optional(),
  height: z.number().int().min(0).optional(),
  format: z.string().optional(),
  revision_notes: z.string().optional(),
});

export const contentArtifactsRouter = router({
  // Upload new artifact
  upload: protectedProcedure
    .input(uploadArtifactSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase: db, user } = ctx;
      
      // Get current version number and ID in a single query
      const { data: existingVersions } = await db
        .from('content_artifacts')
        .select('id, version')
        .eq('content_task_id', input.content_task_id)
        .eq('artifact_type', input.artifact_type)
        .order('version', { ascending: false })
        .limit(1);
      
      const newVersion = (existingVersions?.[0]?.version || 0) + 1;
      // Only link to previous version if this isn't the first version
      const previous_version_id = newVersion > 1 ? (existingVersions?.[0]?.id || null) : null;
      
      // Mark all previous artifacts as not latest (if any exist)
      if (newVersion > 1) {
        await db
          .from('content_artifacts')
          .update({ is_latest: false })
          .eq('content_task_id', input.content_task_id)
          .eq('artifact_type', input.artifact_type);
      }
      
      const { data, error } = await db
        .from('content_artifacts')
        .insert({
          ...input,
          uploaded_by: user.id,
          version: newVersion,
          is_latest: true,
          status: 'pending',
          previous_version_id,
        })
        .select()
        .single();
      
      if (error) throw new Error(`Failed to upload artifact: ${error.message}`);
      
      // Update task status based on artifact type
      if (input.artifact_type === 'script') {
        await db
          .from('content_tasks')
          .update({ status: 'script_submitted' })
          .eq('id', input.content_task_id);
      } else if (input.artifact_type === 'draft') {
        await db
          .from('content_tasks')
          .update({ status: 'draft_submitted' })
          .eq('id', input.content_task_id);
      } else if (input.artifact_type === 'final') {
        await db
          .from('content_tasks')
          .update({ status: 'final_submitted' })
          .eq('id', input.content_task_id);
      }
      
      return data;
    }),
  
  // Get artifacts by task
  getByTask: protectedProcedure
    .input(z.object({ 
      content_task_id: z.string().uuid(),
      artifact_type: z.enum(['script', 'draft', 'final', 'thumbnail', 'caption', 'other']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      let query = db
        .from('content_artifacts')
        .select(`
          *,
          uploaded_by_user:uploaded_by(email),
          reviewed_by_user:reviewed_by(email)
        `)
        .eq('content_task_id', input.content_task_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (input.artifact_type) {
        query = query.eq('artifact_type', input.artifact_type);
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(`Failed to fetch artifacts: ${error.message}`);
      
      return data || [];
    }),
  
  // Get latest artifact of type
  getLatest: protectedProcedure
    .input(z.object({
      content_task_id: z.string().uuid(),
      artifact_type: z.enum(['script', 'draft', 'final', 'thumbnail', 'caption', 'other']),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const { data, error } = await db
        .from('content_artifacts')
        .select('*')
        .eq('content_task_id', input.content_task_id)
        .eq('artifact_type', input.artifact_type)
        .eq('is_latest', true)
        .is('deleted_at', null)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch latest artifact: ${error.message}`);
      }
      
      return data || null;
    }),
  
  // Approve artifact
  approve: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      comments: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db, user } = ctx;
      
      const { data, error } = await db
        .from('content_artifacts')
        .update({
          approval_status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          review_comments: input.comments,
        })
        .eq('id', input.id)
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to approve artifact: ${error.message}`);
      
      return data;
    }),
  
  // Request changes on artifact
  requestChanges: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      comments: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db, user } = ctx;
      
      const { data, error } = await db
        .from('content_artifacts')
        .update({
          approval_status: 'changes_requested',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          review_comments: input.comments,
        })
        .eq('id', input.id)
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to request changes: ${error.message}`);
      
      return data;
    }),
  
  // Get version history
  getVersionHistory: protectedProcedure
    .input(z.object({
      content_task_id: z.string().uuid(),
      artifact_type: z.enum(['script', 'draft', 'final', 'thumbnail', 'caption', 'other']),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const { data, error } = await db
        .from('content_artifacts')
        .select(`
          *,
          uploaded_by_user:uploaded_by(email),
          reviewed_by_user:reviewed_by(email)
        `)
        .eq('content_task_id', input.content_task_id)
        .eq('artifact_type', input.artifact_type)
        .is('deleted_at', null)
        .order('version', { ascending: false });
      
      if (error) throw new Error(`Failed to fetch version history: ${error.message}`);
      
      return data || [];
    }),
});
