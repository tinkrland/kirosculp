import { db } from '@/lib/db';

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag } from "lucide-react";

const ORDER_STATUS_COLORS = {
  placed: "text-blue-600 bg-blue-50 border-blue-200",
  in_production: "text-amber-600 bg-amber-50 border-amber-200",
  shipped: "text-purple-600 bg-purple-50 border-purple-200",
  delivered: "text-emerald-600 bg-emerald-50 border-emerald-200",
  cancelled: "text-red-600 bg-red-50 border-red-200",
};

const STATUS_STEPS = ["placed", "in_production", "shipped", "delivered"];

function OrderProgressBar({ status }) {
  const idx = STATUS_STEPS.indexOf(status);
  if (idx === -1) return null;
  return (
    <div className="flex items-center gap-1 mt-2">
      {STATUS_STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-1">
          <div className={`h-1 flex-1 rounded-full transition-all ${i <= idx ? "bg-foreground/60" : "bg-border/40"}`} />
          {i === STATUS_STEPS.length - 1 && null}
        </div>
      ))}
    </div>
  );
}

export default function OrdersSection({ handle }) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["creator-orders", handle],
    queryFn: () => db.entities.Order.filter({ creator_handle: handle }, "-created_date", 50),
    initialData: [],
  });

  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === "delivered");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-light tracking-wide lowercase text-foreground">orders</h1>
        <p className="text-sm text-muted-foreground/60 tracking-wide mt-0.5">track your artifact orders</p>
      </div>

      {/* summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "total", value: orders.length, accent: "#C1D8DF" },
          { label: "active", value: activeOrders.length, accent: "#F0D58F" },
          { label: "completed", value: completedOrders.length, accent: "#AECBB8" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-card rounded-[14px] border border-border/50 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-[14px] opacity-20" style={{ background: accent }} />
            <p className="text-[10px] tracking-widest text-muted-foreground/40 uppercase">{label}</p>
            <p className="text-2xl font-light tracking-wide text-foreground mt-1">{value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-[14px]" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card rounded-[18px] border border-dashed border-border/60 p-12 text-center">
          <ShoppingBag className="w-6 h-6 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground/40 tracking-wide">no orders yet</p>
          <p className="text-xs text-muted-foreground/30 tracking-wide mt-1">orders will appear here once customers purchase your artifacts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-card rounded-[14px] border border-border/50 p-5 space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                  {order.artifact_image_url && (
                    <img src={order.artifact_image_url} alt={order.artifact_name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm tracking-wide text-foreground lowercase truncate">{order.artifact_name}</p>
                  <p className="text-[11px] text-muted-foreground/50 tracking-wide mt-0.5">
                    {order.customer_name || order.customer_email}, {order.material}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[11px] tracking-wider lowercase px-2.5 py-0.5 rounded-full border block ${ORDER_STATUS_COLORS[order.status] || "text-muted-foreground bg-secondary"}`}>
                    {order.status?.replace("_", " ")}
                  </span>
                  <p className="text-xs text-muted-foreground/50 tracking-wide mt-1">+${order.creator_earnings ?? "-"}</p>
                </div>
              </div>

              {order.status !== "cancelled" && <OrderProgressBar status={order.status} />}

              {order.tracking_number && (
                <p className="text-[11px] text-muted-foreground/50 tracking-wide">
                  tracking: {order.tracking_number}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}