import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { getSupabase } from '@/lib/supabaseClient';

export async function POST() {
  try {
    const auth = (await headers()).get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : (await cookies()).get('sb-access-token')?.value || null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Prevent deletion if user email is not confirmed
    if (!user.email_confirmed_at) {
      return NextResponse.json({ error: 'Email not verified. Please verify your email before requesting account deletion.' }, { status: 403 });
    }

    const uid = user.id;

    // Clean up user data (RLS ensures only own data is deleted)
    await supabase.from('reviews').delete().eq('user_id', uid);
    await supabase.from('bookings').delete().eq('user_id', uid);

    // Mark user for deletion (actual deletion by Edge Function/cron with service key)
    await supabase.from('profiles').update({ deletion_requested: true }).eq('id', uid);

    // Audit log
    await supabase.from('audit_log').insert({ user_id: uid, action: 'account_delete', details: { reason: 'user requested deletion' } });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err ? (err as { message?: string }).message ?? 'Server error' : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
