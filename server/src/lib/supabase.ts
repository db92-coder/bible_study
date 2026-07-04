import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { envVar } from './env.js';

const url = envVar('SUPABASE_URL');
const serviceRoleKey = envVar('SUPABASE_SERVICE_ROLE_KEY');

export const supabase: SupabaseClient | null =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, { auth: { persistSession: false } })
    : null;

if (!supabase) {
  console.warn(
    '[scribe] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — database-backed features are disabled until configured.',
  );
}
