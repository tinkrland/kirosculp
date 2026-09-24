import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";

// ── OpenSCAD code generator ───────────────────────────────────────────────

function profileModule(profile, innerRadius, thickness, bandWidth) {
  const r0 = innerRadius.toFixed(2);
  const r1 = (innerRadius + thickness).toFixed(2);
  const h  = bandWidth.toFixed(2);
  const t  = thickness.toFixed(2);

  if (profile === "flat") {
    return `
// Flat band cross-section (extruded as lathe profile)
module band_profile() {
  polygon(points=[
    [${r0}, ${(-bandWidth / 2).toFixed(2)}],
    [${r1}, ${(-bandWidth / 2).toFixed(2)}],
    [${r1}, ${ (bandWidth / 2).toFixed(2)}],
    [${r0}, ${ (bandWidth / 2).toFixed(2)}]
  ]);
}`;
  }

  if (profile === "comfort") {
    return `
// Comfort-fit band — inner surface is slightly rounded
module band_profile() {
  hull() {
    translate([${r0}, 0]) circle(r=${(thickness * 0.18).toFixed(2)}, $fn=16);
    translate([${r1}, ${(-bandWidth / 2 + thickness * 0.1).toFixed(2)}]) circle(r=0.01);
    translate([${r1}, ${ (bandWidth / 2 - thickness * 0.1).toFixed(2)}]) circle(r=0.01);
    translate([${r0}, ${(-bandWidth / 2).toFixed(2)}]) circle(r=0.01);
    translate([${r0}, ${ (bandWidth / 2).toFixed(2)}]) circle(r=0.01);
  }
}`;
  }

  if (profile === "knife-edge") {
    return `
// Knife-edge band — outer edge tapers to a ridge
module band_profile() {
  polygon(points=[
    [${r0},  ${(-bandWidth / 2).toFixed(2)}],
    [${(innerRadius + thickness * 0.4).toFixed(2)}, ${(-bandWidth / 2).toFixed(2)}],
    [${r1},  0],
    [${(innerRadius + thickness * 0.4).toFixed(2)}, ${ (bandWidth / 2).toFixed(2)}],
    [${r0},  ${ (bandWidth / 2).toFixed(2)}]
  ]);
}`;
  }

  if (profile === "barrel") {
    return `
// Barrel / D-shaped band — outer surface is convex
module band_profile() {
  hull() {
    translate([${(innerRadius + thickness * 0.55).toFixed(2)},  0]) circle(r=${(thickness * 0.45).toFixed(2)}, $fn=16);
    translate([${r0}, ${(-bandWidth / 2).toFixed(2)}]) circle(r=0.01);
    translate([${r0}, ${ (bandWidth / 2).toFixed(2)}]) circle(r=0.01);
  }
}`;
  }
  return "";
}

function stoneModule(stoneSetting, stoneShape, stoneSize, stoneCount, innerRadius, thickness, bandWidth) {
  if (stoneSetting === "none") return "";
  const r1 = (innerRadius + thickness).toFixed(2);
  const ss = stoneSize.toFixed(2);
  const r  = (stoneSize / 2).toFixed(2);
  const bw = (bandWidth / 2).toFixed(2);

  const shapeGeo = stoneShape === "round"
    ? `sphere(r=${r}, $fn=24);`
    : stoneShape === "square"
      ? `cube([${ss}, ${ss}, ${(stoneSize * 0.5).toFixed(2)}], center=true);`
      : stoneShape === "oval"
        ? `scale([1, 0.7, 1]) sphere(r=${r}, $fn=20);`
        : `scale([0.5, 1.6, 0.5]) sphere(r=${r}, $fn=20);`; // marquise

  return `
// Stone / setting
module stone_setting() {
  for (i = [0 : ${stoneCount - 1}]) {
    angle = i * (360 / ${stoneCount});
    rotate([0, 0, angle])
    translate([${r1}, 0, ${bw}]) {
      // ${stoneSetting} setting — ${stoneShape} stone ${stoneSize}mm
      color("lightblue", 0.8) ${shapeGeo}
    }
  }
}`;
}

function generateOpenSCAD(ring) {
  const {
    innerRadius, bandWidth, thickness, profile,
    segments, stoneSetting, stoneShape, stoneSize, stoneCount,
    material, finish, engraving,
  } = ring;

  return `// ══════════════════════════════════════════════════════
//  Sculptura Ring Design — generated ${new Date().toISOString().split("T")[0]}
//  Material : ${material}  |  Finish: ${finish}
//  Engraving: "${engraving || "(none)"}"
// ══════════════════════════════════════════════════════

// ── Parameters ────────────────────────────────────────
inner_radius  = ${innerRadius.toFixed(2)};  // mm
band_width    = ${bandWidth.toFixed(2)};   // mm (ring height)
wall_thickness= ${thickness.toFixed(2)};  // mm
fn_val        = ${segments};              // lathe segments

// ── Band profile ──────────────────────────────────────
${profileModule(profile, innerRadius, thickness, bandWidth)}

// ── Ring body ─────────────────────────────────────────
module ring_body() {
  rotate_extrude(angle=360, $fn=fn_val)
    band_profile();
}

${stoneModule(stoneSetting, stoneShape, stoneSize, stoneCount, innerRadius, thickness, bandWidth)}

// ── Assemble ─────────────────────────────────────────
union() {
  ring_body();
${stoneSetting !== "none" ? "  stone_setting();" : "  // no stone setting"}
}

// ── Notes ─────────────────────────────────────────────
// Render with: OpenSCAD → Render (F6) → Export as STL
// Recommended print/cast tolerance: +0.1mm on inner_radius
// Wall thickness ≥ 1.0mm recommended for casting
`;
}

export default function CodePanel({ ring: jewelry }) {
  const [copied, setCopied] = useState(false);
  // Flatten for backward compat with OpenSCAD generator
  const ring = jewelry?.ring
    ? { ...jewelry, ...jewelry.ring, stoneSetting: jewelry.stone?.setting, stoneShape: jewelry.stone?.shape, stoneSize: jewelry.stone?.sizeMm, stoneCount: jewelry.stone?.count, material: jewelry.material, finish: jewelry.finish, engraving: jewelry.engraving, segments: jewelry.segments }
    : jewelry;
  const code = generateOpenSCAD(ring);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sculptura_${ring.type ?? "ring"}_${ring.material}_${ring.profile ?? "flat"}.scad`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1a1815] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400/70" />
          <span className="w-2 h-2 rounded-full bg-yellow-400/70" />
          <span className="w-2 h-2 rounded-full bg-green-400/70" />
          <span className="ml-3 text-[10px] font-mono text-white/30 tracking-widest uppercase">
            sculptura_ring.scad
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[11px] font-mono text-white/50 hover:text-white/80 border border-white/10 transition-all"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "copied" : "copy"}
          </button>
          <button
            onClick={download}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[11px] font-mono text-white/50 hover:text-white/80 border border-white/10 transition-all"
          >
            <Download className="w-3 h-3" />
            .scad
          </button>
        </div>
      </div>

      {/* Code */}
      <pre className="flex-1 overflow-auto p-5 text-[12px] leading-relaxed font-mono text-green-300/80 whitespace-pre">
        {code.split("\n").map((line, i) => (
          <div key={i} className="flex gap-4">
            <span className="select-none text-white/15 w-6 text-right flex-shrink-0">{i + 1}</span>
            <span
              className={
                line.startsWith("//") ? "text-white/30"
                : line.match(/^(module|union|for|translate|rotate|sphere|cube|polygon|hull|scale|color)/) ? "text-blue-300/80"
                : line.match(/=\s*[\d.-]/) ? "text-yellow-300/70"
                : "text-green-300/70"
              }
            >
              {line || " "}
            </span>
          </div>
        ))}
      </pre>

      {/* Footer hint */}
      <div className="border-t border-white/10 px-5 py-2.5 flex items-center gap-6">
        <span className="text-[10px] font-mono text-white/25 tracking-wider">
          open in openscad → render (F6) → export STL → upload to sculptura
        </span>
      </div>
    </div>
  );
}