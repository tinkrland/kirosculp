# geometry ↔ manufacturing mapping

**produced:** 2026-09-24
**phase:** 9: geometry mapping (first slice)
**scope:** ring + lost-wax investment casting + sterling silver
**status:** initial: based on first evidence corpus

---

## 1. purpose

for every manufacturing concept in the evidence corpus, define:
- what geometric observable would let sculptura detect or reason about this
- whether it can be measured directly from a triangular mesh
- what measurement method is available
- what assumptions are necessary
- what must be deferred to the manufacturer

---

## 2. mappings

### 2.1 minimum wall thickness

**manufacturing concept:** walls below a certain thickness fail to cast, fill incompletely, warp during burnout, or break during finishing/wear.

**geometric observable:** minimum local distance between opposing surfaces of the mesh.

**measurement methods (from evidence):**
1. **ray casting:** cast rays along surface normals, measure distance to opposite surface. fast, best for clean geometry. (source: src-0009, meshinspector)
2. **sphere method:** use inscribed/circumscribed spheres at surface points. more robust for curved/complex shapes, slower. (source: src-0009)
3. **distance field:** compute signed distance field, find minimum distance between opposing surfaces. (source: academic literature, stack overflow discussion)

**can it be measured directly?** yes: for solid walls, ray casting or sphere methods on a manifold mesh produce reliable thickness measurements.

**assumptions:**
- mesh is manifold and watertight
- surface normals are consistent
- "wall" means local distance between opposing surfaces, not just bounding box dimensions
- measurement is taken at the thinnest point, not averaged

**what must be deferred:**
- whether the wall is "solid" vs "hollow" (requires topology analysis)
- whether the wall will survive the specific manufacturer's casting process (manufacturer-specific)
- whether the wall will survive finishing (depends on finishing type)

**proposed measurement:**
```
measure_minimum_wall_thickness(mesh) → {
  min_thickness: float (mm),
  location: [x, y, z],
  method: "ray_cast" | "sphere",
  confidence: float
}
```

**proposed constraint:**
```yaml
constraint_id: wall_thickness_minimum
property: minimum_wall_thickness
operator: >=
value: 0.8  # mm, sterling silver, lost-wax casting
unit: mm
scope:
  process: lost-wax casting from printed wax/resin
  material: sterling_silver
  manufacturer: general (consensus from 3 sources)
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: warning
evidence:
  - evid-wall-001  # Materialise: 0.6/0.8 mm
  - evid-wall-003  # eCadCam: 0.8 mm
  - evid-wall-004  # JFD: 0.8 mm
notes: >
  0.8 mm is the consensus production minimum for sterling silver.
  Materialise specifies 0.6 mm for gloss finish only.
  Ring bands should use 1.0 mm minimum (wear-driven, not casting-driven).
  This is a recommendation, not a hard requirement — manufacturer-specific
  capabilities may vary.
```

### 2.2 minimum feature size (raised details)

**manufacturing concept:** raised details below a certain size fail to cast or disappear during finishing.

**geometric observable:** minimum dimension of a raised geometric feature (width, height) attached to a solid surface.

**measurement methods:**
- local geometric thickness (same as wall thickness, applied to features)
- bounding box of individual raised features (requires feature segmentation)
- distance transform to identify narrow protrusions

**can it be measured directly?** partially. measuring local thickness can identify thin features, but segmenting "features" from the main body is a harder problem. requires the system to know which parts of the geometry are "raised details" vs "structural walls."

**assumptions:**
- features are attached to a solid surface (not floating)
- feature dimensions are measured in the as-designed geometry, before finishing erosion
- finishing erosion must be subtracted from feature dimensions to estimate survival

**proposed measurement:**
```
measure_minimum_feature_size(mesh) → {
  min_feature_width: float (mm),
  min_feature_height: float (mm),
  locations: [...],
  method: "local_thickness + segmentation"
}
```

**proposed constraint:**
```yaml
constraint_id: feature_size_minimum
property: minimum_feature_width
operator: >=
value: 0.35  # mm, general
unit: mm
scope:
  process: lost-wax casting from printed wax
  material: sterling_silver
  manufacturer: Materialise (primary)
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: warning
evidence:
  - evid-feat-001  # Materialise: 0.35 mm diameter, 0.4 mm height
  - evid-feat-002  # eCadCam: 0.3-0.4 mm wide and tall
notes: >
  0.35 mm is the manufacturer-stated minimum for silver.
  eCadCam recommends 0.3-0.4 mm but notes features may disappear during polishing.
  For features that must survive polishing, add finishing erosion (0.05-0.15 mm).
  Rods/prongs in mesh-like structures: 0.8 mm minimum (structural, not casting).
```

### 2.3 engraving depth

**manufacturing concept:** engraved details below a certain depth disappear during finishing. engraving too deep causes casting issues.

**geometric observable:** depth of recessed geometry relative to surrounding surface.

**measurement methods:**
- surface normal ray casting (inward) to measure recess depth
- distance field from surrounding surface to recessed surface
- cross-section analysis

**can it be measured directly?** partially. requires identifying which surfaces are "engraved" vs "structural boundaries." this is a semantic classification problem.

**proposed constraint:**
```yaml
constraint_id: engraving_depth
property: engraving_depth
operator: >=
value: 0.2  # mm, minimum depth for finishing survival
unit: mm
scope:
  process: lost-wax casting from printed wax/resin
  material: sterling_silver
  manufacturer: general (eCadCam)
  finishing: polishing
severity: warning
evidence:
  - evid-feat-002  # eCadCam: 0.2-0.3 mm minimum depth
  - evid-engrave-001  # Hoover & Strong: max 0.5 mm, min width 0.75 mm, 7° draft
  - evid-engrave-002  # Materialise: 1:1 ratio, 0.35 mm min wall
notes: >
  Range: 0.2-0.5 mm depth.
  Width: ≥ 0.35 mm (Materialise) to 0.75 mm (Hoover & Strong).
  Draft angle: 7° (Hoover & Strong).
  Aspect ratio: 1:1 max (Materialise).
  These are not contradictory — they define a bounded range.
```

### 2.4 minimum clearance (between parts)

**manufacturing concept:** gaps below a certain size cause parts to fuse during casting.

**geometric observable:** minimum distance between separate components in the mesh.

**measurement methods:**
- pairwise distance computation between separate mesh components
- distance field between disconnected mesh regions

**can it be measured directly?** yes: if components are disconnected, computing minimum distance between them is straightforward.

**proposed constraint:**
```yaml
constraint_id: clearance_minimum
property: minimum_clearance
operator: >=
value: 0.3  # mm
unit: mm
scope:
  process: lost-wax casting from printed wax
  material: silver, gold
  manufacturer: Materialise
  finishing: unknown
severity: warning
evidence:
  - evid-clear-001  # Materialise: 0.3 mm
notes: >
  Root cause: plaster cannot fully flow into gaps < 0.3 mm, creating thin mold
  walls that break during metal pour. Same value for silver and gold.
```

### 2.5 hollow evacuation

**manufacturing concept:** hollow models need evacuation holes for uncured wax/resin removal.

**geometric observable:** presence and size of through-holes connecting internal cavities to the exterior.

**measurement methods:**
- connected component analysis of the complement (void space)
- cavity detection: identify enclosed voids in the mesh
- hole detection: measure diameter of through-channels from cavity to exterior

**can it be measured directly?** yes, but requires robust cavity detection and hole measurement algorithms. this is more complex than wall thickness.

**proposed constraint:**
```yaml
constraint_id: hollow_evacuation
property: evacuation_hole_count
operator: >=
value: 2
unit: count
scope:
  process: lost-wax casting from printed wax
  material: silver, gold
  manufacturer: Materialise
  finishing: unknown
severity: error
evidence:
  - evid-hollow-001  # Materialise: 2+ holes, > 1.5 mm diameter
notes: >
  Also requires: hole_diameter >= 1.5 mm.
  Holes should be spread out equally (e.g., on opposite ends).
  This is a hard requirement — without evacuation, uncured resin causes casting failure.
```

### 2.6 casting shrinkage

**manufacturing concept:** metal shrinks during solidification, causing the final part to be smaller than the wax pattern.

**geometric observable:** this is not a geometric property of the mesh. it is a process parameter that affects the relationship between the designed geometry and the final physical part.

**measurement:** not measurable from geometry alone. this is a compensation factor applied before manufacturing.

**how sculptura should handle it:**
- store shrinkage as a manufacturing profile parameter, not a geometric measurement
- apply as a scale factor during pattern generation (upstream of casting)
- different materials have different shrinkage rates (1.3-2.1% depending on alloy)

**proposed profile parameter:**
```yaml
parameter_id: casting_shrinkage
value: 1.8  # percent, sterling silver
unit: percent (linear)
scope:
  process: lost-wax casting
  material: sterling_silver
  manufacturer: general
evidence:
  - evid-shrink-001  # eCadCam: 1.5-2%
  - evid-shrink-002  # JewelCAD: 1.8-2.1%
notes: >
  Range: 1.5-2.1% for sterling silver. Manufacturer-specific values preferred.
  Applied as uniform scale factor before pattern generation.
  Non-uniform shrinkage may occur for complex geometries.
```

### 2.7 finishing erosion

**manufacturing concept:** polishing and finishing remove material from the surface, reducing feature dimensions.

**geometric observable:** not directly measurable from the as-designed geometry. this is a predicted surface offset.

**how sculptura should handle it:**
- store as a manufacturing profile parameter (erosion by finishing type)
- use to predict post-finishing dimensions: `final_dimension = designed_dimension - erosion`
- flag features that would fall below minimum after erosion

**proposed profile parameter:**
```yaml
parameter_id: finishing_erosion
value:
  polished: 0.05  # mm, magnetic tumbler
  sandblasted: 0.10  # mm
  brushed: 0.10  # mm
  hand_polished: 0.10  # mm
unit: mm
scope:
  process: lost-wax casting from printed wax
  material: silver
  manufacturer: Materialise
evidence:
  - evid-polish-001
notes: >
  Hand polishing removes 2-3x more material than magnetic tumbling.
  Sharp edges are rounded during hand polishing.
  Cavities and internal structures cannot be polished.
  Features must be designed with erosion allowance to survive finishing.
```

### 2.8 maximum part dimensions

**manufacturing concept:** each manufacturer has a maximum build envelope.

**geometric observable:** bounding box of the mesh.

**measurement:** trivially computable from mesh vertices.

**proposed constraint:**
```yaml
constraint_id: max_part_dimensions
property: bounding_box
operator: <=
value:
  x: 88  # mm
  y: 88  # mm
  z: 125  # mm
unit: mm
scope:
  process: lost-wax casting from printed wax
  material: silver, gold
  manufacturer: Materialise
  machine: unknown
severity: error
evidence:
  - evid-tol-001
notes: >
  Manufacturer-specific. Cooksongold: 30×50×70 mm. i.materialise: 88×88×125 mm.
  Must be scoped per manufacturer profile.
```

### 2.9 Nested/Interlocking parts

**manufacturing concept:** lost-wax casting cannot produce nested, hinged, or interlocking parts.

**geometric observable:** disconnected mesh components where one is enclosed within another.

**measurement methods:**
- connected component analysis
- bounding volume containment check

**can it be measured directly?** yes: detect disconnected components, check if one's bounding volume is contained within another's.

**proposed constraint:**
```yaml
constraint_id: nested_parts
property: nested_components
operator: ==
value: 0
unit: count
scope:
  process: lost-wax casting from printed wax
  material: silver, gold
  manufacturer: Materialise
  machine: unknown
severity: error
evidence:
  - evid-nested-001
notes: >
  Hard process limitation. Hinged and interlocking parts also not supported.
  These require assembly after casting, not in-situ articulation.
```

### 2.10 polishing accessibility

**manufacturing concept:** cavities and internal structures cannot be polished.

**geometric observable:** surface regions that are inaccessible to polishing tools.

**measurement methods:**
- accessibility analysis (ray casting from exterior to surface points)
- curvature analysis (concave regions likely inaccessible)
- tool size + approach angle simulation

**can it be measured directly?** no: this is a heuristic. accessibility depends on tool size, approach angle, and manufacturing process. it requires assumptions about tool geometry.

**proposed classification:**
```yaml
heuristic_id: polishing_accessibility
type: heuristic
method: accessibility_analysis
inputs:
  - mesh
  - tool_radius (assumed)
  - approach_angle_limit (assumed)
output:
  - accessible_surfaces: list
  - inaccessible_surfaces: list
  - likely_rounded_edges: list
scope:
  process: lost-wax casting from printed wax
  material: silver
  manufacturer: Materialise
  finishing: polishing
evidence:
  - evid-polish-002
notes: >
  Heuristic, not deterministic. Cannot predict exact polishing results.
  Useful for warning designers about inaccessible regions.
  Must be labeled as heuristic in validation output.
```

---

## 3. summary table

| concept | measurable from geometry | method | Direct/Heuristic | constraint candidate | confidence |
|---|---|---|---|---|---|
| wall thickness | yes | ray casting / sphere | direct | min ≥ 0.8 mm (ag) | high |
| feature size | partially | local thickness + segmentation | direct (partial) | min ≥ 0.35 mm | medium |
| engraving depth | partially | recess depth analysis | direct (partial) | 0.2-0.5 mm range | medium |
| clearance | yes | pairwise distance | direct | min ≥ 0.3 mm | high |
| hollow evacuation | yes | cavity + hole detection | direct | 2+ holes, ≥ 1.5 mm | high |
| shrinkage | no | N/A (profile parameter) | N/A | 1.5-2.1% (ag) | medium |
| finishing erosion | no | N/A (profile parameter) | N/A | 0.05-0.15 mm | high |
| max dimensions | yes | bounding box | direct | 88×88×125 mm (materialise) | high |
| nested parts | yes | component containment | direct | not supported | high |
| polishing accessibility | partially | accessibility analysis | heuristic | warning only | low |

---

### 2.11 overhang angle (DMLS/SLM only)

**manufacturing concept:** surfaces angled too shallow relative to build direction need support structures. unsupported overhangs warp or fail.

**geometric observable:** surface normal angle relative to build direction.

**measurement methods:**
- surface normal analysis: compute angle between face normal and build direction vector
- build-direction projection: identify faces whose normal has small z-component

**can it be measured directly?** yes: if build direction is known. compute face normals, compare to build direction vector.

**proposed constraint:**
```yaml
constraint_id: ctr-overhang-001
property: overhang_angle
operator: >=
value: 50  # degrees from horizontal
unit: degrees
scope:
  process: DMLS/SLM
  material: various metals
  manufacturer: Hubs (aggregator)
  machine: unknown
  orientation: build_direction
  finishing: unknown
severity: warning
evidence:
  - evid-dmls-overhang-001
notes: >
  Surfaces angled less than 50° from horizontal need support.
  Not applicable to lost-wax casting.
  Requires build orientation as input — this is a manufacturing parameter, not purely geometric.
  Same geometry can pass or fail depending on orientation.
```

### 2.12 unsupported edge length (DMLS/SLM only)

**manufacturing concept:** overhanging edges longer than a threshold warp without support.

**geometric observable:** length of continuous overhanging edge segments.

**measurement methods:**
- edge analysis: identify edges where adjacent face normal points away from build direction
- measure continuous length of overhanging edge chains

**can it be measured directly?** yes: if build direction is known.

**proposed constraint:**
```yaml
constraint_id: ctr-edge-overhang-001
property: unsupported_edge_length
operator: <=
value: 0.5  # mm
unit: mm
scope:
  process: DMLS/SLM
  material: various metals
  manufacturer: Hubs (aggregator)
  machine: unknown
  orientation: build_direction
  finishing: unknown
severity: warning
evidence:
  - evid-dmls-edge-001
notes: >
  Very strict — 0.5 mm max. Use 45° chamfer to eliminate overhang.
  Not applicable to lost-wax casting.
```

### 2.13 aspect ratio (DMLS/SLM only)

**manufacturing concept:** tall thin features warp during printing.

**geometric observable:** height-to-width ratio of isolated features.

**measurement methods:**
- feature segmentation + bounding box ratio
- height vs minimum cross-section dimension

**can it be measured directly?** partially: requires feature segmentation (same challenge as feature size).

**proposed constraint:**
```yaml
constraint_id: ctr-aspect-001
property: aspect_ratio
operator: <=
value: 8  # :1
unit: ratio
scope:
  process: DMLS/SLM
  material: various metals
  manufacturer: Hubs (aggregator)
  machine: unknown
  orientation: build_direction
  finishing: unknown
severity: warning
evidence:
  - evid-dmls-aspect-001
notes: >
  Use support ribs for tall features (like injection molding).
  Applies to prongs, raised details, pins.
```

---

## 3. summary table (updated)

| concept | measurable from geometry | method | Direct/Heuristic | constraint candidate | confidence | processes |
|---|---|---|---|---|---|---|
| wall thickness | yes | ray casting / sphere | direct | min ≥ 0.8 mm (lost-wax) / 1.0 mm (dmls) | high | both |
| feature size | partially | local thickness + segmentation | direct (partial) | min ≥ 0.35 mm (lw) / 0.6 mm (dmls) | medium | both |
| engraving depth | partially | recess depth analysis | direct (partial) | 0.2-0.5 mm range (lw) / 0.5 mm (dmls) | medium | both |
| clearance | yes | pairwise distance | direct | min ≥ 0.3 mm (lw) / 0.5 mm (dmls) | medium | both |
| hollow evacuation | yes | cavity + hole detection | direct | 2+ holes, ≥ 1.5 mm (lw) | high | lost-wax |
| shrinkage | no | N/A (profile parameter) | N/A | 1.5-2.1% (lw ag) | medium | lost-wax |
| finishing erosion | no | N/A (profile parameter) | N/A | 0.05-0.2 mm (lw) | high | lost-wax |
| max dimensions | yes | bounding box | direct | manufacturer-specific | high | both |
| nested parts | yes | component containment | direct | not supported (lw) | high | lost-wax |
| polishing accessibility | partially | accessibility analysis | heuristic | warning only | low | lost-wax |
| overhang angle | yes (needs orientation) | surface normal analysis | direct | ≥ 50° (dmls) | high | dmls |
| unsupported edge | yes (needs orientation) | edge analysis | direct | ≤ 0.5 mm (dmls) | high | dmls |
| aspect ratio | partially | feature bounding box | direct (partial) | ≤ 8:1 (dmls) | high | dmls |
| hole diameter | yes | cross-section analysis | direct | ≥ 0.5 mm (lw) / ≥ 1.5 mm (dmls) | medium | both |
| edge sharpness | partially | dihedral angle | direct (partial) | ≥ 0.30 mm fillet (lw) | low | lost-wax |
| mesh manifoldness | yes | Edge/normal check | direct | required | high | both |

---

## 4. next research targets

for the first slice (ring + lost-wax + silver), the following gaps remain:

1. **ring band-specific constraints:** the 1.0 mm ring band minimum is wear-driven. need evidence on whether this varies by ring type (band vs signet vs open).
2. **Shank/gallery constraints:** ecadcam mentions shanks should not go below 1.5 mm height, galleries 0.9 mm. need more sources.
3. **orientation effects on lost-wax:** no evidence yet on how build orientation affects casting quality for lost-wax from printed patterns.
4. **thick section threshold:** 4 mm review threshold from formlabs. need more sources for jewelry-specific thick section limits.
5. **dmls jewelry-specific data:** current dmls sources are industrial, not jewelry-specific. need dmls jewelry manufacturer design guides.
6. **Cavity/powder evacuation for dmls:** trapped powder in dmls is analogous to trapped wax in lost-wax. need evacuation rules.
7. **teardrop hole shape:** hubs recommends teardrop for non-vertical dmls holes. need to define this geometrically.
