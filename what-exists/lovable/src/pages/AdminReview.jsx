import { db } from '@/lib/db';
import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, X, Package, ShoppingBag, Box, ExternalLink, Truck } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";

const STATUS_COLORS = {
  pending_review: "text-amber-600 bg-amber-50 border-amber-200",
  published: "text-emerald-600 bg-emerald-50 border-emerald-200",
  rejected: "text-red-600 bg-red-50 border-red-200",
  draft: "text-muted-foreground bg-secondary border-border",
  archived: "text-muted-foreground bg-secondary border-border",
};

const ORDER_STATUS_COLORS = {
  placed: "text-blue-600 bg-blue-50 border-blue-200",
  in_production: "text-amber-600 bg-amber-50 border-amber-200",
  shipped: "text-purple-600 bg-purple-50 border-purple-200",
  delivered: "text-emerald-600 bg-emerald-50 border-emerald-200",
  cancelled: "text-red-600 bg-red-50 border-red-200",
};

function ArtifactReviewCard({ artifact, onApprove, onReject }) {
  const [mfgCost, setMfgCost] = useState(artifact.manufacturing_costs?.[artifact.materials?.[0]] || "");
  const [rejectionNote, setRejectionNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-[20px] border border-border/50 overflow-hidden"
    >
      {artifact.image_url && (
        <div className="aspect-video bg-secondary/30 overflow-hidden">
          <img src={artifact.image_url} alt={artifact.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-light tracking-wide lowercase text-foreground">{artifact.name}</h3>
            <p className="text-xs text-muted-foreground/60 tracking-wide mt-0.5">by {artifact.creator_handle}</p>
          </div>
          <span className={`text-[11px] tracking-wider lowercase px-2.5 py-0.5 rounded-full border flex-shrink-0 ${STATUS_COLORS[artifact.status]}`}>
            {artifact.status?.replace("_", " ")}
          </span>
        </div>

        {artifact.description && (
          <p className="text-sm text-muted-foreground tracking-wide font-light leading-relaxed">{artifact.description}</p>
        )}

        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground/60 tracking-wide">
          {artifact.materials?.map((m) => (
            <span key={m} className="px-2.5 py-1 bg-secondary rounded-full">{m}</span>
          ))}
          {artifact.category && <span className="px-2.5 py-1 bg-secondary rounded-full">{artifact.category}</span>}
          {artifact.model_url && (
            <a href={artifact.model_url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-secondary rounded-full flex items-center gap-1 hover:bg-secondary/80 transition-colors">
              <Box className="w-3 h-3" />
              3d file
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>

        {/* mfg cost input */}
        {artifact.status === "pending_review" && (
          <div className="space-y-3 pt-2 border-t border-border/30">
            <p className="text-[11px] tracking-widest text-muted-foreground/50 uppercase">manufacturing cost (per piece)</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder="e.g. 85"
                value={mfgCost}
                onChange={(e) => setMfgCost(e.target.value)}
                className="w-28 rounded-xl bg-background border-border/60 text-sm"
              />
            </div>

            <AnimatePresence>
              {showRejectForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                  <Textarea
                    placeholder="reason for rejection..."
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    className="rounded-xl bg-background border-border/60 text-sm min-h-[70px]"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <Button
                onClick={() => onApprove(artifact, parseFloat(mfgCost) || 0)}
                className="flex-1 rounded-full text-xs tracking-wider bg-foreground text-background hover:bg-foreground/90 gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                approve
              </Button>
              {!showRejectForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1 rounded-full text-xs tracking-wider border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  reject
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => onReject(artifact, rejectionNote)}
                  className="flex-1 rounded-full text-xs tracking-wider border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                >
                  confirm reject
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function OrderRow({ order, onStatusChange }) {
  const [tracking, setTracking] = useState(order.tracking_number || "");
  const [saving, setSaving] = useState(false);

  const handleSaveTracking = async () => {
    setSaving(true);
    await db.entities.Order.update(order.id, { tracking_number: tracking });
    setSaving(false);
    toast.success("tracking saved");
  };

  return (
    <div className="bg-card rounded-[14px] border border-border/50 px-5 py-4 space-y-3">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
          {order.artifact_image_url && <img src={order.artifact_image_url} alt={order.artifact_name} className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm tracking-wide text-foreground lowercase truncate">{order.artifact_name}</p>
          <p className="text-[11px] text-muted-foreground/50 tracking-wide mt-0.5">{order.customer_email}, {order.material}, ${order.price}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="text-[11px] tracking-wider rounded-full px-3 py-1 border bg-card focus:outline-none cursor-pointer"
          >
            {["placed", "in_production", "shipped", "delivered", "cancelled"].map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <span className={`text-[11px] tracking-wider lowercase px-2.5 py-0.5 rounded-full border hidden sm:inline ${ORDER_STATUS_COLORS[order.status]}`}>
            {order.status?.replace("_", " ")}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="tracking number..."
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          className="flex-1 h-8 rounded-lg bg-background border-border/60 text-xs tracking-wide"
        />
        <Button onClick={handleSaveTracking} disabled={saving} size="sm" variant="outline" className="rounded-lg text-[11px] tracking-wider h-8">
          {saving ? "saving..." : "save"}
        </Button>
      </div>
      {order.shipping_address && (
        <p className="text-[11px] text-muted-foreground/50 tracking-wide">{order.shipping_address}</p>
      )}
    </div>
  );
}

export default function AdminReview() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("submissions");

  const { data: pendingArtifacts } = useQuery({
    queryKey: ["admin-pending"],
    queryFn: () => db.entities.Artifact.filter({ status: "pending_review" }, "-created_date", 50),
    initialData: [],
  });

  const { data: allArtifacts } = useQuery({
    queryKey: ["admin-all-artifacts"],
    queryFn: () => db.entities.Artifact.list("-created_date", 100),
    initialData: [],
  });

  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => db.entities.Order.list("-created_date", 100),
    initialData: [],
  });

  const approveMutation = useMutation({
    mutationFn: ({ artifact, mfgCost }) => {
      const mat = artifact.materials?.[0];
      const creatorEarning = artifact.creator_earnings?.[mat] || 0;
      const updatedMfgCosts = { ...(artifact.manufacturing_costs || {}), [mat]: mfgCost };
      const updatedPrices = { ...(artifact.prices || {}), [mat]: mfgCost + creatorEarning };
      return db.entities.Artifact.update(artifact.id, {
        status: "published",
        manufacturing_costs: updatedMfgCosts,
        prices: updatedPrices,
        admin_reviewed: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-artifacts"] });
      toast.success("artifact approved and published");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ artifact, note }) =>
      db.entities.Artifact.update(artifact.id, { status: "rejected", review_notes: note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-artifacts"] });
      toast.success("artifact rejected");
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }) => db.entities.Order.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("order updated");
    },
  });

  const tabs = [
    { id: "submissions", label: "submissions", count: pendingArtifacts.length },
    { id: "all_artifacts", label: "all artifacts", count: allArtifacts.length },
    { id: "orders", label: "orders", count: orders.length },
  ];

  return (
    <AdminLayout title="review queue" subtitle="manage submissions, artifacts, and orders">
        {/* tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-wider lowercase border transition-all ${
                tab === t.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-background/20" : "bg-secondary"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* submissions */}
        {tab === "submissions" && (
          <div>
            {pendingArtifacts.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground/40 tracking-wide">no pending submissions</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pendingArtifacts.map((artifact) => (
                  <ArtifactReviewCard
                    key={artifact.id}
                    artifact={artifact}
                    onApprove={(a, cost) => approveMutation.mutate({ artifact: a, mfgCost: cost })}
                    onReject={(a, note) => rejectMutation.mutate({ artifact: a, note })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* all artifacts */}
        {tab === "all_artifacts" && (
          <div className="space-y-2">
            {allArtifacts.map((artifact) => (
              <div key={artifact.id} className="flex items-center gap-4 bg-card rounded-[14px] border border-border/50 px-5 py-4">
                <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                  {artifact.image_url && <img src={artifact.image_url} alt={artifact.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm tracking-wide text-foreground lowercase truncate">{artifact.name}</p>
                  <p className="text-[11px] text-muted-foreground/50 tracking-wide mt-0.5">
                    {artifact.creator_handle}, {artifact.materials?.join(", ")}
                  </p>
                </div>
                <span className={`text-[11px] tracking-wider lowercase px-2.5 py-0.5 rounded-full border flex-shrink-0 ${STATUS_COLORS[artifact.status] || "text-muted-foreground bg-secondary"}`}>
                  {artifact.status?.replace("_", " ")}
                </span>
              </div>
            ))}
            {allArtifacts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm text-muted-foreground/40 tracking-wide">no artifacts yet</p>
              </div>
            )}
          </div>
        )}

        {/* orders */}
        {tab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground/40 tracking-wide">no orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusChange={(id, status) => updateOrderStatus.mutate({ id, status })}
                />
              ))
            )}
          </div>
        )}
    </AdminLayout>
  );
}