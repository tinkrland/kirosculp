/**
 * data access layer
 *
 * all database reads and writes go through here, not directly through the sdk.
 * this keeps the rest of the codebase free of sdk-specific syntax and makes
 * migration to a different backend (e.g. supabase) a matter of changing this
 * file only, not hunting for calls across dozens of components.
 *
 * method conventions:
 *   - functions return the data directly (not { data, error } objects)
 *   - filter arguments match the sdk's query object shape
 *   - sort is a string like "-created_date" (minus = descending)
 */

import { base44 } from "@/api/base44Client";

// ── artifacts ──────────────────────────────────────────────────────────────────

export const Artifacts = {
  listPublished: (limit = 50) =>
    base44.entities.Artifact.filter({ status: "published" }, "-created_date", limit),

  listPendingReview: (limit = 50) =>
    base44.entities.Artifact.filter({ status: "pending_review" }, "-created_date", limit),

  listAll: (limit = 100) =>
    base44.entities.Artifact.list("-created_date", limit),

  listByCreator: (creatorHandle, limit = 50) =>
    base44.entities.Artifact.filter({ creator_handle: creatorHandle }, "-created_date", limit),

  listPublishedByCreator: (creatorHandle, limit = 20) =>
    base44.entities.Artifact.filter({ creator_handle: creatorHandle, status: "published" }, "-created_date", limit),

  getById: (id) =>
    base44.entities.Artifact.filter({ id }).then((results) => results?.[0] ?? null),

  create: (data) =>
    base44.entities.Artifact.create(data),

  update: (id, data) =>
    base44.entities.Artifact.update(id, data),

  approve: (artifactId, materialKey, manufacturingCost, existingArtifact) => {
    const existingCreatorEarning = existingArtifact.creator_earnings?.[materialKey] ?? 0;
    const updatedManufacturingCosts = {
      ...(existingArtifact.manufacturing_costs ?? {}),
      [materialKey]: manufacturingCost,
    };
    const updatedPrices = {
      ...(existingArtifact.prices ?? {}),
      [materialKey]: manufacturingCost + existingCreatorEarning,
    };
    return base44.entities.Artifact.update(artifactId, {
      status: "published",
      manufacturing_costs: updatedManufacturingCosts,
      prices: updatedPrices,
      admin_reviewed: true,
    });
  },

  reject: (artifactId, reviewNote) =>
    base44.entities.Artifact.update(artifactId, {
      status: "rejected",
      review_notes: reviewNote,
    }),

  togglePublished: (artifactId, currentStatus) =>
    base44.entities.Artifact.update(artifactId, {
      status: currentStatus === "published" ? "archived" : "published",
    }),
};

// ── orders ─────────────────────────────────────────────────────────────────────

export const Orders = {
  listAll: (limit = 100) =>
    base44.entities.Order.list("-created_date", limit),

  listByCreator: (creatorHandle, limit = 100) =>
    base44.entities.Order.filter({ creator_handle: creatorHandle }, "-created_date", limit),

  create: (data) =>
    base44.entities.Order.create(data),

  updateStatus: (orderId, status) =>
    base44.entities.Order.update(orderId, { status }),

  updateTracking: (orderId, trackingNumber) =>
    base44.entities.Order.update(orderId, { tracking_number: trackingNumber }),
};

// ── market accounts ────────────────────────────────────────────────────────────

export const MarketAccounts = {
  getByHandle: (handle) =>
    base44.entities.MarketAccount.filter({ handle }).then((results) => results?.[0] ?? null),

  listActive: (limit = 50) =>
    base44.entities.MarketAccount.filter({ status: "active" }, "-created_date", limit),

  create: (data) =>
    base44.entities.MarketAccount.create(data),

  update: (id, data) =>
    base44.entities.MarketAccount.update(id, data),
};

// ── creator profiles ───────────────────────────────────────────────────────────

export const CreatorProfiles = {
  getByUsername: (username) =>
    base44.entities.CreatorProfile.filter({ username }).then((results) => results?.[0] ?? null),

  create: (data) =>
    base44.entities.CreatorProfile.create(data),

  update: (id, data) =>
    base44.entities.CreatorProfile.update(id, data),
};