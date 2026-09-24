// admin overview. summarises the platform at a glance and points at
// every other admin section. counts come from the same tables the
// individual sections use, so this page never lies about state.

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Package,
  ShoppingBag,
  Factory,
  Route as RouteIcon,
  Settings,
  BookOpen,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

function StatCard({ label, value, hint }) {
  return (
    <div className="bg-card border border-border/50 rounded-[16px] p-5">
      <div className="text-[11px] tracking-widest uppercase text-muted-foreground/60">{label}</div>
      <div className="font-serif text-3xl font-light mt-2">{value}</div>
      {hint && <div className="text-xs text-muted-foreground/60 mt-1">{hint}</div>}
    </div>
  );
}

function SectionCard({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 bg-card border border-border/50 rounded-[16px] p-5 hover:border-foreground/30 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm tracking-wide lowercase text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">{description}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors mt-1" />
    </Link>
  );
}

export default function AdminOverview() {
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["admin-overview-pending"],
    queryFn: async () => {
      const { count } = await supabase.from("artifacts").select("id", { count: "exact", head: true }).eq("status", "pending_review");
      return count || 0;
    },
  });

  const { data: artifactsCount = 0 } = useQuery({
    queryKey: ["admin-overview-artifacts"],
    queryFn: async () => {
      const { count } = await supabase.from("artifacts").select("id", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: ordersCount = 0 } = useQuery({
    queryKey: ["admin-overview-orders"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("id", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: manufacturersCount = 0 } = useQuery({
    queryKey: ["admin-overview-manufacturers"],
    queryFn: async () => {
      const { count } = await supabase.from("manufacturers").select("id", { count: "exact", head: true });
      return count || 0;
    },
  });

  return (
    <AdminLayout title="overview" subtitle="control room for the whole platform">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="pending review" value={pendingCount} hint="awaiting your approval" />
        <StatCard label="artifacts" value={artifactsCount} hint="across every state" />
        <StatCard label="orders" value={ordersCount} hint="lifetime" />
        <StatCard label="manufacturers" value={manufacturersCount} hint="connected partners" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard
          to="/admin/review"
          icon={Package}
          title="review queue"
          description="approve or reject creator submissions, set manufacturing costs, manage orders."
        />
        <SectionCard
          to="/admin/manufacturers"
          icon={Factory}
          title="manufacturers"
          description="connect partner manufacturing services, manage api endpoints and capabilities."
        />
        <SectionCard
          to="/admin/routing"
          icon={RouteIcon}
          title="sales routing"
          description="control how orders flow from checkout to fulfilment. swap stripe demo for live mode."
        />
        <SectionCard
          to="/admin/settings"
          icon={Settings}
          title="platform settings"
          description="payouts, support contact, maintenance mode, and global toggles."
        />
        <SectionCard
          to="/admin/idea"
          icon={Lightbulb}
          title="idea notebook"
          description="markdown scratchpad for working through manufacturing, routing, and product decisions."
        />
        <SectionCard
          to="/admin/docs"
          icon={BookOpen}
          title="admin docs"
          description="how the admin panel is structured today and where it is heading next."
        />
        <SectionCard
          to="/admin/review"
          icon={ShoppingBag}
          title="orders"
          description="jump straight to the orders tab in the review queue."
        />
      </div>
    </AdminLayout>
  );
}
