import { useState } from "react";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/jewelryTemplates";
import { DEFAULT_JEWELRY } from "@/lib/jewelryDefaults";

export default function TemplatesPanel({ onApply }) {
  const [category, setCategory] = useState("all");
  const [customText, setCustomText] = useState({});

  const visible = category === "all"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === category);

  const apply = (tpl) => {
    const base = { ...DEFAULT_JEWELRY, ...tpl.config };
    // Apply typed text to engraving
    if (tpl.supportsText && customText[tpl.id]) {
      base.engraving = customText[tpl.id].slice(0, tpl.textMaxLen).toUpperCase();
      // For letter/initial pendant, optionally adjust width based on character count
      if (tpl.id === "name-pendant" && base.pendant) {
        const len = customText[tpl.id].length;
        base.pendant = { ...base.pendant, width: Math.max(24, len * 7) };
      }
    }
    onApply(base);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Category tabs */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-border/40">
        <p className="text-[9px] tracking-widest font-mono text-muted-foreground/50 uppercase mb-2">template category</p>
        <div className="flex flex-wrap gap-1">
          {TEMPLATE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-2.5 py-1 rounded-full text-[10px] tracking-wide border transition-all ${
                category === c.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border/50 hover:border-foreground/30"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {visible.map((tpl) => (
          <div
            key={tpl.id}
            className="border border-border/50 rounded-xl bg-card/50 overflow-hidden"
          >
            {/* Header row */}
            <div className="flex items-start gap-3 p-3">
              <div className="w-10 h-10 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center text-lg flex-shrink-0">
                {tpl.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium tracking-wide text-foreground/90">{tpl.label}</p>
                <p className="text-[10px] text-muted-foreground/60 tracking-wide mt-0.5">{tpl.description}</p>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-full bg-muted/80 text-muted-foreground/50 uppercase">
                    {tpl.config.type}
                  </span>
                  <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-full bg-muted/80 text-muted-foreground/50 uppercase">
                    {tpl.config.material}
                  </span>
                </div>
              </div>
            </div>

            {/* Text customization */}
            {tpl.supportsText && (
              <div className="px-3 pb-2">
                <input
                  type="text"
                  maxLength={tpl.textMaxLen}
                  placeholder={tpl.textLabel}
                  value={customText[tpl.id] || ""}
                  onChange={(e) => setCustomText((s) => ({ ...s, [tpl.id]: e.target.value }))}
                  className="w-full rounded-lg border border-border/50 bg-background text-[11px] px-3 py-1.5 placeholder:text-muted-foreground/30 tracking-widest font-mono focus:outline-none focus:border-foreground/30"
                />
                <p className="text-[9px] text-muted-foreground/40 mt-1 tracking-wide">
                  max {tpl.textMaxLen} char{tpl.textMaxLen > 1 ? "s" : ""} · appears as engraving
                </p>
              </div>
            )}

            {/* Apply button */}
            <div className="px-3 pb-3">
              <button
                onClick={() => apply(tpl)}
                className="w-full py-2 rounded-lg bg-foreground/90 hover:bg-foreground text-background text-[11px] font-mono tracking-wider transition-colors"
              >
                apply template →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}