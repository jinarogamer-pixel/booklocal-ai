
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSupabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { scope, value, userId } = await req.json();
    if (typeof scope !== 'string' || typeof value !== 'boolean') {
      return NextResponse.json({ error: 'Bad payload' }, { status: 400 });
    }
    const hdrs = await headers();
    const ua = hdrs.get('user-agent') ?? '';
    const ip = (hdrs.get('x-forwarded-for') || '').split(',')[0].trim();

    const supabase = getSupabase();
    // TODO: create table consent_log(user_id uuid, scope text, value bool, ua text, ip inet, created_at timestamptz default now())
    // and a permissive insert policy for anon or auth users as you prefer.
    await supabase.from('consent_log').insert({ user_id: userId ?? null, scope, value, ua, ip });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}

// GET /api/consent/log?userId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('consent_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}
