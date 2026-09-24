import { db } from '@/lib/db';
import InsightCard from "../components/dashboard/InsightCard";
import WalletSection from "../components/dashboard/WalletSection";
import MyArtifacts from "../components/dashboard/MyArtifacts";
import { DollarSign, TrendingUp, Clock, Wrench, BarChart3 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-creator-profile"],
    queryFn: async () => {
      const user = await db.auth.me();
      const results = await db.entities.CreatorProfile.filter({ user_email: user.email });
      return results?.[0] ?? null;
    },
  });

  useEffect(() => {
    if (!profileLoading && profile === null) {
      navigate("/onboarding");
    }
  }, [profile, profileLoading, navigate]);

  if (profileLoading || profile === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-light tracking-wide lowercase text-foreground mb-2">
            your workspace
          </h1>
          <p className="text-sm text-muted-foreground tracking-wide font-light">
            manage your artifacts, track your work, and grow your store
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Left - main content */}
          <div className="space-y-10">
            {/* Insights grid */}
            <div>
              <h2 className="text-xs tracking-wider text-muted-foreground/60 uppercase mb-4">insights</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InsightCard
                  label="revenue"
                  value="$2,340"
                  subtext="this month"
                  icon={DollarSign}
                />
                <InsightCard
                  label="production cost"
                  value="$890"
                  subtext="manufacturing + materials"
                  icon={TrendingUp}
                />
                <InsightCard
                  label="time value"
                  value="$612"
                  subtext="36 hrs × $17/hr"
                  icon={Clock}
                />
                <InsightCard
                  label="tool costs"
                  value="$85"
                  subtext="monthly split"
                  icon={Wrench}
                />
                <InsightCard
                  label="actual profit"
                  value="$753"
                  subtext="after all costs"
                  icon={BarChart3}
                />
              </div>
            </div>

            {/* Artifacts */}
            <MyArtifacts />
          </div>

          {/* Right sidebar - wallet */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <WalletSection />
          </div>
        </div>
      </div>
    </div>
  );
}