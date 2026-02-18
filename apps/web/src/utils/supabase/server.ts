/**
 * Server-side Supabase client wrapper for backwards compatibility.
 * Falls back to the database package's server client.
 */
export { supabase as createClient } from '@precisionflow/database';
