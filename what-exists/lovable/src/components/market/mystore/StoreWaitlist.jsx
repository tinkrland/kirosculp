import { db } from '@/lib/db';
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function StoreWaitlist({ account, onSaved }) {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(account?.waitlist_enabled ?? false);
  const [message, setMessage] = useState(account?.waitlist_message ?? "orders are currently closed - join the waitlist to be notified when i reopen.");

  const saveMutation = useMutation({
    mutationFn: () => db.entities.MarketAccount.update(account.id, {
      waitlist_enabled: enabled, waitlist_message: message,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      toast.success("waitlist saved");
      onSaved?.();
    },
  });

  return (
    <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">order waitlist</p>
          <p className="text-[11px] text-muted-foreground/40 tracking-wide mt-0.5">pause orders and show a waitlist banner</p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (
        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">waitlist message</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide min-h-[80px]" />
        </div>
      )}

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
        variant={enabled ? "default" : "outline"}
        className={`rounded-full px-5 py-4 text-xs tracking-wider gap-1.5 ${enabled ? "bg-foreground text-background hover:bg-foreground/90" : ""}`}>
        <Save className="w-3.5 h-3.5" />
        {saveMutation.isPending ? "saving..." : "save waitlist"}
      </Button>
    </div>
  );
}