import { db } from '@/lib/db';
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Info } from "lucide-react";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK"];

export default function SettingsPricing({ account }) {
  const queryClient = useQueryClient();
  const [margin, setMargin] = useState(account?.pricing_margin_pct ?? 30);
  const [defaultMargin, setDefaultMargin] = useState(account?.default_margin_pct ?? 30);
  const [currency, setCurrency] = useState(account?.pricing_currency ?? "USD");

  const saveMutation = useMutation({
    mutationFn: () => db.entities.MarketAccount.update(account.id, {
      pricing_margin_pct: parseFloat(margin),
      default_margin_pct: parseFloat(defaultMargin),
      pricing_currency: currency,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      toast.success("pricing saved");
    },
  });

  // example breakdown for a $20 manufacturing cost.
  //
  // pricing model:
  //   collector pays   = manufacturing cost + creator markup
  //   manufacturer gets = manufacturing cost (paid through directly)
  //   platform fee     = 8% of the markup only (sculptura never takes
  //                      a cut of the manufacturer's revenue)
  //   creator earns    = markup − platform fee
  //
  // taxes and any direct shipping surcharges from the manufacturer are
  // calculated on top at checkout and are NOT part of the creator's
  // payable amount or the platform's margin.
  const exampleMfg = 20;
  const markup = exampleMfg * (margin / 100);
  const platformFee = markup * 0.08;
  const earnedExample = markup - platformFee;
  const collectorPays = exampleMfg + markup;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-6">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">pricing margins</p>

        <div className="space-y-3">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">creator markup %</Label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={0}
              max={500}
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              className="rounded-xl bg-background border-border/60 text-sm tracking-wide w-28"
            />
            <span className="text-xs text-muted-foreground/60 tracking-wide">% above manufacturing cost</span>
          </div>
          {/* slider */}
          <input
            type="range" min={0} max={200} step={5}
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            className="w-full accent-current h-1"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/30 tracking-wide">
            <span>0% (break-even)</span>
            <span>100% (double)</span>
            <span>200%+</span>
          </div>
        </div>

        {/* example breakdown */}
        <div className="bg-background rounded-[14px] border border-border/40 p-4 space-y-2">
          <div className="flex items-center gap-1.5 mb-3">
            <Info className="w-3 h-3 text-muted-foreground/30" />
            <span className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">example breakdown (mfg cost = $20)</span>
          </div>
          <Row label="manufacturing cost (paid to maker)" value={`$${exampleMfg.toFixed(2)}`} dim />
          <Row label={`your markup (${margin}%)`} value={`+ $${markup.toFixed(2)}`} accent />
          <Row label="platform fee (8% of markup)" value={`− $${platformFee.toFixed(2)}`} dim />
          <div className="h-px bg-border/30 my-2" />
          <Row label="you earn" value={`$${earnedExample.toFixed(2)}`} bold />
          <Row label="collector pays" value={`$${collectorPays.toFixed(2)}`} />
          <p className="text-[10px] text-muted-foreground/40 tracking-wide leading-relaxed pt-2">
            collector pays excludes taxes and any shipping surcharges the manufacturer
            may add at fulfillment. those flow directly to the maker / carrier and the
            platform never takes margin on them.
          </p>
        </div>
      </div>

      {/* default markup applied to brand-new artifacts. each listing can still
          override this on its own publish form, this just saves the creator
          from re-entering their preferred margin every time. */}
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-3">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">default margin for new artifacts</p>
        <p className="text-[11px] text-muted-foreground/40 tracking-wide">
          pre-fills the markup on every new listing. you can still override per artifact.
        </p>
        <div className="flex items-center gap-4">
          <Input
            type="number" min={0} max={500}
            value={defaultMargin}
            onChange={(e) => setDefaultMargin(e.target.value)}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide w-28"
          />
          <span className="text-xs text-muted-foreground/60 tracking-wide">% above manufacturing cost</span>
        </div>
      </div>

      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-4">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">display currency</p>
        <div className="flex flex-wrap gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-4 py-2 rounded-full text-xs tracking-wider border transition-all ${
                currency === c
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border/60 hover:border-foreground/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
        className="rounded-full px-5 py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5">
        <Save className="w-3.5 h-3.5" />
        {saveMutation.isPending ? "saving..." : "save pricing"}
      </Button>
    </div>
  );
}

function Row({ label, value, accent, dim, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs tracking-wide ${dim ? "text-muted-foreground/40" : "text-muted-foreground/70"}`}>{label}</span>
      <span className={`text-xs tracking-wide font-mono ${bold ? "text-foreground font-medium" : accent ? "text-[#84A48B]" : dim ? "text-muted-foreground/40" : "text-foreground"}`}>{value}</span>
    </div>
  );
}