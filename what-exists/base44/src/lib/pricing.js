// Manufacturing cost table by material + region (mock values)
export const MANUFACTURING_COSTS = {
  silver: { europe: 42, north_america: 48, asia: 35, global: 45 },
  brass:  { europe: 25, north_america: 28, asia: 20, global: 26 },
  gold:   { europe: 120, north_america: 135, asia: 105, global: 125 },
};

export const MATERIALS = ["silver", "brass", "gold"];
export const REGIONS = [
  { value: "europe", label: "Europe" },
  { value: "north_america", label: "North America" },
  { value: "asia", label: "Asia" },
  { value: "global", label: "Global" },
];

export function getMfgCost(material, region) {
  return MANUFACTURING_COSTS[material]?.[region] ?? 0;
}

export function getFinalPrice(material, region, creatorEarnings) {
  return getMfgCost(material, region) + (creatorEarnings || 0);
}

export const DELIVERY_ESTIMATES = {
  europe: "10–14 business days",
  north_america: "12–16 business days",
  asia: "8–12 business days",
  global: "14–20 business days",
};