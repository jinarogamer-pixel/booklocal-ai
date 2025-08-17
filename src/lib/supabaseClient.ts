// src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (supabase) return supabase;
  
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_BOOKLOCAL_SUPABASE_URL || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_BOOKLOCAL_SUPABASE_ANON_KEY || '';
  
  // Allow development/preview builds without Supabase
  if (!url || !anon) {
    console.warn('[Supabase] Missing credentials - using mock client');
    // Return a mock client that won't crash
    supabase = {
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
      auth: {
        signUp: () => ({ data: null, error: null }),
        signIn: () => ({ data: null, error: null }),
        signOut: () => ({ error: null }),
        getUser: () => ({ data: { user: null }, error: null }),
      }
    } as unknown as ReturnType<typeof createClient>;
    return supabase;
  }
  
  if (!/^https?:\/\//.test(url)) throw new Error('Invalid SUPABASE URL');
  if (!anon || anon.includes('http')) throw new Error('Invalid ANON KEY');
  
  supabase = createClient(url, anon, { 
    realtime: { params: { eventsPerSecond: 2 } } 
  });
  return supabase;
}
