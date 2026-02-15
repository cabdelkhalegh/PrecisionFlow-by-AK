/**
 * Authentication context provider.
 * Listens to Supabase auth state changes and provides user/session to the app.
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabaseBrowser } from './supabase-browser';

/**
 * Sync a simple cookie so the Next.js middleware can detect auth state.
 * Supabase JS v2 stores sessions in localStorage (not cookies), so
 * the middleware has no way to know about the session otherwise.
 */
function syncAuthCookie(isAuthenticated: boolean) {
  if (typeof document === 'undefined') return;
  if (isAuthenticated) {
    document.cookie = 'pf-auth=1; path=/; max-age=86400; SameSite=Lax';
  } else {
    document.cookie = 'pf-auth=; path=/; max-age=0; SameSite=Lax';
  }
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabaseBrowser.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      syncAuthCookie(!!s);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      syncAuthCookie(!!s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    syncAuthCookie(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
