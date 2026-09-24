import { useState } from "react";
import { Artifacts } from "@/api/db";
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

export default function ArtifactDetail() {
  const id = window.location.pathname.split("/artifact/")[1];
  const navigate = useNavigate();

  const { data: liveArtifact, isLoading } = useQuery({
    queryKey: ["artifact", id],
    queryFn: () => Artifacts.getById(id).then((artifact) => artifact ? [artifact] : []),
    select: (data) => data?.[0],
    enabled: !!id && !id.startsWith("demo-"),
  });

  // Check demo data if id starts with "demo-"
  const demoArtifact = id?.startsWith("demo-") ? DEMO_ARTIFACTS.find((a) => a.id === id) : null;
  const artifact = liveArtifact || demoArtifact;

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const currentMaterial = selectedMaterial || artifact?.materials?.[0];
  const currentPrice = artifact?.prices?.[currentMaterial];

  const handleAddToCart = () => {
    if (!artifact || !currentMaterial) return;
    addToCart(artifact, currentMaterial);
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
      <div className="max-w-6xl mx-auto">
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors">
          <ArrowLeft className="w-4 h-4" />
          back to explore
        </Link>

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
              imageUrl={artifact.image_url}
              className="aspect-square"
            />
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

            {/* Price */}
            {currentPrice != null && (
              <div className="bg-card rounded-[18px] border border-border/50 shadow-paper p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm tracking-wide text-foreground">price</span>
                  <span className="text-2xl font-light tracking-wide text-foreground">${currentPrice}</span>
                </div>
                <p className="text-[11px] text-muted-foreground/50 tracking-wide">
                  delivery fees calculated at checkout
                </p>
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