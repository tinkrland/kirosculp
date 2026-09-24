import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import SiteFooter from "../components/home/SiteFooter";

const phases = [
  {
    id: "phase-1",
    label: "phase 1",
    title: "foundation",
    status: "done",
    accent: "#84A48B",
    bg: "#AECBB8",
    items: [
      { label: "creator store accounts with key-based auth", done: true },
      { label: "artifact publishing and review flow", done: true },
      { label: "admin review panel", done: true },
      { label: "order placement and tracking", done: true },
      { label: "store customization (appearance, socials, coupons)", done: true },
      { label: "explore and browse pages", done: true },
    ],
  },
  {
    id: "phase-2",
    label: "phase 2",
    title: "commerce",
    status: "in_progress",
    accent: "#558E9B",
    bg: "#C1D8DF",
    items: [
      { label: "cart and checkout flow", done: true },
      { label: "saved addresses and customer profiles", done: true },
      { label: "stripe payment integration", done: false },
      { label: "order confirmation emails", done: false },
      { label: "creator payout dashboard", done: false },
      { label: "discount code redemption at checkout", done: false },
    ],
  },
  {
    id: "phase-3",
    label: "phase 3",
    title: "discovery",
    status: "planned",
    accent: "#A386A9",
    bg: "#C8B3CA",
    items: [
      { label: "curated editorial drops", done: false },
      { label: "creator spotlight features", done: false },
      { label: "artifact collections and series", done: false },
      { label: "search with semantic matching", done: false },
      { label: "wishlist and saved artifacts", done: false },
      { label: "browse by material and region", done: false },
    ],
  },
  {
    id: "phase-4",
    label: "phase 4",
    title: "community",
    status: "planned",
    accent: "#C96349",
    bg: "#F8D0D0",
    items: [
      { label: "commissioner tier for buyers", done: false },
      { label: "direct commission requests", done: false },
      { label: "creator profiles with portfolio view", done: false },
      { label: "community drops and limited editions", done: false },
      { label: "newsletter and release announcements", done: false },
      { label: "3d preview and AR try-on", done: false },
    ],
  },
  {
    id: "phase-5",
    label: "phase 5",
    title: "scale",
    status: "planned",
    accent: "#E1CA7A",
    bg: "#F0D58F",
    items: [
      { label: "multi-material per artifact", done: false },
      { label: "regional manufacturing routing", done: false },
      { label: "international shipping calculator", done: false },
      { label: "creator analytics and revenue insights", done: false },
      { label: "bulk ordering for studios and galleries", done: false },
      { label: "mobile apps for iOS and Android", done: false },
      { label: "native sculptura tip jar (no third-party redirect)", done: false },
      { label: "creator account tiers based on sales volume", done: false },
      { label: "smarter artifact seo algorithm tied to creator tier", done: false },
      { label: "engineering & design rules guide for printable pieces", done: false },
      { label: "sculptura docs and creator knowledge base", done: false },
    ],
  },
];

const statusLabel = {
  done: { text: "complete", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  in_progress: { text: "in progress", color: "text-amber-600 bg-amber-50 border-amber-200" },
  planned: { text: "planned", color: "text-muted-foreground bg-secondary border-border" },
};

export default function Roadmap() {
  return (
    <div>
      <div className="px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            back
          </Link>

          <div className="mb-12">
            <p className="text-[10px] tracking-widest font-mono uppercase mb-3 text-muted-foreground/50">public roadmap</p>
            <h1 className="font-serif text-2xl md:text-4xl font-light tracking-tight lowercase text-foreground mb-3">
              where sculptura is going
            </h1>
            <p className="text-sm text-muted-foreground tracking-wide font-light leading-relaxed max-w-xl">
              this is our public roadmap. it reflects what we have built, what we are building now, and what we are planning next. things shift as we learn more from creators and collectors.
            </p>
          </div>

          <div className="space-y-6">
            {phases.map((phase, i) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="bg-card rounded-[20px] border border-border/50 shadow-paper overflow-hidden"
              >
                {/* Phase header */}
                <div className="px-6 py-5 flex items-center justify-between gap-4 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: phase.bg + "55", border: `1px solid ${phase.accent}30` }}
                    >
                      <span className="text-[10px] font-mono tracking-wider" style={{ color: phase.accent }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest font-mono uppercase text-muted-foreground/40">{phase.label}</p>
                      <h3 className="text-sm font-medium tracking-wide lowercase text-foreground">{phase.title}</h3>
                    </div>
                  </div>
                  <span className={`text-[11px] tracking-wider lowercase px-2.5 py-0.5 rounded-full border flex-shrink-0 ${statusLabel[phase.status].color}`}>
                    {statusLabel[phase.status].text}
                  </span>
                </div>

                {/* Items */}
                <ul className="px-6 py-4 space-y-3">
                  {phase.items.map((item) => (
                    <li key={item.label} className="flex items-start gap-3">
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                      ) : phase.status === "in_progress" ? (
                        <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400/70" />
                      ) : (
                        <Circle className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground/25" />
                      )}
                      <span className={`text-sm tracking-wide font-light ${item.done ? "text-muted-foreground/50 line-through" : "text-muted-foreground"}`}>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-card rounded-[20px] border border-border/50 shadow-paper p-6 space-y-3">
            <p className="text-[10px] tracking-widest font-mono uppercase text-muted-foreground/40">suggest a feature</p>
            <p className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed">
              have something you want to see on sculptura? reach out. we read every message.
            </p>
            <a
              href="mailto:hello@sculptura.shop"
              className="inline-flex items-center gap-2 text-xs tracking-wider text-foreground border border-border/60 px-4 py-2 rounded-full hover:bg-secondary transition-colors"
            >
              send a note
            </a>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}