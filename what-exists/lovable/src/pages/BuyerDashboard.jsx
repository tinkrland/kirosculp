// buyer dashboard
//
// shows order history (linked by user_id or matching email), the saved
// wishlist, plus a couple of light recommendation strips: similar
// artifacts (categorically close to recent orders/wishlist) and similar
// stores (creators the buyer has bought from + new makers).
//
// this is intentionally read-only. all data lives in supabase except
// for the wishlist which is localStorage-only by design (see
// wishlistStore for the rationale).

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Package, ShoppingBag, Store } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getWishlist, removeFromWishlist } from "@/lib/wishlistStore";
import ArtifactCard from "@/components/artifacts/ArtifactCard";
import { Button } from "@/components/ui/button";
import BuyerHeader from "@/components/layout/BuyerHeader";
import FollowsAndLists from "@/components/follow/FollowsAndLists";

function StatusPill({ status }) {
  const colors = {
    placed: "bg-amber-50 text-amber-700 border-amber-200",
    in_production: "bg-blue-50 text-blue-700 border-blue-200",
    shipped: "bg-purple-50 text-purple-700 border-purple-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  }[status] || "bg-secondary text-muted-foreground border-border/50";
  return (
    <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border ${colors}`}>
      {status?.replace(/_/g, " ") || "placed"}
    </span>
  );
}

export default function BuyerDashboard({ demo = false, demoOrders = [], demoWishlist = [], demoSimilar = [], demoStores = [] }) {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState(demoOrders);
  const [wishlist, setWishlist] = useState(demoWishlist);
  const [similar, setSimilar] = useState(demoSimilar);
  const [stores, setStores] = useState(demoStores);
  const [loading, setLoading] = useState(!demo);

  useEffect(() => {
    if (demo) return;
    setWishlist(getWishlist());
    const sync = () => setWishlist(getWishlist());
    window.addEventListener("wishlist-updated", sync);
    return () => window.removeEventListener("wishlist-updated", sync);
  }, [demo]);

  useEffect(() => {
    if (demo) return;
    if (!isAuthenticated || !user?.email) { setLoading(false); return; }
    (async () => {
      // rls policy already returns rows that match user_id OR customer_email
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setOrders(data || []);

      // light recommendations: latest published artifacts and stores
      const handlesFromOrders = [...new Set((data || []).map((o) => o.creator_handle).filter(Boolean))];
      const [{ data: artifacts }, { data: storesData }] = await Promise.all([
        supabase.from("artifacts").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(8),
        supabase.from("market_accounts").select("handle, display_name, avatar_url, store_heading, status").eq("status", "approved").limit(6),
      ]);
      setSimilar((artifacts || []).filter((a) => !handlesFromOrders.includes(a.creator_handle)).slice(0, 4));
      setStores(storesData || []);
      setLoading(false);
    })();
  }, [demo, isAuthenticated, user?.email]);

  if (!demo && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <BuyerHeader demo={demo} />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-3xl font-light tracking-tight lowercase text-foreground mb-3">your buyer dashboard</h1>
        <p className="text-sm text-muted-foreground tracking-wide mb-6">
          you don't need an account to buy. but creating one links your past orders and unlocks tracking.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/auth"><Button className="rounded-full">sign in or create account</Button></Link>
          <Link to="/demo/buyer"><Button variant="outline" className="rounded-full">try the demo</Button></Link>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BuyerHeader demo={demo} />
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight lowercase text-foreground">
          {demo ? "buyer demo dashboard" : `welcome back${user?.display_name ? `, ${user.display_name.toLowerCase()}` : ""}`}
        </h1>
        <p className="text-sm text-muted-foreground tracking-wide mt-1">
          track orders, save artifacts, discover new makers
        </p>
        {demo && (
          <p className="text-[11px] text-amber-600 tracking-wide mt-2">
            this is a sandbox view with sample data. nothing here is saved.
          </p>
        )}
      </div>

      {/* Orders */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground/60" />
          <h2 className="text-sm tracking-widest uppercase text-muted-foreground/60">your orders</h2>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground tracking-wide">loading...</p>
        ) : orders.length === 0 ? (
          <div className="bg-card rounded-[18px] border border-border/50 p-10 text-center">
            <ShoppingBag className="w-6 h-6 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground tracking-wide">no orders yet</p>
            <Link to="/explore"><Button variant="outline" className="rounded-full mt-4 text-xs tracking-wider">browse artifacts</Button></Link>
          </div>
        ) : (
          <div className="bg-card rounded-[18px] border border-border/50 divide-y divide-border/30 overflow-hidden">
            {orders.map((o) => (
              <div key={o.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  {o.artifact_image_url && <img src={o.artifact_image_url} alt={o.artifact_name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm tracking-wide text-foreground lowercase truncate">{o.artifact_name}</p>
                  <p className="text-[11px] text-muted-foreground/50 tracking-wide">
                    {o.material} · by {o.creator_handle} · {new Date(o.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-light text-foreground">${Number(o.price).toFixed(0)}</span>
                  <StatusPill status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Wishlist */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-muted-foreground/60" />
          <h2 className="text-sm tracking-widest uppercase text-muted-foreground/60">your wishlist</h2>
        </div>
        {wishlist.length === 0 ? (
          <p className="text-sm text-muted-foreground tracking-wide">tap the heart on any artifact to save it here.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wishlist.map((w) => (
              <div key={w.artifactId} className="bg-card rounded-[16px] border border-border/50 overflow-hidden">
                <Link to={`/artifact/${w.artifactId}`} className="block aspect-square bg-secondary">
                  {w.artifactImage && <img src={w.artifactImage} alt={w.artifactName} className="w-full h-full object-cover" />}
                </Link>
                <div className="p-3 space-y-1">
                  <p className="text-sm tracking-wide text-foreground lowercase truncate">{w.artifactName}</p>
                  <p className="text-[11px] text-muted-foreground/50 tracking-wide">by {w.creatorHandle}</p>
                  <button
                    onClick={() => { removeFromWishlist(w.artifactId); setWishlist(getWishlist()); }}
                    className="text-[11px] text-muted-foreground hover:text-destructive tracking-wide mt-1"
                  >
                    remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* follows + creator lists */}
      <FollowsAndLists />

      {/* Similar artifacts */}
      {similar.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm tracking-widest uppercase text-muted-foreground/60">you might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map((a) => <ArtifactCard key={a.id} artifact={a} />)}
          </div>
        </section>
      )}

      {/* Similar stores */}
      {stores.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-muted-foreground/60" />
            <h2 className="text-sm tracking-widest uppercase text-muted-foreground/60">stores to explore</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stores.map((s) => (
              <Link key={s.handle} to={`/shop/${s.handle}`}
                className="bg-card rounded-[16px] border border-border/50 p-4 flex items-center gap-3 hover:shadow-paper transition">
                <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                  {s.avatar_url && <img src={s.avatar_url} alt={s.display_name} className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground lowercase tracking-wide truncate">{s.display_name || s.handle}</p>
                  <p className="text-[11px] text-muted-foreground tracking-wide truncate">@{s.handle}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  );
}
