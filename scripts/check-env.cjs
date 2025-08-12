const mask = s => (!s ? '(empty)' : s.slice(0,8)+'…'+s.slice(-6));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
console.log('[ENV] URL looks like URL?', /^https?:\/\//.test(url), 'value:', mask(url));
console.log('[ENV] KEY looks like JWT?', key.startsWith('eyJ'), 'value:', mask(key));
if (!/^https?:\/\//.test(url) || !url.includes('supabase.co')) throw new Error('BAD: URL');
if (!key.startsWith('eyJ') || key.includes('http')) throw new Error('BAD: KEY');
