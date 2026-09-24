import { db } from '@/lib/db';
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Plus, Trash2, Tag } from "lucide-react";

function newCoupon() {
  return { code: "", discount_pct: 10, active: true, expires: "" };
}

export default function StoreCoupons({ account, onSaved }) {
  const queryClient = useQueryClient();
  const [coupons, setCoupons] = useState(account?.coupons ?? []);

  const addCoupon = () => setCoupons([...coupons, newCoupon()]);
  const removeCoupon = (i) => setCoupons(coupons.filter((_, idx) => idx !== i));
  const updateCoupon = (i, field, val) => {
    setCoupons(coupons.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  };

  const saveMutation = useMutation({
    mutationFn: () => db.entities.MarketAccount.update(account.id, { coupons }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      toast.success("coupons saved");
      onSaved?.();
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">discount coupons</p>
            <p className="text-[11px] text-muted-foreground/40 tracking-wide mt-0.5">buyers enter these at checkout for a discount</p>
          </div>
          <Button variant="outline" size="sm" onClick={addCoupon}
            className="rounded-full text-xs tracking-wider gap-1.5 border-border/60">
            <Plus className="w-3.5 h-3.5" /> new coupon
          </Button>
        </div>

        {coupons.length === 0 && (
          <div className="text-center py-8">
            <Tag className="w-5 h-5 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground/30 tracking-wide">no coupons yet</p>
          </div>
        )}

        <div className="space-y-3">
          {coupons.map((c, i) => (
            <div key={i} className="bg-background rounded-[14px] border border-border/40 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground/40" />
                  <span className="text-xs tracking-wide text-muted-foreground/60 font-mono uppercase">
                    {c.code || "new coupon"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-wide text-muted-foreground/40">active</span>
                    <Switch checked={c.active} onCheckedChange={(v) => updateCoupon(i, "active", v)} />
                  </div>
                  <button onClick={() => removeCoupon(i)} className="text-muted-foreground/30 hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">code</Label>
                  <Input value={c.code} onChange={(e) => updateCoupon(i, "code", e.target.value.toUpperCase())}
                    placeholder="SUMMER20"
                    className="rounded-xl bg-card border-border/50 text-sm tracking-widest font-mono uppercase" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">discount %</Label>
                  <Input type="number" min={1} max={100} value={c.discount_pct}
                    onChange={(e) => updateCoupon(i, "discount_pct", parseFloat(e.target.value))}
                    className="rounded-xl bg-card border-border/50 text-sm tracking-wide" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">expires (optional)</Label>
                <Input type="date" value={c.expires}
                  onChange={(e) => updateCoupon(i, "expires", e.target.value)}
                  className="rounded-xl bg-card border-border/50 text-sm tracking-wide" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
        className="rounded-full px-5 py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5">
        <Save className="w-3.5 h-3.5" />
        {saveMutation.isPending ? "saving..." : "save coupons"}
      </Button>
    </div>
  );
}