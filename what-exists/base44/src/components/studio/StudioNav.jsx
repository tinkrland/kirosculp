import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Bookmark } from "lucide-react";

const PRESETS_KEY = "sculptura_saved_presets";
function quickSavePreset(jewelry) {
  try {
    const existing = JSON.parse(localStorage.getItem(PRESETS_KEY) || "[]");
    const name = `${jewelry.type} · ${jewelry.material} · ${new Date().toLocaleDateString()}`;
    const next = [{ id: Date.now(), name, design: jewelry, savedAt: new Date().toISOString() }, ...existing];
    localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
    return true;
  } catch { return false; }
}

// ── build-mode step bar (shown when steps prop is provided) ───────────────────

function StepBar({ steps, currentStep, onStepChange, maxVisited }) {
  return (
    <nav className="flex items-stretch gap-0 flex-1 h-full overflow-x-hidden">
      {steps.map((s, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        const accessible = i <= maxVisited;
        return (
          <button
            key={s.id}
            onClick={() => accessible && onStepChange(i)}
            disabled={!accessible}
            className={`inline-flex items-center gap-1.5 px-3 text-[11px] tracking-wide font-mono border-b-2 transition-all whitespace-nowrap h-full ${
              active
                ? "border-foreground text-foreground"
                : done
                ? "border-transparent text-muted-foreground/60 hover:text-foreground/60 cursor-pointer"
                : accessible
                ? "border-transparent text-muted-foreground/40 hover:text-foreground/40 cursor-pointer"
                : "border-transparent text-muted-foreground/20 cursor-default"
            }`}
          >
            {done && <Check className="w-2.5 h-2.5 flex-shrink-0" />}
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}

// ── default studio nav links (templates, styles, etc.) ────────────────────────

// (kept available but not shown on /build when steps are provided)

// ── main component ────────────────────────────────────────────────────────────

export default function StudioNav({ jewelry, steps, currentStep, onStepChange, maxVisited }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    quickSavePreset(jewelry);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <header className="border-b border-border/60 px-4 py-0 flex items-center bg-card/95 backdrop-blur-sm flex-shrink-0 z-20 h-11">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground tracking-wide transition-colors pr-4 border-r border-border/50 mr-4 h-full"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span className="font-wordmark text-sm">sculptura</span>
      </Link>

      {/* Studio label */}
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground/40 uppercase mr-5 hidden sm:block">studio</span>

      {/* Step bar (build mode) or empty space */}
      {steps ? (
        <StepBar
          steps={steps}
          currentStep={currentStep}
          onStepChange={onStepChange}
          maxVisited={maxVisited}
        />
      ) : (
        <div className="flex-1" />
      )}

      {/* Live piece info */}
      {jewelry && (
        <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/40 tracking-wider pl-4 border-l border-border/50 ml-4 flex-shrink-0">
          <span>{jewelry.type}</span>
          <span>·</span>
          <span>{jewelry.material}</span>
          <span>·</span>
          <span>{jewelry.finish}</span>
          {jewelry.engraving && <><span>·</span><span className="italic">"{jewelry.engraving}"</span></>}
        </div>
      )}

      {/* Quick-save preset button */}
      {steps && jewelry && (
        <button
          onClick={handleSave}
          title="save as preset"
          className={`ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider border transition-all flex-shrink-0 ${
            saved
              ? "border-foreground/30 text-foreground bg-foreground/5"
              : "border-border/50 text-muted-foreground/50 hover:border-foreground/30 hover:text-foreground/60"
          }`}
        >
          {saved ? <Check className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
          {saved ? "saved" : "preset"}
        </button>
      )}
    </header>
  );
}