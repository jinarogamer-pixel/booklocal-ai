"use client";
import { getSupabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const supabase = getSupabase();
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    if (!accessToken) {
      setError('You must be logged in to delete your account.');
      setLoading(false);
      return;
    }
    const res = await fetch('/api/account/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      alert('Account deleted.');
      await supabase.auth.signOut();
      window.location.href = '/';
    } else {
      setError(data.error || 'Failed to delete account.');
    }
    setLoading(false);
  }

  return (
    <div className="my-8">
      <button
        onClick={handleDelete}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Deleting...' : 'Delete My Account'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}
