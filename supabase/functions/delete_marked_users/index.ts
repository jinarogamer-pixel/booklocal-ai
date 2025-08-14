// Edge Function: Securely delete users marked for deletion

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req) => {
  try {
    // Find users marked for deletion
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('deletion_requested', true);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    let deletedCount = 0;
    const errors = [];

    for (const profile of profiles || []) {
      try {
        // Delete user from auth
        const { error: authError } = await supabase.auth.admin.deleteUser(profile.id);
        if (authError) throw new Error(`Auth delete error: ${authError.message}`);

        // Delete from profiles
        const { error: profileError } = await supabase.from('profiles').delete().eq('id', profile.id);
        if (profileError) throw new Error(`Profile delete error: ${profileError.message}`);

        // Log audit (details must be a string)
        const { error: auditError } = await supabase.from('audit_log').insert({
          user_id: profile.id,
          action: 'account_deleted',
          details: JSON.stringify({ reason: 'scheduled deletion' })
        });
        if (auditError) throw new Error(`Audit log error: ${auditError.message}`);

        deletedCount++;
      } catch (err) {
        errors.push({ user: profile.id, error: err.message });
      }
    }

    return new Response(
      JSON.stringify({ deleted: deletedCount, errors }),
      { status: errors.length === 0 ? 200 : 207 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
