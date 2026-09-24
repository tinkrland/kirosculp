import { db } from '@/lib/db';
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, Clock, Wrench, DollarSign, BarChart2 } from "lucide-react";

export default function InsightsSection({ account, handle }) {
  const [timeSpent, setTimeSpent] = useState(account?.insights_time_spent || "");
  const [toolCosts, setToolCosts] = useState(account?.insights_tool_costs || "");

  const { data: orders } = useQuery({
    queryKey: ["creator-orders", handle],
    queryFn: () => db.entities.Order.filter({ creator_handle: handle }, "-created_date", 200),
    initialData: [],
  });

  const { data: artifacts } = useQuery({
    queryKey: ["market-artifacts", handle],
    queryFn: () => db.entities.Artifact.filter({ creator_handle: handle }),
    initialData: [],
  });

  const completedOrders = orders.filter((o) => o.status === "delivered");
  const revenue = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const mfgCosts = completedOrders.reduce((sum, o) => sum + (o.manufacturing_cost || 0), 0);
  const platformFeeRate = 0.05; // 5% platform fee
  const platformFees = revenue * platformFeeRate;
  const creatorGross = completedOrders.reduce((sum, o) => sum + (o.creator_earnings || 0), 0);
  const toolCostsNum = parseFloat(toolCosts) || 0;
  const timeSpentNum = parseFloat(timeSpent) || 0;
  const calculatedProfit = creatorGross - toolCostsNum;
  const hourlyEarnings = timeSpentNum > 0 ? (calculatedProfit / timeSpentNum).toFixed(2) : null;

  const handleSaveInsights = async () => {
    await db.entities.MarketAccount.update(account.id, {
      insights_time_spent: parseFloat(timeSpent) || 0,
      insights_tool_costs: parseFloat(toolCosts) || 0,
    });
  };

  const statCards = [
    { label: "total revenue", value: `$${revenue.toLocaleString()}`, icon: DollarSign, accent: "#AECBB8", note: "from completed orders" },
    { label: "manufacturing costs", value: `$${mfgCosts.toLocaleString()}`, icon: Wrench, accent: "#F0D58F", note: "production expenses" },
    { label: "platform fees", value: `$${platformFees.toFixed(2)}`, icon: BarChart2, accent: "#C8B3CA", note: "5% sculptura fee" },
    { label: "your earnings", value: `$${creatorGross.toFixed(2)}`, icon: TrendingUp, accent: "#E89B85", note: "before tool costs" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-light tracking-wide lowercase text-foreground">business insights</h1>
        <p className="text-sm text-muted-foreground/60 tracking-wide mt-0.5">
          private data, only visible to you
        </p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ label, value, icon: Icon, accent, note }) => (
          <div key={label} className="bg-card rounded-[18px] border border-border/50 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-[18px] opacity-20" style={{ background: accent }} />
            <div className="flex items-center gap-2 mb-3 relative">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: accent + "33" }}>
                <Icon className="w-3 h-3" style={{ color: accent }} />
              </div>
              <span className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">{label}</span>
            </div>
            <p className="text-2xl font-light tracking-wide text-foreground relative">{value}</p>
            <p className="text-[10px] text-muted-foreground/30 tracking-wide mt-1 relative">{note}</p>
          </div>
        ))}
      </div>

      {/* user inputs */}
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-5">
        <p className="text-xs tracking-widest text-muted-foreground/50 uppercase">your inputs</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              time spent (hrs)
            </Label>
            <Input
              type="number"
              placeholder="e.g. 12"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              onBlur={handleSaveInsights}
              className="rounded-xl bg-background border-border/60 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] tracking-widest text-muted-foreground/50 uppercase flex items-center gap-1.5">
              <Wrench className="w-3 h-3" />
              tool / software costs ($)
            </Label>
            <Input
              type="number"
              placeholder="e.g. 25"
              value={toolCosts}
              onChange={(e) => setToolCosts(e.target.value)}
              onBlur={handleSaveInsights}
              className="rounded-xl bg-background border-border/60 text-sm"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/30 tracking-wide">auto-saved on blur</p>
      </div>

      {/* calculated profit */}
      <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-4">
        <p className="text-[10px] tracking-widest text-muted-foreground/50 uppercase">calculated summary</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground tracking-wide">creator earnings</span>
            <span className="text-sm tracking-wide text-foreground">${creatorGross.toFixed(2)}</span>
          </div>
          {toolCostsNum > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground tracking-wide">tool costs</span>
              <span className="text-sm tracking-wide text-foreground">-${toolCostsNum.toFixed(2)}</span>
            </div>
          )}
          <div className="h-px bg-border/30" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium tracking-wide text-foreground">calculated profit</span>
            <span className={`text-xl font-light tracking-wide ${calculatedProfit >= 0 ? "text-foreground" : "text-destructive"}`}>
              ${calculatedProfit.toFixed(2)}
            </span>
          </div>
          {hourlyEarnings && (
            <div className="flex items-center justify-between pt-1 border-t border-border/20">
              <span className="text-xs text-muted-foreground/60 tracking-wide">est. hourly earnings</span>
              <span className="text-sm tracking-wide text-foreground">${hourlyEarnings}/hr</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/30 tracking-wide text-center">
        this data is private and never shown publicly
      </p>
    </div>
  );
}