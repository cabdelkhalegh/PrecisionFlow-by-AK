import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

// Shortlist input schemas
const addCreatorToShortlistSchema = z.object({
  campaign_id: z.string().uuid(),
  creator_id: z.string().uuid(),
  position: z.number().int().min(1).optional(),
  proposed_rate: z.number().min(0).optional(),
  proposed_deliverables: z.array(z.string()).optional(),
  internal_notes: z.string().optional(),
});

export const shortlistsRouter = router({
  // Get shortlist for campaign
  getByCampaign: protectedProcedure
    .input(z.object({ campaign_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const { data, error } = await db
        .from('campaign_shortlists')
        .select(`
          *,
          creator:creators(*),
          campaign:campaigns(name, status)
        `)
        .eq('campaign_id', input.campaign_id)
        .is('deleted_at', null)
        .order('position', { ascending: true });
      
      if (error) throw new Error(`Failed to fetch shortlist: ${error.message}`);
      
      return data || [];
    }),
  
  // Add creator to shortlist
  addCreator: protectedProcedure
    .input(addCreatorToShortlistSchema)
    .mutation(async ({ ctx, input }) => {
      const { supabase: db, user } = ctx;
      
      // Get current max position if not provided
      let position = input.position;
      if (!position) {
        const { data: existing } = await db
          .from('campaign_shortlists')
          .select('position')
          .eq('campaign_id', input.campaign_id)
          .order('position', { ascending: false })
          .limit(1);
        
        position = (existing?.[0]?.position || 0) + 1;
      }
      
      const { data, error } = await db
        .from('campaign_shortlists')
        .insert({
          ...input,
          position,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Creator already in shortlist');
        }
        throw new Error(`Failed to add creator to shortlist: ${error.message}`);
      }
      
      return data;
    }),
  
  // Remove creator from shortlist
  removeCreator: protectedProcedure
    .input(z.object({
      campaign_id: z.string().uuid(),
      creator_id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const { data, error } = await db
        .from('campaign_shortlists')
        .update({ 
          status: 'removed',
          deleted_at: new Date().toISOString() 
        })
        .eq('campaign_id', input.campaign_id)
        .eq('creator_id', input.creator_id)
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to remove creator: ${error.message}`);
      
      return data;
    }),
  
  // Update position in shortlist
  updatePosition: protectedProcedure
    .input(z.object({
      campaign_id: z.string().uuid(),
      creator_id: z.string().uuid(),
      new_position: z.number().int().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const { data, error } = await db
        .from('campaign_shortlists')
        .update({ position: input.new_position })
        .eq('campaign_id', input.campaign_id)
        .eq('creator_id', input.creator_id)
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to update position: ${error.message}`);
      
      return data;
    }),
  
  // Update proposed rate
  updateRate: protectedProcedure
    .input(z.object({
      campaign_id: z.string().uuid(),
      creator_id: z.string().uuid(),
      proposed_rate: z.number().min(0),
      proposed_deliverables: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db } = ctx;
      
      const { data, error } = await db
        .from('campaign_shortlists')
        .update({
          proposed_rate: input.proposed_rate,
          proposed_deliverables: input.proposed_deliverables,
        })
        .eq('campaign_id', input.campaign_id)
        .eq('creator_id', input.creator_id)
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to update rate: ${error.message}`);
      
      return data;
    }),
  
  // Submit shortlist for approval
  submit: protectedProcedure
    .input(z.object({ campaign_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db, user } = ctx;
      
      // Update all draft items to submitted
      const { data, error } = await db
        .from('campaign_shortlists')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          submitted_by: user.id,
        })
        .eq('campaign_id', input.campaign_id)
        .eq('status', 'draft')
        .is('deleted_at', null)
        .select();
      
      if (error) throw new Error(`Failed to submit shortlist: ${error.message}`);
      
      return data;
    }),
  
  // Approve/reject shortlist item (client action)
  approve: protectedProcedure
    .input(z.object({
      campaign_id: z.string().uuid(),
      creator_id: z.string().uuid(),
      approved: z.boolean(),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase: db, user } = ctx;
      
      const updateData: any = {
        status: input.approved ? 'approved' : 'rejected',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      };
      
      if (input.feedback) {
        updateData.client_feedback = input.feedback;
        if (!input.approved) {
          updateData.rejection_reason = input.feedback;
        }
      }
      
      const { data, error } = await db
        .from('campaign_shortlists')
        .update(updateData)
        .eq('campaign_id', input.campaign_id)
        .eq('creator_id', input.creator_id)
        .is('deleted_at', null)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to approve shortlist: ${error.message}`);
      
      return data;
    }),
});
