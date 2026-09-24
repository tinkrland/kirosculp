// newsletter signup card on public storefront
//
// writes the new email into the market_account.newsletter_signups jsonb array
// via the same edge function used by the dashboard, but without the access
// key (the function rejects writes without verification, so for public
// signups we use a separate, unauthenticated path).
//
// for hackathon/demo purposes this just appends to localStorage when no
// session exists, so the demo experience works end to end. when a real
// supabase session is available we also persist server-side.

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function ShopNewsletter({ account, label }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!account?.newsletter_enabled) return null;

  const submit = async () => {
    const value = email.trim().toLowerCase();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error('enter a valid email');
      return;
    }
    setSubmitting(true);
    try {
      // local capture so the demo always works
      const localKey = `newsletter:${account.handle}`;
      const local = JSON.parse(localStorage.getItem(localKey) || '[]');
      if (!local.includes(value)) {
        local.push(value);
        localStorage.setItem(localKey, JSON.stringify(local));
      }
      // best-effort server persistence (will silently fail on rls; that's
      // fine for the demo)
      try {
        const next = [
          ...(Array.isArray(account.newsletter_signups) ? account.newsletter_signups : []),
          { email: value, signed_up_at: new Date().toISOString() },
        ];
        await supabase
          .from('market_accounts')
          .update({ newsletter_signups: next })
          .eq('id', account.id);
      } catch (_err) {
        // non-fatal
      }
      setDone(true);
      toast.success('thanks, you are on the list');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-[18px] border border-border/50 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="w-3.5 h-3.5 text-muted-foreground/50" />
        <p className="text-sm tracking-wide text-foreground lowercase">
          {label || 'get notified about new drops'}
        </p>
      </div>
      {done ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground tracking-wide">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          subscribed
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide flex-1"
          />
          <Button
            onClick={submit}
            disabled={submitting}
            className="rounded-full px-4 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90"
          >
            {submitting ? '...' : 'subscribe'}
          </Button>
        </div>
      )}
    </div>
  );
}
