import { db } from '@/lib/db';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, DollarSign, Clock } from "lucide-react";

const StatusBadge = ({ status }) => {
  const config = {
    draft: { label: "draft", className: "text-muted-foreground/60 bg-secondary" },
    pending_review: { label: "in review", className: "text-amber-600 bg-amber-50 border border-amber-200" },
    active: { label: "active", className: "text-emerald-600 bg-emerald-50 border border-emerald-200" },
    rejected: { label: "rejected", className: "text-red-600 bg-red-50 border border-red-200" },
  }[status] || { label: status, className: "text-muted-foreground bg-secondary" };

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] tracking-wider lowercase ${config.className}`}>
      {config.label}
    </span>
  );
};

export default function OverviewSection({ account, handle }) {
  const queryClient = useQueryClient();

  const { data: artifacts } = useQuery({
    queryKey: ["market-artifacts", handle],
    queryFn: () => db.entities.Artifact.filter({ creator_handle: handle }),
    initialData: [],
  });

  const submitForReviewMutation = useMutation({
    mutationFn: () => db.entities.MarketAccount.update(account.id, { status: "pending_review" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-account", handle] });
    },
  });

  const publishedCount = artifacts.filter((a) => a.status === "published").length;
  const inReviewCount = artifacts.filter((a) => a.status === "pending_review").length;

  const stats = [
    { label: "artifacts", value: String(artifacts.length), icon: Package, accent: "#C1D8DF" },
    { label: "published", value: String(publishedCount), icon: ShoppingBag, accent: "#AECBB8" },
    { label: "in review", value: String(inReviewCount), icon: Clock, accent: "#F0D58F" },
    { label: "total revenue", value: `$${(account?.total_revenue ?? 0).toLocaleString()}`, icon: DollarSign, accent: "#E89B85" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-light tracking-wide lowercase text-foreground">overview</h1>
          <p className="text-sm text-muted-foreground/60 tracking-wide mt-0.5">your account at a glance</p>
        </div>
        <StatusBadge status={account?.status} />
      </div>

      {/* account status messaging */}
      {account?.status === "draft" && (
        <div className="bg-card rounded-[18px] border border-border/50 p-5 space-y-4">
          <div>
            <p className="text-sm tracking-wide text-foreground mb-1">your account is in draft</p>
            <p className="text-xs text-muted-foreground/60 tracking-wide leading-relaxed">
              when you are ready, submit for review. a member of the sculptura team will review your account before it goes live. this usually takes 1 to 3 business days.
            </p>
          </div>
          <Button
            onClick={() => submitForReviewMutation.mutate()}
            disabled={submitForReviewMutation.isPending}
            className="rounded-full px-5 py-4 text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90"
          >
            {submitForReviewMutation.isPending ? "submitting..." : "submit for review"}
          </Button>
        </div>
      )}

      {account?.status === "pending_review" && (
        <div className="bg-card rounded-[18px] border border-border/50 p-5">
          <p className="text-sm tracking-wide text-foreground mb-1">in review</p>
          <p className="text-xs text-muted-foreground/60 tracking-wide leading-relaxed">
            your account is being reviewed. you will be notified at {account?.email} when a decision is made.
          </p>
        </div>
      )}

      {account?.status === "rejected" && (
        <div className="bg-red-50 rounded-[18px] border border-red-200 p-5">
          <p className="text-sm tracking-wide text-red-700 mb-1">account not approved</p>
          {account?.review_notes && (
            <p className="text-xs text-red-600/70 tracking-wide leading-relaxed">{account.review_notes}</p>
          )}
        </div>
      )}

      {/* stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="bg-card rounded-[18px] border border-border/50 p-5 space-y-3 relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-16 h-16 rounded-bl-[18px] opacity-20"
              style={{ background: accent }}
            />
            <div className="flex items-center justify-between relative">
              <span className="text-[10px] tracking-widest text-muted-foreground/50 uppercase">{label}</span>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: accent + "33" }}>
                <Icon className="w-3 h-3" style={{ color: accent }} />
              </div>
            </div>
            <p className="text-2xl font-light tracking-wide text-foreground relative">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}