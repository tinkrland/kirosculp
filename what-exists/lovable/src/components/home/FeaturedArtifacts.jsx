import { db } from '@/lib/db';

import { useQuery } from "@tanstack/react-query";
import ArtifactGrid from "../artifacts/ArtifactGrid";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedArtifacts() {
  const { data: artifacts, isLoading } = useQuery({
    queryKey: ["featured-artifacts"],
    queryFn: () => db.entities.Artifact.list("-created_date", 6),
    initialData: [],
  });

  if (isLoading) {
    return (
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] tracking-widest font-mono uppercase mb-2 text-muted-foreground/50">latest drops</p>
          <h2 className="font-serif text-2xl md:text-3xl font-light tracking-tight text-foreground mb-8 lowercase">
            recent artifacts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="rounded-[20px] overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!artifacts.length) return null;

  return (
    <section className="px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <p className="text-[10px] tracking-widest font-mono uppercase mb-2 text-muted-foreground/50">latest drops</p>
        <h2 className="font-serif text-2xl md:text-3xl font-light tracking-tight text-foreground mb-8 lowercase">
          recent artifacts
        </h2>
        <ArtifactGrid artifacts={artifacts} />
      </div>
    </section>
  );
}