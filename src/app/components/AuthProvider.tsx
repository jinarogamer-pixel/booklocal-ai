"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

import type { User } from '@supabase/supabase-js';
interface UserContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<unknown>;
  signUp: (email: string, password: string) => Promise<unknown>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    const getUserAndRole = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        // Fetch user role from 'profiles' table (or user_metadata)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        setRole((profile as { role?: string })?.role || 'user');
      } else {
        setRole(null);
      }
      setLoading(false);
    };
    getUserAndRole();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => setRole((profile as { role?: string })?.role || 'user'));
      } else {
        setRole(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = (email: string, password: string) => getSupabase().auth.signInWithPassword({ email, password });
  const signUp = (email: string, password: string) => getSupabase().auth.signUp({ email, password });
  const signOut = async () => { await getSupabase().auth.signOut(); };

  return (
    <UserContext.Provider value={{ user, role, loading, signIn, signUp, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within AuthProvider");
  return ctx;
}
