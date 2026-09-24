import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Copy, Check, Bookmark } from "lucide-react";
import StudioNav from "@/components/studio/StudioNav";
import { useStudioDesign } from "@/lib/studioStore";
import { MATERIALS } from "@/lib/jewelryDefaults";

const PRESETS_KEY = "sculptura_saved_presets";

function loadPresets() {
  try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || "[]"); } catch { return []; }
}
function savePresets(list) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(list));
}

export default function PresetsPage() {
  const { jewelry, applyFull } = useStudioDesign(useState, useEffect);
  const navigate = useNavigate();
  const [presets, setPresets] = useState(() => loadPresets());
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);

  const saveCurrentAsPreset = () => {
    const name = saveName.trim() || `${jewelry.type} · ${jewelry.material} · ${new Date().toLocaleDateString()}`;
    const next = [{ id: Date.now(), name, design: jewelry, savedAt: new Date().toISOString() }, ...presets];
    setPresets(next);
    savePresets(next);
    setSaveName("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deletePreset = (id) => {
    const next = presets.filter((p) => p.id !== id);
    setPresets(next);
    savePresets(next);
  };

  const loadPreset = (preset) => {
    applyFull(preset.design);
    navigate("/build");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <StudioNav jewelry={jewelry} />
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-8 border-b border-border/40">
          <h1 className="font-serif text-2xl text-foreground/80 tracking-wide">Saved Presets</h1>
          <p className="text-sm text-muted-foreground/60 mt-1 tracking-wide">
            Save your current design as a named preset to revisit or order later.
          </p>
        </div>

        {/* Save current */}
        <div className="px-8 py-6 border-b border-border/30">
          <p className="text-[10px] tracking-widest font-mono text-muted-foreground/50 uppercase mb-3">save current design</p>
          <div className="flex gap-3 max-w-md">
            <input
              type="text"
              placeholder={`${jewelry.type} · ${jewelry.material} · ${jewelry.finish}`}
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveCurrentAsPreset()}
              className="flex-1 rounded-xl border border-border/60 bg-card text-[12px] px-4 py-2.5 placeholder:text-muted-foreground/30 tracking-wide focus:outline-none focus:border-foreground/30"
            />
            <button
              onClick={saveCurrentAsPreset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-[11px] font-mono tracking-wider hover:bg-foreground/90 transition-colors"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {saved ? "saved!" : "save"}
            </button>
          </div>

          {/* Current design summary */}
          <div className="mt-3 flex gap-2 flex-wrap">
            {[
              jewelry.type,
              MATERIALS[jewelry.material]?.label,
              jewelry.finish,
              jewelry.engraving && `"${jewelry.engraving}"`,
            ].filter(Boolean).map((tag, i) => (
              <span key={i} className="text-[9px] font-mono tracking-wider px-2 py-1 rounded-full bg-muted/50 text-muted-foreground/50 uppercase">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Presets grid */}
        <div className="px-8 py-6">
          {presets.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <Bookmark className="w-8 h-8 text-muted-foreground/20 mx-auto" />
              <p className="text-sm text-muted-foreground/40 tracking-wide">No presets saved yet.</p>
              <p className="text-[11px] text-muted-foreground/30 tracking-wide">Build something in the designer, then save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {presets.map((p) => {
                const mat = MATERIALS[p.design.material];
                return (
                  <div key={p.id} className="border border-border/50 rounded-2xl bg-card overflow-hidden hover:shadow-paper transition-all">
                    {/* Color strip */}
                    <div
                      className="h-16 w-full"
                      style={{ background: mat ? `#${mat.color.toString(16).padStart(6, "0")}` : "#d4d4d4", opacity: 0.7 }}
                    />
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-[12px] font-medium tracking-wide text-foreground/90">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground/40 mt-0.5 font-mono">
                          saved {new Date(p.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {[p.design.type, p.design.material, p.design.finish].map((tag, i) => (
                          <span key={i} className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground/50 uppercase">{tag}</span>
                        ))}
                        {p.design.engraving && (
                          <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground/50 italic">"{p.design.engraving}"</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadPreset(p)}
                          className="flex-1 py-1.5 rounded-xl bg-foreground/90 hover:bg-foreground text-background text-[11px] font-mono tracking-wider transition-colors"
                        >
                          load →
                        </button>
                        <button
                          onClick={() => deletePreset(p.id)}
                          className="p-1.5 rounded-xl border border-border/50 hover:border-destructive/40 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}