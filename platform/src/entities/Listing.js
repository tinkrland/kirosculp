// Listing entity type for marketplace
// A published design release offered for sale

export class Listing {
  constructor(data) {
    this.id = data.id;
    this.release_id = data.release_id;
    this.creator_id = data.creator_id;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.status = data.status;
    this.pricing = data.pricing; // creator net or retail price intent per buildplan two-way model
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.featured = data.featured || false;
  }

  isActive() {
    return this.status === 'published';
  }

  getRetailPrice(metal, region) {
    // pricing is server-side computed, this is a reference holder
    return this.pricing?.[metal]?.[region] || null;
  }
}

export const LISTING_STATUS = [
  "draft",
  "published",
  "paused",
  "archived"
];

export const CATEGORIES = [
  "jewelry",
  "wearable",
  "sculpture",
  "functional"
];
