import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase con service_role_key.
 * USO EXCLUSIVO en API Routes (server-side).
 * NUNCA importar desde componentes client-side.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
