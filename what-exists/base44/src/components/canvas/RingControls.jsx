// Sidebar parameter controls for the ring designer

const PROFILES = ["flat", "comfort", "knife-edge", "barrel"];
const MATERIALS = ["silver", "gold", "brass", "rose-gold", "oxidized"];
const FINISHES = ["polished", "brushed", "hammered", "matte"];
const SETTINGS = ["none", "prong", "bezel", "channel", "flush"];
const SHAPES = ["round", "oval", "square", "marquise"];

const MATERIAL_LABELS = {
  silver: "Sterling Silver",
  gold: "18k Yellow Gold",
  brass: "Brass",
  "rose-gold": "Rose Gold",
  oxidized: "Oxidized Silver",
};

const FINGER_SIZES = [
  { label: "US 4  (14.8 mm)", value: 14.8 },
  { label: "US 5  (15.7 mm)", value: 15.7 },
  { label: "US 6  (16.5 mm)", value: 16.5 },
  { label: "US 7  (17.3 mm)", value: 17.3 },
  { label: "US 8  (18.2 mm)", value: 18.2 },
  { label: "US 9  (19.0 mm)", value: 19.0 },
  { label: "US 10 (19.8 mm)", value: 19.8 },
  { label: "US 11 (20.6 mm)", value: 20.6 },
  { label: "US 12 (21.4 mm)", value: 21.4 },
];

function Section({ title, children }) {
  return (
    <div className="border-b border-border/50 px-5 py-4 space-y-3">
      <p className="text-[10px] tracking-widest font-mono text-muted-foreground/60 uppercase">{title}</p>
      {children}
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, onChange }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground tracking-wide">{label}</span>
        <span className="text-xs font-mono text-foreground/80">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full accent-foreground cursor-pointer"
      />
    </div>
  );
}

function PillGroup({ options, value, onChange, labelFn }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1 rounded-full text-[11px] tracking-wide border transition-all ${
            value === o
              ? "bg-foreground text-background border-foreground"
              : "bg-card text-muted-foreground border-border/60 hover:border-foreground/30"
          }`}
        >
          {labelFn ? labelFn(o) : o}
        </button>
      ))}
    </div>
  );
}

export default function RingControls({ ring, set }) {
  return (
    <div className="divide-y divide-border/40">
      {/* Size preset */}
      <Section title="finger size">
        <select
          value={ring.innerRadius * 2}
          onChange={(e) => set("innerRadius", parseFloat(e.target.value) / 2)}
          className="w-full rounded-lg border border-border/60 bg-background text-xs px-3 py-2 text-foreground tracking-wide focus:outline-none"
        >
          {FINGER_SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <Slider
          label="inner diameter"
          value={(ring.innerRadius * 2).toFixed(1)}
          min={12} max={24} step={0.1} unit=" mm"
          onChange={(v) => set("innerRadius", v / 2)}
        />
      </Section>

      {/* Band geometry */}
      <Section title="band">
        <Slider label="width (height)" value={ring.bandWidth} min={2} max={20} step={0.5} unit=" mm" onChange={(v) => set("bandWidth", v)} />
        <Slider label="wall thickness"  value={ring.thickness} min={0.8} max={4.0} step={0.1} unit=" mm" onChange={(v) => set("thickness", v)} />
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground tracking-wide">profile</span>
          <PillGroup options={PROFILES} value={ring.profile} onChange={(v) => set("profile", v)} />
        </div>
      </Section>

      {/* Material */}
      <Section title="material">
        <div className="grid grid-cols-1 gap-1.5">
          {MATERIALS.map((m) => (
            <button
              key={m}
              onClick={() => set("material", m)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-xs tracking-wide transition-all ${
                ring.material === m
                  ? "bg-foreground/5 border-foreground/30 text-foreground"
                  : "border-border/40 text-muted-foreground hover:border-border"
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                style={{ background: { silver: "#d4d4d4", gold: "#f5c842", brass: "#b5a642", "rose-gold": "#e8a68c", oxidized: "#2a2622" }[m] }}
              />
              {MATERIAL_LABELS[m]}
            </button>
          ))}
        </div>
      </Section>

      {/* Finish */}
      <Section title="surface finish">
        <PillGroup options={FINISHES} value={ring.finish} onChange={(v) => set("finish", v)} />
      </Section>

      {/* Stone */}
      <Section title="stone setting">
        <PillGroup options={SETTINGS} value={ring.stoneSetting} onChange={(v) => set("stoneSetting", v)} />
        {ring.stoneSetting !== "none" && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground tracking-wide">stone shape</span>
              <PillGroup options={SHAPES} value={ring.stoneShape} onChange={(v) => set("stoneShape", v)} />
            </div>
            <Slider label="stone size" value={ring.stoneSize} min={1.5} max={10} step={0.5} unit=" mm" onChange={(v) => set("stoneSize", v)} />
            <Slider label="stone count" value={ring.stoneCount} min={1} max={7} step={1} unit="×" onChange={(v) => set("stoneCount", v)} />
          </div>
        )}
      </Section>

      {/* Engraving */}
      <Section title="engraving (cosmetic)">
        <input
          type="text"
          maxLength={32}
          placeholder="e.g. ever yours"
          value={ring.engraving}
          onChange={(e) => set("engraving", e.target.value)}
          className="w-full rounded-lg border border-border/60 bg-background text-xs px-3 py-2 text-foreground placeholder:text-muted-foreground/40 tracking-wide focus:outline-none focus:border-foreground/30"
        />
        <p className="text-[10px] text-muted-foreground/40 tracking-wide">shown in exported OpenSCAD code</p>
      </Section>

      {/* Quality */}
      <Section title="render quality">
        <Slider
          label="segments (smoothness)"
          value={ring.segments}
          min={16} max={128} step={16} unit=""
          onChange={(v) => set("segments", v)}
        />
        <p className="text-[10px] text-muted-foreground/40 tracking-wide">higher = smoother, lower = faster</p>
      </Section>

      {/* Spec summary */}
      <div className="px-5 py-4 space-y-1.5">
        <p className="text-[10px] tracking-widest font-mono text-muted-foreground/60 uppercase">specs</p>
        {[
          ["inner ∅",   `${(ring.innerRadius * 2).toFixed(1)} mm`],
          ["outer ∅",   `${((ring.innerRadius + ring.thickness) * 2).toFixed(1)} mm`],
          ["width",     `${ring.bandWidth} mm`],
          ["thickness", `${ring.thickness} mm`],
          ["profile",   ring.profile],
          ["material",  MATERIAL_LABELS[ring.material]],
          ["finish",    ring.finish],
          ...(ring.stoneSetting !== "none" ? [["stone", `${ring.stoneCount}× ${ring.stoneSize}mm ${ring.stoneShape} (${ring.stoneSetting})`]] : []),
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-muted-foreground/60 tracking-wide">{k}</span>
            <span className="font-mono text-foreground/70">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}