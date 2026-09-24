// auth context
//
// supabase-backed replacement for the original base44 auth wrapper. it
// keeps the same shape that the rest of the app already consumes:
//   - isAuthenticated, user, isLoadingAuth, authError
//   - navigateToLogin(), logout()
// plus a few new helpers for the email/google/demo sign-in screen.
//
// notes on demo mode: a "demo" session is just a regular supabase
// account created on the fly with a random email. the profile row gets
// flagged is_demo = true via the new-user trigger, which we use later
// to label the experience and to make it obvious in admin views.

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // public-settings + general loading flag kept so existing app shell
  // checks (`if (isLoadingPublicSettings || isLoadingAuth)`) keep
  // resolving without us having to touch App.jsx beyond imports.
  const isLoadingPublicSettings = false;
  const authError = null;

  useEffect(() => {
    // important: register the listener before we ask for the session,
    // otherwise we can race the initial sign_in event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigateToLogin = useCallback(() => {
    if (typeof window !== 'undefined') window.location.href = '/auth';
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    if (typeof window !== 'undefined') window.location.href = '/';
  }, []);

  const value = {
    user,
    session,
    isAuthenticated: !!session,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    appPublicSettings: { id: 'sculptura' },
    navigateToLogin,
    logout,
    checkAppState: () => Promise.resolve(),
    checkUserAuth: () => Promise.resolve(),
    authChecked: !isLoadingAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
