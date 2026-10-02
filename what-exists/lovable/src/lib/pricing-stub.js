// Studio-side pricing stub
// Only material and region vocabulary; no price computation.
// Actual retail prices and splits are computed server-side on platform.
// Kept here so PublishArtifact can enumerate offered metals and regions
// when a creator is setting their creator_net intent.

export const MATERIALS = ["silver", "brass", "gold"];
export const REGIONS = [
  { value: "europe", label: "Europe" },
  { value: "north_america", label: "North America" },
  { value: "asia", label: "Asia" },
  { value: "global", label: "Global" },
];

export const DELIVERY_ESTIMATES = {
  europe: "10–14 business days",
  north_america: "12–16 business days",
  asia: "8–12 business days",
  global: "14–20 business days",
};

// getMfgCost and getFinalPrice are not available in the studio.
// Platform computes them from the release's mass_estimate_g and
// the active manufacturer quote at order time.
export function getMfgCost() {
  throw new Error("getMfgCost is not available in the studio. use the platform pricing service.");
}
export function getFinalPrice() {
  throw new Error("getFinalPrice is not available in the studio. use the platform pricing service.");
}
