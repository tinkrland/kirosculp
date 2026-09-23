# offerings

this is the proposed product and configuration taxonomy, not a live catalog. it describes *what* someone may offer and the approved choices around a piece. it does not make geometry, approve a material, create a listing, charge a buyer, or promise that any partner can make it.

| area | purpose | current state |
|---|---|---|
| [rings](rings/README.md) | bands, signets, open/bypass forms and sizes | partial browser controls; no trusted release |
| [earrings](earrings/README.md) | studs, hoops, drops, cuffs and compatible findings | partial browser controls; no verified hardware supply |
| [bracelets](bracelets/README.md) | bangles, cuffs and chain-linked pieces | partial browser controls; no approved clasp routing |
| [pendants](pendants/README.md) | charms, tags, bails and attachment | partial browser controls; no approved assembly route |
| [chains](chains/README.md) | chain profile, length and clasp | source vocabulary only; sourcing/assembly unproved |
| [necklaces](necklaces/README.md) | composition of pendant and chain | composition plan, not a distinct geometry engine |
| [piercings](piercings/README.md) | body-jewelry boundary | research hold; no offer or safety claim |
| [metals](metals/README.md) | alloy, color, finish, finding compatibility | candidates only; partner verification needed |
| [configure](configure/README.md) | bounded customization and symbolic bases | product specification, not a live configurator |
| [nativity](nativity/README.md) | native sales channels beyond our storefront | candidates only; none connected |

## the hard boundary

- the studio owns creator controls, paracraft geometry, server-side manufacturability checks, and immutable [design releases](../contracts/design-release.md).
- this folder defines product-family and option vocabulary, including compatibility questions. the [platform](../platform/README.md) owns listing, eligibility, selectable variants, pricing presentation, checkout, and orders. manufacturing and operations determine capability, quote, route, hallmarking and payment rules.
- an option is not buyer-selectable just because it appears in these files. it needs a release-backed geometry or an authorized studio personalization workflow, an approved finding and assembly path where applicable, and current route and price eligibility.
- stones and gemstone-setting templates inherited from the old prototypes are **not offerings**. sculptura supplies metal only. an empty setting for a buyer's own stone remains undecided.

## existing sources and gaps

`repo-audit/sculptura/src/lib/jewelryDefaults.js` already contains ring, earring, pendant, bracelet and chain vocabularies, including category-based earring back lists. `jewelryTemplates.js` contains initial/name rings and pendants, a signet, hoops and drops. these are browser defaults and templates, not validated catalog entries. `repo-audit/sculptura/base44/entities/Artifact.jsonc` holds coarse materials and prices but not fitting compatibility or immutable design-release references. the offering app under `repo-audit/sculptura.dev` uses supabase, not a `base44/` directory in the provided snapshot; its `SettingsMaterials.jsx` accepts resin and ceramics, contrary to the intended metal-only scope. see the [source tracker](../audit/index.md).

[research and source links](research/sources.md) distinguish observed features from proposed product decisions. all statuses here are drafts until source code, supplier evidence, and production checks agree.
