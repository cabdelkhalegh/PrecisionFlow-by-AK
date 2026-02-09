/**
 * tRPC configuration and context for PrecisionFlow
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { supabase } from '@precisionflow/database';
import type { User } from '@supabase/supabase-js';

/**
 * tRPC context - includes authenticated user and database client
 */
export interface Context {
  user: User | null;
  supabase: typeof supabase;
}

/**
 * Initialize tRPC with context
 */
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Public procedures - no authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedures - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Type-narrowed to non-null
    },
  });
});

/**
 * Admin-only procedures - requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // Query user role from database
  const { data: userData, error } = await ctx.supabase
    .from('users')
    .select('role')
    .eq('id', ctx.user.id)
    .single();

  if (error || !userData) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to verify user role',
    });
  }

  if (userData.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }

  return next({ ctx });
});

/**
 * Director or Admin procedures
 */
export const directorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const { data: userData, error } = await ctx.supabase
    .from('users')
    .select('role')
    .eq('id', ctx.user.id)
    .single();

  if (error || !userData) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to verify user role',
    });
  }

  if (!['admin', 'director'].includes(userData.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be a director or admin to access this resource',
    });
  }

  return next({ ctx });
});

export const router = t.router;
export const middleware = t.middleware;
