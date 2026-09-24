import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MarketAccounts } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { hashKey } from "@/lib/crypto";
import { toast } from "sonner";
import MarketSidebar from "@/components/market/MarketSidebar";
import OverviewSection from "@/components/market/sections/OverviewSection";
import ArtifactsSection from "@/components/market/sections/ArtifactsSection";
import AnalyticsSection from "@/components/market/sections/AnalyticsSection";
import FinanceSection from "@/components/market/sections/FinanceSection";
import OrdersSection from "@/components/market/sections/OrdersSection";
import InsightsSection from "@/components/market/sections/InsightsSection";


/**
 * market account dashboard.
 * credentials are passed as url params (?handle=...&key=...) and verified
 * client-side by hashing the key and comparing to the stored hash.
 * no server-side session is created — the key lives only in memory for this visit.
 */
export default function MarketDashboard() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const handle = urlParams.get("handle");
  const rawKey = urlParams.get("key");

  const [isVerified, setIsVerified] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const { data: account, isLoading } = useQuery({
    queryKey: ["market-account", handle],
    queryFn: () => MarketAccounts.getByHandle(handle),
    enabled: !!handle,
  });

  // verify the key against the stored hash once account data loads
  useEffect(() => {
    if (!account || !rawKey) return;

    hashKey(rawKey).then((keyHash) => {
      if (keyHash === account.access_key_hash) {
        setIsVerified(true);
      } else {
        toast.error("invalid access key");
        navigate("/store/access");
      }
    });
  }, [account, rawKey, navigate]);

  const handleSignOut = () => {
    navigate("/store/access");
  };

  if (!handle || !rawKey) {
    navigate("/store/access");
    return null;
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-border border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!account) {
    navigate("/store/access");
    return null;
  }

  if (!isVerified) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-border border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const sectionComponents = {
    overview: <OverviewSection account={account} handle={handle} />,
    artifacts: <ArtifactsSection handle={handle} />,
    orders: <OrdersSection handle={handle} />,
    analytics: <AnalyticsSection />,
    finance: <FinanceSection account={account} />,
    insights: <InsightsSection account={account} handle={handle} />,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MarketSidebar
        account={account}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onSignOut={handleSignOut}
        handle={handle}
        rawKey={rawKey}
      />

      {/* main content area */}
      <main className="flex-1 min-w-0">
        {/* grid background to match screenshot */}
        <div className="min-h-screen grid-bg p-10 max-w-4xl">
          {sectionComponents[activeSection]}
        </div>
      </main>
    </div>
  );
}