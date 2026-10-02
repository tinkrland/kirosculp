// Listing entity type for marketplace
// A published design release offered for sale
// Aligned with contracts/listing.schema.json

export class Listing {
  constructor(data) {
    this.listing_id = data.listing_id;
    this.release_id = data.release_id;
    this.creator_id = data.creator_id;
    this.name = data.name;
    this.description = data.description || null;
    this.status = data.status;
    this.scheduled_publish_at = data.scheduled_publish_at || null;
    this.pricing_intent = data.pricing_intent;
    this.collections = data.collections || [];
    this.style_tags = data.style_tags || [];
    this.is_featured = data.is_featured || false;
    this.made_to_order = data.made_to_order !== undefined ? data.made_to_order : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.published_at = data.published_at || null;
  }

  isActive() {
    return this.status === 'published';
  }

  isDraft() {
    return this.status === 'draft';
  }

  isLockedDrop() {
    return this.status === 'locked_drop';
  }

  requiresScheduledTime() {
    return this.status === 'locked_drop';
  }
}

export const LISTING_STATUS = [
  "draft",
  "published",
  "paused",
  "archived",
  "locked_drop"
];

// pricing models per buildplan/platform/README.md two-way pricing
export const PRICING_MODELS = [
  "creator_net_fixed",
  "retail_fixed"
];

