import { db } from '@/lib/db';

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import CreatorSidebar from "../components/creator/CreatorSidebar";
import ArtifactCard from "../components/artifacts/ArtifactCard";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreatorProfile() {
  const handle = window.location.pathname.split("/creator/")[1];

  const { data: profileData } = useQuery({
    queryKey: ["creator-profile", handle],
    queryFn: () => db.entities.CreatorProfile.filter({ handle }),
    select: (data) => data?.[0],
    enabled: !!handle,
  });

  // Fallback creator object for backwards compatibility
  const creator = profileData || {
    handle: handle || "unknown",
    display_name: handle,
    bio: "creator on sculptura",
    commissions_open: false,
    hourly_rate: null,
    turnaround: null,
    materials_worked: [],
    software: [],
    rush_available: false,
    waitlist_count: 0,
  };

  const { data: artifacts, isLoading } = useQuery({
    queryKey: ["creator-artifacts", handle],
    queryFn: () => db.entities.Artifact.filter({ creator_handle: handle, status: "published" }, "-created_date", 20),
    initialData: [],
    enabled: !!handle,
  });

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
          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CreatorSidebar creator={creator} />
          </div>

          {/* Artifact grid */}
          <div className="space-y-8">
            <h2 className="text-lg font-light tracking-wider text-muted-foreground lowercase">
              {creator.display_name || handle}'s artifacts
            </h2>

            {featured && (
              <div className="mb-6">
                <p className="text-[11px] tracking-wider text-muted-foreground/50 uppercase mb-3">featured</p>
                <div className="max-w-md">
                  <ArtifactCard artifact={featured} />
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="rounded-[20px] overflow-hidden">
                    <Skeleton className="aspect-square" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rest.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {rest.map((artifact) => (
                  <ArtifactCard key={artifact.id} artifact={artifact} />
                ))}
              </div>
            ) : artifacts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground/50 tracking-wide text-sm">no artifacts published yet</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}