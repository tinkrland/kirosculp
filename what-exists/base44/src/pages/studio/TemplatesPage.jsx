import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudioNav from "@/components/studio/StudioNav";
import { useStudioDesign } from "@/lib/studioStore";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/jewelryTemplates";

export default function TemplatesPage() {
  const { jewelry, applyFull } = useStudioDesign(useState, useEffect);
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [customText, setCustomText] = useState({});
  const [applied, setApplied] = useState(null);

  const visible = category === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.category === category);

  const apply = (tpl) => {
    const config = { ...tpl.config };
    if (tpl.supportsText && customText[tpl.id]) {
      config.engraving = customText[tpl.id].slice(0, tpl.textMaxLen).toUpperCase();
      if (tpl.id === "name-pendant" && config.pendant) {
        config.pendant = { ...config.pendant, width: Math.max(24, customText[tpl.id].length * 7) };
      }
    }
    applyFull(config);
    setApplied(tpl.id);
    setTimeout(() => navigate("/build"), 600);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <StudioNav jewelry={jewelry} />

      <div className="flex-1 overflow-y-auto">
        {/* Page header */}
        <div className="px-8 py-8 border-b border-border/40">
          <h1 className="font-serif text-2xl text-foreground/80 tracking-wide">Templates</h1>
          <p className="text-sm text-muted-foreground/60 mt-1 tracking-wide">
            Start from a ready-made design. Every template is fully editable in the builder.
          </p>
        </div>

        {/* Category filter */}
        <div className="px-8 py-4 border-b border-border/30 flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] tracking-wide border transition-all ${
                category === c.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border/50 hover:border-foreground/30"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((tpl) => (
            <div key={tpl.id} className={`border rounded-2xl bg-card overflow-hidden flex flex-col transition-all ${applied === tpl.id ? "border-foreground/50 scale-[0.98]" : "border-border/50 hover:border-border hover:shadow-paper"}`}>
              {/* Preview tile */}
              <div className="h-32 bg-muted/30 flex items-center justify-center border-b border-border/30">
                <span className="text-5xl opacity-50">{tpl.icon}</span>
              </div>

              <div className="p-4 flex flex-col flex-1 gap-3">
                <div>
                  <p className="text-sm font-medium tracking-wide text-foreground/90">{tpl.label}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5 leading-relaxed">{tpl.description}</p>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground/50 uppercase">{tpl.config.type}</span>
                  <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground/50 uppercase">{tpl.config.material}</span>
                  <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground/50 uppercase">{tpl.config.finish}</span>
                </div>

                {tpl.supportsText && (
                  <input
                    type="text"
                    maxLength={tpl.textMaxLen}
                    placeholder={tpl.textLabel}
                    value={customText[tpl.id] || ""}
                    onChange={(e) => setCustomText((s) => ({ ...s, [tpl.id]: e.target.value }))}
                    className="w-full rounded-lg border border-border/50 bg-background text-[11px] px-3 py-1.5 placeholder:text-muted-foreground/30 tracking-widest font-mono focus:outline-none focus:border-foreground/30"
                  />
                )}

                <button
                  onClick={() => apply(tpl)}
                  className="mt-auto w-full py-2 rounded-xl bg-foreground/90 hover:bg-foreground text-background text-[11px] font-mono tracking-wider transition-colors"
                >
                  {applied === tpl.id ? "applied ✓" : "use template →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}