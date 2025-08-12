// scripts/check-env.ts
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!/^https?:\/\//.test(url)) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
}
if (key.includes('http') || key.endsWith('/')) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY looks wrong (contains http or trailing /).');
}
console.log('Supabase env vars look sane.');
