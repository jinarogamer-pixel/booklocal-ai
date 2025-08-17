"use client";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function NavBar() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/90 backdrop-blur shadow-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-lg group">
          <img src="/booklocal-logo.svg" alt="BookLocal logo" width={36} height={36} className="drop-shadow-md transition-transform group-hover:scale-105" />
          <span className="text-white">Book</span>
          <span className="text-sky-400">Local</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-neutral-300 hover:text-white transition-colors">
            Home
          </Link>
          
          {!loading && (
            <>
              {authed ? (
                <>
                  <Link href="/analytics" className="text-sm text-neutral-300 hover:text-white transition-colors">
                    Analytics
                  </Link>
                  <Link href="/admin" className="text-sm text-neutral-300 hover:text-white transition-colors">
                    Admin
                  </Link>
                  <Link href="/payments" className="text-sm text-neutral-300 hover:text-white transition-colors">
                    Payments
                  </Link>
                  <Link href="/user-profile" className="text-sm text-neutral-300 hover:text-white transition-colors">
                    Profile
                  </Link>
                  <Link href="/chat" className="text-sm text-neutral-300 hover:text-white transition-colors">
                    Chat
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/onboarding" className="text-sm text-neutral-300 hover:text-white transition-colors">
                    Get Started
                  </Link>
                  <Link href="/provider-signup" className="text-sm text-neutral-300 hover:text-white transition-colors">
                    For Providers
                  </Link>
                  <Link href="/auth/sign-in" className="text-sm bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors">
                    Sign In
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
