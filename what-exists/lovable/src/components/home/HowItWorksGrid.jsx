import { motion } from "framer-motion";
import { Upload, Sliders, Package, Search, MessageSquare, Truck } from "lucide-react";

const creatorSteps = [
  {
    icon: Upload,
    title: "upload your design",
    desc: "publish cad files in .glb or .stl format. add a name, description, and a render.",
    points: ["supports glb, stl, gltf", "attach render images", "set category and specs"],
    accent: "#558E9B",
    bg: "#C1D8DF",
  },
  {
    icon: Sliders,
    title: "set pricing and materials",
    desc: "choose your material, your target region, and how much you want to earn per piece.",
    points: ["silver, brass, gold", "regional manufacturing routing", "you set your own earnings"],
    accent: "#84A48B",
    bg: "#AECBB8",
  },
  {
    icon: Package,
    title: "we handle production",
    desc: "when a buyer orders, sculptura routes to a manufacturing partner and ships directly to them.",
    points: ["made-to-order workflow", "no inventory required", "worldwide shipping"],
    accent: "#E1CA7A",
    bg: "#F0D58F",
  },
];

const buyerSteps = [
  {
    icon: Search,
    title: "find your piece",
    desc: "browse hundreds of original cad designs across jewelry, sculpture, functional objects and more.",
    points: ["filter by material", "filter by category", "search by creator"],
    accent: "#A386A9",
    bg: "#C8B3CA",
  },
  {
    icon: MessageSquare,
    title: "request or commission",
    desc: "order a listed artifact or reach out to a creator directly for something bespoke.",
    points: ["made-to-order items", "commission requests", "upgrade to commissioner tier"],
    accent: "#C96349",
    bg: "#F8D0D0",
  },
  {
    icon: Truck,
    title: "receive your artifact",
    desc: "your object is manufactured and shipped straight to your door. physical and real.",
    points: ["metal manufacturing", "careful packaging", "tracked delivery"],
    accent: "#7BB2BA",
    bg: "#C1D8DF",
  },
];

function StepCard({ step, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="bg-card rounded-[20px] border border-border/60 shadow-paper p-6 space-y-4 hover:shadow-paper-hover transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: step.bg + "55", border: `1px solid ${step.accent}30` }}
        >
          <step.icon className="w-4 h-4" style={{ color: step.accent }} />
        </div>
        <h3 className="text-sm font-semibold tracking-wide lowercase text-foreground pt-1.5">{step.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground font-light leading-relaxed tracking-wide">{step.desc}</p>
      <ul className="space-y-1.5">
        {step.points.map((pt) => (
          <li key={pt} className="flex items-center gap-2 text-[11px] tracking-wider text-muted-foreground/60">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: step.accent + "80" }} />
            {pt}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function HowItWorksGrid() {
  return (
    <section className="px-6 py-16 border-t border-border/40">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Creator flow */}
        <div>
          <div className="mb-8">
            <p className="text-[10px] tracking-widest font-mono uppercase mb-3" style={{ color: "#558E9B" }}>for designers</p>
            <h2 className="font-serif text-2xl md:text-4xl font-light leading-tight tracking-tight text-foreground">
              publish a design. earn from every sale.
            </h2>
            <p className="text-sm text-muted-foreground font-light tracking-wide mt-3 max-w-xl">
              no factory. no logistics. just your cad work and a store that ships real objects worldwide.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creatorSteps.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        </div>

        {/* Buyer flow */}
        <div>
          <div className="mb-8">
            <p className="text-[10px] tracking-widest font-mono uppercase mb-3" style={{ color: "#A386A9" }}>for collectors</p>
            <h2 className="font-serif text-2xl md:text-4xl font-light leading-tight tracking-tight text-foreground">
              discover objects that don't exist anywhere else.
            </h2>
            <p className="text-sm text-muted-foreground font-light tracking-wide mt-3 max-w-xl">
              original designs, manufactured on demand. or go further and commission something entirely your own.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buyerSteps.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}