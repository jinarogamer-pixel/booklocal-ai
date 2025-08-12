import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id } = req.body;
  // Delete from users table
  await supabase.from('users').delete().eq('id', id);
  // Delete from Auth (requires service role key)
  await supabase.auth.admin.deleteUser(id);
  res.status(200).json({ ok: true });
}
