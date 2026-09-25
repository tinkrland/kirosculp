# how this repository is organized

this file explains the repository itself. the [readme](README.md) explains the product. [`explain.md`](explain.md) is the one-shot product story and [`explain/`](explain/index.md) holds the detailed guides.

## repository map

```text
buildplan/
  paracraft/
  tessa/
  studio/
  platform/
  operations/
  security/

studio/
  creators/
  design-agent/
  project-model/
  geometry/
  validation/
  releases/
  studiogram/
    why/
    how-it-works/
    hand/
    jewelry/
    scene-system/
    capture/
    behind-the-scenes/

offerings/
  nativity/
  rings/
  earrings/
  bracelets/
  pendants/
  chains/
  necklaces/
  piercings/
  metals/
  configure/

paracraft/
  measure/
  validate/
  test/

platform/
  creators/
  buyers/
  discoverability/
  storefronts/
  commissions/
  checkout/

console/
  creators/
  buyers/
  support/
  reporting/

admin/
  review/
  manufacturer-control/
  routing-control/
  platform-policy/
  audit/

what-exists/
  base44/
  lovable/

marketing/
  brand/
  positioning/
  social-media/
  studiogram/
    wearables/

manufacturing/

  processes/
  materials-supported/
  routing/
  manufacturer-layer/
  quotes/
  quality/
  reference/
  research/
  schemas/
  tasks/

operations/
  financial/
    purchase/
    payout/
    pricing/
    settlement/
    refunds/
  insurance/
  shipping/
  legal/
    creator-ip/
  compliance/
  country-rollout/

contracts/
  design-release.md
  design-release.schema.json

research/
  sources/
  evidence/
  contradictions/
  ontology/
  synthesis/
  profiles/
  reports/
  repository-map.md
  research-gaps.md

audit/
  index.md
  studio.md
  platform.md
  operations.md
  security.md
  rebuild-order.md
  source-files.tsv

explain/
  index.md
  creator-experience/
  studio/
  platform/
  manufacturing/
  operations/
  example/

docs/
  current-state-audit.md
  architecture/

venture/
  thesis/
  product/
  architecture/
  moat/
  economics/
  go-to-market/
  risks/

scripts/
  validate-data-contracts.mjs
  validate-offerings.mjs
  normalize-prose.py
  build-source-audit.py
```

## what each area is for

| area | role |
|---|---|
| [`buildplan/`](buildplan/README.md) | what gets built next, leg by leg, and what each leg is waiting on |
| [`studio/`](studio/README.md) | the creative engine: project model, tessa, paracraft, validation, releases |
| [`paracraft/`](paracraft/README.md) | the deterministic engine: the five ready measurements and the profile validator, decoupled from tessa |
| [`offerings/`](offerings/README.md) | the product taxonomy: jewelry families, metals, findings, bounded personalization |
| [`platform/`](platform/README.md) | the offering system: listings, storefronts, checkout, commissions |
| [`console/`](console/README.md) | the creator and buyer view over orders, money, and support |
| [`admin/`](admin/README.md) | operator controls: review, policy, routing, partner management |
| [`manufacturing/`](manufacturing/README.md) | capability truth: materials, partners, quotes, routing, quality |
| [`operations/`](operations/README.md) | money and delivery: purchase, pricing, payout, settlement, shipping, rollout |
| [`marketing/`](marketing/README.md) | outward-facing re-explanations for the content shell: brand, positioning, social, studiogram |
| [`contracts/`](contracts/README.md) | the versioned interfaces between domains, starting with the design release |
| [`research/`](research/README.md) | the evidence corpus: sources, atomic evidence, contradictions, ontology, and the first versioned manufacturing profile for paracraft's rules |
| [`audit/`](audit/index.md) | per-file source status and the evidence-gated rebuild order |
| [`what-exists/`](what-exists/README.md) | the two supplied source repos, brought in whole, so every audit citation links to a real file instead of pointing elsewhere |
| [`explain/`](explain/index.md) | the detailed product explanation split by domain |
| [`docs/`](docs/README.md) | the long-form source assessment and target architecture |
| [`venture/`](venture/README.md) | investor-facing thesis, kept separate from implementation truth |
| [`scripts/`](scripts/README.md) | validation and maintenance tooling run through `npm run validate` |

## reading order

1. [readme](README.md): the problem and the shape of the product
2. [`explain.md`](explain.md) then [`explain/`](explain/index.md): how the system works
3. [`buildplan/`](buildplan/README.md): what is being tackled and in what order
4. [`audit/`](audit/index.md): what actually exists in the supplied source snapshots
5. [`contracts/`](contracts/design-release.md): the studio to platform handoff

## maintenance rules

- run `npm run validate` before every push. it checks the data contracts, the offering inventories, and the lowercase prose rule (no emojis, no em dashes; code, urls, and file names keep their case).
- a status claim needs evidence. use [`audit/`](audit/index.md) for what exists and [`buildplan/`](buildplan/README.md) for what is planned. never let a plan document silently become a claim of live functionality.
- market availability, creator onboarding, shipping clusters, hallmarking, customs, and route activation are operational concerns tracked under [`operations/country-rollout`](operations/country-rollout/README.md) and [`operations/shipping`](operations/shipping/README.md).
- [`venture/`](venture/README.md) keeps investor language separate from implementation truth while grounding both in the same system boundaries.
