// store newsletter
//
// lets a creator collect emails from their public storefront. signups are
// stored as a simple jsonb array on market_accounts (no separate table) so
// the demo flow stays portable. for high-volume real use this should move
// into a dedicated table with rate limits.

import { db } from '@/lib/db';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Mail, Download } from 'lucide-react';

export default function StoreNewsletter({ account, onSaved }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    newsletter_enabled: account?.newsletter_enabled ?? false,
    newsletter_label: account?.newsletter_label ?? 'get notified about new drops',
  });

  const signups = Array.isArray(account?.newsletter_signups) ? account.newsletter_signups : [];

  const saveMutation = useMutation({
    mutationFn: () => db.entities.MarketAccount.update(account.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-account', account.handle] });
      toast.success('newsletter saved');
      onSaved?.();
    },
  });

  const exportSignups = () => {
    if (signups.length === 0) {
      toast.info('no signups yet');
      return;
    }
    const csv = ['email,signed_up_at', ...signups.map((s) => `${s.email},${s.signed_up_at || ''}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${account.handle}-newsletter.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">newsletter</p>
            <p className="text-[11px] text-muted-foreground/40 tracking-wide mt-0.5">collect emails from your storefront</p>
          </div>
          <Switch
            checked={form.newsletter_enabled}
            onCheckedChange={(v) => setForm((p) => ({ ...p, newsletter_enabled: v }))}
          />
        </div>

        {form.newsletter_enabled && (
          <div className="space-y-2">
            <Label className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">prompt label</Label>
            <Input
              value={form.newsletter_label}
              onChange={(e) => setForm((p) => ({ ...p, newsletter_label: e.target.value }))}
              placeholder="get notified about new drops"
              className="rounded-xl bg-background border-border/60 text-sm tracking-wide"
            />
          </div>
        )}

        {/* signup list */}
        <div className="bg-background rounded-[14px] border border-border/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-muted-foreground/40" />
              <span className="text-[11px] tracking-wider text-muted-foreground/60">
                {signups.length} {signups.length === 1 ? 'signup' : 'signups'}
              </span>
            </div>
            {signups.length > 0 && (
              <button
                onClick={exportSignups}
                className="flex items-center gap-1.5 text-[11px] tracking-wider text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                <Download className="w-3 h-3" /> export csv
              </button>
            )}
          </div>
          {signups.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1 pt-2">
              {signups.slice(-10).reverse().map((s, i) => (
                <p key={i} className="text-[11px] text-muted-foreground/50 tracking-wide font-mono truncate">
                  {s.email}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="rounded-full px-5 py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5"
      >
        <Save className="w-3.5 h-3.5" />
        {saveMutation.isPending ? 'saving...' : 'save newsletter'}
      </Button>
    </div>
  );
}
