/**
 * Activity Logs router — read-only queries on the audit_logs table.
 * Surfaces the immutable audit trail as a user-facing activity feed.
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

export const activityLogsRouter = router({
  /**
   * List recent activity across all entities.
   * Supports pagination, entity-type filter, and action filter.
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(30),
        offset: z.number().min(0).default(0),
        tableName: z.string().optional(),
        operation: z.enum(['INSERT', 'UPDATE', 'DELETE']).optional(),
        recordId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (input.tableName) {
        query = query.eq('table_name', input.tableName);
      }
      if (input.operation) {
        query = query.eq('operation', input.operation);
      }
      if (input.recordId) {
        query = query.eq('record_id', input.recordId);
      }

      const { data, error, count } = await query;

      if (error) throw new Error(`Failed to fetch activity: ${error.message}`);

      return {
        logs: data || [],
        total: count || 0,
      };
    }),

  /**
   * Get audit history for a single record.
   */
  getByRecord: protectedProcedure
    .input(
      z.object({
        tableName: z.string(),
        recordId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', input.tableName)
        .eq('record_id', input.recordId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Failed to fetch record history: ${error.message}`);

      return data || [];
    }),

  /**
   * Aggregate activity counts by entity type (for summary widgets).
   */
  summary: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('audit_logs')
      .select('table_name', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw new Error(`Failed to fetch activity summary: ${error.message}`);

    // Group counts by table_name client-side (Supabase doesn't have GROUP BY in PostgREST)
    const counts: Record<string, number> = {};
    for (const row of data || []) {
      const name = (row as Record<string, unknown>).table_name as string;
      counts[name] = (counts[name] || 0) + 1;
    }

    return counts;
  }),
});
