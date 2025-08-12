// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_BOOKLOCAL_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_BOOKLOCAL_SUPABASE_ANON_KEY!;
  if (!/^https?:\/\//.test(url)) throw new Error('Invalid SUPABASE URL');
  if (!anon || anon.includes('http')) throw new Error('Invalid ANON KEY');
  return createClient(url, anon);
}
