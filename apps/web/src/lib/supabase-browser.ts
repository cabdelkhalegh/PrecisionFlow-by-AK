/**
 * Browser-side Supabase client for authentication.
 * Uses the anon key and persists the session in localStorage.
 *
 * Lazily initialised so that the module can be imported at build time
 * (SSG / static generation) without throwing when env vars are absent.
 * If env vars are missing at runtime, returns safe no-op defaults
 * instead of crashing the page.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;
let _warned = false;

function getClient(): SupabaseClient | null {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (!_warned && typeof window !== 'undefined') {
      _warned = true;
      console.warn(
        'PrecisionFlow: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
          'Auth features will be unavailable.',
      );
    }
    return null;
  }

  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return _client;
}

/**
 * Safe no-op auth object returned when Supabase is not configured.
 * Prevents client-side crashes on pages that reference auth.
 */
const noopAuth = {
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  onAuthStateChange: () => ({
    data: { subscription: { unsubscribe: () => {} } },
  }),
  signOut: () => Promise.resolve({ error: null }),
  signInWithPassword: () =>
    Promise.resolve({
      data: { user: null, session: null },
      error: { message: 'Supabase not configured' },
    }),
  signUp: () =>
    Promise.resolve({
      data: { user: null, session: null },
      error: { message: 'Supabase not configured' },
    }),
};

/**
 * Proxy so every property access lazily initialises the real client.
 * If env vars are missing, returns safe no-op defaults instead of throwing.
 */
export const supabaseBrowser: SupabaseClient = new Proxy(
  {} as SupabaseClient,
  {
    get(_target, prop) {
      // Return safe no-op auth if supabase is not configured
      if (prop === 'auth') {
        const client = getClient();
        if (!client) return noopAuth;
        return client.auth;
      }

      const client = getClient();
      if (!client) {
        // Return no-op for any other property/method
        return () =>
          Promise.resolve({
            data: null,
            error: { message: 'Supabase not configured' },
          });
      }

      const value = Reflect.get(client, prop, client);
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    },
  },
);
