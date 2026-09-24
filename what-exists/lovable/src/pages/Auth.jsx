// auth screen
//
// supports three sign-in flows:
//   1. google (managed by lovable cloud out of the box)
//   2. email + password (signup or sign-in toggle)
//   3. demo mode: spins up a throwaway account with a generated email
//      and a strong random password so you can poke around without
//      committing to a real signup. demo accounts get is_demo=true on
//      their profile via the new-user trigger.
//
// the visual language matches the rest of the app: light paper
// background, serif headline, lowercase ui copy, lots of whitespace.

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowRight, Mail, Wand2 } from 'lucide-react';

function generateDemoCredentials() {
  // we want demo emails to be obviously demo so admins can clean them
  // up later, while still being unique per session.
  const slug = Math.random().toString(36).slice(2, 10);
  const email = `demo_${slug}@sculptura.demo`;
  // strong-ish random password - not used by the user, only by supabase
  const buffer = new Uint8Array(18);
  window.crypto.getRandomValues(buffer);
  const password = Array.from(buffer).map((b) => b.toString(16).padStart(2, '0')).join('');
  return { email, password, displayName: `demo ${slug.slice(0, 4)}` };
}

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);

  const submitEmail = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('email and password are required'); return; }
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('signed in');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // keep users on this domain after they confirm.
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName || email.split('@')[0] },
          },
        });
        if (error) throw error;
        toast.success('check your inbox to confirm your email');
        setMode('signin');
      }
    } catch (err) {
      toast.error(err.message || 'something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err.message || 'google sign-in failed');
      setBusy(false);
    }
  };

  // demo mode: skip signup entirely. we just route to the public buyer
  // demo sandbox which uses mock data via localStorage. this avoids the
  // email-confirmation wall and works without any backend roundtrip.
  const enterDemoMode = () => {
    navigate('/demo/buyer');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center mb-12">
          <span className="font-wordmark text-lg text-muted-foreground/40">sculptura</span>
        </Link>

        <div className="space-y-7">
          <div>
            <h1 className="font-serif text-2xl font-light tracking-tight lowercase text-foreground mb-1">
              {mode === 'signin' ? 'welcome back' : 'create your account'}
            </h1>
            <p className="text-sm text-muted-foreground tracking-wide font-light">
              {mode === 'signin' ? 'sign in to continue' : 'a single account for buying, selling, and reviewing'}
            </p>
          </div>

          <Button
            type="button"
            onClick={signInWithGoogle}
            disabled={busy}
            variant="outline"
            className="w-full rounded-full py-6 text-sm tracking-wider gap-3"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.99 10.99 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            continue with google
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground/40">or</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <form onSubmit={submitEmail} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">display name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="how you want to be shown"
                  className="rounded-xl bg-card border-border/60 text-sm tracking-wide"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl bg-card border-border/60 text-sm tracking-wide"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="at least 8 characters"
                minLength={8}
                className="rounded-xl bg-card border-border/60 text-sm tracking-wide"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full rounded-full py-6 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2"
            >
              <Mail className="w-4 h-4" />
              {mode === 'signin' ? (busy ? 'signing in...' : 'sign in with email') : (busy ? 'creating account...' : 'create account')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
              className="text-xs tracking-wide text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              {mode === 'signin' ? 'no account? sign up' : 'already have an account? sign in'}
            </button>
          </div>

          <div className="pt-4 border-t border-border/40">
            <Button
              type="button"
              onClick={enterDemoMode}
              disabled={busy}
              variant="ghost"
              className="w-full rounded-full text-xs tracking-wider text-muted-foreground hover:text-foreground gap-2"
            >
              <Wand2 className="w-3.5 h-3.5" />
              try demo mode (no signup)
            </Button>
            <p className="text-[10px] text-center text-muted-foreground/40 mt-2 tracking-wide">
              demo accounts are auto-generated and may be cleared periodically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
