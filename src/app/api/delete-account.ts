import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseServiceRoleKey
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id } = req.body;
  // Delete from users table
  await supabase.from('users').delete().eq('id', id);
  // Delete from Auth (requires service role key)
  await supabase.auth.admin.deleteUser(id);
  // Rate limiting stub
  // TODO: Implement rate limiting (e.g., per user or IP)
  // Audit log
  await supabase.from('audit_log').insert({ user_id: id, action: 'account_delete', details: { reason: 'user requested deletion' } });
  // Notification stub
  // TODO: Send email or in-app notification to user about account deletion
  res.status(200).json({ ok: true });
}
