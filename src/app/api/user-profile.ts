import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get user profile by id
    const { id } = req.query;
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    // Rate limiting stub
    // TODO: Implement rate limiting (e.g., per user or IP)

    // Update user profile
    const { id, name, email, avatar_url } = req.body;
    const { error } = await supabase.from('users').update({ name, email, avatar_url }).eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    // Audit log
    await supabase.from('audit_log').insert({ user_id: id, action: 'profile_update', details: { name, email, avatar_url } });
    // Notification stub
    // TODO: Send email or in-app notification to user about profile update
    return res.status(200).json({ ok: true });
  }
  res.status(405).end();
}
