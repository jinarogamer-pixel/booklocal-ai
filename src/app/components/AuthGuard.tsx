"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // Replace with real auth logic (e.g. from Supabase or NextAuth)
  const isAuthenticated = true; // TODO: wire up real auth
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  return <>{children}</>;
}
