import { supabaseBrowser } from '@/lib/supabase-browser';

// Server-side: reuse the same client for now
// In production, this should use createServerClient from @supabase/ssr
export const createClient = () => supabaseBrowser;
