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

export default function SettingsSection({ account }) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    display_name: account?.display_name ?? "",
    bio: account?.bio ?? "",
    email: account?.email ?? "",
    hourly_rate: account?.hourly_rate ?? "",
    turnaround_time: account?.turnaround_time ?? "",
    commission_open: account?.commission_open ?? false,
    rush_available: account?.rush_available ?? false,
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: () =>
      db.entities.MarketAccount.update(account.id, {
        display_name: form.display_name,
        bio: form.bio,
        email: form.email,
        hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
        turnaround_time: form.turnaround_time,
        commission_open: form.commission_open,
        rush_available: form.rush_available,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      toast.success("settings saved");
    },
  });

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-light tracking-wide lowercase text-foreground">settings</h1>
        <p className="text-sm text-muted-foreground/60 tracking-wide mt-0.5">update your profile details</p>
      </div>

      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">profile</p>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">display name</Label>
          <Input
            value={form.display_name}
            onChange={(e) => update("display_name", e.target.value)}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">bio</Label>
          <Textarea
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide"
          />
        </div>
      </div>

      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">commissions</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm tracking-wide text-foreground">accept commissions</p>
            <p className="text-[11px] text-muted-foreground/40 tracking-wide">allow buyers to request custom work</p>
          </div>
          <Switch checked={form.commission_open} onCheckedChange={(v) => update("commission_open", v)} />
        </div>

        {form.commission_open && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">hourly rate (usd)</Label>
              <Input
                type="number"
                placeholder="e.g. 20"
                value={form.hourly_rate}
                onChange={(e) => update("hourly_rate", e.target.value)}
                className="rounded-xl bg-background border-border/60 text-sm tracking-wide"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">turnaround</Label>
              <Input
                placeholder="e.g. 2-3 weeks"
                value={form.turnaround_time}
                onChange={(e) => update("turnaround_time", e.target.value)}
                className="rounded-xl bg-background border-border/60 text-sm tracking-wide"
              />
            </div>
          </div>
        )}

        {form.commission_open && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm tracking-wide text-foreground">rush orders available</p>
              <p className="text-[11px] text-muted-foreground/40 tracking-wide">faster turnaround for an added fee</p>
            </div>
            <Switch checked={form.rush_available} onCheckedChange={(v) => update("rush_available", v)} />
          </div>
        )}
      </div>

      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="rounded-full px-5 py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5"
      >
        <Save className="w-3.5 h-3.5" />
        {saveMutation.isPending ? "saving..." : "save changes"}
      </Button>
    </div>
  );
}