// sales routing. controls how checkout actually settles. today
// everything points at stripe sandbox; the panel makes it explicit
// what the live cutover will look like and which manufacturer becomes
// the fulfilment default.

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Route as RouteIcon, AlertTriangle } from "lucide-react";

const ROUTING_OPTIONS = [
  { value: "stripe_demo", label: "stripe sandbox (demo orders)", help: "safe for the pilot. nothing routes to manufacturers." },
  { value: "stripe_live_manual", label: "stripe live, manual fulfilment", help: "real charges. orders sit in the queue until you forward them by hand." },
  { value: "stripe_live_auto", label: "stripe live, auto route to default manufacturer", help: "real charges. paid orders push to the default manufacturer api." },
];

const PAYOUT_OPTIONS = [
  { value: "manual", label: "manual payouts" },
  { value: "stripe_connect", label: "stripe connect (planned)" },
];

export default function AdminRouting() {
  const qc = useQueryClient();
  const [routing, setRouting] = useState("stripe_demo");
  const [payout, setPayout] = useState("manual");
  const [defaultMfg, setDefaultMfg] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  const { data: manufacturers = [] } = useQuery({
    queryKey: ["manufacturers"],
    queryFn: async () => {
      const { data } = await supabase.from("manufacturers").select("id,name,status").order("name");
      return data || [];
    },
  });

  useEffect(() => {
    if (!settings) return;
    setRouting(settings.sales_routing_mode || "stripe_demo");
    setPayout(settings.payout_mode || "manual");
    setDefaultMfg(settings.default_manufacturer_id || "");
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("platform_settings").update({
        sales_routing_mode: routing,
        payout_mode: payout,
        default_manufacturer_id: defaultMfg || null,
      }).eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("routing saved");
      qc.invalidateQueries({ queryKey: ["platform-settings"] });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AdminLayout title="sales routing" subtitle="how a paid order becomes a manufactured artifact">
      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-[16px] p-4 flex gap-3 mb-8">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="text-xs leading-relaxed">
          the platform is in pilot mode. the only routing currently wired end to end
          is stripe sandbox. the other options describe the cutover plan and become
          functional once a manufacturer integration is live.
        </div>
      </div>

      <section className="bg-card border border-border/50 rounded-[16px] p-6 space-y-5">
        <div>
          <h2 className="text-sm tracking-widest uppercase text-muted-foreground/70">checkout routing</h2>
          <div className="mt-3 space-y-2">
            {ROUTING_OPTIONS.map((opt) => (
              <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                routing === opt.value ? "border-foreground bg-secondary/40" : "border-border/60 hover:border-foreground/30"
              }`}>
                <input
                  type="radio"
                  name="routing"
                  className="mt-1"
                  checked={routing === opt.value}
                  onChange={() => setRouting(opt.value)}
                />
                <div>
                  <div className="text-sm lowercase">{opt.label}</div>
                  <div className="text-xs text-muted-foreground/70 mt-0.5">{opt.help}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs">default manufacturer</Label>
          <select
            value={defaultMfg}
            onChange={(e) => setDefaultMfg(e.target.value)}
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">none</option>
            {manufacturers.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.status})</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground/60 mt-1">
            used by auto routing. paid orders hand off to this partner unless an
            artifact specifies its own.
          </p>
        </div>

        <div>
          <Label className="text-xs">payout mode</Label>
          <select
            value={payout}
            onChange={(e) => setPayout(e.target.value)}
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            {PAYOUT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <Button onClick={() => save.mutate()} disabled={save.isPending || !settings} className="rounded-full">
          {save.isPending ? "saving..." : "save routing"}
        </Button>
      </section>

      <section className="mt-8 bg-card border border-border/50 rounded-[16px] p-6">
        <h2 className="text-sm tracking-widest uppercase text-muted-foreground/70 flex items-center gap-2">
          <RouteIcon className="w-4 h-4" /> the route, top to bottom
        </h2>
        <ol className="mt-4 space-y-3 text-sm text-muted-foreground/80 leading-relaxed list-decimal list-inside">
          <li>buyer checks out via stripe.</li>
          <li>order is recorded with payment status and creator handle.</li>
          <li>routing mode decides whether fulfilment waits, queues for manual handoff, or pushes to the default manufacturer api.</li>
          <li>creator earnings accumulate and pay out per the selected payout mode.</li>
        </ol>
      </section>
    </AdminLayout>
  );
}
