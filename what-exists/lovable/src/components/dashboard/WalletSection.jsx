import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Wallet, ArrowUpRight } from "lucide-react";

export default function WalletSection() {
  const [bankSplit, setBankSplit] = useState([70]);

  return (
    <div className="bg-card rounded-[20px] border border-border/50 shadow-paper p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
          <Wallet className="w-4 h-4 text-muted-foreground/40" />
        </div>
        <h3 className="text-sm font-medium tracking-wide lowercase text-foreground">wallet</h3>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary/40 rounded-xl p-4">
          <p className="text-[10px] tracking-wider text-muted-foreground/50 uppercase mb-1">available</p>
          <p className="text-xl font-light tracking-wide text-foreground">$847.20</p>
        </div>
        <div className="bg-secondary/40 rounded-xl p-4">
          <p className="text-[10px] tracking-wider text-muted-foreground/50 uppercase mb-1">pending</p>
          <p className="text-xl font-light tracking-wide text-muted-foreground">$234.00</p>
        </div>
      </div>

      {/* Payout split */}
      <div className="space-y-3">
        <p className="text-xs tracking-wider text-muted-foreground/60 uppercase">payout split</p>
        <Slider
          value={bankSplit}
          onValueChange={setBankSplit}
          max={100}
          step={5}
          className="py-2"
        />
        <div className="flex justify-between text-[11px] tracking-wide text-muted-foreground">
          <span>{bankSplit[0]}% to bank</span>
          <span>{100 - bankSplit[0]}% stays in platform</span>
        </div>
      </div>

      <Button className="w-full rounded-full text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-2">
        <ArrowUpRight className="w-3.5 h-3.5" />
        request payout
      </Button>
    </div>
  );
}