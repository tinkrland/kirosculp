import { db } from '@/lib/db';

import { useQuery } from "@tanstack/react-query";
import ArtifactCard from "../artifacts/ArtifactCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export default function MyArtifacts() {
  const { data: artifacts, isLoading } = useQuery({
    queryKey: ["my-artifacts"],
    queryFn: () => db.entities.Artifact.list("-created_date", 20),
    initialData: [],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium tracking-wide lowercase text-foreground">your artifacts</h3>
        <Link to="/publish">
          <Button variant="outline" className="rounded-full text-xs tracking-wider border-border/60 gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            publish new
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
      ) : artifacts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {artifacts.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-[20px] border border-border/50 border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground/50 tracking-wide mb-4">
            you haven't published any artifacts yet
          </p>
          <Link to="/publish">
            <Button variant="outline" className="rounded-full text-xs tracking-wider border-border/60 gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              publish your first artifact
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}