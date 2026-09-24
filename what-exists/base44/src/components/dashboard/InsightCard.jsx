import { cn } from "@/lib/utils";

export default function InsightCard({ label, value, subtext, icon: Icon, className }) {
  return (
    <div className={cn(
      "bg-card rounded-[20px] border border-border/50 shadow-paper p-6 space-y-3",
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-wider text-muted-foreground/60 uppercase">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
            <Icon className="w-4 h-4 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <p className="text-2xl font-light tracking-wide text-foreground">{value}</p>
      {subtext && (
        <p className="text-[11px] text-muted-foreground/50 tracking-wide">{subtext}</p>
      )}
    </div>
  );
}