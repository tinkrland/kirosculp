import { db } from '@/lib/db';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Archive, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ArtifactsSection({ handle }) {
  const queryClient = useQueryClient();

  const { data: artifacts, isLoading } = useQuery({
    queryKey: ["market-artifacts", handle],
    queryFn: () => db.entities.Artifact.filter({ creator_handle: handle }, "-created_date", 50),
    initialData: [],
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, currentStatus }) =>
      db.entities.Artifact.update(id, {
        status: currentStatus === "published" ? "archived" : "published",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-artifacts", handle] });
      toast.success("artifact updated");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-light tracking-wide lowercase text-foreground">artifacts</h1>
          <p className="text-sm text-muted-foreground/60 tracking-wide mt-0.5">manage your published designs</p>
        </div>
        <Button
          onClick={() => window.location.href = "/publish"}
          className="rounded-full px-4 py-4 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          new artifact
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-[14px]" />)}
        </div>
      ) : artifacts.length === 0 ? (
        <div className="bg-card rounded-[18px] border border-dashed border-border/60 p-12 text-center">
          <p className="text-sm text-muted-foreground/40 tracking-wide">no artifacts yet</p>
          <p className="text-xs text-muted-foreground/30 tracking-wide mt-1">publish your first design to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {artifacts.map((artifact) => (
            <div
              key={artifact.id}
              className={`bg-card rounded-[14px] border px-5 py-4 space-y-2 ${artifact.status === "rejected" ? "border-red-200 bg-red-50/30" : "border-border/50"}`}
            >
            <div className="flex items-center gap-4">
              {/* thumbnail */}
              <div className="w-10 h-10 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
                {artifact.image_url && (
                  <img src={artifact.image_url} alt={artifact.name} className="w-full h-full object-cover" />
                )}
              </div>

              {/* info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm tracking-wide text-foreground lowercase truncate">{artifact.name}</p>
                <p className="text-[11px] text-muted-foreground/50 tracking-wide mt-0.5">
                  {artifact.materials?.join(", ")}{artifact.category ? `, ${artifact.category}` : ""}
                </p>
              </div>

              {/* status */}
              <span className={`text-[11px] tracking-wider lowercase px-2.5 py-0.5 rounded-full flex-shrink-0 border ${
                artifact.status === "published"
                  ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                  : artifact.status === "archived"
                  ? "text-muted-foreground bg-secondary border-border"
                  : artifact.status === "rejected"
                  ? "text-red-600 bg-red-50 border-red-200"
                  : artifact.status === "pending_review"
                  ? "text-amber-600 bg-amber-50 border-amber-200"
                  : "text-muted-foreground bg-secondary border-border"
              }`}>
                {artifact.status === "pending_review" ? "in review" : artifact.status}
              </span>

              {/* toggle - only allow archive/publish for published or archived */}
              {(artifact.status === "published" || artifact.status === "archived") && (
                <button
                  onClick={() => toggleStatusMutation.mutate({ id: artifact.id, currentStatus: artifact.status })}
                  className="flex items-center gap-1.5 text-[11px] tracking-wider text-muted-foreground/50 hover:text-foreground transition-colors flex-shrink-0"
                >
                  {artifact.status === "published" ? (
                    <><Archive className="w-3.5 h-3.5" /> archive</>
                  ) : (
                    <><Globe className="w-3.5 h-3.5" /> publish</>
                  )}
                </button>
              )}
            </div>
            {artifact.status === "rejected" && artifact.review_notes && (
              <p className="text-[11px] text-red-600/70 tracking-wide pl-14 pb-1">
                rejection note: {artifact.review_notes}
              </p>
            )}
            {artifact.status === "pending_review" && (
              <p className="text-[11px] text-amber-600/70 tracking-wide pl-14 pb-1">
                under review by the sculptura team, usually 1-3 business days
              </p>
            )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}