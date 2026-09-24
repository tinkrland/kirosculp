import { Upload, Palette, Package } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Upload,
    title: "publish your design",
    desc: "upload CAD files, set materials, write a poetic description.",
  },
  {
    icon: Palette,
    title: "choose materials",
    desc: "silver, brass, gold - each changes the price and character.",
  },
  {
    icon: Package,
    title: "make it real",
    desc: "your artifact is manufactured and shipped as a tangible object.",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-light tracking-wider text-muted-foreground mb-12 lowercase">
          how it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-card rounded-[20px] border border-border/50 shadow-paper p-7 space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <step.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium tracking-wide lowercase text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed tracking-wide">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}