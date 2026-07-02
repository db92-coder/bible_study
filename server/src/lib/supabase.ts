import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase: SupabaseClient | null =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, { auth: { persistSession: false } })
    : null;

if (!supabase) {
  console.warn(
    '[scribe] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — database-backed features are disabled until configured.',
  );
}
