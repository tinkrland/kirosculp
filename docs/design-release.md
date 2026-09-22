---
title: the design release object
summary: the versioned, immutable interface between the studio and the platform.
---

# the design release object

studio and platform must never share internal state directly. the studio doesn't know what a listing, a coupon, or a payout is. the platform doesn't know what an openscad parameter, a wall-thickness tolerance, or an engine version is. the only thing that crosses the boundary is a **design release**: a versioned, immutable snapshot the studio hands off once a design passes validation.

## why versioned and immutable

a creator keeps iterating on a design after it's already selling. the platform needs to keep selling the *exact* geometry a customer already bought, while the creator's studio session moves on to v6. so a design release is never edited in place — a new edit produces a new release. the platform always points its listing at a specific release id, and can choose to move that pointer forward when the creator asks it to (a deliberate "update my listing to the new version" action, not an automatic one).

## shape

```jsonc
{
  "release_id": "uuid",
  "design_id": "uuid",              // stable across versions of the same design
  "version": 6,
  "creator_handle": "string",
  "created_at": "timestamp",

  "engine": {
    "name": "paracraft-jewelry",
    "version": "semver",             // which engine version produced this
    "parameter_hash": "sha256"       // same params → same hash → cache hit, no recompile
  },

  "type": "ring | earring | bracelet | brooch | pendant | other",
  "parameters": { "...": "the full parameter set — opaque to the platform" },

  "openscad_source_url": "string",   // canonical source, creator-editable in studio
  "mesh_url": "string",              // compiled, for viewer + platform product page
  "render_urls": ["string"],         // studio-generated product shots

  "metals_offered": ["silver", "brass", "bronze", "gold_14k", "gold_18k"],
  "sizing": {
    "size_type": "unisize | us_ring_size | s_m_l | custom",
    "sizes_offered": ["string"]
  },

  "castability": {
    "passed": true,
    "checked_at": "timestamp",
    "min_wall_thickness_mm": 1.2,
    "issues": []                     // populated, and passed=false, when it fails
  },

  "mass_estimate_g": {
    "silver": 4.8,
    "gold_14k": 5.1
  },

  "bring_your_own_stone": {
    "supported": false,              // metal-only at launch; empty-bezel support is a later flag here, not a new object
    "bezel_spec": null
  }
}
```

## the one rule that matters

**the platform can only list a release where `castability.passed` is `true`.** that's the entire enforcement point for "only the studio validates printability." the platform doesn't re-derive castability, doesn't second-guess it, and doesn't have a code path that lists a design without checking this field. if that check ever needs to be bypassed (e.g. an admin override for an edge case), it happens in admin, gets logged, and still doesn't touch the studio's validator.

## what the platform does with it

when a creator publishes, the platform:
1. reads the design release (not the studio's internal state)
2. copies `mass_estimate_g` + `metals_offered` into its own pricing calculation (console's job, not studio's)
3. stores a reference to `release_id` on the `artifacts` row — not a copy of the geometry
4. shows `mesh_url` / `render_urls` on the product page

when console computes a price, it combines the design release's `mass_estimate_g` (per metal) with the manufacturer's quoted cost per gram for that alloy and region (admin-owned data) and the creator's earnings preference (fix earnings vs. fix retail — see `payouts.md` and the pricing note in `architecture.md`). the design release itself never contains a price. prices are regional and time-sensitive; a design release is neither.

## what changes when paracraft-jewelry actually exists

today, `sculptura`'s canvas designer computes stl exports and pricing inline in the same app. that's fine for a single-repo prototype. the design release object is the seam where that stops being true: once paracraft-jewelry is a standalone service, "publish" becomes "request a design release," and everything downstream (listing, pricing, checkout) only ever talks to that release, never to the engine directly.
