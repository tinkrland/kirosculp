import { db } from '@/lib/db';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { hashKey } from "@/lib/crypto";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import StoreAppearance from "@/components/market/mystore/StoreAppearance";
import StoreSocials from "@/components/market/mystore/StoreSocials";
import StoreTipJar from "@/components/market/mystore/StoreTipJar";
import StoreWaitlist from "@/components/market/mystore/StoreWaitlist";
import StoreCoupons from "@/components/market/mystore/StoreCoupons";
import StoreContent from "@/components/market/mystore/StoreContent";
import StoreNewsletter from "@/components/market/mystore/StoreNewsletter";
import StorePreviewCard from "@/components/market/mystore/StorePreviewCard";
import StoreUsername from "@/components/market/mystore/StoreUsername";

const TABS = [
  { id: "appearance", label: "appearance" },
  { id: "username", label: "username" },
  { id: "content", label: "content & faq" },
  { id: "socials", label: "socials" },
  { id: "commerce", label: "tip jar & waitlist" },
  { id: "newsletter", label: "newsletter" },
  { id: "coupons", label: "promo codes" },
];

export default function MyStore() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const handle = urlParams.get("handle");
  const rawKey = urlParams.get("key");
  const [activeTab, setActiveTab] = useState("appearance");
  const [isVerified, setIsVerified] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: account, isLoading, refetch } = useQuery({
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
        <span className="text-xs tracking-wide text-foreground">my store</span>
        <div className="ml-auto flex items-center gap-3">
          <a
            href={`/shop/${handle}?key=${rawKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-wide text-muted-foreground hover:text-foreground border border-border/60 px-3 py-1.5 rounded-full transition-colors"
          >
            view live (preview)
          </a>
          <span className="font-wordmark text-lg text-foreground">sculptura</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-2xl md:text-4xl font-light tracking-tight lowercase text-foreground">my store</h1>
          <p className="text-sm text-muted-foreground/60 tracking-wide mt-1">customize your public storefront, everything collectors see</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* editor panel */}
          <div>
            {activeTab === "appearance" && <StoreAppearance account={account} onSaved={refetch} />}
            {activeTab === "username" && (
              <StoreUsername
                account={account}
                onSaved={(next) => { window.location.href = `/store/mystore?handle=${next}&key=${rawKey}`; }}
              />
            )}
            {activeTab === "content" && <StoreContent account={account} onSaved={refetch} />}
            {activeTab === "socials" && <StoreSocials account={account} onSaved={refetch} />}
            {activeTab === "commerce" && (
              <div className="space-y-6">
                <StoreTipJar account={account} onSaved={refetch} />
                <StoreWaitlist account={account} onSaved={refetch} />
              </div>
            )}
            {activeTab === "newsletter" && <StoreNewsletter account={account} onSaved={refetch} />}
            {activeTab === "coupons" && <StoreCoupons account={account} onSaved={refetch} />}
          </div>

          {/* live preview */}
          <div className="hidden lg:block">
            <StorePreviewCard account={account} />
          </div>
        </div>
      </div>
    </div>
  );
}