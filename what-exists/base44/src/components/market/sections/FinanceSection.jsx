import { Landmark, TrendingUp } from "lucide-react";

const MONTHLY_MOCK = [
  { month: "Nov", amount: 340 },
  { month: "Dec", amount: 780 },
  { month: "Jan", amount: 620 },
  { month: "Feb", amount: 940 },
  { month: "Mar", amount: 1180 },
  { month: "Apr", amount: 960 },
];

export default function FinanceSection({ account }) {
  const available = account?.total_revenue ?? 0;
  const maxAmount = Math.max(...MONTHLY_MOCK.map((m) => m.amount), 1);
  const hasEarnings = available > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-light tracking-wide lowercase text-foreground">finance</h1>
        <p className="text-sm text-muted-foreground/60 tracking-wide mt-0.5">earnings and payouts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-[18px] opacity-15" style={{ background: "#AECBB8" }} />
          <p className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">available balance</p>
          <p className="text-3xl font-light tracking-wide text-foreground">${available.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-[18px] opacity-15" style={{ background: "#E89B85" }} />
          <p className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">total earned</p>
          <p className="text-3xl font-light tracking-wide text-foreground">${(account?.total_revenue ?? 0).toLocaleString()}</p>
        </div>
      </div>

      {/* earnings chart (mock for now) */}
      {hasEarnings && (
        <div className="bg-card rounded-[18px] border border-border/50 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/40" />
            <p className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">monthly earnings</p>
          </div>
          <div className="flex items-end gap-2 h-24">
            {MONTHLY_MOCK.map(({ month, amount }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${(amount / maxAmount) * 80}px`,
                    background: `linear-gradient(to top, #84A48B, #AECBB8)`,
                    opacity: 0.75,
                  }}
                />
                <span className="text-[9px] tracking-wider text-muted-foreground/40">{month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasEarnings ? (
        <div className="bg-card rounded-[18px] border border-border/50 p-8 text-center">
          <Landmark className="w-5 h-5 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground/40 tracking-wide">no earnings yet</p>
          <p className="text-xs text-muted-foreground/30 tracking-wide mt-1">earnings will appear here once your first order is fulfilled</p>
        </div>
      ) : (
        <div className="bg-card rounded-[18px] border border-border/50 p-5">
          <p className="text-xs text-muted-foreground/50 tracking-wide leading-relaxed">payout processing is handled manually during beta. contact sculptura to request a payout to your bank.</p>
        </div>
      )}
    </div>
  );
}