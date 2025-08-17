// Deno environment variables and serve function for Edge Functions
// @ts-ignore Deno-specific import
const Deno = globalThis.Deno;
// @ts-ignore Deno-specific import
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-ignore Deno-specific import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req: Request) => {
  // Find users marked for deletion
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('deletion_requested', true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  for (const profile of profiles || []) {
    // Delete user from auth
    await supabase.auth.admin.deleteUser(profile.id);
    // Delete from profiles
    await supabase.from('profiles').delete().eq('id', profile.id);
    // Log audit
    await supabase.from('audit_log').insert({
      user_id: profile.id,
      action: 'account_deleted',
      details: { reason: 'scheduled deletion' }
    });
  }

  return new Response(JSON.stringify({ deleted: (profiles || []).length }), { status: 200 });
});
