import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);
  const filename = `avatar-${Date.now()}.png`;
  const { data, error } = await supabase.storage.from('avatars').upload(filename, buffer, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) return res.status(400).json({ error: error.message });
  const { publicUrl } = supabase.storage.from('avatars').getPublicUrl(filename).data;
  return res.status(200).json({ url: publicUrl });
}
