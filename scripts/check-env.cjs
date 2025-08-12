// scripts/check-env.cjs
const mask = s => (!s ? '(empty)' : s.slice(0,8)+'…'+s.slice(-6));

const keys = Object.keys(process.env).filter(k => k.includes('SUPABASE'));
console.log('[ENV] VERCEL_ENV=', process.env.VERCEL_ENV, ' BRANCH=', process.env.VERCEL_GIT_COMMIT_REF);
console.log('[ENV] Found SUPABASE-like keys:', keys);

const URL = process.env.NEXT_PUBLIC_BOOKLOCAL_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const KEY = process.env.NEXT_PUBLIC_BOOKLOCAL_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('[ENV] URL value (masked):', mask(URL));
console.log('[ENV] KEY value (masked):', mask(KEY));
console.log('[ENV] URL looks like URL?', /^https?:\/\//.test(URL));
console.log('[ENV] KEY looks like JWT?', KEY.startsWith('eyJ'));

if (!/^https?:\/\//.test(URL) || !URL.includes('supabase.co')) throw new Error('BAD: URL');
if (!KEY.startsWith('eyJ') || KEY.includes('http')) throw new Error('BAD: KEY');
