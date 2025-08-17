'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/';

  useEffect(() => {
    // Check if already signed in
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push(redirectTo);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push(redirectTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, redirectTo]);

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + redirectTo,
      },
    });

    if (error) {
      console.error('Error signing in:', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-neutral-800/50 backdrop-blur p-8 rounded-xl border border-neutral-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-neutral-400">Sign in to access your dashboard</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSignIn}
            className="w-full bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors font-medium"
          >
            Sign in with Google
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-neutral-700 text-white px-6 py-3 rounded-lg hover:bg-neutral-600 transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>}>
      <SignInContent />
    </Suspense>
  );
}
