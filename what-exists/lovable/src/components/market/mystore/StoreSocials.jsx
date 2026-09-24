import { db } from '@/lib/db';
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Globe, Instagram, Twitter, Youtube } from "lucide-react";

const SOCIALS = [
  { field: "social_website", label: "website", placeholder: "https://yoursite.com", icon: Globe },
  { field: "social_instagram", label: "instagram", placeholder: "@handle or URL", icon: Instagram },
  { field: "social_twitter", label: "x / twitter", placeholder: "@handle or URL", icon: Twitter },
  { field: "social_tiktok", label: "tiktok", placeholder: "@handle or URL", icon: null, emoji: "♪" },
  { field: "social_youtube", label: "youtube", placeholder: "channel URL", icon: Youtube },
  { field: "social_discord", label: "discord", placeholder: "invite link", icon: null, emoji: "🎮" },
  { field: "social_patreon", label: "patreon", placeholder: "patreon.com/yourname", icon: null, emoji: "🎁" },
];

export default function StoreSocials({ account, onSaved }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(
    Object.fromEntries(SOCIALS.map(({ field }) => [field, account?.[field] ?? ""]))
  );
  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const saveMutation = useMutation({
    mutationFn: () => db.entities.MarketAccount.update(account.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      toast.success("socials saved");
      onSaved?.();
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">social links</p>
        <p className="text-[11px] text-muted-foreground/40 tracking-wide -mt-3">shown as icons on your store page</p>

        {SOCIALS.map(({ field, label, placeholder, icon, emoji }) => (
          <div key={field} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              {icon ? (() => { const Ic = icon; return <Ic className="w-3.5 h-3.5 text-muted-foreground/50" />; })() : (
                <span className="text-sm">{emoji}</span>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">{label}</Label>
              <Input value={form[field]} onChange={(e) => update(field, e.target.value)}
                placeholder={placeholder}
                className="rounded-xl bg-background border-border/60 text-sm tracking-wide" />
            </div>
          </div>
        ))}
      </div>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
        className="rounded-full px-5 py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5">
        <Save className="w-3.5 h-3.5" />
        {saveMutation.isPending ? "saving..." : "save socials"}
      </Button>
    </div>
  );
}