import { db } from '@/lib/db';
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import MaterialTag from "../components/artifacts/MaterialTag";
import ModelViewer from "../components/viewer/ModelViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Package, Clock, Box, ShoppingCart, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_ARTIFACTS } from "@/lib/demoData";
import { addToCart } from "@/lib/cartStore";
import { toast } from "sonner";
import CartDrawer from "@/components/cart/CartDrawer";
import SeoTags from "@/components/seo/SeoTags";
import { useCurrency } from "@/lib/CurrencyContext";

export default function ArtifactDetail() {
  const { format } = useCurrency();
  const id = window.location.pathname.split("/artifact/")[1];
  const navigate = useNavigate();

  const { data: liveArtifact, isLoading } = useQuery({
    queryKey: ["artifact", id],
    queryFn: () => db.entities.Artifact.filter({ id }),
    select: (data) => data?.[0],
    enabled: !!id && !id.startsWith("demo-"),
  });

  // Check demo data if id starts with "demo-"
  const demoArtifact = id?.startsWith("demo-") ? DEMO_ARTIFACTS.find((a) => a.id === id) : null;
  const artifact = liveArtifact || demoArtifact;

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const offeredSizes = Array.isArray(artifact?.sizes) ? artifact.sizes : [];
  const requiresSize = offeredSizes.length > 0 && (artifact?.size_type && artifact.size_type !== "unisize");
  const currentMaterial = selectedMaterial || artifact?.materials?.[0];
  const currentSize = selectedSize || (requiresSize ? offeredSizes[0] : null);
  const basePrice = artifact?.prices?.[currentMaterial];
  const sizeSurcharge = currentSize ? Number((artifact?.size_surcharges || {})[currentSize] || 0) : 0;
  const currentPrice = basePrice != null ? Number(basePrice) + sizeSurcharge : null;

  // gallery: combine optional image_urls[] with the legacy image_url cover
  const gallery = (() => {
    const urls = Array.isArray(artifact?.image_urls) ? artifact.image_urls.filter(Boolean) : [];
    const merged = artifact?.image_url ? [artifact.image_url, ...urls.filter((u) => u !== artifact.image_url)] : urls;
    return merged;
  })();
  const [activeImage, setActiveImage] = useState(0);

  const handleAddToCart = () => {
    if (!artifact || !currentMaterial) return;
    if (requiresSize && !currentSize) {
      toast.error("pick a size first");
      return;
    }
    addToCart(artifact, currentMaterial, currentSize);
    setJustAdded(true);
    toast.success(`${artifact.name} added to your queue`);
    setTimeout(() => setJustAdded(false), 2000);
  };

  if (isLoading && !demoArtifact) {
    return (
      <div className="px-6 py-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-[24px]" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground tracking-wide">artifact not found</p>
        <Link to="/explore" className="text-primary text-sm mt-4 inline-block tracking-wide">back to explore</Link>
      </div>
    );
  }

  const hasModel = !!artifact.model_url;

  return (
    <div className="px-6 py-10">
      <SeoTags
        title={artifact.seo_title || `${artifact.name}${artifact.creator_handle ? ` by ${artifact.creator_handle}` : ''} - sculptura`}
        description={artifact.seo_description || artifact.description}
        image={artifact.image_url}
        canonical={artifact.creator_handle && artifact.slug ? `/shop/${artifact.creator_handle}/${artifact.slug}` : `/artifact/${artifact.id}`}
        keywords={(artifact.keywords || []).join(', ')}
      />
      <div className="max-w-6xl mx-auto">
        <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/explore"))} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors">
          <ArrowLeft className="w-4 h-4" />
          back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 3D Viewer or image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <ModelViewer
              modelUrl={artifact.model_url}
              imageUrl={gallery[activeImage] || artifact.image_url}
              className="aspect-square"
            />
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border transition-all ${i === activeImage ? "border-foreground" : "border-border/40 opacity-70 hover:opacity-100"}`}
                  >
                    <img src={src} alt={`view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {hasModel && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50 tracking-wide">
                <Box className="w-3 h-3" />
                interactive 3d model, drag to rotate
              </div>
            )}
            {artifact.specs && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/40">
                <span className="text-[11px] tracking-wider text-muted-foreground">{artifact.specs}</span>
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-7"
          >
            {/* Name & creator */}
            <div>
              <h1 className="font-serif text-2xl md:text-4xl font-light tracking-tight lowercase text-foreground">
                {artifact.name}
              </h1>
              {artifact.creator_handle && (
                <Link
                  to={`/shop/${artifact.creator_handle}`}
                  className="text-sm text-muted-foreground hover:text-primary tracking-wide mt-2 inline-block transition-colors"
                >
                  by {artifact.creator_handle}
                </Link>
              )}
            </div>

            {/* Description */}
            {artifact.description && (
              <p className="text-sm text-muted-foreground font-light leading-relaxed tracking-wide">
                {artifact.description}
              </p>
            )}

            {/* tag pills (creator-curated, distinct from materials) */}
            {Array.isArray(artifact.tags) && artifact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {artifact.tags.map((t) => (
                  <span key={t} className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-[11px] tracking-wider lowercase text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Material selector */}
            {artifact.materials?.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs tracking-wider text-muted-foreground/70 uppercase">material</p>
                <div className="flex flex-wrap gap-2">
                  {artifact.materials.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`px-4 py-2 rounded-full text-xs tracking-wider lowercase border transition-all duration-200 ${
                        currentMaterial === mat
                          ? "bg-foreground text-background border-foreground"
                          : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector - only when the creator offers multiple sizes */}
            {requiresSize && (
              <div className="space-y-3">
                <p className="text-xs tracking-wider text-muted-foreground/70 uppercase">
                  {artifact.size_type === "ring" ? "ring size (US)" : "size"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {offeredSizes.map((s) => {
                    const sel = currentSize === s;
                    const sc = Number((artifact.size_surcharges || {})[s] || 0);
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 rounded-full text-xs tracking-wider lowercase border transition-all duration-200 ${
                          sel
                            ? "bg-foreground text-background border-foreground"
                            : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
                        }`}
                      >
                        {s}{sc > 0 ? <span className="opacity-60 ml-1">+${sc}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price */}
            {currentPrice != null && (
              <div className="bg-card rounded-[18px] border border-border/50 shadow-paper p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm tracking-wide text-foreground">price</span>
                  <span className="text-2xl font-light tracking-wide text-foreground">{format(currentPrice)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground/50 tracking-wide">
                  delivery fees calculated at checkout
                </p>
              </div>
            )}

            {/* measurements (dimensions + weight in grams) */}
            {(artifact.dimensions || artifact.weight_grams) && (
              <div className="grid grid-cols-2 gap-3">
                {artifact.dimensions && (
                  <div className="px-4 py-3 rounded-xl bg-secondary/40 border border-border/30">
                    <p className="text-[10px] tracking-widest text-muted-foreground/50 uppercase">dimensions</p>
                    <p className="text-sm tracking-wide text-foreground mt-1">{artifact.dimensions}</p>
                  </div>
                )}
                {artifact.weight_grams != null && artifact.weight_grams !== "" && (
                  <div className="px-4 py-3 rounded-xl bg-secondary/40 border border-border/30">
                    <p className="text-[10px] tracking-widest text-muted-foreground/50 uppercase">weight</p>
                    <p className="text-sm tracking-wide text-foreground mt-1">{Number(artifact.weight_grams)} g</p>
                  </div>
                )}
              </div>
            )}

            {/* pendant chain disclaimer */}
            {artifact.artifact_type === "pendant" && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/40 border border-border/30">
                <span className="text-xs tracking-wider text-muted-foreground">
                  pendant only, chain not included
                </span>
              </div>
            )}

            {/* Made to order */}
            {artifact.made_to_order && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/40 border border-border/30">
                <Clock className="w-4 h-4 text-muted-foreground/50" />
                <span className="text-xs tracking-wider text-muted-foreground">
                  made to order, crafted after you place your request
                </span>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                className="rounded-full px-8 py-6 text-sm tracking-wider bg-foreground text-background hover:bg-foreground/90 shadow-paper gap-2"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    added to queue
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    add to queue
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCartOpen(true)}
                className="rounded-full px-8 py-6 text-sm tracking-wider border-border/80 text-muted-foreground gap-2"
              >
                <Package className="w-4 h-4" />
                view queue
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => navigate("/checkout")}
      />
    </div>
  );
}