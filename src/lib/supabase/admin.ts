import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * ⚠️ Client avec SERVICE ROLE KEY : bypass toutes les RLS.
 * À n'utiliser QUE dans les Route Handlers / Server Actions sécurisés.
 * JAMAIS dans un composant client.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
