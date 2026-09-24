import { BarChart2 } from "lucide-react";

export default function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-light tracking-wide lowercase text-foreground">analytics</h1>
        <p className="text-sm text-muted-foreground/60 tracking-wide mt-0.5">views and engagement data</p>
      </div>

      <div className="bg-card rounded-[18px] border border-border/50 p-10 text-center space-y-4">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto">
          <BarChart2 className="w-5 h-5 text-muted-foreground/30" />
        </div>
        <div>
          <p className="text-sm tracking-wide text-muted-foreground/60 lowercase">analytics coming soon</p>
          <p className="text-xs text-muted-foreground/40 tracking-wide mt-1">view and engagement tracking will appear here once your account is active</p>
        </div>
      </div>
    </div>
  );
}