import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import StudioNav from "@/components/studio/StudioNav";
import { useStudioDesign } from "@/lib/studioStore";
import { MATERIALS } from "@/lib/jewelryDefaults";
import { SCULPTEO_MATERIALS } from "@/lib/sculpteoMaterials";

const METAL_DETAILS = {
  silver: {
    fullName: "Sterling Silver (925)",
    composition: "92.5% silver, 7.5% copper",
    hardness: "Vickers 60–100 HV",
    meltPoint: "893 °C",
    density: "10.36 g/cm³",
    pros: ["Most affordable precious metal", "Excellent detail reproduction", "Hypoallergenic with rhodium plating", "Widely available"],
    cons: ["Tarnishes over time", "Softer than gold alloys"],
    printProcess: "Lost-wax casting",
    minWall: "0.6 mm",
    notes: "Best all-rounder for jewelry. Works for rings, pendants, bracelets, earrings.",
  },
  gold: {
    fullName: "18k Yellow Gold",
    composition: "75% gold, 12.5% silver, 12.5% copper",
    hardness: "Vickers 130–170 HV",
    meltPoint: "904 °C",
    density: "15.58 g/cm³",
    pros: ["Prestigious, high-value", "Doesn't tarnish", "Warm classic colour", "Highly malleable"],
    cons: ["Most expensive", "Softer than 14k", "Heavier feel"],
    printProcess: "Lost-wax casting",
    minWall: "0.6 mm",
    notes: "Premium choice. Best for special occasion pieces.",
  },
  "rose-gold": {
    fullName: "Rose Gold (18k)",
    composition: "75% gold, 22.25% copper, 2.75% silver",
    hardness: "Vickers 150–200 HV",
    meltPoint: "≈900 °C",
    density: "≈15.0 g/cm³",
    pros: ["Romantic warm hue", "More durable than yellow gold", "Trendy & photogenic"],
    cons: ["Can cause reactions in copper-sensitive individuals", "Less traditional"],
    printProcess: "Lost-wax casting",
    minWall: "0.6 mm",
    notes: "Popular for modern feminine jewelry.",
  },
  brass: {
    fullName: "Brass (CuZn)",
    composition: "60–70% copper, 30–40% zinc",
    hardness: "Vickers 60–120 HV",
    meltPoint: "900–940 °C",
    density: "8.4–8.7 g/cm³",
    pros: ["Affordable", "Gold-like appearance", "Highly machinable", "Good for large pieces"],
    cons: ["Tarnishes / oxidises", "May cause skin reactions", "Not precious metal"],
    printProcess: "Direct metal printing / casting",
    minWall: "0.8 mm",
    notes: "Great for costume jewelry, prop making, large statement pieces.",
  },
  oxidized: {
    fullName: "Oxidized Sterling Silver",
    composition: "925 silver + deliberate patina",
    hardness: "Vickers 60–100 HV",
    meltPoint: "893 °C",
    density: "10.36 g/cm³",
    pros: ["Dramatic dark finish", "Highlights texture and engraving", "Unique artisan look"],
    cons: ["Surface patina can wear in high-contact areas", "Less reflective"],
    printProcess: "Cast silver + chemical oxidation",
    minWall: "0.6 mm",
    notes: "Perfect for textured, engraved, or gothic designs where contrast matters.",
  },
  copper: {
    fullName: "Copper",
    composition: "99%+ Cu",
    hardness: "Vickers 35–60 HV",
    meltPoint: "1085 °C",
    density: "8.96 g/cm³",
    pros: ["Warm reddish tone", "Antibacterial", "Very affordable", "Excellent for surface texture"],
    cons: ["Turns skin green for some wearers", "Tarnishes quickly", "Soft"],
    printProcess: "Direct metal printing",
    minWall: "0.8 mm",
    notes: "Best for decorative or artistic pieces rather than wearable jewelry.",
  },
};

export default function MaterialsPage() {
  const { jewelry, set } = useStudioDesign(useState, useEffect);
  const [selected, setSelected] = useState(jewelry.material);

  const detail = METAL_DETAILS[selected];
  const mat3d  = SCULPTEO_MATERIALS.find((m) => m.id === selected || (selected === "gold" && m.id === "gold_18k"));

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <StudioNav jewelry={jewelry} />
      <div className="flex-1 overflow-hidden flex">

        {/* Left: material list */}
        <aside className="w-64 border-r border-border/60 overflow-y-auto flex-shrink-0 bg-card/40 py-4 px-3 space-y-1">
          <p className="text-[9px] tracking-widest font-mono text-muted-foreground/40 uppercase px-2 pb-2">Available metals</p>
          {Object.entries(MATERIALS).map(([k, m]) => (
            <button
              key={k}
              onClick={() => setSelected(k)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                selected === k
                  ? "bg-foreground/5 border-foreground/30 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted/40"
              }`}
            >
              <span className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                style={{ background: `#${m.color.toString(16).padStart(6, "0")}` }} />
              <div className="min-w-0">
                <p className="text-[11px] tracking-wide leading-tight">{m.label}</p>
              </div>
            </button>
          ))}

          <div className="pt-4 border-t border-border/30 mt-4">
            <p className="text-[9px] tracking-widest font-mono text-muted-foreground/40 uppercase px-2 pb-2">Sculpteo printable</p>
            {SCULPTEO_MATERIALS.filter(m => m.id !== "gold_14k").map((m) => (
              <div key={m.id} className="px-3 py-2 text-[10px] text-muted-foreground/50 tracking-wide flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border border-black/10 flex-shrink-0" style={{ background: m.color }} />
                {m.label} {m.isPrototype && <span className="text-[8px] px-1 rounded-sm bg-muted text-muted-foreground/40 font-mono">proto</span>}
              </div>
            ))}
          </div>
        </aside>

        {/* Right: detail */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          {detail && (
            <div className="max-w-3xl space-y-8">
              {/* Title row */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="w-8 h-8 rounded-full border border-black/10"
                      style={{ background: `#${MATERIALS[selected]?.color.toString(16).padStart(6, "0")}` }}
                    />
                    <h1 className="font-serif text-2xl text-foreground/80">{detail.fullName}</h1>
                  </div>
                  <p className="text-sm text-muted-foreground/60 tracking-wide">{detail.composition}</p>
                </div>
                <button
                  onClick={() => { set("material", selected); }}
                  className="px-4 py-2 rounded-xl bg-foreground text-background text-[11px] font-mono tracking-wider hover:bg-foreground/90 transition-colors flex-shrink-0"
                >
                  use this material
                </button>
              </div>

              {/* Properties grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  ["Hardness", detail.hardness],
                  ["Melt point", detail.meltPoint],
                  ["Density", detail.density],
                  ["Min wall (3D)", detail.minWall],
                ].map(([k, v]) => (
                  <div key={k} className="border border-border/40 rounded-xl p-3 bg-card">
                    <p className="text-[9px] font-mono tracking-widest text-muted-foreground/40 uppercase mb-1">{k}</p>
                    <p className="text-[13px] font-mono text-foreground/80">{v}</p>
                  </div>
                ))}
              </div>

              {/* Print process */}
              <div className="border border-border/40 rounded-xl p-4 bg-card space-y-2">
                <p className="text-[9px] font-mono tracking-widest text-muted-foreground/40 uppercase">Print / fabrication process</p>
                <p className="text-sm text-foreground/80 tracking-wide">{detail.printProcess}</p>
                <p className="text-[11px] text-muted-foreground/50 leading-relaxed">{detail.notes}</p>
              </div>

              {/* Pros & cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-green-200/50 dark:border-green-900/40 rounded-xl p-4 bg-green-50/30 dark:bg-green-900/10 space-y-2">
                  <p className="text-[9px] font-mono tracking-widest text-green-700/60 dark:text-green-400/50 uppercase">Advantages</p>
                  <ul className="space-y-1">
                    {detail.pros.map((p, i) => (
                      <li key={i} className="text-[11px] text-green-800/70 dark:text-green-300/60 flex items-start gap-1.5">
                        <span className="mt-0.5 flex-shrink-0">+</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border border-orange-200/50 dark:border-orange-900/40 rounded-xl p-4 bg-orange-50/30 dark:bg-orange-900/10 space-y-2">
                  <p className="text-[9px] font-mono tracking-widest text-orange-700/60 dark:text-orange-400/50 uppercase">Limitations</p>
                  <ul className="space-y-1">
                    {detail.cons.map((c, i) => (
                      <li key={i} className="text-[11px] text-orange-800/70 dark:text-orange-300/60 flex items-start gap-1.5">
                        <span className="mt-0.5 flex-shrink-0">−</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sculpteo info */}
              {mat3d && (
                <div className="border border-border/40 rounded-xl p-4 bg-card space-y-3">
                  <p className="text-[9px] font-mono tracking-widest text-muted-foreground/40 uppercase">Sculpteo 3D print specs</p>
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{mat3d.description}</p>
                  <div className="flex gap-6 flex-wrap">
                    {[
                      ["Sculpteo ID", mat3d.sculpteoId],
                      ["Min wall", `${mat3d.minThicknessMm} mm`],
                      ["Max size", `${mat3d.maxSizeMm.x}×${mat3d.maxSizeMm.y}×${mat3d.maxSizeMm.z} mm`],
                      ["Est. cost", `$${mat3d.pricePerMm3}/mm³`],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[9px] font-mono text-muted-foreground/40 uppercase">{k}</p>
                        <p className="text-[12px] font-mono text-foreground/70 mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                  <a href="https://www.sculpteo.com/en/materials/" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-foreground/70 transition-colors tracking-wide">
                    Full material specs on Sculpteo <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}