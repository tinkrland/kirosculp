import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check, Printer, Code2, Upload, Layers } from "lucide-react";
import { svgToThreeShape } from "@/lib/svgToShape";
import * as THREE from "three";
import { TWO_PIECE_TYPES, THREE_PIECE_TYPES } from "@/lib/multiPieceJewelry";
import StudioNav from "@/components/studio/StudioNav";
import JewelryViewport from "@/components/canvas/JewelryViewport";
import { useStudioDesign } from "@/lib/studioStore";
import {
  MATERIALS, FINISHES,
  RING_PROFILES, RING_PROFILE_DESC,
  PENDANT_SHAPES, PENDANT_BAILS,
  BRACELET_STYLES, BRACELET_CLASPS,
  EARRING_CATEGORIES, EARRING_SHAPES_BY_CATEGORY, EARRING_VALID_MECHANISMS,
  EARRING_MECHANISM_DESC, EARRING_QUANTITY_OPTIONS, EARRING_PLACEMENT_OPTIONS,
  CHAIN_STYLES, CHAIN_CLASPS,
  KEYCHAIN_RINGS,
  PATTERNS, STONE_SETTINGS, STONE_SHAPES, STONE_COLORS,
} from "@/lib/jewelryDefaults";

// ─── primitives ───────────────────────────────────────────────────────────────

function Label({ children }) {
  return <p className="text-[9px] tracking-widest font-mono text-muted-foreground/40 uppercase mb-2">{children}</p>;
}

function Section({ title, children }) {
  return (
    <div className="border-t border-border/30 pt-5 space-y-3 first:border-0 first:pt-0">
      {title && <Label>{title}</Label>}
      {children}
    </div>
  );
}

function Pills({ options, value, onChange, labelFn, cols = 3 }) {
  const grid = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };
  return (
    <div className={`grid gap-1.5 ${grid[cols] || "grid-cols-3"}`}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-2 py-2 rounded-xl text-[10px] tracking-wide border transition-all text-center ${
            value === o
              ? "bg-foreground text-background border-foreground"
              : "bg-card text-muted-foreground border-border/50 hover:border-foreground/30"
          }`}>
          {labelFn ? labelFn(o) : o}
        </button>
      ))}
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, onChange }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-muted-foreground/70 tracking-wide">{label}</span>
        <span className="font-mono text-foreground/60">{typeof value === "number" ? value.toFixed(1) : value}{unit || ""}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full accent-foreground cursor-pointer" />
    </div>
  );
}

function UploadButton({ label, value, onChange, accept }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => onChange(ev.target.result);
    r.readAsDataURL(file);
  };
  return (
    <div className="space-y-1.5">
      <button onClick={() => ref.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-border rounded-xl text-[10px] font-mono tracking-wider text-muted-foreground hover:border-foreground/30 hover:text-foreground/60 transition-all">
        <Upload className="w-3 h-3" />
        {value ? "loaded — click to replace" : `+ upload ${label}`}
      </button>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleFile} />
      {value && (
        <div className="border border-border/30 rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center p-2 h-16">
          {accept?.includes("svg") || accept?.includes("image")
            ? <img src={value} className="max-h-full max-w-full object-contain opacity-60" alt="" />
            : <span className="text-[10px] font-mono text-muted-foreground/40">file loaded ✓</span>}
        </div>
      )}
    </div>
  );
}

// ─── step 0: type ─────────────────────────────────────────────────────────────

const TYPE_META = {
  ring:     { icon: "◎", desc: "bands, signets, stacking" },
  pendant:  { icon: "◆", desc: "charms, letters, shapes" },
  bracelet: { icon: "○", desc: "cuffs, bangles, chains" },
  earring:  { icon: "◈", desc: "studs, hoops, drops — wearable jewelry" },
  piercing: { icon: "◉", desc: "barbells, labrets, captive rings, surface anchors" },
  chain:    { icon: "⌀", desc: "link chains, necklaces" },
  keychain: { icon: "⊕", desc: "tags, fobs, accessories" },
};

function StepType({ jewelry, set }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-xl text-foreground/80 mb-1">what are you making?</h2>
        <p className="text-[11px] text-muted-foreground/50 tracking-wide">choose a type to begin</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(TYPE_META).map(([k, m]) => (
          <button key={k} onClick={() => set("type", k)}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-all ${
              jewelry.type === k
                ? "bg-foreground/5 border-foreground/40 text-foreground"
                : "border-border/40 bg-card hover:border-border text-muted-foreground"
            }`}>
            <span className="text-2xl w-8 text-center flex-shrink-0 leading-none opacity-60">{m.icon}</span>
            <div>
              <p className="text-[12px] tracking-wide font-medium">{k}</p>
              <p className="text-[10px] text-muted-foreground/50 tracking-wide mt-0.5">{m.desc}</p>
            </div>
            {jewelry.type === k && <Check className="w-3.5 h-3.5 ml-auto text-foreground/50 flex-shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── earring design sub-component ────────────────────────────────────────────

function EarringDesign({ jewelry, setNested }) {
  const e = jewelry.earring ?? {};
  const sn = (k, v) => setNested("earring", k, v);
  const category = e.category ?? "stud";
  const shapes = EARRING_SHAPES_BY_CATEGORY[category] ?? [];
  const validMechanisms = EARRING_VALID_MECHANISMS[category] ?? [];
  const hasBacking = validMechanisms.length > 0;

  // when category changes, reset shape and mechanism to valid defaults
  const setCategory = (cat) => {
    const newShapes = EARRING_SHAPES_BY_CATEGORY[cat] ?? [];
    const newMechanisms = EARRING_VALID_MECHANISMS[cat] ?? [];
    setNested("earring", "category", cat);
    setNested("earring", "shape", newShapes[0] ?? "");
    setNested("earring", "mechanism", newMechanisms[0] ?? "none");
  };

  return (
    <>
      {/* category */}
      <Section title="earring type">
        <div className="grid grid-cols-1 gap-1.5">
          {EARRING_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                category === cat.id
                  ? "bg-foreground/5 border-foreground/30 text-foreground"
                  : "border-border/40 bg-card hover:border-border text-muted-foreground"
              }`}>
              <div className="flex-1">
                <p className="text-[11px] tracking-wide font-medium">{cat.label}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">{cat.desc}</p>
              </div>
              {category === cat.id && <Check className="w-3 h-3 flex-shrink-0 text-foreground/40" />}
            </button>
          ))}
        </div>
      </Section>

      {/* shape within category */}
      <Section title="shape">
        <div className="grid grid-cols-3 gap-1.5">
          {shapes.map((s) => (
            <button key={s} onClick={() => sn("shape", s)}
              className={`px-2 py-2 rounded-xl text-[10px] tracking-wide border transition-all text-center ${
                (e.shape ?? shapes[0]) === s
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border/50 hover:border-foreground/30"
              }`}>
              {s.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      </Section>

      {/* dimensions — category-specific */}
      <Section title="dimensions">
        {category === "stud" && <>
          <Slider label="face diameter" value={e.size ?? 10} min={3} max={30} step={0.5} unit=" mm" onChange={(v) => sn("size", v)} />
          <Slider label="depth" value={e.thickness ?? 1.5} min={0.5} max={6} step={0.1} unit=" mm" onChange={(v) => sn("thickness", v)} />
          <Slider label="post diameter" value={e.postDiameter ?? 0.8} min={0.6} max={1.5} step={0.05} unit=" mm" onChange={(v) => sn("postDiameter", v)} />
        </>}
        {category === "hoop" && <>
          <Slider label="inner diameter" value={e.hoopDiameter ?? 20} min={6} max={80} step={0.5} unit=" mm" onChange={(v) => sn("hoopDiameter", v)} />
          <Slider label="band / wire thickness" value={e.hoopThickness ?? 1.5} min={0.5} max={8} step={0.1} unit=" mm" onChange={(v) => sn("hoopThickness", v)} />
        </>}
        {category === "drop" && <>
          <Slider label="top width" value={e.size ?? 8} min={3} max={30} step={0.5} unit=" mm" onChange={(v) => sn("size", v)} />
          <Slider label="drop length" value={e.dropLength ?? 20} min={8} max={90} step={0.5} unit=" mm" onChange={(v) => sn("dropLength", v)} />
          <Slider label="thickness" value={e.thickness ?? 1.5} min={0.5} max={5} step={0.1} unit=" mm" onChange={(v) => sn("thickness", v)} />
        </>}
        {category === "climber" && <>
          <Slider label="climb length" value={e.climbLength ?? 18} min={8} max={50} step={0.5} unit=" mm" onChange={(v) => sn("climbLength", v)} />
          <Slider label="width" value={e.size ?? 4} min={2} max={15} step={0.5} unit=" mm" onChange={(v) => sn("size", v)} />
          <Slider label="thickness" value={e.thickness ?? 1.5} min={0.5} max={4} step={0.1} unit=" mm" onChange={(v) => sn("thickness", v)} />
        </>}
        {category === "cuff" && <>
          <Slider label="band width" value={e.cuffWidth ?? 4} min={2} max={20} step={0.5} unit=" mm" onChange={(v) => sn("cuffWidth", v)} />
          <Slider label="inner diameter" value={e.hoopDiameter ?? 14} min={10} max={20} step={0.5} unit=" mm" onChange={(v) => sn("hoopDiameter", v)} />
          <Slider label="opening gap" value={e.cuffOpening ?? 8} min={4} max={16} step={0.5} unit=" mm" onChange={(v) => sn("cuffOpening", v)} />
          <Slider label="thickness" value={e.hoopThickness ?? 1.5} min={0.5} max={5} step={0.1} unit=" mm" onChange={(v) => sn("hoopThickness", v)} />
          <p className="text-[10px] text-muted-foreground/40 tracking-wide pt-1">ear cuffs squeeze gently onto the helix — no piercing required</p>
        </>}
        {category === "wrap" && <>
          <Slider label="wrap length" value={e.climbLength ?? 35} min={15} max={80} step={0.5} unit=" mm" onChange={(v) => sn("climbLength", v)} />
          <Slider label="wire gauge" value={e.hoopThickness ?? 1.2} min={0.5} max={4} step={0.1} unit=" mm" onChange={(v) => sn("hoopThickness", v)} />
          <p className="text-[10px] text-muted-foreground/40 tracking-wide pt-1">wraps coil around the outer ear — self-securing, no backing needed</p>
        </>}
        {category === "threader" && <>
          <Slider label="chain length" value={e.dropLength ?? 60} min={20} max={120} step={1} unit=" mm" onChange={(v) => sn("dropLength", v)} />
          <Slider label="wire gauge" value={e.hoopThickness ?? 0.7} min={0.5} max={1.2} step={0.05} unit=" mm" onChange={(v) => sn("hoopThickness", v)} />
          <p className="text-[10px] text-muted-foreground/40 tracking-wide pt-1">thin wire threads through the piercing — no back required</p>
        </>}
        {category === "crawler" && <>
          <Slider label="length" value={e.climbLength ?? 15} min={8} max={40} step={0.5} unit=" mm" onChange={(v) => sn("climbLength", v)} />
          <Slider label="width" value={e.size ?? 5} min={2} max={12} step={0.5} unit=" mm" onChange={(v) => sn("size", v)} />
          <Slider label="thickness" value={e.thickness ?? 1.5} min={0.5} max={4} step={0.1} unit=" mm" onChange={(v) => sn("thickness", v)} />
        </>}
      </Section>

      {/* backing — only shown when the category uses a back */}
      {hasBacking ? (
        <Section title="back / closure">
          <div className="grid grid-cols-1 gap-1.5">
            {validMechanisms.map((m) => (
              <button key={m} onClick={() => sn("mechanism", m)}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border text-left transition-all ${
                  (e.mechanism ?? validMechanisms[0]) === m
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground border-border/50 hover:border-foreground/30"
                }`}>
                <span className="text-[10px] tracking-wide w-28 flex-shrink-0">{m.replace(/-/g, " ")}</span>
                <span className={`text-[9px] tracking-wide ${(e.mechanism ?? validMechanisms[0]) === m ? "text-background/60" : "text-muted-foreground/40"}`}>
                  {EARRING_MECHANISM_DESC[m]}
                </span>
              </button>
            ))}
          </div>
        </Section>
      ) : (
        <Section title="back / closure">
          <p className="text-[10px] text-muted-foreground/40 tracking-wide">
            {category === "cuff" && "ear cuffs have no back — they grip the helix cartilage"}
            {category === "wrap" && "wraps are self-securing around the ear"}
            {category === "threader" && "threaders require no back — the wire hangs through the hole"}
          </p>
        </Section>
      )}

      {/* quantity & placement */}
      <Section title="quantity">
        <Pills options={EARRING_QUANTITY_OPTIONS} value={e.quantity ?? "pair"} onChange={(v) => sn("quantity", v)} cols={2} />
      </Section>
      <Section title="ear placement">
        <Pills options={EARRING_PLACEMENT_OPTIONS} value={e.placement ?? "lobe"} onChange={(v) => sn("placement", v)} cols={3} />
      </Section>
    </>
  );
}

// ─── piercing design sub-component ───────────────────────────────────────────

const PIERCING_STYLES = [
  { id: "labret",         label: "labret",          desc: "flat-back post, sits flush — lip, monroe, nostril" },
  { id: "barbell",        label: "barbell",          desc: "straight bar — industrial, tongue, navel" },
  { id: "curved-barbell", label: "curved barbell",   desc: "banana shape — eyebrow, navel, daith" },
  { id: "circular",       label: "circular barbell", desc: "horseshoe ring — septum, eyebrow, helix" },
  { id: "captive-ring",   label: "captive ring",     desc: "seamless ring held by a bead — helix, septum" },
  { id: "surface-anchor", label: "surface anchor",   desc: "single-point anchor for flat body areas" },
  { id: "nostril-screw",  label: "nostril screw",    desc: "l-shaped or spiral post for the nostril" },
  { id: "septum-retainer",label: "septum retainer",  desc: "u-shaped, flips up to hide the piercing" },
];

function PiercingDesign({ jewelry, setNested }) {
  const p = jewelry.piercing ?? {};
  const sn = (k, v) => setNested("piercing", k, v);
  const style = p.style ?? "labret";

  return (
    <>
      <Section title="piercing style">
        <div className="grid grid-cols-1 gap-1.5">
          {PIERCING_STYLES.map((s) => (
            <button key={s.id} onClick={() => sn("style", s.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                style === s.id
                  ? "bg-foreground/5 border-foreground/30 text-foreground"
                  : "border-border/40 bg-card hover:border-border text-muted-foreground"
              }`}>
              <div className="flex-1">
                <p className="text-[11px] tracking-wide font-medium">{s.label}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">{s.desc}</p>
              </div>
              {style === s.id && <Check className="w-3 h-3 flex-shrink-0 text-foreground/40" />}
            </button>
          ))}
        </div>
      </Section>

      <Section title="dimensions">
        {(style === "labret") && <>
          <Slider label="post length" value={p.postLength ?? 6} min={3} max={16} step={0.5} unit=" mm" onChange={(v) => sn("postLength", v)} />
          <Slider label="post diameter" value={p.gauge ?? 1.2} min={0.8} max={2.5} step={0.1} unit=" mm" onChange={(v) => sn("gauge", v)} />
          <Slider label="disc / end size" value={p.endSize ?? 4} min={2} max={10} step={0.5} unit=" mm" onChange={(v) => sn("endSize", v)} />
        </>}
        {(style === "barbell" || style === "curved-barbell") && <>
          <Slider label="bar length" value={p.postLength ?? 14} min={6} max={50} step={0.5} unit=" mm" onChange={(v) => sn("postLength", v)} />
          <Slider label="gauge" value={p.gauge ?? 1.6} min={0.8} max={4} step={0.1} unit=" mm" onChange={(v) => sn("gauge", v)} />
          <Slider label="ball / end size" value={p.endSize ?? 4} min={2} max={10} step={0.5} unit=" mm" onChange={(v) => sn("endSize", v)} />
        </>}
        {(style === "circular" || style === "captive-ring") && <>
          <Slider label="inner diameter" value={p.ringDiameter ?? 10} min={6} max={30} step={0.5} unit=" mm" onChange={(v) => sn("ringDiameter", v)} />
          <Slider label="gauge" value={p.gauge ?? 1.2} min={0.8} max={3} step={0.1} unit=" mm" onChange={(v) => sn("gauge", v)} />
          {style === "captive-ring" && (
            <Slider label="bead diameter" value={p.endSize ?? 3} min={2} max={8} step={0.5} unit=" mm" onChange={(v) => sn("endSize", v)} />
          )}
        </>}
        {style === "surface-anchor" && <>
          <Slider label="foot width" value={p.footWidth ?? 5} min={3} max={12} step={0.5} unit=" mm" onChange={(v) => sn("footWidth", v)} />
          <Slider label="post height" value={p.postLength ?? 2} min={1} max={6} step={0.5} unit=" mm" onChange={(v) => sn("postLength", v)} />
          <Slider label="top disc size" value={p.endSize ?? 4} min={2} max={10} step={0.5} unit=" mm" onChange={(v) => sn("endSize", v)} />
        </>}
        {(style === "nostril-screw" || style === "septum-retainer") && <>
          <Slider label="post length" value={p.postLength ?? 8} min={5} max={20} step={0.5} unit=" mm" onChange={(v) => sn("postLength", v)} />
          <Slider label="gauge" value={p.gauge ?? 1.0} min={0.6} max={2} step={0.1} unit=" mm" onChange={(v) => sn("gauge", v)} />
        </>}
      </Section>

      <Section title="quantity">
        <Pills
          options={["single", "pair", "set of 3"]}
          value={p.quantity ?? "single"}
          onChange={(v) => sn("quantity", v)}
          cols={3}
        />
      </Section>
    </>
  );
}

// ─── pendant design sub-component (with SVG import) ──────────────────────────

function PendantDesign({ jewelry, setNested }) {
  const svgRef = useRef();
  const p = jewelry.pendant;

  const handleSvgImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const svgText = ev.target.result;
      // parse SVG → THREE.Shape for viewport, store data URL for preview
      const shape = svgToThreeShape(THREE, svgText);
      // store as data URL for persistence + preview
      const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
      setNested("pendant", "shape", "svg-import");
      setNested("pendant", "svgDataUrl", dataUrl);
      // Pass the parsed THREE.Shape directly — viewport reads pendant.svgShape
      setNested("pendant", "svgShape", shape);
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* SVG import (inspo import) */}
      <Section title="shape from svg">
        <div className="space-y-2">
          <button onClick={() => svgRef.current?.click()}
            className={`w-full flex items-center justify-center gap-2 py-2.5 border border-dashed rounded-xl text-[10px] font-mono tracking-wider transition-all ${
              p.shape === "svg-import"
                ? "border-foreground/40 text-foreground bg-foreground/5"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground/60"
            }`}>
            <Upload className="w-3 h-3" />
            {p.shape === "svg-import" ? "svg loaded — click to replace" : "+ import svg silhouette"}
          </button>
          <input ref={svgRef} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={handleSvgImport} />
          {p.svgDataUrl && p.shape === "svg-import" && (
            <div className="border border-border/30 rounded-xl bg-muted/20 flex items-center justify-center p-3 h-20">
              <img src={p.svgDataUrl} className="max-h-full max-w-full object-contain opacity-50" alt="svg preview" />
            </div>
          )}
          <p className="text-[9px] text-muted-foreground/30 tracking-wide leading-relaxed">
            upload any svg — the outline is extruded into a 3d pendant. works best with simple logos, letters, or icons.
          </p>
        </div>
      </Section>

      {/* preset shapes — greyed out when svg is active */}
      <Section title="or choose a preset shape">
        <Pills
          options={PENDANT_SHAPES}
          value={p.shape === "svg-import" ? "" : p.shape}
          onChange={(v) => { setNested("pendant","shape",v); setNested("pendant","svgDataUrl",null); setNested("pendant","svgShape",null); }}
          cols={3}
        />
      </Section>

      <Section title="dimensions">
        <Slider label="width"  value={p.width}  min={6}   max={50} step={0.5} unit=" mm" onChange={(v) => setNested("pendant","width",v)} />
        <Slider label="height" value={p.height} min={6}   max={60} step={0.5} unit=" mm" onChange={(v) => setNested("pendant","height",v)} />
        <Slider label="depth"  value={p.depth}  min={0.8} max={8}  step={0.2} unit=" mm" onChange={(v) => setNested("pendant","depth",v)} />
      </Section>

      <Section title="bail / loop">
        <Pills options={PENDANT_BAILS} value={p.bail ?? "open-ring"} onChange={(v) => setNested("pendant","bail",v)} cols={2} labelFn={(v) => v.replace(/-/g," ")} />
        <div className="pt-1 space-y-1.5">
          <Slider label="bail inner width" value={p.bailWidth ?? 4} min={2} max={12} step={0.5} unit=" mm" onChange={(v) => setNested("pendant","bailWidth",v)} />
          <Slider label="bail height"      value={p.bailHeight ?? 6} min={3} max={16} step={0.5} unit=" mm" onChange={(v) => setNested("pendant","bailHeight",v)} />
        </div>
      </Section>
    </>
  );
}

// ─── multi-piece assembly step ────────────────────────────────────────────────

function StepAssembly({ jewelry, set, setNested }) {
  const mp = jewelry.multiPiece ?? {};
  const enabled = mp.enabled ?? false;
  const pieceCount = mp.pieceCount ?? 2;
  const types = pieceCount === 2 ? TWO_PIECE_TYPES : THREE_PIECE_TYPES;

  const setMp = (k, v) => {
    const next = { ...mp, [k]: v };
    set("multiPiece", next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-foreground/80 mb-1">multi-piece assembly</h2>
        <p className="text-[11px] text-muted-foreground/50 tracking-wide">
          design a 2 or 3-component piece with real findings — hinges, clasps, pivot links
        </p>
      </div>

      {/* toggle */}
      <Section>
        <button onClick={() => setMp("enabled", !enabled)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
            enabled ? "bg-foreground/5 border-foreground/40 text-foreground" : "border-border/40 bg-card text-muted-foreground"
          }`}>
          <div>
            <p className="text-[12px] tracking-wide font-medium">enable assembly mode</p>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">renders multiple components with connectors</p>
          </div>
          {enabled && <Check className="w-3.5 h-3.5 flex-shrink-0 text-foreground/50" />}
        </button>
      </Section>

      {enabled && <>
        <Section title="piece count">
          <div className="grid grid-cols-2 gap-1.5">
            {[2, 3].map((n) => (
              <button key={n} onClick={() => { setMp("pieceCount", n); setMp("assemblyType", null); }}
                className={`py-2.5 rounded-xl border text-[11px] tracking-wide transition-all ${
                  pieceCount === n ? "bg-foreground text-background border-foreground" : "border-border/50 text-muted-foreground hover:border-foreground/30"
                }`}>
                {n}-piece
              </button>
            ))}
          </div>
        </Section>

        <Section title={`${pieceCount}-piece assembly types`}>
          <div className="grid grid-cols-1 gap-1.5">
            {types.map((t) => (
              <button key={t.id} onClick={() => setMp("assemblyType", t.id)}
                className={`flex items-start gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                  mp.assemblyType === t.id
                    ? "bg-foreground/5 border-foreground/30 text-foreground"
                    : "border-border/40 bg-card hover:border-border text-muted-foreground"
                }`}>
                <div className="flex-1">
                  <p className="text-[11px] tracking-wide font-medium">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">{t.desc}</p>
                </div>
                {mp.assemblyType === t.id && <Check className="w-3 h-3 flex-shrink-0 text-foreground/40 mt-0.5" />}
              </button>
            ))}
          </div>
        </Section>

        {mp.assemblyType && (
          <Section title="how it reads in 3d">
            <div className="bg-muted/20 border border-border/30 rounded-xl px-3 py-3 space-y-1">
              <p className="text-[10px] text-muted-foreground/50 tracking-wide leading-relaxed">
                piece 1 renders at full brightness. piece 2 is slightly darker. piece 3 (if present) is darkest.
                connector findings (hinges, clasps, jump rings) are visible as separate geometry so you can verify the assembly makes physical sense.
              </p>
            </div>
          </Section>
        )}

        <Section title="note">
          <p className="text-[10px] text-muted-foreground/40 tracking-wide leading-relaxed">
            assembly mode overrides the single-piece renderer — shape and dimension settings in the design step still control the proportions.
          </p>
        </Section>
      </>}
    </div>
  );
}

// ─── step 1: design (shape + dimensions) ─────────────────────────────────────

function StepDesign({ jewelry, set, setNested }) {
  const t = jewelry.type;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-foreground/80 mb-1">shape & dimensions</h2>
        <p className="text-[11px] text-muted-foreground/50 tracking-wide">define the physical form of your {t}</p>
      </div>

      {t === "ring" && <>
        <Section>
          <Label>finger size</Label>
          <select value={jewelry.ring.innerRadius * 2}
            onChange={(e) => setNested("ring", "innerRadius", parseFloat(e.target.value) / 2)}
            className="w-full rounded-xl border border-border/50 bg-card text-[11px] px-3 py-2.5 tracking-wide focus:outline-none focus:border-foreground/30">
            {[["us 4  (14.8mm)",14.8],["us 5  (15.7mm)",15.7],["us 6  (16.5mm)",16.5],
              ["us 7  (17.3mm)",17.3],["us 8  (18.2mm)",18.2],["us 9  (19.0mm)",19.0],
              ["us 10 (19.8mm)",19.8],["us 11 (20.6mm)",20.6],["us 12 (21.4mm)",21.4],
            ].map(([l,v]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Section>
        <Section title="band">
          <Slider label="width" value={jewelry.ring.bandWidth} min={2} max={20} step={0.5} unit=" mm" onChange={(v) => setNested("ring","bandWidth",v)} />
          <Slider label="wall thickness" value={jewelry.ring.thickness} min={0.8} max={5.0} step={0.1} unit=" mm" onChange={(v) => setNested("ring","thickness",v)} />
        </Section>
        <Section title="profile style">
          <div className="grid grid-cols-1 gap-1.5">
            {RING_PROFILES.map((p) => (
              <button key={p} onClick={() => setNested("ring","profile",p)}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border text-left transition-all ${
                  jewelry.ring.profile === p
                    ? "bg-foreground/5 border-foreground/30 text-foreground"
                    : "border-border/40 bg-card hover:border-border text-muted-foreground"
                }`}>
                <span className="text-[11px] tracking-wide font-medium w-20 flex-shrink-0">{p}</span>
                <span className="text-[10px] text-muted-foreground/50">{RING_PROFILE_DESC[p]}</span>
                {jewelry.ring.profile === p && <Check className="w-3 h-3 ml-auto flex-shrink-0 text-foreground/40" />}
              </button>
            ))}
          </div>
        </Section>
        {/* profile-specific sub-controls */}
        {jewelry.ring.profile === "signet" && (
          <Section title="signet face">
            <Slider label="face width" value={jewelry.ring.signetWidth} min={6} max={20} step={0.5} unit=" mm" onChange={(v) => setNested("ring","signetWidth",v)} />
            <Slider label="face height" value={jewelry.ring.signetHeight} min={6} max={22} step={0.5} unit=" mm" onChange={(v) => setNested("ring","signetHeight",v)} />
          </Section>
        )}
        {jewelry.ring.profile === "wave" && (
          <Section title="wave shape">
            <Slider label="cycles" value={jewelry.ring.waveCycles ?? 3} min={1} max={12} step={1} unit="×" onChange={(v) => setNested("ring","waveCycles",v)} />
            <Slider label="amplitude" value={jewelry.ring.waveAmplitude ?? 1.5} min={0.3} max={4} step={0.1} unit=" mm" onChange={(v) => setNested("ring","waveAmplitude",v)} />
          </Section>
        )}
        {jewelry.ring.profile === "twist" && (
          <Section title="twist">
            <Slider label="turns" value={jewelry.ring.twistTurns ?? 1} min={0.5} max={4} step={0.5} unit="×" onChange={(v) => setNested("ring","twistTurns",v)} />
          </Section>
        )}
        {jewelry.ring.profile === "tapered" && (
          <Section title="taper">
            <Slider label="back width ratio" value={jewelry.ring.taperRatio ?? 0.4} min={0.1} max={0.9} step={0.05} unit="×" onChange={(v) => setNested("ring","taperRatio",v)} />
          </Section>
        )}
        {(jewelry.ring.profile === "open" || jewelry.ring.profile === "bypass") && (
          <Section title="opening">
            <Slider label="gap" value={jewelry.ring.openGap ?? 5} min={2} max={12} step={0.5} unit=" mm" onChange={(v) => setNested("ring","openGap",v)} />
          </Section>
        )}
      </>}

      {t === "pendant" && <PendantDesign jewelry={jewelry} setNested={setNested} />}

      {t === "bracelet" && <>
        <Section title="style">
          <Pills options={BRACELET_STYLES} value={jewelry.bracelet.style} onChange={(v) => setNested("bracelet","style",v)} cols={2} />
        </Section>
        <Section title="dimensions">
          <Slider label="inner diameter" value={jewelry.bracelet.innerDiameter} min={48} max={72} step={0.5} unit=" mm" onChange={(v) => setNested("bracelet","innerDiameter",v)} />
          <Slider label="band width" value={jewelry.bracelet.width} min={3} max={30} step={0.5} unit=" mm" onChange={(v) => setNested("bracelet","width",v)} />
          <Slider label="wall thickness" value={jewelry.bracelet.thickness} min={0.8} max={5.0} step={0.1} unit=" mm" onChange={(v) => setNested("bracelet","thickness",v)} />
          {jewelry.bracelet.style === "cuff" && (
            <Slider label="cuff opening" value={jewelry.bracelet.cuffOpening ?? 20} min={5} max={50} step={1} unit="°" onChange={(v) => setNested("bracelet","cuffOpening",v)} />
          )}
          {jewelry.bracelet.style === "chain-link" && (
            <Slider label="link size" value={jewelry.bracelet.linkSize ?? 8} min={3} max={18} step={0.5} unit=" mm" onChange={(v) => setNested("bracelet","linkSize",v)} />
          )}
        </Section>
        <Section title="clasp / closure">
          <div className="grid grid-cols-2 gap-1.5">
            {BRACELET_CLASPS.map((c) => (
              <button key={c} onClick={() => setNested("bracelet","clasp",c)}
                className={`px-2.5 py-2 rounded-xl border text-[10px] tracking-wide text-left transition-all ${
                  (jewelry.bracelet?.clasp ?? "lobster") === c
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground border-border/50 hover:border-foreground/30"
                }`}>
                {c.replace(/-/g," ")}
              </button>
            ))}
          </div>
        </Section>
      </>}

      {t === "earring" && <EarringDesign jewelry={jewelry} setNested={setNested} />}

      {t === "piercing" && <PiercingDesign jewelry={jewelry} setNested={setNested} />}

      {t === "chain" && <>
        <Section title="link style">
          <Pills options={CHAIN_STYLES} value={jewelry.chain?.style ?? "cable"} onChange={(v) => setNested("chain","style",v)} cols={3} />
        </Section>
        <Section title="dimensions">
          <Slider label="length" value={jewelry.chain?.length ?? 450} min={150} max={900} step={10} unit=" mm" onChange={(v) => setNested("chain","length",v)} />
          <Slider label="link width" value={jewelry.chain?.linkWidth ?? 3} min={1} max={12} step={0.5} unit=" mm" onChange={(v) => setNested("chain","linkWidth",v)} />
          <Slider label="wire gauge" value={jewelry.chain?.gauge ?? 1} min={0.5} max={3} step={0.1} unit=" mm" onChange={(v) => setNested("chain","gauge",v)} />
        </Section>
        <Section title="clasp">
          <Pills options={CHAIN_CLASPS} value={jewelry.chain?.clasp ?? "lobster"} onChange={(v) => setNested("chain","clasp",v)} cols={2} labelFn={(v) => v.replace(/-/g," ")} />
        </Section>
      </>}

      {t === "keychain" && <>
        <Section title="tag shape">
          <Pills options={["rectangle","circle","tag","shield","hexagon","custom"]}
            value={jewelry.keychain?.shape ?? "rectangle"} onChange={(v) => setNested("keychain","shape",v)} cols={3} />
        </Section>
        <Section title="dimensions">
          <Slider label="width" value={jewelry.keychain?.width ?? 35} min={20} max={80} step={0.5} unit=" mm" onChange={(v) => setNested("keychain","width",v)} />
          <Slider label="height" value={jewelry.keychain?.height ?? 55} min={20} max={100} step={0.5} unit=" mm" onChange={(v) => setNested("keychain","height",v)} />
          <Slider label="thickness" value={jewelry.keychain?.depth ?? 3} min={1.5} max={8} step={0.5} unit=" mm" onChange={(v) => setNested("keychain","depth",v)} />
        </Section>
        <Section title="ring / attachment">
          <Pills options={KEYCHAIN_RINGS} value={jewelry.keychain?.ringStyle ?? "split-ring"}
            onChange={(v) => setNested("keychain","ringStyle",v)} cols={2} labelFn={(v) => v.replace(/-/g," ")} />
        </Section>
      </>}
    </div>
  );
}

// ─── step 2: surface decoration + hardware/mechanism ─────────────────────────

const DECORATION_METHODS = ["none","engrave","emboss","deboss","relief","svg","cad"];
const DECORATION_DESC = {
  none:    "plain surface",
  engrave: "cut into the metal surface",
  emboss:  "raised text / artwork above surface",
  deboss:  "pressed text / artwork below surface",
  relief:  "sculptural high-relief carving",
  svg:     "custom vector art mapped onto surface",
  cad:     "upload a .stl / .obj / .step file",
};



function StepHardware({ jewelry, set, setNested }) {
  const t = jewelry.type;
  const dec = jewelry.decoration ?? {};
  const sd = (k, v) => setNested("decoration", k, v);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-foreground/80 mb-1">surface & hardware</h2>
        <p className="text-[11px] text-muted-foreground/50 tracking-wide">decoration method and connection mechanism</p>
      </div>

      {/* ── decoration ── */}
      <Section title="decoration method">
        <div className="grid grid-cols-1 gap-1.5">
          {DECORATION_METHODS.map((m) => (
            <button key={m} onClick={() => sd("method", m)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                dec.method === m
                  ? "bg-foreground/5 border-foreground/30 text-foreground"
                  : "border-border/40 bg-card hover:border-border text-muted-foreground"
              }`}>
              <span className="text-[11px] tracking-wide font-medium w-16 flex-shrink-0">{m}</span>
              <span className="text-[10px] text-muted-foreground/50">{DECORATION_DESC[m]}</span>
              {dec.method === m && <Check className="w-3 h-3 ml-auto flex-shrink-0 text-foreground/40" />}
            </button>
          ))}
        </div>
      </Section>

      {dec.method && dec.method !== "none" && dec.method !== "svg" && dec.method !== "cad" && (
        <>
          <Section title="text / inscription">
            <input type="text" maxLength={60} placeholder="your text here"
              value={dec.text ?? ""}
              onChange={(e) => sd("text", e.target.value)}
              className="w-full rounded-xl border border-border/50 bg-card text-[11px] px-3 py-2.5 placeholder:text-muted-foreground/30 tracking-wide focus:outline-none focus:border-foreground/30" />
          </Section>
          <Section title="font style">
            <Pills options={["serif","sans","mono","script","gothic"]} value={dec.font ?? "serif"} onChange={(v) => sd("font", v)} cols={3} />
          </Section>
          <Section title="depth & placement">
            <Slider label="depth" value={dec.depth ?? 0.3} min={0.1} max={1.5} step={0.05} unit=" mm" onChange={(v) => sd("depth", v)} />
            <div className="pt-1">
              <Label>placement</Label>
              <Pills options={["center","top","bottom","wrap-around"]} value={dec.placement ?? "center"} onChange={(v) => sd("placement", v)} cols={2} />
            </div>
          </Section>
        </>
      )}

      {dec.method === "svg" && (
        <Section title="svg artwork">
          <UploadButton label=".svg file" value={dec.svgUrl} onChange={(v) => sd("svgUrl", v)} accept=".svg,image/svg+xml" />
          {dec.svgUrl && (
            <Slider label="depth" value={dec.depth ?? 0.3} min={0.1} max={1.5} step={0.05} unit=" mm" onChange={(v) => sd("depth", v)} />
          )}
        </Section>
      )}

      {dec.method === "cad" && (
        <Section title="cad / mesh file">
          <UploadButton label=".stl / .obj file" value={dec.cadUrl} onChange={(v) => sd("cadUrl", v)} accept=".stl,.obj,.step" />
          <p className="text-[10px] text-muted-foreground/40 tracking-wide">uploaded geometry will be boolean-unioned onto the surface</p>
        </Section>
      )}

      {/* Also expose pattern map here */}
      <Section title="surface pattern (repeating texture)">
        <Pills options={["none","waves","lattice","dots","chevron","floral","lines"]}
          value={jewelry.pattern} onChange={(v) => set("pattern", v)} cols={3} />
        {jewelry.pattern !== "none" && (
          <div className="space-y-2 pt-1">
            <Slider label="depth" value={jewelry.patternDepth} min={0.1} max={1.5} step={0.05} unit=" mm" onChange={(v) => set("patternDepth", v)} />
            <Slider label="scale" value={jewelry.patternScale} min={0.3} max={3.0} step={0.1} unit="×" onChange={(v) => set("patternScale", v)} />
          </div>
        )}
      </Section>

      {/* note: clasp/mechanism/bail options live in the design step */}
      {t !== "ring" && (
        <Section title="note">
          <p className="text-[10px] text-muted-foreground/40 tracking-wide">clasp, bail, and mechanism options are set in the design step</p>
        </Section>
      )}
    </div>
  );
}

// ─── step 3: stone setting ────────────────────────────────────────────────────

function StepStone({ jewelry, setNested }) {
  const s = (k, v) => setNested("stone", k, v);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-foreground/80 mb-1">stone setting</h2>
        <p className="text-[11px] text-muted-foreground/50 tracking-wide">add a gemstone, or leave unset</p>
      </div>
      <Section title="setting type">
        <Pills options={STONE_SETTINGS} value={jewelry.stone.setting} onChange={(v) => s("setting",v)} cols={3} />
      </Section>
      {jewelry.stone.setting !== "none" && <>
        <Section title="stone shape">
          <Pills options={STONE_SHAPES} value={jewelry.stone.shape} onChange={(v) => s("shape",v)} cols={3} />
        </Section>
        <Section title="gem">
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(STONE_COLORS).map(([k, g]) => (
              <button key={k} onClick={() => s("gem",k)}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-[10px] tracking-wide transition-all ${
                  jewelry.stone.gem === k ? "border-foreground/40 bg-foreground/5" : "border-border/40 hover:border-border"
                }`}>
                <span className="w-4 h-4 rounded-full" style={{ background:`#${g.color.toString(16).padStart(6,"0")}`, opacity:g.opacity }} />
                <span className="text-muted-foreground">{g.label}</span>
              </button>
            ))}
          </div>
        </Section>
        <Section>
          <Slider label="stone size" value={jewelry.stone.sizeMm} min={1.5} max={12} step={0.5} unit=" mm" onChange={(v) => s("sizeMm",v)} />
          <Slider label="count" value={jewelry.stone.count} min={1} max={9} step={1} unit="×" onChange={(v) => s("count",v)} />
        </Section>
      </>}
    </div>
  );
}

// ─── step 4: material & finish ────────────────────────────────────────────────

function StepMaterial({ jewelry, set }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-foreground/80 mb-1">material & finish</h2>
        <p className="text-[11px] text-muted-foreground/50 tracking-wide">the metal and surface treatment</p>
      </div>
      <Section title="metal">
        <div className="space-y-1.5">
          {Object.entries(MATERIALS).map(([k, m]) => (
            <button key={k} onClick={() => set("material",k)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-[11px] tracking-wide transition-all ${
                jewelry.material === k
                  ? "bg-foreground/5 border-foreground/30 text-foreground"
                  : "border-border/40 text-muted-foreground hover:border-border"
              }`}>
              <span className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                style={{ background:`#${m.color.toString(16).padStart(6,"0")}` }} />
              {m.label}
              {jewelry.material === k && <Check className="w-3.5 h-3.5 ml-auto text-foreground/40" />}
            </button>
          ))}
        </div>
      </Section>
      <Section title="surface finish">
        <Pills options={FINISHES} value={jewelry.finish} onChange={(v) => set("finish",v)} cols={3} />
      </Section>
      <Section title="mesh quality">
        <Slider label="smoothness" value={jewelry.segments} min={16} max={128} step={16} unit="" onChange={(v) => set("segments",v)} />
      </Section>
    </div>
  );
}

// ─── step 5: synopsis ─────────────────────────────────────────────────────────

function StepSynopsis({ jewelry, goTo, navigate }) {
  const typeSpecs = () => {
    if (jewelry.type === "ring") return [
      ["inner ∅", `${(jewelry.ring.innerRadius*2).toFixed(1)} mm`],
      ["outer ∅", `${((jewelry.ring.innerRadius+jewelry.ring.thickness)*2).toFixed(1)} mm`],
      ["width", `${jewelry.ring.bandWidth} mm`],
      ["profile", jewelry.ring.profile],
    ];
    if (jewelry.type === "pendant") return [
      ["size", `${jewelry.pendant.width} × ${jewelry.pendant.height} mm`],
      ["depth", `${jewelry.pendant.depth} mm`],
      ["shape", jewelry.pendant.shape],
    ];
    if (jewelry.type === "bracelet") return [
      ["inner ∅", `${jewelry.bracelet.innerDiameter} mm`],
      ["width", `${jewelry.bracelet.width} mm`],
      ["style", jewelry.bracelet.style],
    ];
    if (jewelry.type === "earring") {
      const e = jewelry.earring ?? {};
      const cat = e.category ?? "stud";
      const rows = [
        ["type", cat],
        ["shape", (e.shape ?? "").replace(/-/g, " ")],
        ["quantity", e.quantity ?? "pair"],
        ["placement", e.placement ?? "lobe"],
      ];
      if (cat === "stud") rows.push(["face ∅", `${e.size ?? 10} mm`]);
      if (cat === "hoop") rows.push(["hoop ∅", `${e.hoopDiameter ?? 20} mm`]);
      if (["drop","climber","crawler"].includes(cat)) rows.push(["length", `${e.dropLength ?? e.climbLength ?? 20} mm`]);
      if (cat === "cuff") rows.push(["band width", `${e.cuffWidth ?? 4} mm`]);
      return rows;
    }
    if (jewelry.type === "keychain") return [
      ["shape", jewelry.keychain?.shape ?? "rectangle"],
      ["size", `${jewelry.keychain?.width ?? 35} × ${jewelry.keychain?.height ?? 55} mm`],
    ];
    return [];
  };

  const hardwareSpec = () => {
    const t = jewelry.type;
    if (t === "pendant") return [["bail", (jewelry.pendant?.bail ?? "open-ring").replace(/-/g," ")]];
    if (t === "bracelet") return [["clasp", (jewelry.bracelet?.clasp ?? "lobster").replace(/-/g," ")]];
    if (t === "earring") {
      const cat = jewelry.earring?.category ?? "stud";
      const validMechanisms = EARRING_VALID_MECHANISMS[cat] ?? [];
      if (!validMechanisms.length) return [["back", "none (self-securing)"]];
      return [["back", (jewelry.earring?.mechanism ?? validMechanisms[0]).replace(/-/g," ")]];
    }
    if (t === "chain") return [["clasp", (jewelry.chain?.clasp ?? "lobster").replace(/-/g," ")]];
    if (t === "keychain") return [["ring", (jewelry.keychain?.ringStyle ?? "split-ring").replace(/-/g," ")]];
    return [];
  };

  const dec = jewelry.decoration ?? {};
  const decorationSpec = [
    ["method", dec.method ?? "none"],
    ...(dec.method && dec.method !== "none" && dec.text ? [["text", `"${dec.text}"`]] : []),
    ...(jewelry.pattern !== "none" ? [["pattern", jewelry.pattern]] : []),
  ];

  const SummaryCard = ({ title, items, stepIdx }) => (
    <div className="border border-border/40 rounded-2xl bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <p className="text-[9px] tracking-widest font-mono text-muted-foreground/40 uppercase">{title}</p>
        <button onClick={() => goTo(stepIdx)} className="text-[10px] font-mono text-muted-foreground/40 hover:text-foreground/60 tracking-wide transition-colors">edit</button>
      </div>
      <div className="px-4 py-3 space-y-1.5">
        {items.map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-muted-foreground/60">{k}</span>
            <span className="font-mono text-foreground/70">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-xl text-foreground/80 mb-1">synopsis</h2>
        <p className="text-[11px] text-muted-foreground/50 tracking-wide">review your design before exporting or printing</p>
      </div>
      <SummaryCard title="type" items={[["piece", jewelry.type]]} stepIdx={0} />
      <SummaryCard title="design" items={typeSpecs()} stepIdx={1} />
      {jewelry.multiPiece?.enabled && (
        <SummaryCard title="assembly" items={[
          ["mode", `${jewelry.multiPiece.pieceCount ?? 2}-piece`],
          ["type", jewelry.multiPiece.assemblyType ?? "not set"],
        ]} stepIdx={2} />
      )}
      <SummaryCard title="surface & hardware" items={[...decorationSpec, ...hardwareSpec()]} stepIdx={3} />
      <SummaryCard title="stone" items={[
        ["setting", jewelry.stone.setting],
        ...(jewelry.stone.setting !== "none" ? [
          ["gem", STONE_COLORS[jewelry.stone.gem]?.label ?? jewelry.stone.gem],
          ["size", `${jewelry.stone.sizeMm} mm`],
          ["count", `${jewelry.stone.count}×`],
        ] : []),
      ]} stepIdx={4} />
      <SummaryCard title="material & finish" items={[
        ["metal", MATERIALS[jewelry.material]?.label],
        ["finish", jewelry.finish],
      ]} stepIdx={5} />
      <div className="pt-2 flex flex-col gap-2">
        <button onClick={() => navigate("/print")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-foreground text-background text-[11px] font-mono tracking-wider hover:bg-foreground/90 transition-colors">
          <Printer className="w-3.5 h-3.5" />
          send to print
        </button>
        <button onClick={() => navigate("/code")}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-border/50 text-[11px] font-mono tracking-wider text-muted-foreground hover:text-foreground hover:border-border transition-colors">
          <Code2 className="w-3.5 h-3.5" />
          export openscad
        </button>
      </div>
    </div>
  );
}

// ─── steps config ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: "type",     label: "type" },
  { id: "design",   label: "design" },
  { id: "assembly", label: "assembly" },
  { id: "surface",  label: "surface" },
  { id: "stone",    label: "stone" },
  { id: "material", label: "material" },
  { id: "synopsis", label: "synopsis" },
];

// ─── main ─────────────────────────────────────────────────────────────────────

export default function BuildPage() {
  const { jewelry, set, setNested } = useStudioDesign(useState, useEffect);
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const sceneGroupRef = useRef(null);
  const navigate = useNavigate();

  const LAST_STEP = STEPS.length - 1;
  const goTo = (idx) => { setStep(idx); setMaxVisited((m) => Math.max(m, idx)); };
  const next = () => goTo(Math.min(step + 1, LAST_STEP));
  const prev = () => goTo(Math.max(step - 1, 0));

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <StudioNav
        jewelry={jewelry}
        steps={STEPS}
        currentStep={step}
        onStepChange={goTo}
        maxVisited={maxVisited}
      />
      <div className="flex-1 flex overflow-hidden">

        {/* left panel */}
        <aside className="w-[340px] xl:w-[380px] flex-shrink-0 border-r border-border/50 flex flex-col bg-card/30">

          {/* content */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            {step === 0 && <StepType jewelry={jewelry} set={set} />}
            {step === 1 && <StepDesign jewelry={jewelry} set={set} setNested={setNested} />}
            {step === 2 && <StepAssembly jewelry={jewelry} set={set} setNested={setNested} />}
            {step === 3 && <StepHardware jewelry={jewelry} set={set} setNested={setNested} />}
            {step === 4 && <StepStone jewelry={jewelry} setNested={setNested} />}
            {step === 5 && <StepMaterial jewelry={jewelry} set={set} />}
            {step === 6 && <StepSynopsis jewelry={jewelry} goTo={goTo} navigate={navigate} />}
          </div>

          {/* nav */}
          {step < LAST_STEP && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-border/40 flex-shrink-0">
              <button onClick={prev} disabled={step === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/40 text-[11px] font-mono tracking-wide text-muted-foreground hover:text-foreground hover:border-border transition-all disabled:opacity-20 disabled:cursor-default">
                <ChevronLeft className="w-3 h-3" />
                back
              </button>
              <button onClick={next}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-[11px] font-mono tracking-wide hover:bg-foreground/90 transition-colors">
                {step === LAST_STEP - 1 ? "review" : "continue"}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </aside>

        {/* viewport */}
        <main className="flex-1 relative overflow-hidden">
          <JewelryViewport jewelry={jewelry} onSceneGroupRef={(g) => { sceneGroupRef.current = g; }} />
        </main>
      </div>
    </div>
  );
}