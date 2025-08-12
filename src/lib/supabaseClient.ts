// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
if (!/^https?:\/\//.test(supabaseUrl)) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
}
if (supabaseAnonKey.includes('http') || supabaseAnonKey.endsWith('/')) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY looks wrong (contains http or trailing /)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
