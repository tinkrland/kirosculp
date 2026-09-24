/**
 * Sculpteo material IDs and their constraints for jewelry-suitable materials.
 * Source: https://www.sculpteo.com/en/developer/webapi/query/materials/
 *
 * These map our internal jewelry materials to the closest Sculpteo product names.
 */

export const SCULPTEO_MATERIALS = [
  {
    id: "silver",
    sculpteoId: "silver",
    label: "Sterling Silver",
    description: "925 sterling silver, cast via lost-wax. Best for rings, pendants, fine jewelry.",
    minThicknessMm: 0.6,
    maxSizeMm: { x: 90, y: 90, z: 90 },
    pricePerMm3: 0.0014, // rough estimate USD
    currency: "USD",
    color: "#d4d4d4",
    suitable: ["ring", "pendant", "bracelet", "earring"],
  },
  {
    id: "gold_14k",
    sculpteoId: "gold_14k",
    label: "14k Yellow Gold",
    description: "14 karat yellow gold. Premium cast jewelry.",
    minThicknessMm: 0.6,
    maxSizeMm: { x: 70, y: 70, z: 70 },
    pricePerMm3: 0.012,
    currency: "USD",
    color: "#f5c842",
    suitable: ["ring", "pendant", "earring"],
  },
  {
    id: "gold_18k",
    sculpteoId: "gold_18k",
    label: "18k Yellow Gold",
    description: "18 karat yellow gold.",
    minThicknessMm: 0.6,
    maxSizeMm: { x: 60, y: 60, z: 60 },
    pricePerMm3: 0.018,
    currency: "USD",
    color: "#f5c842",
    suitable: ["ring", "pendant", "earring"],
  },
  {
    id: "brass",
    sculpteoId: "brass",
    label: "Brass",
    description: "Polished brass. Great for costume jewelry and decorative pieces.",
    minThicknessMm: 0.8,
    maxSizeMm: { x: 150, y: 150, z: 80 },
    pricePerMm3: 0.0005,
    currency: "USD",
    color: "#b5a642",
    suitable: ["ring", "pendant", "bracelet", "earring"],
  },
  {
    id: "white_plastic",
    sculpteoId: "white_plastic",
    label: "White Nylon (Prototype)",
    description: "SLS nylon. Use for prototyping before committing to metal.",
    minThicknessMm: 0.7,
    maxSizeMm: { x: 350, y: 350, z: 350 },
    pricePerMm3: 0.00008,
    currency: "USD",
    color: "#f5f0e8",
    suitable: ["ring", "pendant", "bracelet", "earring"],
    isPrototype: true,
  },
];

/**
 * Map our internal material key to the best Sculpteo material for the jewelry type.
 */
export function getSculpteoMaterial(internalMaterial) {
  const map = {
    silver: "silver",
    gold: "gold_18k",
    "rose-gold": "gold_18k", // closest available
    brass: "brass",
    oxidized: "silver",
    copper: "brass",
  };
  return map[internalMaterial] || "silver";
}

/**
 * Return printability warnings for a given jewelry config.
 */
export function getPrintabilityWarnings(jewelry, sculpteoMaterialId) {
  const mat = SCULPTEO_MATERIALS.find((m) => m.id === sculpteoMaterialId);
  if (!mat) return [];

  const warnings = [];
  const minT = mat.minThicknessMm;

  if (jewelry.type === "ring") {
    const t = jewelry.ring.thickness;
    if (t < minT) warnings.push(`Wall thickness ${t}mm is below minimum ${minT}mm for ${mat.label}. Increase to at least ${minT}mm.`);
    if (t < 1.0) warnings.push("Rings thinner than 1.0mm may be too fragile for everyday wear.");
    const w = jewelry.ring.bandWidth;
    if (w > 30) warnings.push("Band width over 30mm may cause comfort issues.");
  }

  if (jewelry.type === "pendant") {
    const t = jewelry.pendant.depth;
    if (t < minT) warnings.push(`Pendant depth ${t}mm is below minimum ${minT}mm for ${mat.label}.`);
    if (jewelry.pendant.bailWidth < 2.5) warnings.push("Bail width under 2.5mm may be too fragile.");
  }

  if (jewelry.type === "bracelet") {
    const t = jewelry.bracelet.thickness;
    if (t < minT) warnings.push(`Wall thickness ${t}mm is below minimum ${minT}mm for ${mat.label}.`);
  }

  if (jewelry.type === "earring") {
    const t = jewelry.earring.thickness ?? jewelry.earring.hoopThickness;
    if (t < minT) warnings.push(`Thickness ${t}mm is below minimum ${minT}mm for ${mat.label}.`);
  }

  if (!mat.suitable.includes(jewelry.type)) {
    warnings.push(`${mat.label} is not recommended for ${jewelry.type}s.`);
  }

  return warnings;
}

/**
 * Rough volume estimate (mm³) for a jewelry piece based on its params.
 * Used for price estimation before uploading STL.
 */
export function estimateVolumeRoughMM3(jewelry) {
  if (jewelry.type === "ring") {
    const { innerRadius, thickness, bandWidth } = jewelry.ring;
    const outerR = innerRadius + thickness;
    return Math.PI * (outerR ** 2 - innerRadius ** 2) * bandWidth;
  }
  if (jewelry.type === "pendant") {
    const { width, height, depth } = jewelry.pendant;
    return width * height * depth * 0.65; // shape factor
  }
  if (jewelry.type === "bracelet") {
    const { innerDiameter, thickness, width } = jewelry.bracelet;
    const r0 = innerDiameter / 2;
    const r1 = r0 + thickness;
    return Math.PI * (r1 ** 2 - r0 ** 2) * width;
  }
  if (jewelry.type === "earring") {
    const { size, thickness } = jewelry.earring;
    return Math.PI * (size / 2) ** 2 * (thickness || 2);
  }
  return 500;
}

/**
 * Estimate print price in USD.
 */
export function estimatePriceUSD(volumeMM3, sculpteoMaterialId) {
  const mat = SCULPTEO_MATERIALS.find((m) => m.id === sculpteoMaterialId);
  if (!mat) return null;
  const base = Math.max(volumeMM3 * mat.pricePerMm3, mat.isPrototype ? 3 : 25);
  return parseFloat(base.toFixed(2));
}