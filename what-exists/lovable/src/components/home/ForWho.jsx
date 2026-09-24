import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, ShoppingBag, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const creatorPoints = [
  "upload cad files (.glb, .stl, .gltf)",
  "set your earnings per piece",
  "we handle manufacturing and shipping",
  "track orders and revenue in your dashboard",
];

const buyerPoints = [
  "browse hundreds of original designs",
  "order made-to-order in silver, brass or gold",
  "request bespoke commissions from creators",
  "upgrade to commissioner for direct access",
];

export default function ForWho() {
  return (
    <section className="px-6 py-16 border-t border-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-[10px] tracking-widest font-mono uppercase mb-3 text-muted-foreground/50">who it's for</p>
          <h2 className="font-serif text-2xl md:text-4xl font-light leading-tight tracking-tight text-foreground">
            built for creators and collectors alike
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Creators card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-card rounded-[24px] border border-border/60 shadow-paper p-8 flex flex-col overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[60px] opacity-20 pointer-events-none" style={{ background: "#84A48B" }} />
            <div className="flex items-start gap-4 mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#AECBB855", border: "1px solid #84A48B40" }}>
                <Store className="w-5 h-5" style={{ color: "#84A48B" }} />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-wide lowercase text-foreground">for designers</h3>
                <p className="text-sm text-muted-foreground/70 tracking-wide font-light mt-1">
                  turn your cad work into a real store without a factory
                </p>
              </div>
            </div>

            <ul className="space-y-2.5 flex-1">
              {creatorPoints.map((pt) => (
                <li key={pt} className="flex items-start gap-2.5 text-sm text-muted-foreground tracking-wide font-light">
                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#84A48B" }} />
                  {pt}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link to="/market/create">
                <Button className="rounded-full text-xs tracking-wider gap-2 bg-foreground text-background hover:bg-foreground/90">
                  open your store
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Buyers card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-card rounded-[24px] border border-border/60 shadow-paper p-8 flex flex-col overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[60px] opacity-20 pointer-events-none" style={{ background: "#558E9B" }} />
            <div className="flex items-start gap-4 mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#C1D8DF55", border: "1px solid #558E9B40" }}>
                <ShoppingBag className="w-5 h-5" style={{ color: "#558E9B" }} />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-wide lowercase text-foreground">for collectors</h3>
                <p className="text-sm text-muted-foreground/70 tracking-wide font-light mt-1">
                  discover bespoke objects made to order from independent designers
                </p>
              </div>
            </div>

            <ul className="space-y-2.5 flex-1">
              {buyerPoints.map((pt) => (
                <li key={pt} className="flex items-start gap-2.5 text-sm text-muted-foreground tracking-wide font-light">
                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#558E9B" }} />
                  {pt}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link to="/explore">
                <Button variant="outline" className="rounded-full text-xs tracking-wider gap-2 border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary/60">
                  explore artifacts
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}