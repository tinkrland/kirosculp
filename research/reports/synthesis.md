# sculptura research report

**produced:** 2026-09-24
**researcher:** research agent
**phase:** initial research cycle (phases 1-10 + adversarial review)
**status:** first vertical slice complete, second process initiated

---

## executive summary

this report presents the initial research corpus for sculptura's manufacturing validation system. the work covers two manufacturing processes (lost-wax investment casting and direct metal laser sintering), 18 sources across 3 evidence tiers, 58 atomic evidence records, 9 contradictions, and 16 geometry-to-manufacturing mappings.

the key finding is that **the same geometry produces different validation outcomes under different manufacturing profiles**. a 0.6 mm wall passes for lost-wax casting (materialise, gloss finish) but fails for dmls (forge labs, 1.0 mm minimum). a 0.4 mm hole passes for lost-wax (stuller) but fails for dmls (hubs, 1.5 mm). this validates the architecture's scoped-profile approach.

the most well-corroborated constraint is **minimum wall thickness at 0.8 mm for sterling silver lost-wax casting**, confirmed by 5 independent sources (materialise, ecadcam, jfd jewelry, cooksongold, stuller). the most well-corroborated engraving spec is **0.3 mm minimum / 0.6 mm maximum / 0.3 mm spacing**, confirmed identically by cooksongold and stuller.

three adversarial review passes (auditor, engineer, manufacturer) identified key weaknesses: single-source constraints need corroboration, manufacturer-specific facts are sometimes presented as generic, and feature segmentation remains an unsolved algorithmic challenge.

---

## repository findings

### current architecture

the repository is documentation-first: comprehensive architecture contracts, manufacturing process documentation, and historical implementations, but no production code. the canonical pipeline is:

```
Canonical Parameter State → Deterministic Paracraft Compile → Geometry → Measurement → Manufacturing Validation → Immutable Design Release
```

### existing manufacturing knowledge

- 8 manufacturer candidates drafted (none activated)
- manufacturing adapter interface is a placeholder
- capability schema defined, partially populated
- rule digest contains raw constraint data from 4+ sources
- historical `getPrintabilityWarnings()` in base44 is a hardcoded heuristic, not a deterministic validator

### historical implementations

- **base44:** React/Three.js studio with procedural geometry generation for 7 jewelry types. uses `LatheGeometry` for rings, `ExtrudeGeometry` for pendants. contains svg import, stl export, openscad generation (rings only). clay sculpting breaks parameter-to-geometry determinism.
- **lovable:** Marketplace/platform ui. no studio, no geometry, no manufacturing.

both are archaeological evidence, not current authority.

---

## research gaps

23-row gap matrix produced. priority findings:

| priority | concept | sources | status |
|---|---|---|---|
| 1 | wall thickness (solid) | 5 | **in progress**: strong consensus |
| 2 | wall thickness (ring band) | 2 | in progress: wear-driven |
| 3 | feature size | 3 | in progress: finishing survival |
| 4 | engraving | 4 | **in progress**: well-corroborated |
| 5 | clearance | 2 | in progress: needs more sources |
| 6 | hollow evacuation | 2 | in progress: manufacturer-specific |
| 7 | shrinkage | 3 | in progress: non-uniform |
| 8 | finishing erosion | 3 | in progress: varies by process |
| 9 | max dimensions | 2 | in progress: manufacturer-specific |
| 10 | nested parts | 2 | in progress: hard limitation |
| 11 | polishing accessibility | 1 | not started: heuristic |
| 12 | prong parameters | 2 | not started |
| 19 | overhang (dmls) | 1 | in progress: new |
| 20 | surface finish | 2 | in progress: dmls only |

---

## source landscape

### sources by tier

| tier | count | sources |
|---|---|---|
| tier 1 (primary) | 8 | materialise (silver), materialise (gold), hoover & strong, cooksongold, stuller, formlabs, forge labs, inui et al. (academic) |
| tier 2 (technical) | 5 | bessercast, meshinspector, hubs, tashvi, inside metal am, jeweller's toolkit |
| tier 3 (practitioner) | 4 | ecadcam, jfd jewelry, jewelcad design, saqlain bullion |

### source quality assessment

- **strongest sources:** materialise (detailed, scoped by finish type), cooksongold + stuller (identical engraving specs), formlabs (pattern printing specifics)
- **weakest sources:** saqlain bullion (cites formlabs, not independent), tashvi (aggregator, not primary)
- **missing source types:** academic papers on jewelry-specific manufacturing, iso standards for jewelry casting, empirical testing results

---

## evidence collected

### by concept

| concept | records | sources | confidence |
|---|---|---|---|
| minimum wall thickness | 7 | 5 | high |
| engraving parameters | 4 | 4 | high |
| minimum feature size | 4 | 3 | medium |
| minimum hole diameter | 2 | 2 | medium |
| casting shrinkage | 3 | 3 | medium |
| finishing erosion | 3 | 2 | high |
| dmls overhang | 1 | 1 | high |
| dmls surface finish | 2 | 2 | medium |
| dmls jewelry materials | 1 | 1 | medium |
| powder evacuation | 1 | 1 | medium |
| plus 14 more concepts | 30 | various | various |

### by process

| process | records | sources |
|---|---|---|
| lost-wax casting | 42 | 14 |
| DMLS/SLM | 14 | 3 |
| binder jetting | 2 | 1 |

---

## terminology

14 normalized terms defined in `ontology/terms.json`. key distinctions:

- **"clearance"** means different things: casting clearance (0.3 mm, prevent fusion) vs assembly clearance (0.5 mm, allow movement)
- **"wall thickness"** vs **"metal thickness"** vs **"minimum wall"**: same concept, different manufacturers
- **"holes"** vs **"openings"**: same concept, different manufacturers (0.4-0.5 mm)
- **"engraving"** subsumes raised text, recessed text, debossed, embossed: related but distinct sub-parameters

---

## contradictions

9 contradictions recorded:

| id | concept | resolution |
|---|---|---|
| 001 | wall thickness silver (0.6 vs 0.8 mm) | partially resolved: finish-dependent |
| 002 | shrinkage silver (1.5-2% vs 1.8-2.1%) | unresolved: manufacturer-specific |
| 003 | engraving depth | resolved: defines a range, not a conflict |
| 004 | hollow support (yes vs no) | resolved: manufacturer-specific |
| 005 | min hole diameter (0.4 vs 0.5 mm) | unresolved |
| 006 | finishing erosion (0.05-0.15 vs 0.2 mm) | partially resolved: cumulative vs per-process |
| 007 | dmls wall thickness (0.4 vs 1.0 mm) | unresolved: theoretical vs production |
| 008 | dmls hole diameter (0.5 vs 1.5 mm) | unresolved: orientation-dependent |
| 009 | dmls surface roughness | resolved: different finishing states |

---

## geometry ↔ manufacturing mappings

16 concept mappings produced. summary:

| concept | measurable | method | type | constraint | processes |
|---|---|---|---|---|---|
| wall thickness | yes | sphere mis | direct | ≥ 0.8 mm (lw) / ≥ 1.0 mm (dmls) | both |
| feature size | partial | local thickness + segmentation | direct (partial) | ≥ 0.35 mm (lw) / ≥ 0.6 mm (dmls) | both |
| engraving | partial | recess depth analysis | direct (partial) | 0.2-0.5 mm range | both |
| clearance | yes | pairwise distance | direct | ≥ 0.3 mm (lw) / ≥ 0.5 mm (dmls) | both |
| hollow evacuation | yes | cavity + hole detection | direct | 2+ holes, ≥ 1.5 mm | lw |
| overhang | yes (needs orientation) | surface normal analysis | direct | ≥ 50° | dmls |
| unsupported edge | yes (needs orientation) | edge analysis | direct | ≤ 0.5 mm | dmls |
| aspect ratio | partial | feature bounding box | direct (partial) | ≤ 8:1 | dmls |
| hole diameter | yes | cross-section analysis | direct | ≥ 0.5 mm (lw) / ≥ 1.5 mm (dmls) | both |
| nested parts | yes | component containment | direct | not supported | lw |
| max dimensions | yes | bounding box | direct | manufacturer-specific | both |
| mesh manifoldness | yes | Edge/normal check | direct | required | both |
| edge sharpness | partial | dihedral angle | direct (partial) | ≥ 0.30 mm fillet | lw |
| shrinkage | no | N/A (profile param) | N/A | 1.5-2.1% (lw ag) | lw |
| finishing erosion | no | N/A (profile param) | N/A | 0.05-0.2 mm | lw |
| polishing accessibility | partial | accessibility analysis | heuristic | warning only | lw |

---

## proposed measurements

### implementable now (5)

1. **minimum wall thickness**: sphere mis method (inui et al. 2016). converges in ~5 iterations. handles 2m polygons in minutes with gpu.
2. **minimum clearance**: pairwise distance between disconnected components.
3. **bounding box**: vertex extents.
4. **nested components**: connected component analysis + containment check.
5. **mesh manifoldness**: edge manifoldness + normal consistency check.

### implementable with research (4)

6. **minimum hole diameter**: cross-section analysis, but needs hole detection algorithm
7. **hollow evacuation**: cavity detection + hole measurement, but needs robust cavity detection
8. **overhang angle**: surface normal vs build direction, but needs orientation input
9. **edge sharpness**: dihedral angle analysis, but needs threshold validation

### needs algorithmic research (3)

10. **feature size**: requires semantic feature segmentation (which mesh regions are "features"?)
11. **engraving depth**: requires recess classification (which surfaces are "engraved"?)
12. **aspect ratio**: requires feature segmentation

### profile parameters (3)

13. **casting shrinkage**: not measurable, stored in profile
14. **finishing erosion**: not measurable, stored in profile
15. **dimensional tolerance**: not measurable, stored in profile

### heuristic only (1)

16. **polishing accessibility**: requires tool simulation, labeled as heuristic

---

## proposed constraints

13 formal constraints in `synthesis/constraint-taxonomy.md`. severity distribution:

| severity | count | examples |
|---|---|---|
| error | 4 | nested parts, hollow without evacuation, max dimensions, non-manifold mesh |
| warning | 9 | wall thickness, feature size, engraving, holes, clearance, edge sharpness, overhang, aspect ratio |
| informational | 4 | polishing accessibility, finishing erosion, shrinkage, tolerance |

---

## manufacturing profiles

1 profile produced: `profiles/profile-001-lost-wax-silver-general.json`

- process: lost-wax casting from printed wax/resin
- material: sterling silver
- manufacturer: general (consensus)
- 11 constraints, 4 profile parameters, 3 capability flags

dmls profile not yet produced: needs manufacturer-specific data (current dmls sources are industrial, not jewelry-specific).

---

## unresolved questions

1. **ring band 1.0 mm minimum:** is this wear-driven or casting-driven? only materialise distinguishes ring bands. does it vary by ring type?
2. **non-uniform shrinkage:** jeweller's toolkit notes shrinkage is not uniform. how does geometry affect shrinkage direction and magnitude?
3. **dmls wall thickness:** 0.4 mm (hubs) vs 1.0 mm (forge labs): theoretical minimum vs production recommendation?
4. **dmls hole diameter:** 0.5 mm (forge labs) vs 1.5 mm (hubs): orientation-dependent?
5. **feature segmentation:** how to algorithmically identify "features" vs "structural walls" in a mesh?
6. **orientation for lost-wax:** does build orientation of the wax/resin pattern affect casting quality?
7. **finishing erosion by feature type:** does polishing remove more material from curved surfaces than flat?
8. **dmls jewelry-specific constraints:** current dmls sources are industrial. do jewelry-specific dmls constraints differ?
9. **binder jetting for jewelry:** 15-20% shrinkage is very high. is binder jetting viable for jewelry?
10. **thick section threshold:** 4 mm from formlabs. is this jewelry-specific or pattern-specific?

---

## empirical testing requirements

the following cannot be resolved from documentation alone:

1. **minimum feature survival:** at what exact dimension do raised features disappear during polishing?
2. **polishing dimensional change:** how much material is removed from curved vs flat surfaces?
3. **casting fidelity:** what is the minimum reproducible detail in lost-wax casting from printed patterns?
4. **dmls surface finish:** what ra is achievable for jewelry-specific dmls (precious metals, fine features)?
5. **articulated clearance:** what is the minimum gap for functional articulation in cast jewelry?
6. **stone-setting durability:** what prong dimensions survive setting without failure?
7. **non-uniform shrinkage:** how does geometry complexity affect shrinkage distribution?
8. **dmls powder removal:** what is the minimum evacuation channel diameter for jewelry-scale cavities?

---

## implementation implications

### ready for implementation

- wall thickness measurement (sphere mis algorithm)
- clearance measurement (pairwise distance)
- bounding box check
- nested component detection
- mesh manifoldness check
- manufacturing profile structure
- constraint schema
- validation result structure

### needs more research

- feature segmentation algorithm
- engraving depth measurement
- hole detection and measurement
- cavity detection and evacuation analysis
- overhang analysis (needs orientation input)
- dmls-specific constraints (jewelry-specific data)

### needs architectural decisions

- how does build orientation enter the system? (user-specified? auto-optimized? profile-default?)
- how are semantic classifications (feature vs wall vs engraving) derived from canonical parameters?
- how is finishing erosion applied to features? (uniform offset? per-feature-type?)
- how are manufacturer-specific capabilities (hollow support) represented in the profile?

---

## adversarial review summary

three adversarial passes completed:

### pass 1: auditor (12 issues)
- recommendations treated as requirements in some constraints
- single-source constraints need corroboration
- manufacturer-specific facts sometimes presented as generic
- orientation and finishing not always considered
- fillet requirement should be highlighted

### pass 2: engineer (implementation readiness)
- 5 of 10 measurements deterministically implementable now
- 2 need semantic classification research
- 3 are profile parameters or heuristics
- all hard-error constraints are implementable
- warning constraints need more source corroboration

### pass 3: manufacturer
- 2 constraints rated "yes" (accurate)
- 5 constraints rated "depends" (flexibility needed)
- key concern: design-specific requirements may override general rules
- finishing impact on features needs more emphasis
- fillets requirement should be highlighted

---

## recommended next engineering step

1. **implement the 5 ready measurements** as a standalone geometry analysis module
2. **define the manufacturing profile json schema** based on `profile-001`
3. **build the validation result structure**: structured findings with constraint id, severity, measurement, threshold, scope, evidence
4. **implement the constraint checker**: compare measurements against profile thresholds
5. **research feature segmentation**: the key algorithmic blocker for feature size and engraving constraints
6. **add 2-3 more manufacturer profiles**: cooksongold, stuller, materialise (all lost-wax + silver)
7. **add first dmls jewelry profile**: needs jewelry-specific dmls manufacturer data

---

## source registry

18 sources registered in `sources/sources.jsonl`. full list at `research/sources/sources.jsonl`.

---

## labels

throughout this report:
- **documented:** stated directly by a manufacturer or technical source
- **derived:** computed or inferred from documented values
- **inferred:** reasoned from evidence but not directly stated
- **proposed:** suggested by this research but not yet validated
- **unknown:** insufficient evidence to determine