import { db } from '@/lib/db';
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, ShieldCheck } from "lucide-react";

const METHODS = [
  { id: "bank_transfer", label: "bank transfer", hint: "IBAN / routing + account number" },
  { id: "paypal", label: "paypal", hint: "your PayPal email address" },
  { id: "wise", label: "wise", hint: "Wise email or account ID" },
  { id: "crypto", label: "crypto", hint: "wallet address (USDC/ETH/BTC)" },
];

export default function SettingsPayout({ account }) {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState(account?.payout_method ?? "bank_transfer");
  const [details, setDetails] = useState(account?.payout_details ?? "");
  const [legalName, setLegalName] = useState(account?.payout_legal_name ?? "");

  const current = METHODS.find((m) => m.id === method);

  const saveMutation = useMutation({
    mutationFn: () => db.entities.MarketAccount.update(account.id, {
      payout_method: method,
      payout_details: details,
      payout_legal_name: legalName,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", account.handle] });
      toast.success("payout settings saved");
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-6">
        <p className="text-[11px] tracking-widest text-muted-foreground/40 uppercase">payout method</p>

        <div className="grid grid-cols-2 gap-3">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`p-4 rounded-[14px] border text-left transition-all ${
                method === m.id
                  ? "border-foreground bg-foreground/5"
                  : "border-border/50 hover:border-foreground/20"
              }`}
            >
              <p className={`text-xs tracking-wide font-medium ${method === m.id ? "text-foreground" : "text-muted-foreground"}`}>{m.label}</p>
              <p className="text-[10px] text-muted-foreground/40 tracking-wide mt-0.5">{m.hint}</p>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">legal name (required for first payout)</Label>
          <Input
            placeholder="full legal name as it appears on your id"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide"
          />
          <p className="text-[10px] text-muted-foreground/40 tracking-wide leading-relaxed">
            payouts under $20 stay in your sculptura balance. once you cross the
            $20 threshold and request a withdrawal, we need your legal name on
            file. final payment is processed through stripe, which may run its
            own kyc / identity verification at higher volumes.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">{current?.hint}</Label>
          <Input
            placeholder={current?.hint}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="rounded-xl bg-background border-border/60 text-sm tracking-wide"
          />
        </div>

        <div className="flex items-start gap-2 p-3 rounded-[12px] bg-background border border-border/40">
          <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/30 mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground/40 tracking-wide leading-relaxed">
            payout details are stored securely. during beta, payouts are processed manually by the sculptura team. allow 3–5 business days after requesting.
          </p>
        </div>
      </div>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
        className="rounded-full px-5 py-5 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5">
        <Save className="w-3.5 h-3.5" />
        {saveMutation.isPending ? "saving..." : "save payout info"}
      </Button>
    </div>
  );
}