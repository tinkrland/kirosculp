import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import MaterialTag from "./MaterialTag";
import { motion } from "framer-motion";
import { useCurrency } from "@/lib/CurrencyContext";
import { isWishlisted, toggleWishlist } from "@/lib/wishlistStore";

export default function ArtifactCard({ artifact }) {
  const { format } = useCurrency();
  const [wished, setWished] = useState(false);
  useEffect(() => {
    setWished(isWishlisted(artifact.id));
    const sync = () => setWished(isWishlisted(artifact.id));
    window.addEventListener("wishlist-updated", sync);
    return () => window.removeEventListener("wishlist-updated", sync);
  }, [artifact.id]);
  const defaultPrice = artifact.prices
    ? Object.values(artifact.prices)[0]
    : null;

  // prefer the slug-based url when both pieces are available, fall back to id
  // so legacy artifacts (no slug yet) keep working.
  const href = artifact.creator_handle && artifact.slug
    ? `/shop/${artifact.creator_handle}/${artifact.slug}`
    : `/artifact/${artifact.id}`;

  return (
    <Link to={href}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="group bg-card rounded-[20px] border border-border/60 shadow-paper hover:shadow-paper-hover transition-shadow duration-300 overflow-hidden cursor-pointer"
      >
        {/* Image */}
        <div className="aspect-square bg-secondary/40 relative overflow-hidden">
          {artifact.image_url ? (
            <img
              src={artifact.image_url}
              alt={artifact.name}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-border/40 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-foreground/40">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
            </div>
          )}

          {/* Wishlist heart */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(artifact); }}
            aria-label={wished ? "remove from wishlist" : "add to wishlist"}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background transition-colors"
          >
            <Heart className={`w-3.5 h-3.5 ${wished ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </button>

          {/* Specs annotation */}
          {artifact.specs && (
            <span className="absolute bottom-3 left-3 text-[10px] tracking-wider text-muted-foreground/70 bg-background/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {artifact.specs}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Name */}
          <h3 className="text-sm font-medium tracking-wide lowercase text-foreground">
            {artifact.name}
          </h3>

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {artifact.materials?.slice(0, 3).map((mat) => (
                <MaterialTag key={mat} material={mat} />
              ))}
            </div>
            {defaultPrice && (
              <span className="text-xs text-muted-foreground font-medium tracking-wide flex-shrink-0">
                {format(defaultPrice)}
              </span>
            )}
          </div>

          {/* Creator */}
          {artifact.creator_handle && (
            <p className="text-[11px] text-muted-foreground/60 tracking-wide">
              by {artifact.creator_handle}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}