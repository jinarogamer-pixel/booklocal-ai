"use client";
// ReviewModerationPanel: Admin tool for moderating reviews
import { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabaseClient';

interface Review {
  id: string;
  user: string;
  provider: string;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function ReviewModerationPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);


  // Always use a local supabase instance
  const supabase = getSupabase();

  // Fetch reviews from Supabase
  async function fetchReviews() {
    setLoading(true);
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (!error) setReviews((data as unknown as Review[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchReviews();
    // Real-time subscription
    const channel = supabase.channel('realtime:reviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        fetchReviews();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function moderate(id: string, status: 'approved' | 'rejected') {
    await supabase.from('reviews').update({ status }).eq('id', id);
    // UI will update via subscription
  }

  return (
    <div className="glass-card animate-fade-in-up p-6">
      <h2 className="font-bold text-lg mb-4">Review Moderation</h2>
      {loading ? (
        <div className="empty-state">Loading reviews…</div>
      ) : (
        <ul className="space-y-4">
          {reviews.map(r => (
            <li key={r.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 rounded-lg border border-gray-100 bg-white/60">
              <div>
                <div className="font-semibold">{r.user} → {r.provider}</div>
                <div className="text-gray-700">{r.text}</div>
                <div className="text-xs text-gray-400">Status: {r.status}</div>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={() => moderate(r.id, 'approved')}>Approve</button>
                  <button className="btn-primary" onClick={() => moderate(r.id, 'rejected')}>Reject</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
