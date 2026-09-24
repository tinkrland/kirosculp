import { useState, useEffect } from "react";
import StudioNav from "@/components/studio/StudioNav";
import { useStudioDesign } from "@/lib/studioStore";
import { MATERIALS, FINISHES, FINISH_ROUGHNESS, PATTERNS } from "@/lib/jewelryDefaults";

const FINISH_DESCRIPTIONS = {
  polished: "Mirror-bright surface. Reflects like liquid metal. Classic, luxurious.",
  brushed:  "Fine parallel lines. Understated, modern. Hides fingerprints well.",
  hammered: "Organic dimpled texture. Handcrafted feel. Each piece looks unique.",
  matte:    "Completely flat, no shine. Contemporary minimal aesthetic.",
  satin:    "Soft sheen between polished and matte. Gentle and refined.",
};

const PATTERN_DESCRIPTIONS = {
  none:       "Smooth, undecorated surface.",
  waves:      "Flowing horizontal wave lines.",
  lattice:    "Open grid / mesh pattern.",
  dots:       "Uniform raised dot array.",
  chevron:    "Repeating V-stripe motif.",
  floral:     "Small 6-petal floral rosette.",
  lines:      "Clean parallel engraved lines.",
  "custom-svg": "Upload your own SVG artwork.",
};

function Swatch({ color, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border text-left transition-all ${
        active ? "border-foreground/40 bg-foreground/5" : "border-border/40 hover:border-border"
      }`}
    >
      <span className="w-5 h-5 rounded-full border border-black/10 flex-shrink-0" style={{ background: color }} />
      <span className="text-[11px] tracking-wide text-foreground/80">{label}</span>
      {active && <span className="ml-auto text-[10px] font-mono text-muted-foreground/50">active</span>}
    </button>
  );
}

export default function StylesPage() {
  const { jewelry, set } = useStudioDesign(useState, useEffect);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <StudioNav jewelry={jewelry} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-8 border-b border-border/40">
          <h1 className="font-serif text-2xl text-foreground/80 tracking-wide">Styles</h1>
          <p className="text-sm text-muted-foreground/60 mt-1 tracking-wide">
            Choose the surface finish and decorative pattern for your piece.
          </p>
        </div>

        <div className="px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
          {/* Finish */}
          <section className="col-span-1 lg:col-span-2 space-y-4">
            <h2 className="text-[10px] tracking-widest font-mono text-muted-foreground/50 uppercase">Surface Finish</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FINISHES.map((f) => (
                <button
                  key={f}
                  onClick={() => set("finish", f)}
                  className={`flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all ${
                    jewelry.finish === f
                      ? "border-foreground/40 bg-foreground/5"
                      : "border-border/40 bg-card hover:border-border hover:shadow-paper"
                  }`}
                >
                  {/* Finish preview strip */}
                  <div
                    className="w-full h-10 rounded-lg"
                    style={{
                      background: f === "polished" ? "linear-gradient(120deg, #d4d4d4, #f8f8f8, #b0b0b0)"
                        : f === "brushed"  ? "repeating-linear-gradient(90deg, #c8c8c8 0px, #e0e0e0 2px, #c8c8c8 4px)"
                        : f === "hammered" ? "radial-gradient(circle at 30% 40%, #e0e0e0 3px, #b8b8b8 10px, #c8c8c8 18px)"
                        : f === "matte"    ? "#c0c0c0"
                        : "linear-gradient(120deg, #ccc 0%, #e8e8e8 50%, #ccc 100%)"
                    }}
                  />
                  <div>
                    <p className="text-[12px] font-medium tracking-wide text-foreground/90 capitalize">{f}</p>
                    <p className="text-[11px] text-muted-foreground/55 mt-0.5 leading-relaxed">{FINISH_DESCRIPTIONS[f]}</p>
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground/40 tracking-wide">
                    roughness ≈ {((FINISH_ROUGHNESS[f] ?? 0) * 100).toFixed(0)}%
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Right column: material reminder + pattern */}
          <section className="space-y-8">
            {/* Current material quick-switch */}
            <div className="space-y-3">
              <h2 className="text-[10px] tracking-widest font-mono text-muted-foreground/50 uppercase">Material</h2>
              <div className="space-y-1.5">
                {Object.entries(MATERIALS).map(([k, m]) => (
                  <Swatch
                    key={k}
                    color={`#${m.color.toString(16).padStart(6, "0")}`}
                    label={m.label}
                    active={jewelry.material === k}
                    onClick={() => set("material", k)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Pattern — full width row */}
          <section className="col-span-1 lg:col-span-3 space-y-4">
            <h2 className="text-[10px] tracking-widest font-mono text-muted-foreground/50 uppercase">Surface Pattern</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PATTERNS.map((p) => (
                <button
                  key={p}
                  onClick={() => set("pattern", p)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all ${
                    jewelry.pattern === p
                      ? "border-foreground/40 bg-foreground/5"
                      : "border-border/40 bg-card hover:border-border"
                  }`}
                >
                  <span className="text-2xl opacity-60">
                    {p === "none" ? "—" : p === "waves" ? "〰" : p === "lattice" ? "⊞" : p === "dots" ? "⠿" : p === "chevron" ? "⋀" : p === "floral" ? "✿" : p === "lines" ? "≡" : "↑"}
                  </span>
                  <p className="text-[11px] font-medium tracking-wide text-foreground/80 capitalize">{p === "custom-svg" ? "Custom SVG" : p}</p>
                  <p className="text-[10px] text-muted-foreground/45 leading-relaxed">{PATTERN_DESCRIPTIONS[p]}</p>
                </button>
              ))}
            </div>

            {jewelry.pattern !== "none" && (
              <div className="flex gap-6 pt-2">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground/60">Pattern depth</span>
                    <span className="font-mono text-foreground/70">{jewelry.patternDepth?.toFixed(2)} mm</span>
                  </div>
                  <input type="range" min={0.1} max={1.5} step={0.05} value={jewelry.patternDepth ?? 0.3}
                    onChange={(e) => set("patternDepth", parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full accent-foreground cursor-pointer" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground/60">Pattern scale</span>
                    <span className="font-mono text-foreground/70">{jewelry.patternScale?.toFixed(1)}×</span>
                  </div>
                  <input type="range" min={0.3} max={3.0} step={0.1} value={jewelry.patternScale ?? 1.0}
                    onChange={(e) => set("patternScale", parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full accent-foreground cursor-pointer" />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}