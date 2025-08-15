import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_BOOKLOCAL_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_BOOKLOCAL_SUPABASE_ANON_KEY || '';

const supabase = url && key ? createClient(url, key) : null;

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) {
    console.warn('[EmailVerification] No Supabase client available');
    return { data: null, error: { message: 'Service unavailable' } };
  }
  return supabase.auth.signUp({ email, password });
}

export async function sendPasswordReset(email: string) {
  if (!supabase) {
    console.warn('[EmailVerification] No Supabase client available');
    return { error: { message: 'Service unavailable' } };
  }
  return supabase.auth.resetPasswordForEmail(email);
}
