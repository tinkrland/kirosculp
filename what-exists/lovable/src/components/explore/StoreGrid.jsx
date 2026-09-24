import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Store } from "lucide-react";

function StoreCard({ store, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/shop/${store.handle}`}
        className="block bg-card rounded-[20px] border border-border/50 shadow-paper hover:shadow-paper-hover hover:border-foreground/15 transition-all p-6 space-y-4"
      >
        <div className="flex items-center gap-4">
          {store.avatar_url ? (
            <img src={store.avatar_url} alt={store.handle} className="w-12 h-12 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-muted-foreground/40" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-wide lowercase text-foreground truncate">
              {store.display_name || store.handle}
            </p>
            <p className="text-[11px] text-muted-foreground/50 tracking-wide truncate">
              sculptura.shop/{store.handle}
            </p>
          </div>
        </div>

        {store.bio && (
          <p className="text-xs text-muted-foreground font-light tracking-wide leading-relaxed line-clamp-2">
            {store.bio}
          </p>
        )}

        {store.materials?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {store.materials.slice(0, 4).map((m) => (
              <span key={m} className="px-2.5 py-0.5 rounded-full text-[10px] tracking-wider bg-secondary text-secondary-foreground border border-border/40">
                {m}
              </span>
            ))}
          </div>
        )}

        {store.commission_open && (
          <div className="inline-flex items-center gap-1.5 text-[10px] tracking-wider text-moss">
            <div className="w-1.5 h-1.5 rounded-full bg-moss" />
            commissions open
          </div>
        )}
      </Link>
    </motion.div>
  );
}

export default function StoreGrid({ stores }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {stores.map((store, i) => (
        <StoreCard key={store.id} store={store} index={i} />
      ))}
    </div>
  );
}