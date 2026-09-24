import { db } from '@/lib/db';
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useSearchParams } from "react-router-dom";
import CreatorSidebar from "../components/creator/CreatorSidebar";
import ArtifactCard from "../components/artifacts/ArtifactCard";
import { ArrowLeft, Pencil, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_STORES, DEMO_ARTIFACTS } from "@/lib/demoData";
import ShopPromoCodes from "@/components/shop/ShopPromoCodes";
import ShopNewsletter from "@/components/shop/ShopNewsletter";
import ShopCollections from "@/components/shop/ShopCollections";
import SeoTags from "@/components/seo/SeoTags";
import FollowButton from "@/components/follow/FollowButton";
import { hashKey } from "@/lib/crypto";

const ARTIFACT_TYPES = ["all", "ring", "earring", "bracelet", "brooch", "pendant", "other"];

export default function ShopProfile() {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const ownerKey = searchParams.get("key");
  const [isOwner, setIsOwner] = useState(false);

  // Check if this is a demo store handle
  const demoStore = DEMO_STORES.find((s) => s.handle === username);
  const demoArtifacts = demoStore ? DEMO_ARTIFACTS.filter((a) => a.creator_handle === username) : null;

  const { data: liveProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["shop-profile", username],
    queryFn: () => db.entities.CreatorProfile.filter({ username }),
    select: (data) => data?.[0] ?? null,
    enabled: !!username && !demoStore,
  });

  const { data: liveArtifacts, isLoading: artifactsLoading } = useQuery({
    queryKey: ["shop-artifacts", username],
    queryFn: () => db.entities.Artifact.filter({ creator_handle: username, status: "published" }, "-created_date", 20),
    initialData: [],
    enabled: !!username && !demoStore,
  });

  // market account is optional - only stores that went through the
  // /store/create flow will have one, but it carries promo codes,
  // newsletter settings, and customization data we want to surface.
  // we also fall back to it as the profile source if there is no
  // creator_profiles row yet, so a store owner who hasn't filled in a
  // separate creator profile (or who is still in pending review) can
  // still preview their public storefront from /store/mystore.
  const { data: marketAccount, isLoading: marketLoading } = useQuery({
    queryKey: ["shop-market-account", username],
    queryFn: () => db.entities.MarketAccount.filter({ handle: username }).then((r) => r?.[0] ?? null),
    enabled: !!username && !demoStore,
  });

  const { data: collections } = useQuery({
    queryKey: ["shop-collections", username],
    queryFn: () => db.entities.Collection.filter({ creator_handle: username }, "sort_order", 50),
    initialData: [],
    enabled: !!username && !demoStore,
  });

  // Use demo data if available, otherwise live data, otherwise market account fallback
  const profile = demoStore
    ? { username: demoStore.handle, display_name: demoStore.display_name, bio: demoStore.bio, avatar_url: demoStore.avatar_url, commission_open: demoStore.commission_open, hourly_rate: demoStore.hourly_rate, turnaround_time: demoStore.turnaround_time, rush_available: demoStore.rush_available, materials: demoStore.materials, tools: demoStore.tools }
    : liveProfile || (marketAccount ? {
        username: marketAccount.handle,
        display_name: marketAccount.display_name,
        bio: marketAccount.bio,
        avatar_url: marketAccount.avatar_url,
        commission_open: marketAccount.commission_open,
        hourly_rate: marketAccount.hourly_rate,
        turnaround_time: marketAccount.turnaround_time,
        rush_available: marketAccount.rush_available,
        materials: marketAccount.materials,
        tools: marketAccount.tools,
      } : null);
  const artifacts = demoStore ? demoArtifacts : liveArtifacts;

  if ((profileLoading || marketLoading) && !demoStore) {
    return (
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          <Skeleton className="h-64 rounded-[20px]" />
          <div className="grid grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-[20px]" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-2xl font-light tracking-wide text-muted-foreground/40 mb-4">store not found</p>
        <p className="text-sm text-muted-foreground/50 tracking-wide mb-8">sculptura.shop/{username} doesn't exist yet</p>
        <Link to="/explore" className="text-sm tracking-wider text-muted-foreground hover:text-foreground transition-colors">
          back to explore
        </Link>
      </div>
    );
  }

  // Normalize profile fields for CreatorSidebar
  const sidebarCreator = {
    handle: profile.username,
    display_name: profile.display_name,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
    commissions_open: profile.commission_open,
    hourly_rate: profile.hourly_rate,
    turnaround: profile.turnaround_time,
    rush_available: profile.rush_available,
    materials_worked: profile.materials || [],
    software: profile.tools || [],
    waitlist_count: 0,
  };

  // owner preview mode: when /shop/<handle>?key=<rawkey> is opened we
  // verify the key against the market account's stored hash and surface
  // an "edit your store" banner. this lets approved AND pending owners
  // preview their public storefront, even before sculptura admins
  // approve them, without exposing edit controls to public visitors.
  useEffect(() => {
    if (!ownerKey || !marketAccount?.access_key_hash) { setIsOwner(false); return; }
    let cancelled = false;
    hashKey(ownerKey).then((h) => { if (!cancelled) setIsOwner(h === marketAccount.access_key_hash); });
    return () => { cancelled = true; };
  }, [ownerKey, marketAccount?.access_key_hash]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredArtifacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (artifacts || []).filter((a) => {
      const matchType = typeFilter === "all" || (a.artifact_type || "").toLowerCase() === typeFilter;
      const matchSearch = !q
        || a.name?.toLowerCase().includes(q)
        || a.description?.toLowerCase().includes(q)
        || (a.tags || []).some((t) => t.toLowerCase().includes(q))
        || (a.materials || []).some((m) => m.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [artifacts, search, typeFilter]);

  const featuredItems = filteredArtifacts.filter((a) => a.is_featured);
  const featuredIds = new Set(featuredItems.map((a) => a.id));
  const rest = filteredArtifacts.filter((a) => !featuredIds.has(a.id));

  return (
    <div className="px-6 py-10">
      <SeoTags
        title={`${profile.display_name || profile.username} on sculptura`}
        description={profile.bio || `${profile.username}'s store on sculptura`}
        image={profile.avatar_url}
        canonical={`/shop/${profile.username}`}
      />
      <div className="max-w-7xl mx-auto">
        {isOwner && (
          <div className="mb-6 rounded-[14px] border border-foreground/20 bg-card px-4 py-3 flex items-center gap-3 flex-wrap">
            <Eye className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <p className="text-[12px] text-muted-foreground/80 tracking-wide">
              you're previewing your own store{marketAccount?.status !== "active" && " (pending review - public visitors can't see this yet)"}.
            </p>
            <Link
              to={`/store/mystore?handle=${username}&key=${ownerKey}`}
              className="ml-auto inline-flex items-center gap-1.5 text-[12px] tracking-wide text-foreground bg-secondary hover:bg-secondary/70 px-3 py-1.5 rounded-full transition-all"
            >
              <Pencil className="w-3 h-3" />
              edit profile, banner & photo
            </Link>
          </div>
        )}
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors">
          <ArrowLeft className="w-4 h-4" />
          back to explore
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <CreatorSidebar creator={sidebarCreator} />
            {marketAccount && <ShopPromoCodes coupons={marketAccount.coupons} />}
            {marketAccount && (
              <ShopNewsletter account={marketAccount} label={marketAccount.newsletter_label} />
            )}
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="font-serif text-xl font-light tracking-tight text-foreground lowercase">
                {profile.display_name || profile.username}'s artifacts
              </h2>
              <FollowButton creatorHandle={profile.username} creatorName={profile.display_name} />
            </div>

            {!demoStore && <ShopCollections username={profile.username} collections={collections} />}

            {/* search + type filters within this store */}
            <div className="space-y-3">
              <div className="relative max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="search this store..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 rounded-full bg-card border-border/60 text-sm tracking-wide"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {ARTIFACT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1 rounded-full text-[11px] tracking-wider lowercase border transition-all ${
                      typeFilter === t
                        ? "bg-foreground text-background border-foreground"
                        : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {featuredItems.length > 0 && (
              <div>
                <p className="text-[11px] tracking-wider text-muted-foreground/50 uppercase mb-3">featured</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {featuredItems.map((a) => <ArtifactCard key={a.id} artifact={a} />)}
                </div>
              </div>
            )}

            {artifactsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="rounded-[20px] overflow-hidden">
                    <Skeleton className="aspect-square" />
                    <div className="p-4 space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-32" /></div>
                  </div>
                ))}
              </div>
            ) : rest.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((a) => <ArtifactCard key={a.id} artifact={a} />)}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground/50 tracking-wide text-sm">no artifacts published yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}