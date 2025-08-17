// src/lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let serverClient: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
  }
  return serverClient;
}
