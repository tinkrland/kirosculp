// Size presets used by the publish flow + buyer detail page.
// `unisize` = no size selector, sold as one-size-fits-all.
// `standard` = generic apparel-style S/M/L/XL.
// `ring` = US ring sizes in half-step increments.
// `custom` = creator types in their own list of sizes.

export const SIZE_TYPES = [
  { value: "unisize", label: "one size only" },
  { value: "standard", label: "S / M / L" },
  { value: "ring", label: "ring sizes (US)" },
  { value: "custom", label: "custom sizes" },
];

export const STANDARD_SIZES = ["XS", "S", "M", "L", "XL"];

export const RING_SIZES = (() => {
  const out = [];
  for (let n = 4; n <= 13; n += 0.5) {
    out.push(n % 1 === 0 ? String(n) : n.toFixed(1));
  }
  return out;
})();

export function defaultSizesFor(type) {
  if (type === "standard") return ["S", "M", "L"];
  if (type === "ring") return ["6", "7", "8"];
  if (type === "custom") return [];
  return [];
}

export function presetSizes(type) {
  if (type === "standard") return STANDARD_SIZES;
  if (type === "ring") return RING_SIZES;
  return [];
}
