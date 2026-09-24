import { db } from '@/lib/db';
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function SettingsProfile({ account }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    display_name: account?.display_name ?? "",
    bio: account?.bio ?? "",
    email: account?.email ?? "",
    avatar_url: account?.avatar_url ?? "",
  });
  const update = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const saveMutation = useMutation({
    mutationFn: () => db.entities.MarketAccount.update(account.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      toast.success("profile saved");
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">identity</p>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">display name</Label>
          <Input value={form.display_name} onChange={(e) => update("display_name", e.target.value)}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide" />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">bio</Label>
          <Textarea value={form.bio} onChange={(e) => update("bio", e.target.value)}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide min-h-[90px]" />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">contact email</Label>
          <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide" />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">avatar image URL</Label>
          <Input placeholder="https://..." value={form.avatar_url} onChange={(e) => update("avatar_url", e.target.value)}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide" />
          {form.avatar_url && (
            <img src={form.avatar_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-border/40 mt-2" />
          )}
        </div>
      </div>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
        className="rounded-full px-5 py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5">
        <Save className="w-3.5 h-3.5" />
        {saveMutation.isPending ? "saving..." : "save profile"}
      </Button>
    </div>
  );
}