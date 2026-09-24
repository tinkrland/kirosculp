# sculptura repository map

**produced:** 2026-09-24
**researcher:** research agent
**phase:** 1: repository reconnaissance
**status:** complete

---

## 1. repository overview

the repository is a documentation-first architecture specification for **sculptura**, a digital manufacturing platform for jewelry and small physical artifacts. it contains:

- architecture contracts and flow documents
- manufacturing process documentation and candidate assessments
- a historical React/Three.js studio application (base44 build)
- a historical lovable-built marketplace/platform (lovable build)
- operations, finance, admin, and marketing documentation
- venture thesis and go-to-market strategy
- sql migrations and schema fragments

there is **no current production codebase**. the repository is a foundation: contracts, schemas, audits, and historical implementations that inform a future build.

---

## 2. top-level structure

```
sculptura-main/
├── docs/                    # Architecture, flow, system boundaries, audit
├── contracts/               # Design release contract + JSON schema
├── buildplan/               # Build scoping, paracraft, studio, platform, ops, security, tessa
├── studio/                  # Studio domain: geometry, validation, design-agent, flows, releases, creators, studiogram
├── manufacturing/           # Manufacturing: processes, materials, adapters, routing, quotes, quality, research, schemas, tasks
├── offerings/              # Product offerings: rings, earrings, pendants, bracelets, chains, necklaces, piercings, metals, configure
├── operations/             # Financial, country rollout, payouts, shipping, compliance
├── platform/               # Listings, storefronts, commissions, discovery, feeds
├── admin/                   # Admin: audit, manufacturer control, platform policy, review, routing control
├── console/                 # Console: buyers, creators, reporting, support
├── audit/                   # Studio, platform, operations, security, rebuild order
├── explain/                 # Explainers for studio, manufacturing, platform, operations, creator experience
├── venture/                 # Thesis, architecture, economics, go-to-market, moat, product, risks
├── marketing/               # Brand, positioning, social media, studiogram
├── security/                # Security documentation
├── migrations/              # SQL migrations
├── what-exists/             # Historical implementations
│   ├── base44/              # React/Three.js studio app (old)
│   └── lovable/             # Lovable-built marketplace (old)
└── research/                # ← THIS AGENT'S WORKSPACE
```

---

## 3. current architecture

### 3.1 canonical pipeline

the system is designed around a deterministic compilation pipeline:

```
Canonical Parameter State
  ↓
Deterministic Paracraft Compile
  ↓
Geometry (mesh)
  ↓
Measurement
  ↓
Manufacturing Validation
  ↓
Immutable Design Release
  ↓
Quote / Purchase / Manufacture / Fulfillment
```

### 3.2 key architectural principles

1. **one authoritative representation.** canonical parameter state → deterministic compile → geometry. everything else consumes the result. no independent geometry for studio, viewer, marketplace, or export.

2. **canonical vs derived vs manufacturing.** three distinct layers:
   - **canonical:** creator-authored design intent (ring_inner_diameter, band_width, engraving_text, stone_diameter)
   - **derived:** computed from canonical state (volume, surface_area, minimum_wall, bounding_box, hole_diameter)
   - **manufacturing:** profile-dependent interpretation (minimum_allowed_wall, minimum_allowed_hole, maximum_supported_overhang)

3. **deterministic validation.** `validate(geometry, manufacturing_profile)` returns structured findings: not a boolean "printable" flag. same geometry can produce different validation outcomes under different profiles.

4. **no ai-only manufacturability.** ai discovers and interprets evidence; final validation is deterministic. tessa (the ai assistant) proposes typed parameter changes; the creator approves; the canonical state is compiled deterministically.

5. **manufacturing profiles are scoped.** a profile is `process + material + manufacturer + machine + orientation + finishing`, not just "silver profile."

### 3.3 system boundaries

- **studio:** design, compile, validate, release (client of the system)
- **viewer:** consumes released geometry (client of the system)
- **marketplace:** listings, storefronts, commissions (client of the system)
- **manufacturing:** adapter boundary to external manufacturers
- **tessa:** bounded ai proposal layer on top: proposes parameter changes, does not silently change geometry
- **studiogram:** virtual product photography using the same compiled artifact

### 3.4 design release contract

defined in `contracts/design-release.md` and `contracts/design-release.schema.json`. a manufacturing-ready design becomes an immutable release with:

- design id, version
- canonical parameters
- compiled geometry hash
- manufacturing profile
- validation result
- Evidence/constraint version
- creator approval
- timestamp

historical releases remain interpretable under the version that created them.

---

## 4. existing manufacturing knowledge

### 4.1 process documentation

the repository documents these manufacturing processes:

| process | document | status |
|---|---|---|
| lost-wax investment casting | `manufacturing/processes/lost-wax-investment-casting.md` | documented with design constraints |
| resin pattern casting | `manufacturing/processes/resin-pattern-casting.md` | documented |
| sand casting | `manufacturing/processes/sand-casting.md` | documented |
| defect modes | `manufacturing/processes/defect-modes.md` | catalogued |

### 4.2 manufacturer candidate assessments

eight candidates assessed in `manufacturing/research/candidates/`:

| manufacturer | status | process | materials | api | min wall | max size |
|---|---|---|---|---|---|---|
| cooksongold | drafted | lost-wax from printed wax | gold, silver | no public api | 0.5–0.8 mm | 30×50×70 mm |
| i.materialise | drafted | lost-wax from printed wax | gold, silver | unknown | 0.6–0.8 mm | 88×88×125 mm |
| rio grande | drafted | supplies + customization | unknown | unknown | not specified | not specified |
| sculpteo | drafted | lost-wax from printed wax | bronze, brass, silver | public web api (upload, quote, order, status) | not specified | not specified |
| shapeways | drafted | lost-wax from printed wax | gold, platinum, silver, copper | public api | not specified | specified (source) |
| stuller | drafted | lost-wax from wax patterns | precious metals | rest api (products, orders) | 0.5 mm | not specified |
| xometry | drafted | investment casting (general) | not confirmed for precious metals | online quote | not specified | not specified |

**critical:** none of these are activated. all are "drafted": capability research only.

### 4.3 manufacturing adapter

`manufacturing/manufacturer-layer/manufacturer-adapter.js` defines a conceptual adapter interface:

```javascript
class ManufacturerAdapter {
  constructor(config) { ... }
  async uploadDesign(fileUrl) { ... }
  async requestQuote(designId, materialId, quantity) { ... }
  async placeOrder(designId, quoteId) { ... }
  async getOrderStatus(orderId) { ... }
  async getCapabilities() { ... }
}
```

this is a **placeholder interface**, not a real integration.

### 4.4 manufacturer capabilities schema

`manufacturing/schemas/capability.schema.json` and `manufacturing/reference/manufacturer-capabilities.json` define a structured capability record:

- material specifications (name, alloy, min wall, min feature, min hole, etc.)
- process identification
- machine identification
- finishing options
- constraint records

### 4.5 existing constraint data

the `buildplan/paracraft/rule-digest.md` contains a **rule digest** harvested from manufacturer documentation. this is the most concentrated manufacturing constraint data in the repository:

**constraints already recorded (from rule-digest.md):**

| concept | values found | sources | scope |
|---|---|---|---|
| minimum wall thickness | 0.5 mm (stuller), 0.6–0.8 mm (i.materialise), 0.8 mm (cooksongold), 0.8 mm / 1.0 mm ring bands (materialise gold) | 4 manufacturer sources + 1 academic | lost-wax casting, precious metals |
| minimum feature size | 0.3–0.35 mm (materialise gold) | 1 source | gold lost-wax casting |
| minimum hole size | 0.15 mm pilot holes (stuller) | 1 source | stuller casting |
| maximum part size | 30×50×70 mm (cooksongold), 88×88×125 mm (i.materialise) | 2 sources | lost-wax casting |
| shrinkage | not specified | 0 sources |: |
| tolerance | ±5% with lower limit ±0.15 or ±0.35 mm (i.materialise) | 1 source | i.materialise lost-wax |
| engraving depth | not specified | 0 sources |: |
| overhang angle | not specified | 0 sources |: |

**major gaps:** engraving depth, overhang/support, cavity/powder evacuation, relief/embossing, prong dimensions, clearance/articulation, surface finishing, casting-specific constraints, orientation-dependent constraints.

### 4.6 sculpteo materials (historical)

`what-exists/base44/src/lib/sculpteoMaterials.js` contains hardcoded sculpteo material data:

| material | min wall | max size | Price/mm³ |
|---|---|---|---|
| silver | 0.6 mm | 90×90×90 mm | $0.0014 |
| 14k gold | 0.6 mm | 70×70×70 mm | $0.012 |
| 18k gold | 0.6 mm | 60×60×60 mm | $0.018 |
| brass | 0.8 mm | 150×150×80 mm | $0.0005 |
| white nylon (proto) | 0.7 mm | 350×350×350 mm | $0.00008 |

**warning:** these are historical implementation values, not current-architecture verified constraints. the `getPrintabilityWarnings()` function in this file is a **hardcoded heuristic**, not a deterministic validator.

---

## 5. existing geometry knowledge

### 5.1 historical studio (base44)

the base44 build contains a complete Three.js jewelry studio with:

- **jewelry types:** ring, pendant, bracelet, earring, piercing, chain, keychain
- **ring profiles:** flat, comfort, knife-edge, barrel, signet, wave, twist, tapered, open, bypass
- **pendant shapes:** circle, square, hexagon, teardrop, shield, leaf, star, svg-import
- **bracelet styles:** bangle, cuff, chain-link, tennis
- **earring categories:** stud, hoop, drop, climber, cuff, wrap, threader, crawler
- **piercing styles:** labret, barbell, curved-barbell, circular, captive-ring, surface-anchor, nostril-screw, septum-retainer
- **stone settings:** none, prong, bezel, channel, flush, pave
- **stone shapes:** round, oval, square, marquise, trillion, heart
- **materials:** silver, gold, brass, rose-gold, oxidized
- **finishes:** polished, brushed, hammered, matte
- **patterns:** none, waves, lattice, dots, chevron, floral, lines, custom-svg
- **multi-piece:** 2-piece (hinged-bangle, box-clasp, toggle, locket, split-shank) and 3-piece (articulated-band, pendant-set, bar-earring, triple-band)

### 5.2 geometry generation

the base44 studio generates geometry procedurally using Three.js:

- **rings:** `LatheGeometry` from a 2d cross-section profile (flat, comfort, knife-edge, barrel, signet)
- **pendants:** `ExtrudeGeometry` from 2d shapes (circle, square, hexagon, teardrop, shield, leaf, star) or svg import
- **bracelets:** `LatheGeometry` (bangle, cuff) or `TorusGeometry` chain links
- **earrings:** category-specific: cylinders, torus, extruded shapes, tube geometry
- **stones:** spheres, boxes, scaled spheres, cones, extruded hearts
- **multi-piece:** separate builders for hinges, clasps, jump rings, lockets, articulated bands

### 5.3 svg import

`svgToShape.js` converts svg path data to Three.js shapes for extrusion. handles m, l, c, q, z, h, v commands. normalizes to ±0.5 units.

### 5.4 stl export

`stlExport.js` exports Three.js groups as binary stl. merges geometries, applies world transforms, computes normals. converts Three.js units (1 unit = 10mm) to mm in the stl output.

### 5.5 openscad generation

`CodePanel.jsx` generates openscad code from ring parameters:
- band profiles as 2d polygons (flat, comfort, knife-edge, barrel)
- `rotate_extrude` for ring body
- stone module with settings
- parameter comments with material/finish/engraving metadata
- note: "wall thickness ≥ 1.0mm recommended for casting" (hardcoded comment, not validated constraint)

### 5.6 clay sculpting

the viewport includes a clay sculpting tool that displaces vertices along surface normals within a brush radius. this is a **direct mesh deformation**: it breaks the deterministic parameter-to-geometry pipeline.

### 5.7 printability checking (historical)

`sculpteoMaterials.js` contains `getPrintabilityWarnings()`: a hardcoded heuristic that checks:
- ring wall thickness vs. material minimum
- pendant depth vs. material minimum
- bracelet wall thickness vs. material minimum
- earring thickness vs. material minimum
- material suitability for jewelry type

this is **not** the deterministic validator the architecture requires. it's a rough ui warning system tied to sculpteo-specific material data.

---

## 6. existing schemas and contracts

### 6.1 design release schema

`contracts/design-release.schema.json`: defines the immutable release record structure.

### 6.2 manufacturer capability schema

`manufacturing/schemas/capability.schema.json`: defines manufacturer capability records.

### 6.3 manufacturer capabilities data

`manufacturing/reference/manufacturer-capabilities.json`: structured capability data for assessed manufacturers.

### 6.4 shipping markets schema

`operations/country-rollout/shipping-markets.schema.json`: defines country rollout data.

### 6.5 creator payout policy

`operations/country-rollout/creator-payout-policy.json`: payout policy by country.

### 6.6 archetypes

`offerings/configure/archetypes.json`: jewelry archetype definitions.

### 6.7 earring backings

`offerings/earrings/backings.json`: earring backing mechanism definitions.

---

## 7. historical implementations

### 7.1 base44 build

**what it is:** a React/Three.js single-page application built on the base44 platform. this is the most complete historical implementation of the studio.

**useful evidence:**
- jewelry parameter data structures (`jewelryDefaults.js`)
- template configurations (`jewelryTemplates.js`)
- Three.js geometry generation for all jewelry types
- svg-to-shape conversion logic
- stl export pipeline
- openscad code generation (rings only)
- multi-piece jewelry assembly logic
- studio ui patterns (step-based wizard, viewport, controls)
- sculpteo material mapping and printability warnings
- clay sculpting interaction model

**architecture conflicts:**
- uses `localStorage` for design persistence (not canonical state)
- geometry is generated client-side in Three.js (not deterministic paracraft compile)
- no manufacturing validation (only rough printability warnings)
- no design release or versioning
- no separation of canonical/derived/manufacturing layers
- clay sculpting breaks parameter-to-geometry determinism
- openscad generation is ring-only and hardcoded
- sculpteo integration is a web2web form post, not a real adapter

### 7.2 lovable build

**what it is:** a lovable-built marketplace/platform site. contains marketplace ui, creator profiles, commission system, cart, storefronts, discovery feeds.

**useful evidence:**
- marketplace ux patterns (storefronts, artifact cards, commission requests)
- creator profile structure
- cart and ordering flow patterns
- admin layout patterns

**architecture conflicts:**
- conjoins content and commerce (identified as "first fault" in scoping.md)
- no studio, no geometry, no manufacturing
- separate from the canonical pipeline

---

## 8. research gaps

### 8.1 gap matrix

| concept | geometry concept exists | measurement exists | manufacturing threshold | process scope | material scope | research required | priority |
|---|---|---|---|---|---|---|---|
| **wall thickness** | yes (ring, bracelet, pendant, earring) | partial (bounding box, rough volume) | partial (4 manufacturer sources, 0.5–1.0mm) | partial (lost-wax only) | partial (gold, silver) | yes: expand sources, processes, materials | **1: critical** |
| **feature size** | partial (engraving depth, pattern depth) | no | partial (0.3–0.35mm, 1 source) | partial (gold lost-wax) | partial (gold) | yes: major gap | **2: high** |
| **holes** | partial (earring posts, piercing gauges) | no | partial (0.15mm pilot, 1 source) | partial (stuller casting) | unknown | yes: orientation, through vs blind | **3: high** |
| **cavities** | partial (locket, hollow pieces mentioned) | no | no | no | no | yes: powder/resin evacuation | **4: medium** |
| **Overhang/support** | no | no | no | no | no | yes: orientation-dependent | **5: medium** |
| **engraving** | partial (text, depth slider 0.1–1.5mm) | no | no | no | no | yes: min depth, line width, spacing | **6: medium** |
| **Relief/embossing** | partial (pattern depth slider) | no | no | no | no | yes: min height, width, edge definition | **7: medium** |
| **disconnected components** | partial (multi-piece assembly) | no | no | no | no | yes: clearance, articulation | **8: lower** |
| **Articulation/clearance** | partial (multi-piece types defined) | no | no | no | no | yes: gap dimensions | **9: lower** |
| **surface finishing** | partial (finish options: polished, brushed, hammered, matte) | no | no | no | no | yes: as-printed roughness, polishing access | **10: lower** |
| **casting-specific** | no | no | partial (shrinkage mentioned in process docs) | partial (lost-wax documented) | no | yes: sprue, gate, tree, shrinkage | **11: lower** |
| **Process/material exceptions** | no | no | no | no | no | yes: per-process specific rules | **12: ongoing** |

### 8.2 major unknowns

1. **no validated constraint set.** the existing constraints are from manufacturer documentation only: no academic/technical cross-referencing, no empirical validation, no orientation/finishing scope.

2. **no measurement definitions.** the architecture calls for deterministic measurement of geometry properties (minimum wall, hole diameter, overhang angle, cavity connectivity), but no measurement algorithms are defined or implemented.

3. **no manufacturing profiles.** no profile has been built. the schema exists conceptually but no profile json has been constructed.

4. **no geometry-to-manufacturing mapping.** the bridge between geometric observables and manufacturing constraints is entirely conceptual. no specific measurement method is defined for any constraint.

5. **no deterministic validator.** the architecture specifies `validate(geometry, profile)` returning structured findings, but no validator exists.

6. **no paracraft.** the deterministic compilation layer is architectural intent, not implementation. the base44 build generates geometry client-side in Three.js.

7. **no canonical state model.** the separation of canonical/derived/manufacturing parameters is documented but not implemented.

8. **limited process scope.** only lost-wax investment casting is documented with any depth. direct metal additive manufacturing, resin printing for patterns, cnc, and laser engraving are mentioned but not researched.

9. **no orientation research.** build orientation affects overhang, support, surface quality, and potentially wall thickness minimums: but no orientation-dependent constraints have been researched.

10. **no finishing research.** polishing, tumbling, and hand finishing affect final dimensions and feature survival: but no finishing constraints have been researched.

---

## 9. proposed first research slice

### 9.1 selection

based on available evidence and architectural priority:

| dimension | selection | rationale |
|---|---|---|
| **archetype** | ring (flat band profile) | most constrained, best documented, simplest geometry, primary jewelry type |
| **process** | lost-wax investment casting from printed castable resin/wax | best documented in existing research, primary process for precious metal jewelry |
| **material** | sterling silver (925) | most common jewelry metal, documented by multiple manufacturers, affordable |
| **manufacturer** | cooksongold + i.materialise (triangulated) | both have detailed public design guidelines for silver lost-wax casting |

### 9.2 slice goals

for this first slice, establish end-to-end:

1. **canonical geometry concepts** for a flat band ring (inner radius, band width, wall thickness, profile)
2. **manufacturing constraints** from 2+ independent sources (min wall, min feature, max size, tolerance, shrinkage)
3. **measurement definitions** (how to measure minimum wall thickness from geometry, bounding box, volume)
4. **source lineage** (exact urls, pages, excerpts, access dates for every constraint)
5. **validation representation** (what a structured finding looks like for this slice)

### 9.3 research questions for first slice

1. what is the minimum wall thickness for sterling silver lost-wax casting from printed patterns?
   - does it vary by manufacturer?
   - does it vary by orientation?
   - is it a requirement or recommendation?
   - does "wall" mean solid wall, unsupported wall, or both?

2. what is the minimum feature size for sterling silver lost-wax casting?
   - engraving depth?
   - raised detail width?
   - does polishing affect minimum feature survival?

3. what is the maximum part size for sterling silver lost-wax casting?
   - does it vary by manufacturer?
   - does it vary by machine?

4. what dimensional tolerance can be expected?
   - as-cast?
   - after polishing?
   - does it vary by feature type?

5. what shrinkage should be expected?
   - is it material-specific or process-specific?
   - is it accounted for in the pattern or the final geometry?

6. how can minimum wall thickness be measured from a triangular mesh?
   - what algorithm?
   - what coordinate system?
   - what tolerance?

---

## 10. source landscape (existing)

### 10.1 sources already in repository

| source | type | topics | url |
|---|---|---|---|
| cooksongold design guidelines | manufacturer docs | wall thickness, max size, file requirements | cooksongold.com/precious-metal-casting/design-guidelines |
| cooksongold casting service | manufacturer docs | process description, turnaround | cooksongold.com/precious-metal-casting |
| cooksongold about | manufacturer info | company background | cooksongold-am.com/about-us |
| cooksongold customisation | manufacturer docs | services, materials | cooksongold.com/customisation |
| materialise gold design guide | manufacturer docs | wall thickness, feature size, max size | materialise.com/en/academy/industrial/design-am/gold |
| materialise lost-wax casting | manufacturer docs | process, max size, min wall, tolerance | materialise.com/en/industrial/3d-printing-technologies/lost-wax-casting |
| pahwa metaltech investment casting | technical secondary | process description, wall thickness | pahwametaltech.co.in/post/investment-casting-lost-wax-casting-complete-guide |
| sculpteo metal 3d printing | manufacturer docs | process, materials | sculpteo.com/en/services/metal-3d-printing-service |
| sculpteo api services | manufacturer docs | api capabilities | sculpteo.com/en/services/api-services |
| sculpteo api ordering | manufacturer docs | api order endpoint | sculpteo.com/en/developer/webapi/order/order |
| sculpteo api docs | manufacturer docs | api documentation | sculpteo.com/en/developer/webapi |
| shapeways lost wax casting | manufacturer docs | process, materials, bounding box | shapeways.com/3d-print-material-technology/lost-wax-casting |
| shapeways wax casting materials | manufacturer docs | materials, molds | shapeways.com/3d-print-material-technology/wax-casting |
| shapeways blog | manufacturer blog | process explanation | shapeways.com/blog/3d-print-lost-wax-casting-materials-molds |
| shapeways api (3druck) | secondary news | api existence | 3druck.com/en/suppliers-distributors/shapeways-provides-api-for-developers-589336 |
| stuller production standards | manufacturer pdf | min wall, min feature, file types | stuller.scene7.com/.../production-standards.pdf |
| stuller casting video | manufacturer media | process description | stuller.com/video/watch/53943 |
| stuller api docs | manufacturer docs | rest api endpoints | stuller.com/services/e-commerce-business/api-documentation |
| stuller api help | manufacturer docs | api help | api.stuller.com/help |
| xometry investment casting | manufacturer docs | process overview | xometry.com/resources/casting/investment-casting |
| xometry quote | manufacturer docs | quote flow | xometry.com/how-xometry-works/request-a-quote |
| xometry get started | manufacturer docs | general flow | xometry.com/get-started |

### 10.2 source quality assessment

- **tier 1 (primary):** cooksongold, materialise, sculpteo, stuller, shapeways manufacturer documentation
- **tier 2 (technical secondary):** pahwa metaltech, 3druck
- **tier 3 (community):** none currently

**missing source types:** academic papers, technical standards, independent testing, material science references, computational geometry literature.

---

## 11. key architectural decisions to preserve

1. **paracraft is the deterministic geometry layer.** not Three.js client-side generation. the base44 build's approach is historical, not current.

2. **manufacturing profiles are scoped, not universal.** a constraint applies to a specific process+material+manufacturer+machine+orientation+finishing combination.

3. **validation returns structured findings, not a boolean.** each finding includes constraint id, severity, measurement, threshold, scope, and evidence.

4. **evidence must be traceable.** every constraint traces back through evidence → source → exact URL/section/page.

5. **no unexplained magic numbers.** every threshold needs a documented origin.

6. **historical code is evidence, not authority.** base44 and lovable builds inform patterns but do not define the current architecture.

7. **tessa proposes; the creator approves.** ai does not silently change geometry.

8. **released designs are immutable.** historical releases remain interpretable under their creation version.

---

## 12. implementation readiness assessment

| component | status | notes |
|---|---|---|
| architecture documents | **ready** | comprehensive, well-structured |
| design release contract | **ready** | schema defined |
| manufacturing process docs | **partial** | lost-wax documented, others stubs |
| manufacturer candidate assessments | **partial** | 8 drafted, none activated |
| manufacturing adapter interface | **conceptual** | placeholder, not implemented |
| capability schema | **ready** | schema defined, data partially populated |
| studio ui patterns | **historical** | base44 provides reference ux |
| geometry generation | **historical** | Three.js in base44, needs paracraft replacement |
| openscad generation | **historical** | ring-only, needs generalization |
| stl export | **historical** | works but needs integration with paracraft |
| svg import | **historical** | useful pattern, needs paracraft integration |
| manufacturing validation | **not started** | architecture defined, no implementation |
| measurement algorithms | **not started** | no measurement code exists |
| manufacturing profiles | **not started** | conceptual only |
| constraint taxonomy | **not started** | rule digest is raw data, not structured |
| evidence corpus | **not started** | sources identified, not structured |
| terminology ontology | **not started** | no ontology exists |
| geometry-to-manufacturing mapping | **not started** | conceptual examples only |
| paracraft | **not started** | architecture defined, no implementation |
| canonical state model | **not started** | architecture defined, no implementation |

---

## 13. next steps

### phase 2: research gap matrix
formalize the gap matrix in `research/research-gaps.md` with precise priority ordering.

### phase 3: source discovery
identify additional sources beyond existing manufacturer docs: academic papers, technical standards, computational geometry literature.

### phase 4: source acquisition
acquire and preserve selected sources with full provenance.

### phase 5: evidence extraction
extract atomic claims with scope, modality, and provenance.

### phase 6: normalization
normalize units, terminology, process names, material names.

### phase 7: contradiction analysis
cluster claims and identify conflicts.

### phase 8: ontology construction
build manufacturing ontology from evidence.

### phase 9: geometry mapping
map manufacturing concepts to geometric observables and measurement methods.

### phase 10: constraint synthesis
propose formal, scoped constraints with evidence lineage.

### first vertical slice
ring + lost-wax investment casting + sterling silver + Cooksongold/i.materialise → complete evidence chain.
