import { db } from '@/lib/db';
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { hashKey } from "@/lib/crypto";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import SettingsProfile from "@/components/market/settings/SettingsProfile";
import SettingsCommissions from "@/components/market/settings/SettingsCommissions";
import SettingsMaterials from "@/components/market/settings/SettingsMaterials";
import SettingsPricing from "@/components/market/settings/SettingsPricing";
import SettingsPayout from "@/components/market/settings/SettingsPayout";

const TABS = [
  { id: "profile", label: "profile" },
  { id: "commissions", label: "commissions" },
  { id: "materials", label: "materials & tools" },
  { id: "pricing", label: "pricing margins" },
  { id: "payout", label: "payout & currency" },
];

export default function StoreSettings() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const handle = urlParams.get("handle");
  const rawKey = urlParams.get("key");
  const [activeTab, setActiveTab] = useState(urlParams.get("tab") || "profile");
  const [isVerified, setIsVerified] = useState(false);

  const { data: account, isLoading } = useQuery({
    queryKey: ["market-account", handle],
    queryFn: () => db.entities.MarketAccount.filter({ handle }).then((r) => r?.[0] ?? null),
    enabled: !!handle,
  });

  useEffect(() => {
    if (!account || !rawKey) return;
    hashKey(rawKey).then((keyHash) => {
      if (keyHash === account.access_key_hash) setIsVerified(true);
      else { toast.error("invalid access key"); navigate("/store/access"); }
    });
  }, [account, rawKey, navigate]);

  if (!handle || !rawKey) { navigate("/store/access"); return null; }

  if (isLoading || !isVerified) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-border border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!account) { navigate("/store/access"); return null; }

  const dashLink = `/store/dashboard?handle=${handle}&key=${rawKey}`;

  return (
    <div className="min-h-screen bg-background">
      {/* top bar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border/40 px-6 py-4 flex items-center gap-4">
        <a href={dashLink} className="flex items-center gap-2 text-xs tracking-wide text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          dashboard
        </a>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-xs tracking-wide text-foreground">settings</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-wordmark text-lg text-foreground">sculptura</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-2xl md:text-4xl font-light tracking-tight lowercase text-foreground">settings</h1>
          <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">manage your account, pricing, and payout preferences</p>
        </div>

        {/* tab rail */}
        <div className="flex gap-1 mb-8 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs tracking-wider lowercase border transition-all ${
                activeTab === tab.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* tab content */}
        {activeTab === "profile" && <SettingsProfile account={account} />}
        {activeTab === "commissions" && <SettingsCommissions account={account} />}
        {activeTab === "materials" && <SettingsMaterials account={account} />}
        {activeTab === "pricing" && <SettingsPricing account={account} />}
        {activeTab === "payout" && <SettingsPayout account={account} />}
      </div>
    </div>
  );
}