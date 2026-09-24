import { useRef } from "react";
import {
  JEWELRY_TYPES, MATERIALS, FINISHES,
  RING_PROFILES, PENDANT_SHAPES, BRACELET_STYLES,
  EARRING_CATEGORIES, EARRING_SHAPES_BY_CATEGORY, EARRING_VALID_MECHANISMS, EARRING_MECHANISM_DESC,
  PATTERNS, STONE_SETTINGS, STONE_SHAPES, STONE_COLORS,
} from "@/lib/jewelryDefaults";

// ── tiny shared UI ────────────────────────────────────────────────────────────

function Sec({ title, children }) {
  return (
    <div className="border-b border-border/50 px-4 py-4 space-y-3">
      <p className="text-[9px] tracking-widest font-mono text-muted-foreground/50 uppercase">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value, unit, children }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-muted-foreground tracking-wide">{label}</span>
        {value !== undefined && (
          <span className="text-[11px] font-mono text-foreground/70">{typeof value === "number" ? value.toFixed(1) : value}{unit || ""}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, onChange }) {
  return (
    <Row label={label} value={value} unit={unit}>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full accent-foreground cursor-pointer" />
    </Row>
  );
}

function Pills({ options, value, onChange, labelFn, cols }) {
  return (
    <div className={`grid gap-1 ${cols === 3 ? "grid-cols-3" : cols === 4 ? "grid-cols-4" : "grid-cols-2"}`}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-2 py-1.5 rounded-lg text-[10px] tracking-wide border transition-all text-center ${
            value === o
              ? "bg-foreground text-background border-foreground"
              : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
          }`}>
          {labelFn ? labelFn(o) : o}
        </button>
      ))}
    </div>
  );
}

function MaterialPicker({ value, onChange }) {
  return (
    <div className="space-y-1">
      {Object.entries(MATERIALS).map(([k, m]) => (
        <button key={k} onClick={() => onChange(k)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-[11px] tracking-wide transition-all ${
            value === k
              ? "bg-foreground/5 border-foreground/30 text-foreground"
              : "border-border/40 text-muted-foreground hover:border-border"
          }`}>
          <span className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
            style={{ background: `#${m.color.toString(16).padStart(6, "0")}` }} />
          {m.label}
        </button>
      ))}
    </div>
  );
}

// ── Type-specific parameter panels ────────────────────────────────────────────

function RingPanel({ ring, setNested }) {
  const s = (k, v) => setNested("ring", k, v);
  return (
    <>
      <Sec title="finger size">
        <select value={ring.innerRadius * 2} onChange={(e) => s("innerRadius", parseFloat(e.target.value) / 2)}
          className="w-full rounded-lg border border-border/60 bg-background text-[11px] px-3 py-2 tracking-wide focus:outline-none">
          {[
            ["US 4  (14.8mm)", 14.8], ["US 5  (15.7mm)", 15.7], ["US 6  (16.5mm)", 16.5],
            ["US 7  (17.3mm)", 17.3], ["US 8  (18.2mm)", 18.2], ["US 9  (19.0mm)", 19.0],
            ["US 10 (19.8mm)", 19.8], ["US 11 (20.6mm)", 20.6], ["US 12 (21.4mm)", 21.4],
          ].map(([l, v]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Slider label="inner diameter" value={ring.innerRadius * 2} min={12} max={24} step={0.1} unit=" mm" onChange={(v) => s("innerRadius", v / 2)} />
      </Sec>
      <Sec title="band">
        <Slider label="width" value={ring.bandWidth} min={2} max={20} step={0.5} unit=" mm" onChange={(v) => s("bandWidth", v)} />
        <Slider label="wall thickness" value={ring.thickness} min={0.8} max={5.0} step={0.1} unit=" mm" onChange={(v) => s("thickness", v)} />
        <Row label="profile">
          <Pills options={RING_PROFILES} value={ring.profile} onChange={(v) => s("profile", v)} cols={3} />
        </Row>
        {ring.profile === "signet" && (
          <>
            <Slider label="face width" value={ring.signetWidth} min={6} max={20} step={0.5} unit=" mm" onChange={(v) => s("signetWidth", v)} />
            <Slider label="face height" value={ring.signetHeight} min={6} max={22} step={0.5} unit=" mm" onChange={(v) => s("signetHeight", v)} />
          </>
        )}
      </Sec>
    </>
  );
}

function PendantPanel({ pendant, setNested }) {
  const s = (k, v) => setNested("pendant", k, v);
  return (
    <>
      <Sec title="pendant shape">
        <Pills options={PENDANT_SHAPES} value={pendant.shape} onChange={(v) => s("shape", v)} cols={3} />
      </Sec>
      <Sec title="dimensions">
        <Slider label="width" value={pendant.width} min={6} max={50} step={0.5} unit=" mm" onChange={(v) => s("width", v)} />
        <Slider label="height" value={pendant.height} min={6} max={60} step={0.5} unit=" mm" onChange={(v) => s("height", v)} />
        <Slider label="depth / thickness" value={pendant.depth} min={0.8} max={8} step={0.2} unit=" mm" onChange={(v) => s("depth", v)} />
      </Sec>
      <Sec title="bail (loop)">
        <Slider label="bail width" value={pendant.bailWidth} min={2} max={10} step={0.5} unit=" mm" onChange={(v) => s("bailWidth", v)} />
        <Slider label="bail height" value={pendant.bailHeight} min={3} max={14} step={0.5} unit=" mm" onChange={(v) => s("bailHeight", v)} />
      </Sec>
    </>
  );
}

function BraceletPanel({ bracelet, setNested }) {
  const s = (k, v) => setNested("bracelet", k, v);
  return (
    <>
      <Sec title="style">
        <Pills options={BRACELET_STYLES} value={bracelet.style} onChange={(v) => s("style", v)} cols={2} />
      </Sec>
      <Sec title="dimensions">
        <Slider label="inner diameter" value={bracelet.innerDiameter} min={48} max={72} step={0.5} unit=" mm" onChange={(v) => s("innerDiameter", v)} />
        <Slider label="band width" value={bracelet.width} min={3} max={30} step={0.5} unit=" mm" onChange={(v) => s("width", v)} />
        <Slider label="wall thickness" value={bracelet.thickness} min={0.8} max={5.0} step={0.1} unit=" mm" onChange={(v) => s("thickness", v)} />
        {bracelet.style === "cuff" && (
          <Slider label="cuff opening" value={bracelet.cuffOpening} min={5} max={60} step={1} unit="°" onChange={(v) => s("cuffOpening", v)} />
        )}
        {bracelet.style === "chain-link" && (
          <Slider label="link size" value={bracelet.linkSize} min={4} max={20} step={0.5} unit=" mm" onChange={(v) => s("linkSize", v)} />
        )}
      </Sec>
    </>
  );
}

function EarringPanel({ earring, setNested }) {
  const s = (k, v) => setNested("earring", k, v);
  const category = earring.category ?? "stud";
  const shapes = EARRING_SHAPES_BY_CATEGORY[category] ?? [];
  const validMechanisms = EARRING_VALID_MECHANISMS[category] ?? [];

  const setCategory = (cat) => {
    s("category", cat);
    s("shape", (EARRING_SHAPES_BY_CATEGORY[cat] ?? [])[0] ?? "");
    s("mechanism", (EARRING_VALID_MECHANISMS[cat] ?? [])[0] ?? "none");
  };

  return (
    <>
      <Sec title="earring type">
        <Pills options={EARRING_CATEGORIES.map(c => c.id)} value={category}
          onChange={setCategory} cols={2}
          labelFn={(id) => EARRING_CATEGORIES.find(c => c.id === id)?.label ?? id} />
      </Sec>
      <Sec title="shape">
        <Pills options={shapes} value={earring.shape ?? shapes[0]} onChange={(v) => s("shape", v)} cols={2}
          labelFn={(v) => v.replace(/-/g, " ")} />
      </Sec>
      <Sec title="dimensions">
        {category === "stud" && <>
          <Slider label="diameter" value={earring.size ?? 10} min={3} max={30} step={0.5} unit=" mm" onChange={(v) => s("size", v)} />
          <Slider label="thickness" value={earring.thickness ?? 1.5} min={0.5} max={6} step={0.1} unit=" mm" onChange={(v) => s("thickness", v)} />
        </>}
        {category === "hoop" && <>
          <Slider label="hoop diameter" value={earring.hoopDiameter ?? 20} min={6} max={80} step={0.5} unit=" mm" onChange={(v) => s("hoopDiameter", v)} />
          <Slider label="wire thickness" value={earring.hoopThickness ?? 1.5} min={0.5} max={8} step={0.1} unit=" mm" onChange={(v) => s("hoopThickness", v)} />
        </>}
        {(category === "drop" || category === "threader") && <>
          <Slider label="top width" value={earring.size ?? 8} min={3} max={30} step={0.5} unit=" mm" onChange={(v) => s("size", v)} />
          <Slider label="drop length" value={earring.dropLength ?? 20} min={8} max={90} step={0.5} unit=" mm" onChange={(v) => s("dropLength", v)} />
        </>}
        {(category === "climber" || category === "crawler" || category === "wrap") && <>
          <Slider label="length" value={earring.climbLength ?? 18} min={8} max={80} step={0.5} unit=" mm" onChange={(v) => s("climbLength", v)} />
          <Slider label="width" value={earring.size ?? 5} min={2} max={15} step={0.5} unit=" mm" onChange={(v) => s("size", v)} />
        </>}
        {category === "cuff" && <>
          <Slider label="band width" value={earring.cuffWidth ?? 4} min={2} max={20} step={0.5} unit=" mm" onChange={(v) => s("cuffWidth", v)} />
          <Slider label="inner diameter" value={earring.hoopDiameter ?? 14} min={10} max={20} step={0.5} unit=" mm" onChange={(v) => s("hoopDiameter", v)} />
          <Slider label="opening gap" value={earring.cuffOpening ?? 8} min={4} max={16} step={0.5} unit=" mm" onChange={(v) => s("cuffOpening", v)} />
        </>}
      </Sec>
      {validMechanisms.length > 0 && (
        <Sec title="back / closure">
          <Pills options={validMechanisms} value={earring.mechanism ?? validMechanisms[0]}
            onChange={(v) => s("mechanism", v)} cols={2}
            labelFn={(v) => v.replace(/-/g, " ")} />
          {earring.mechanism && EARRING_MECHANISM_DESC[earring.mechanism] && (
            <p className="text-[10px] text-muted-foreground/40 tracking-wide">{EARRING_MECHANISM_DESC[earring.mechanism]}</p>
          )}
        </Sec>
      )}
    </>
  );
}

// ── Stone panel (shared) ──────────────────────────────────────────────────────

function StonePanel({ stone, setNested }) {
  const s = (k, v) => setNested("stone", k, v);
  return (
    <Sec title="stone & setting">
      <Row label="setting">
        <Pills options={STONE_SETTINGS} value={stone.setting} onChange={(v) => s("setting", v)} cols={3} />
      </Row>
      {stone.setting !== "none" && (
        <>
          <Row label="shape">
            <Pills options={STONE_SHAPES} value={stone.shape} onChange={(v) => s("shape", v)} cols={3} />
          </Row>
          <Row label="gem">
            <div className="grid grid-cols-3 gap-1">
              {Object.entries(STONE_COLORS).map(([k, g]) => (
                <button key={k} onClick={() => s("gem", k)}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-[10px] tracking-wide transition-all ${
                    stone.gem === k ? "border-foreground/40 bg-foreground/5" : "border-border/40 hover:border-border"
                  }`}>
                  <span className="w-4 h-4 rounded-full" style={{ background: `#${g.color.toString(16).padStart(6, "0")}`, opacity: g.opacity }} />
                  <span className="text-muted-foreground">{g.label}</span>
                </button>
              ))}
            </div>
          </Row>
          <Slider label="stone size" value={stone.sizeMm} min={1.5} max={12} step={0.5} unit=" mm" onChange={(v) => s("sizeMm", v)} />
          <Slider label="count" value={stone.count} min={1} max={9} step={1} unit="×" onChange={(v) => s("count", v)} />
        </>
      )}
    </Sec>
  );
}

// ── Pattern panel ──────────────────────────────────────────────────────────────

function PatternPanel({ jewelry, set, setNested }) {
  const svgRef = useRef();

  const handleSvg = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("svgUrl", ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <Sec title="surface pattern">
      <Row label="pattern">
        <Pills options={PATTERNS} value={jewelry.pattern} onChange={(v) => set("pattern", v)} cols={3}
          labelFn={(v) => v === "custom-svg" ? "svg" : v} />
      </Row>
      {jewelry.pattern === "custom-svg" && (
        <div className="space-y-2">
          <button
            onClick={() => svgRef.current?.click()}
            className="w-full py-2 border border-dashed border-border rounded-xl text-[10px] font-mono tracking-wider text-muted-foreground hover:border-foreground/30 hover:text-foreground/60 transition-all">
            {jewelry.svgUrl ? "svg loaded — click to replace" : "+ upload .svg file"}
          </button>
          <input ref={svgRef} type="file" accept=".svg" className="hidden" onChange={handleSvg} />
          {jewelry.svgUrl && (
            <div className="border border-border/40 rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center p-3">
              <img src={jewelry.svgUrl} className="max-h-20 max-w-full object-contain opacity-70" alt="pattern preview" />
            </div>
          )}
        </div>
      )}
      {jewelry.pattern !== "none" && (
        <>
          <Slider label="depth" value={jewelry.patternDepth} min={0.1} max={1.5} step={0.05} unit=" mm" onChange={(v) => set("patternDepth", v)} />
          <Slider label="scale" value={jewelry.patternScale} min={0.3} max={3.0} step={0.1} unit="×" onChange={(v) => set("patternScale", v)} />
        </>
      )}
    </Sec>
  );
}

// ── Main controls ─────────────────────────────────────────────────────────────

export default function JewelryControls({ jewelry, set, setNested }) {
  return (
    <div className="divide-y divide-border/40">
      {/* Type picker */}
      <div className="px-4 py-4 space-y-2">
        <p className="text-[9px] tracking-widest font-mono text-muted-foreground/50 uppercase">jewelry type</p>
        <div className="grid grid-cols-4 gap-1.5">
          {JEWELRY_TYPES.map((t) => {
            const icons = { ring: "◎", pendant: "◆", bracelet: "○", earring: "◈" };
            return (
              <button key={t} onClick={() => set("type", t)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-[10px] tracking-wide transition-all ${
                  jewelry.type === t
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground border-border/60 hover:border-foreground/20"
                }`}>
                <span className="text-base leading-none">{icons[t]}</span>
                <span>{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Type-specific controls */}
      {jewelry.type === "ring"     && <RingPanel     ring={jewelry.ring}         setNested={setNested} />}
      {jewelry.type === "pendant"  && <PendantPanel  pendant={jewelry.pendant}   setNested={setNested} />}
      {jewelry.type === "bracelet" && <BraceletPanel bracelet={jewelry.bracelet} setNested={setNested} />}
      {jewelry.type === "earring"  && <EarringPanel  earring={jewelry.earring}   setNested={setNested} />}

      {/* Pattern (shared) */}
      <PatternPanel jewelry={jewelry} set={set} setNested={setNested} />

      {/* Stone (shared) */}
      <StonePanel stone={jewelry.stone} setNested={setNested} />

      {/* Material */}
      <Sec title="material">
        <MaterialPicker value={jewelry.material} onChange={(v) => set("material", v)} />
      </Sec>

      {/* Finish */}
      <Sec title="surface finish">
        <Pills options={FINISHES} value={jewelry.finish} onChange={(v) => set("finish", v)} cols={3} />
      </Sec>

      {/* Engraving */}
      <Sec title="engraving / text">
        <input type="text" maxLength={40} placeholder="e.g. ever yours"
          value={jewelry.engraving}
          onChange={(e) => set("engraving", e.target.value)}
          className="w-full rounded-lg border border-border/60 bg-background text-[11px] px-3 py-2 placeholder:text-muted-foreground/40 tracking-wide focus:outline-none focus:border-foreground/30" />
        <p className="text-[10px] text-muted-foreground/40 tracking-wide">appears in exported code</p>
      </Sec>

      {/* Render quality */}
      <Sec title="render quality">
        <Slider label="mesh smoothness" value={jewelry.segments} min={16} max={128} step={16} unit="" onChange={(v) => set("segments", v)} />
      </Sec>

      {/* Live spec summary */}
      <div className="px-4 py-4 space-y-1.5">
        <p className="text-[9px] tracking-widest font-mono text-muted-foreground/50 uppercase">specs</p>
        {jewelry.type === "ring" && [
          ["inner ∅", `${(jewelry.ring.innerRadius * 2).toFixed(1)} mm`],
          ["outer ∅", `${((jewelry.ring.innerRadius + jewelry.ring.thickness) * 2).toFixed(1)} mm`],
          ["width",   `${jewelry.ring.bandWidth} mm`],
          ["profile", jewelry.ring.profile],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-muted-foreground/60">{k}</span>
            <span className="font-mono text-foreground/70">{v}</span>
          </div>
        ))}
        {jewelry.type === "pendant" && [
          ["size",    `${jewelry.pendant.width} × ${jewelry.pendant.height} mm`],
          ["depth",   `${jewelry.pendant.depth} mm`],
          ["shape",   jewelry.pendant.shape],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-muted-foreground/60">{k}</span>
            <span className="font-mono text-foreground/70">{v}</span>
          </div>
        ))}
        {jewelry.type === "bracelet" && [
          ["inner ∅", `${jewelry.bracelet.innerDiameter} mm`],
          ["width",   `${jewelry.bracelet.width} mm`],
          ["style",   jewelry.bracelet.style],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-muted-foreground/60">{k}</span>
            <span className="font-mono text-foreground/70">{v}</span>
          </div>
        ))}
        {jewelry.type === "earring" && [
          ["type",  jewelry.earring.category ?? "stud"],
          ["shape", (jewelry.earring.shape ?? "").replace(/-/g, " ")],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-muted-foreground/60">{k}</span>
            <span className="font-mono text-foreground/70">{v}</span>
          </div>
        ))}
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground/60">material</span>
          <span className="font-mono text-foreground/70">{MATERIALS[jewelry.material]?.label}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground/60">finish</span>
          <span className="font-mono text-foreground/70">{jewelry.finish}</span>
        </div>
      </div>
    </div>
  );
}