// Design release entity type per contracts/design-release.schema.json
// Immutable versioned handoff from Studio to Platform

export class Release {
  constructor(data) {
    this.release_id = data.release_id;
    this.design_id = data.design_id;
    this.version = data.version;
    this.creator_id = data.creator_id;
    this.created_at = data.created_at;
    this.engine = data.engine;
    this.type = data.type;
    this.parameters = data.parameters;
    this.assets = data.assets;
    this.metals_offered = data.metals_offered;
    this.sizing = data.sizing;
    this.castability = data.castability;
    this.mass_estimate_g = data.mass_estimate_g;
    this.bring_your_own_stone = data.bring_your_own_stone;
  }

  isPublishable() {
    return this.castability.passed;
  }

  getMetalMass(metal) {
    return this.mass_estimate_g[metal] || null;
  }

  hasSize(size) {
    return this.sizing.sizes_offered.includes(size);
  }
}

export const RELEASE_TYPES = [
  "ring",
  "earring",
  "bracelet",
  "brooch",
  "pendant",
  "other"
];

export const METALS = [
  "silver_925",
  "brass",
  "bronze",
  "gold_14k_yellow",
  "gold_14k_white",
  "gold_14k_rose",
  "gold_18k_yellow",
  "gold_18k_white",
  "gold_18k_rose"
];

export const SIZE_TYPES = [
  "unisize",
  "us_ring_size",
  "s_m_l",
  "custom"
];
