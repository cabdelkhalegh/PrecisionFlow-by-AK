/**
 * Supabase client configuration for TiKiT OS
 * Provides type-safe database access with connection pooling
 *
 * Clients are lazily initialized so the module can be imported at build time
 * without requiring environment variables to be present.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

let _supabase: SupabaseClient<Database> | null = null;
let _supabaseAdmin: SupabaseClient<Database> | null = null;

/**
 * Client-side Supabase client (uses anon key with RLS)
 * Safe to use in browser/client components
 */
export const getSupabase = (): SupabaseClient<Database> => {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      db: {
        schema: 'public',
      },
    });
  }
  return _supabase;
};

/**
 * Backwards-compatible lazy proxy so existing code using `supabase.*` keeps working.
 * Property access is forwarded to the lazily-initialised client.
 */
export const supabase: SupabaseClient<Database> = new Proxy(
  {} as SupabaseClient<Database>,
  {
    get(_target, prop) {
      const client = getSupabase();
      const value = Reflect.get(client, prop, client);
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    },
  },
);

/**
 * Server-side Supabase client (uses service role key, bypasses RLS)
 * ⚠️ ONLY use in server-side code (API routes, server components, edge functions)
 * ⚠️ NEVER expose to client-side code
 */
export const getSupabaseAdmin = (): SupabaseClient<Database> | null => {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return null;
    }

    _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
    });
  }
  return _supabaseAdmin;
};

/**
 * Lazy proxy for the admin Supabase client.
 * Returns null at the top level if the service role key is unavailable.
 * Callers should check `hasAdminAccess()` before using this.
 */
export const supabaseAdmin: SupabaseClient<Database> | null = new Proxy(
  {} as SupabaseClient<Database>,
  {
    get(_target, prop) {
      const client = getSupabaseAdmin();
      if (client === null) {
        throw new Error(
          'Supabase admin client is not available. Set SUPABASE_SERVICE_ROLE_KEY to enable admin access.',
        );
      }
      const value = Reflect.get(client, prop, client);
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    },
  },
) as SupabaseClient<Database> | null;

// Helper to check if admin client is available
export const hasAdminAccess = () => getSupabaseAdmin() !== null;

// Export types
export type { Database } from './database.types';
