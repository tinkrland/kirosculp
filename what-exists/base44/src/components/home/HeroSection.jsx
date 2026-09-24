import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const previewCards = [
  { label: "ring_03",    dotColor: "#7BB2BA", bg: "rgba(193,216,223,0.35)", border: "rgba(193,216,223,0.6)", offsetY: 24  },
  { label: "pendant_01", dotColor: "#C8B3CA", bg: "rgba(200,179,202,0.22)", border: "rgba(200,179,202,0.45)", offsetY: 0  },
  { label: "cuff_07",    dotColor: "#E89B85", bg: "rgba(232,155,133,0.18)", border: "rgba(232,155,133,0.4)",  offsetY: 12 },
];

export default function HeroSection() {
  return (
    <section className="relative px-6 pt-8 pb-10 md:pt-10 md:pb-14">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-[28px] border border-border/50 overflow-hidden"
          style={{
            background: "radial-gradient(ellipse 90% 100% at 75% -10%, hsl(195 45% 88%) 0%, hsl(210 30% 93%) 30%, hsl(38 20% 97%) 65%, hsl(38 28% 96%) 100%)",
            minHeight: 460,
          }}
        >
          {/* Corner marks */}
          <div className="absolute top-5 left-5 w-5 h-5 border-l border-t border-foreground/12 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-5 right-5 w-5 h-5 border-r border-t border-foreground/12 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-5 left-5 w-5 h-5 border-l border-b border-foreground/12 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-5 right-5 w-5 h-5 border-r border-b border-foreground/12 rounded-br-sm pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 p-10 md:p-14 flex flex-col justify-center" style={{ minHeight: 460 }}>
            <div className="max-w-lg">
              {/* Pill label */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-foreground/15 bg-white/30 backdrop-blur-sm mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 flex-shrink-0" />
                <span className="text-[10px] tracking-[0.18em] text-foreground/55 uppercase font-mono">
                  cad to metal, a new way to create
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-serif font-light leading-[0.95] tracking-tight text-foreground mb-6">
                <span className="block text-6xl md:text-7xl lg:text-[88px]">from cad</span>
                <span className="block text-6xl md:text-7xl lg:text-[88px] text-foreground/35 italic">to metal</span>
              </h1>

              {/* Description */}
              <p className="text-sm md:text-[15px] text-foreground/55 font-light tracking-wide leading-relaxed mb-9 max-w-[340px]">
                publish your designs. choose materials. let your artifacts become real objects,{" "}
                <span className="text-foreground/80">crafted, shipped, loved.</span>
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link to="/store/create">
                  <Button className="rounded-full px-6 py-5 text-sm tracking-wide gap-2 bg-foreground text-background hover:bg-foreground/90">
                    open a store
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link to="/explore">
                  <Button variant="outline" className="rounded-full px-6 py-5 text-sm tracking-wide border-foreground/20 bg-white/20 text-foreground/60 hover:text-foreground hover:bg-white/40 backdrop-blur-sm">
                    explore artifacts
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Artifact preview cards — staggered, right side */}
          <div className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 items-end gap-3">
            {previewCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.12, duration: 0.5 }}
                className="flex flex-col items-center gap-2"
                style={{ marginBottom: card.offsetY }}
              >
                <div
                  className="w-[110px] h-[110px] rounded-[20px] flex items-center justify-center"
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full"
                    style={{ background: card.dotColor, opacity: 0.65 }}
                  />
                </div>
                <span className="text-[10px] tracking-wider text-foreground/40 font-mono">{card.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}