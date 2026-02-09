/**
 * Browser-side Supabase client for authentication.
 * Uses the anon key and persists the session in localStorage.
 *
 * Lazily initialised so that the module can be imported at build time
 * (SSG / static generation) without throwing when env vars are absent.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }

    _client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}

/**
 * Proxy so every property access lazily initialises the real client.
 * This lets modules import `supabaseBrowser` at the top level without
 * crashing during Next.js static page generation.
 */
export const supabaseBrowser: SupabaseClient = new Proxy(
  {} as SupabaseClient,
  {
    get(_target, prop) {
      const client = getClient();
      const value = Reflect.get(client, prop, client);
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    },
  },
);
