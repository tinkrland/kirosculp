import { CreatorProfiles, Artifacts } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import CreatorSidebar from "../components/creator/CreatorSidebar";
import ArtifactCard from "../components/artifacts/ArtifactCard";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_STORES, DEMO_ARTIFACTS } from "@/lib/demoData";

export default function ShopProfile() {
  const { username } = useParams();

  // Check if this is a demo store handle
  const demoStore = DEMO_STORES.find((s) => s.handle === username);
  const demoArtifacts = demoStore ? DEMO_ARTIFACTS.filter((a) => a.creator_handle === username) : null;

  const { data: liveProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["shop-profile", username],
    queryFn: () => CreatorProfiles.getByUsername(username).then((profile) => profile ? [profile] : []),
    select: (data) => data?.[0] ?? null,
    enabled: !!username && !demoStore,
  });

  const { data: liveArtifacts, isLoading: artifactsLoading } = useQuery({
    queryKey: ["shop-artifacts", username],
    queryFn: () => Artifacts.listPublishedByCreator(username, 20),
    initialData: [],
    enabled: !!username && !demoStore,
  });

  // Use demo data if available, otherwise live data
  const profile = demoStore
    ? { username: demoStore.handle, display_name: demoStore.display_name, bio: demoStore.bio, avatar_url: demoStore.avatar_url, commission_open: demoStore.commission_open, hourly_rate: demoStore.hourly_rate, turnaround_time: demoStore.turnaround_time, rush_available: demoStore.rush_available, materials: demoStore.materials, tools: demoStore.tools }
    : liveProfile;
  const artifacts = demoStore ? demoArtifacts : liveArtifacts;

  if (profileLoading && !demoStore) {
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

  const featured = artifacts.find((a) => a.is_featured);
  const rest = artifacts.filter((a) => a.id !== featured?.id);

  return (
    <div className="px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors">
          <ArrowLeft className="w-4 h-4" />
          back to explore
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CreatorSidebar creator={sidebarCreator} />
          </div>

          <div className="space-y-8">
            <h2 className="font-serif text-xl font-light tracking-tight text-foreground lowercase">
              {profile.display_name || profile.username}'s artifacts
            </h2>

            {featured && (
              <div>
                <p className="text-[11px] tracking-wider text-muted-foreground/50 uppercase mb-3">featured</p>
                <div className="max-w-md">
                  <ArtifactCard artifact={featured} />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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