import { db } from '@/lib/db';
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function StoreTipJar({ account, onSaved }) {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(account?.tip_jar_enabled ?? false);
  const [label, setLabel] = useState(account?.tip_jar_label ?? "buy me a coffee ☕");
  const [url, setUrl] = useState(account?.tip_jar_url ?? "");

  const saveMutation = useMutation({
    mutationFn: () => db.entities.MarketAccount.update(account.id, {
      tip_jar_enabled: enabled, tip_jar_label: label, tip_jar_url: url,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      toast.success("tip jar saved");
      onSaved?.();
    },
  });

  return (
    <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">tip jar</p>
          <p className="text-[11px] text-muted-foreground/40 tracking-wide mt-0.5">let collectors support your work directly</p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (
        <>
          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">button label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder="buy me a coffee ☕"
              className="rounded-xl bg-background border-border/60 text-sm tracking-wide" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">tip URL (ko-fi, paypal, etc)</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ko-fi.com/yourname"
              className="rounded-xl bg-background border-border/60 text-sm tracking-wide" />
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
            className="rounded-full px-5 py-4 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5">
            <Save className="w-3.5 h-3.5" />
            {saveMutation.isPending ? "saving..." : "save tip jar"}
          </Button>
        </>
      )}

      {!enabled && (
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          variant="outline"
          className="rounded-full px-5 py-4 text-xs tracking-wider gap-1.5">
          <Save className="w-3.5 h-3.5" />
          save
        </Button>
      )}
    </div>
  );
}