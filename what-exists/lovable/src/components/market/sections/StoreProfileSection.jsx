import { db } from '@/lib/db';

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ExternalLink, Package, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ACCENT_COLORS = [
  "bg-[#C1D8DF]", "bg-[#AECBB8]", "bg-[#F8D0D0]", "bg-[#F0D58F]", "bg-[#C8B3CA]", "bg-[#E89B85]",
];

export default function StoreProfileSection({ account, handle }) {
  const { data: artifacts, isLoading } = useQuery({
    queryKey: ["market-artifacts", handle],
    queryFn: () => db.entities.Artifact.filter({ creator_handle: handle, status: "published" }, "-created_date", 12),
    initialData: [],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-light tracking-wide lowercase text-foreground">public store</h1>
          <p className="text-sm text-muted-foreground/60 tracking-wide mt-0.5">preview how collectors see your page</p>
        </div>
        <a
          href={`/shop/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="rounded-full px-4 py-4 text-xs tracking-wider border-border/60 gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            open live page
          </Button>
        </a>
      </div>

      {/* Store card preview */}
      <div className="bg-card rounded-[20px] border border-border/50 overflow-hidden shadow-paper">
        {/* header band */}
        <div className="h-20 bg-gradient-to-br from-[#C1D8DF]/40 via-[#AECBB8]/30 to-[#F8D0D0]/40" />
        <div className="px-6 pb-6">
          {/* avatar */}
          <div className="-mt-8 mb-4">
            {account?.avatar_url ? (
              <img src={account.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover border-4 border-card shadow-paper" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#AECBB8] border-4 border-card shadow-paper flex items-center justify-center text-2xl font-wordmark text-white">
                {(account?.display_name || account?.handle || "?")[0].toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="text-base font-medium tracking-wide text-foreground lowercase">
            {account?.display_name || account?.handle}
          </h2>
          <p className="text-xs text-muted-foreground/50 tracking-wide mb-3">sculptura.shop/{handle}</p>
          {account?.bio && (
            <p className="text-sm text-muted-foreground font-light leading-relaxed tracking-wide mb-4">
              {account.bio}
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            {account?.commission_open && (
              <span className="px-3 py-1 rounded-full text-[10px] tracking-wider bg-[#AECBB8]/30 text-[#84A48B] border border-[#84A48B]/20">
                commissions open
              </span>
            )}
            {account?.materials?.map((m) => (
              <span key={m} className="px-3 py-1 rounded-full text-[10px] tracking-wider bg-secondary border border-border/40 text-muted-foreground">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Artifact grid preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs tracking-widest text-muted-foreground/50 uppercase flex items-center gap-2">
            <Package className="w-3.5 h-3.5" />
            published artifacts ({artifacts.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-[14px]" />)}
          </div>
        ) : artifacts.length === 0 ? (
          <div className="bg-card rounded-[18px] border border-dashed border-border/50 p-10 text-center">
            <Globe className="w-6 h-6 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground/40 tracking-wide">no published artifacts yet</p>
            <p className="text-xs text-muted-foreground/30 tracking-wide mt-1">publish artifacts from the artifacts tab to populate your store</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {artifacts.map((artifact, i) => (
              <div key={artifact.id} className="group relative aspect-square rounded-[14px] overflow-hidden border border-border/40">
                {artifact.image_url ? (
                  <img src={artifact.image_url} alt={artifact.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className={`w-full h-full ${ACCENT_COLORS[i % ACCENT_COLORS.length]} flex items-center justify-center`}>
                    <span className="text-[10px] tracking-wider text-white/60">{artifact.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] tracking-wider text-white lowercase truncate">{artifact.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}