# configure an offering

inspiration: [jweel's browser-based 3d text ring](https://www.jweel.com/html/textring.html) and [image-relief ring](https://www.jweel.com/html/embossed-ring.html) show how immediate visual feedback can make a personal piece approachable. sculptura should go further than changing a name: creators can start from symbolic, manufacturable bases and decide which bounded changes another person may request. this is inspiration for interaction, not copied designs or a live integration with jweel.

## two different kinds of configuration

1. **creator configuration:** in the studio, a creator selects a [base archetype](archetypes.json) and tunes the silhouette, band, motif relationships and allowed inscription surfaces. tessa may propose control values, but paracraft alone compiles the geometry. the creator approves a revision; the studio server validates it and issues a design release. a new silhouette or new backing creates a new validated release, not a platform mutation.
2. **buyer selection:** on the platform, a buyer selects only published, compatible metal/size/finish/finding variants from a released design. optional text, initials or embossing may be entered only when the creator has enabled an approved bounded personalization template and the studio can independently build and validate the *exact personalized result* before production. the buyer never operates tessa or paracraft directly. until that service, creator approval, and pricing flow exist, custom text is a request to the creator, not an instant purchasable product.

no model-generated mesh, unconstrained "upload anything" embossing, text-only overlay that differs from the production file, or arbitrary material swap. preview is not validation. a submitted option outside the allowlist or with no eligible manufacturing route is rejected, not silently replaced.

## the contract of one configuration

- a base id and version, creator id, parent design release id/version, and allowed parameter envelope owned by the studio
- stable ids for decorative motif, approved inscription surface, relief mode and approved hardware assembly
- values and proofs for size, body alloy, finding alloy, finish, text content and orientation as applicable
- server-produced exact geometry and validation hashes for geometry-changing personalization, linked to a derived immutable release or equivalent versioned order-specific production artifact
- an immutable selection and route/quote snapshot on the platform order; a revised release does not rewrite a paid order

price follows the same two-way model: a creator fixes net earnings or retail price; trusted operations calculates the other using the selected variant, production work and current route. personalizing an engraving or changing a fitted backing may change mass, labor, yield, lead time and price. this folder defines choices; [the design-release contract](../../contracts/design-release.md) and [studio validation gate](../../studio/validation/server-release-gate.md) define the technical handoff.

see [ring archetypes](rings.md), [text and relief controls](personalization.md), [earring backings](../earrings/backings.md), and [research](../research/sources.md). everything in this folder is a proposed configuration specification, not an implemented feature.
