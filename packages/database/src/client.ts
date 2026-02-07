/**
 * Supabase client configuration for TiKiT OS
 * Provides type-safe database access with connection pooling
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Client-side Supabase client (uses anon key with RLS)
 * Safe to use in browser/client components
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});

/**
 * Server-side Supabase client (uses service role key, bypasses RLS)
 * ⚠️ ONLY use in server-side code (API routes, server components, edge functions)
 * ⚠️ NEVER expose to client-side code
 */
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
    })
  : null;

// Helper to check if admin client is available
export const hasAdminAccess = () => supabaseAdmin !== null;

// Export types
export type { Database } from './database.types';
