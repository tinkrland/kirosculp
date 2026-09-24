# constraint taxonomy

**produced:** 2026-09-24
**phase:** 10: constraint synthesis
**scope:** first vertical slice (ring + lost-wax + sterling silver)

---

## 1. constraint structure

every constraint follows this structure:

```yaml
constraint_id: <stable_id>
property: <canonical_concept>
operator: >= | <= | == | !=
value: <number_or_set>
unit: mm | degrees | percent | count | n/a

scope:
  process: <process_name>
  material: <material_name>
  manufacturer: <manufacturer_name | "general">
  machine: <machine_name | "unknown">
  orientation: <orientation | "unknown">
  finishing: <finishing_type | "unknown">

severity: error | warning | informational

evidence:
  - <evidence_id>

measurement:
  method: <measurement_method>
  inputs: <what_the_measurement_needs>

notes: <additional_context>
```

---

## 2. constraints for first vertical slice

### 2.1 wall thickness: solid walls

```yaml
constraint_id: ctr-wall-001
property: minimum_wall_thickness
operator: >=
value: 0.8
unit: mm
scope:
  process: lost-wax casting from printed wax/resin
  material: sterling_silver
  manufacturer: general
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: warning
evidence:
  - evid-wall-001  # Materialise: 0.6/0.8 mm
  - evid-wall-003  # eCadCam: 0.8 mm
  - evid-wall-004  # JFD: 0.8 mm
  - evid-wall-006  # Cooksongold: 0.8 mm
  - evid-wall-007  # Stuller: 0.8 mm
measurement:
  method: sphere_inscription_MIS
  inputs: manifold mesh with consistent normals
notes: >
  0.8 mm is the consensus production minimum across 5 sources (3 manufacturers, 2 practitioners).
  Materialise specifies 0.6 mm for gloss finish only — 0.8 mm for high gloss.
  This is a recommendation (most sources use "advise" or "recommend"), not a hard requirement.
  Manufacturer-specific profiles may override with tighter or looser values.
```

### 2.2 wall thickness: ring bands

```yaml
constraint_id: ctr-wall-002
property: minimum_wall_thickness
operator: >=
value: 1.0
unit: mm
scope:
  process: lost-wax casting from printed wax/resin
  material: sterling_silver, gold
  manufacturer: general
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: warning
evidence:
  - evid-wall-001  # Materialise: ring band 1.0 mm
  - evid-wall-002  # Materialise gold: ring band 1.0 mm
measurement:
  method: sphere_inscription_MIS
  inputs: manifold mesh, ring band region identified
notes: >
  Ring band minimum is wear-driven, not casting-driven.
  The 1.0 mm applies to the band region specifically, not to all walls.
  Materialise specifies this for both silver and gold.
  No other source contradicts this, but only Materialise distinguishes ring bands.
```

### 2.3 wall thickness: small elements (claws, bezels)

```yaml
constraint_id: ctr-wall-003
property: minimum_wall_thickness
operator: >=
value: 0.5
unit: mm
scope:
  process: lost-wax casting from printed wax/resin
  material: precious_metals
  manufacturer: Cooksongold, Stuller
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: warning
evidence:
  - evid-wall-006  # Cooksongold: claws/bezels 0.5 mm
  - evid-prong-003 # Stuller: pinpoint prong 0.45 mm
measurement:
  method: sphere_inscription_MIS
  inputs: manifold mesh, feature region identified
notes: >
  Cooksongold: 0.5 mm for claws/small setting bezels.
  Stuller: 0.45 mm for pinpoint prongs, 0.45 mm for bezel walls.
  These are smaller features than structural walls — different threshold.
```

### 2.4 feature size: raised details

```yaml
constraint_id: ctr-feat-001
property: minimum_feature_size
operator: >=
value: 0.35
unit: mm
scope:
  process: lost-wax casting from printed wax
  material: sterling_silver
  manufacturer: Materialise
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: warning
evidence:
  - evid-feat-001  # Materialise: 0.35 mm diameter, 0.4 mm height
  - evid-feat-002  # eCadCam: 0.3-0.4 mm
measurement:
  method: local_thickness + feature_segmentation
  inputs: manifold mesh, feature regions identified
notes: >
  0.35 mm is Materialise's stated minimum for silver.
  eCadCam recommends 0.3-0.4 mm but notes features may disappear during polishing.
  For features that must survive polishing, add finishing erosion allowance.
  Rods/prongs in mesh-like structures: 0.8 mm minimum (structural, not casting).
```

### 2.5 engraving: raised text

```yaml
constraint_id: ctr-engrave-001
property: engraving_parameters
operator: >=
value:
  min_thickness: 0.30
  max_height: 0.60
  min_spacing: 0.30
unit: mm
scope:
  process: lost-wax casting from printed wax / CAD/CAM
  material: precious_metals
  manufacturer: Cooksongold, Stuller
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: warning
evidence:
  - evid-feat-003  # Cooksongold: 0.30/0.60/0.30
  - evid-feat-004  # Stuller: 0.3/0.6/0.3
measurement:
  method: feature_segmentation + dimension_measurement
  inputs: manifold mesh, text/lettering regions identified
notes: >
  Two independent manufacturers agree exactly: 0.3 mm min, 0.6 mm max height, 0.3 mm spacing.
  Stuller requires fillets on all edges. Cooksongold recommends fillets.
  This is the most well-corroborated constraint in the corpus.
```

### 2.6 engraving: recessed text

```yaml
constraint_id: ctr-engrave-002
property: engraving_parameters
operator: >=
value:
  min_width: 0.30
  max_depth: 0.50
  min_spacing: 0.30
  max_depth_to_width_ratio: 2.0
unit: mm
scope:
  process: lost-wax casting from printed wax / CAD/CAM
  material: precious_metals
  manufacturer: Cooksongold, Stuller
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: warning
evidence:
  - evid-feat-003  # Cooksongold: 0.30/0.50/0.30, negative draft
  - evid-feat-004  # Stuller: 0.3 mm width, depth <= 2x width
  - evid-engrave-001 # Hoover & Strong: max 0.5 mm, min 0.75 mm width, 7° draft
  - evid-engrave-002 # Materialise: 1:1 ratio, 0.35 mm min
measurement:
  method: recess_depth_analysis
  inputs: manifold mesh, recessed regions identified
notes: >
  Depth: 0.2-0.5 mm (eCadCam min 0.2-0.3 for survival, Cooksongold/Stuller max 0.5).
  Width: 0.30 mm (Cooksongold, Stuller) to 0.75 mm (Hoover & Strong).
  Draft angle: 7° (Hoover & Strong), negative/taper (Cooksongold).
  Depth-to-width: 1:1 (Materialise) to 2:1 (Stuller).
  Use 2:1 as max, 1:1 as conservative.
```

### 2.7 minimum hole diameter

```yaml
constraint_id: ctr-hole-001
property: minimum_hole_diameter
operator: >=
value: 0.5
unit: mm
scope:
  process: lost-wax casting from printed wax
  material: precious_metals
  manufacturer: Cooksongold
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: warning
evidence:
  - evid-hole-001  # Cooksongold: 0.50 mm
  - evid-hole-002  # Stuller: 0.40 mm (stricter)
measurement:
  method: cross_section_analysis
  inputs: manifold mesh, hole regions identified
notes: >
  Range: 0.4-0.5 mm. Both cite investment relocation as root cause.
  Stuller adds 2:1 max depth-to-diameter ratio.
  Use 0.5 mm as warning, 0.4 mm as error (or defer to manufacturer profile).
  Pilot holes should use conical/spherical shape, width > depth.
```

### 2.8 minimum clearance

```yaml
constraint_id: ctr-clear-001
property: minimum_clearance
operator: >=
value: 0.3
unit: mm
scope:
  process: lost-wax casting from printed wax
  material: silver, gold
  manufacturer: Materialise
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: warning
evidence:
  - evid-clear-001  # Materialise: 0.3 mm
measurement:
  method: pairwise_distance_between_components
  inputs: manifold mesh, disconnected components identified
notes: >
  Single source (Materialise). Root cause: plaster cannot flow into gaps < 0.3 mm.
  Same value for silver and gold. Need more sources to confirm universality.
```

### 2.9 hollow evacuation

```yaml
constraint_id: ctr-hollow-001
property: hollow_evacuation
operator: >=
value:
  min_holes: 2
  min_hole_diameter: 1.5
unit: count / mm
scope:
  process: lost-wax casting from printed wax
  material: silver, gold
  manufacturer: Materialise
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: error
evidence:
  - evid-hollow-001  # Materialise: 2+ holes, > 1.5 mm
measurement:
  method: cavity_detection + hole_measurement
  inputs: manifold mesh, internal cavities and through-holes identified
notes: >
  Hard requirement for Materialise. Cooksongold does NOT support hollow at all.
  Holes should be spread out equally (e.g., on opposite ends).
  This is an error for Materialise profile, but 'not_supported' for Cooksongold profile.
```

### 2.10 nested components

```yaml
constraint_id: ctr-nested-001
property: nested_components
operator: ==
value: 0
unit: count
scope:
  process: lost-wax casting from printed wax
  material: silver, gold, precious_metals
  manufacturer: Materialise, Cooksongold
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: error
evidence:
  - evid-nested-001  # Materialise: not supported
  - evid-hollow-002  # Cooksongold: interlocking/multiple not supported
measurement:
  method: connected_component_analysis + containment_check
  inputs: manifold mesh
notes: >
  Hard process limitation for lost-wax casting. Nested, hinged, interlocking parts
  all not supported. Must be cast separately and assembled.
  Confirmed by 2 manufacturers.
```

### 2.11 maximum part dimensions

```yaml
constraint_id: ctr-size-001
property: bounding_box
operator: <=
value:
  materialise:
    x: 88
    y: 88
    z: 125
  cooksongold:
    x: 30
    y: 50
    z: 70
unit: mm
scope:
  process: lost-wax casting from printed wax
  material: silver, gold, precious_metals
  manufacturer: manufacturer_specific
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: error
evidence:
  - evid-tol-001  # Materialise: 88×88×125 mm
  - evid-tol-003  # Cooksongold: 30×50×70 mm
measurement:
  method: vertex_extents
  inputs: mesh vertices
notes: >
  Manufacturer-specific. Must be stored per profile.
  Cooksongold is much smaller than Materialise.
```

### 2.12 edge sharpness

```yaml
constraint_id: ctr-edge-001
property: edge_sharpness
operator: >=
value: 0.30
unit: mm
scope:
  process: lost-wax casting from printed wax
  material: precious_metals
  manufacturer: Cooksongold
  machine: unknown
  orientation: unknown
  finishing: unknown
severity: warning
evidence:
  - evid-edge-001  # Cooksongold: 0.30 mm fillet or thickness
measurement:
  method: dihedral_angle_analysis + curvature_analysis
  inputs: manifold mesh
notes: >
  Single source. Sharp edges do not print well.
  Recommend fillet 0.30 mm radius or thicken edge to 0.30 mm.
  Better to have too much material and sharpen during finishing.
```

### 2.13 mesh manifoldness

```yaml
constraint_id: ctr-mesh-001
property: mesh_manifoldness
operator: ==
value: true
unit: boolean
scope:
  process: lost-wax casting from printed wax
  material: all
  manufacturer: all
  machine: all
  orientation: unknown
  finishing: unknown
severity: error
evidence:
  - evid-tol-003  # Cooksongold: watertight required
  - src-0011      # Stuller: STL files accepted, implies manifold
measurement:
  method: edge_manifoldness_check + normal_consistency_check
  inputs: mesh
notes: >
  Universal requirement. All manufacturers require watertight, manifold meshes.
  Non-manifold edges, naked edges, and inconsistent normals cause printing failures.
```

---

## 3. profile parameters (not constraints)

these are stored in the manufacturing profile, not as geometry constraints:

| parameter | value (sterling silver) | source | notes |
|---|---|---|---|
| casting_shrinkage | 1.5-2.1% | evid-shrink-001, evid-shrink-002 | applied as scale factor |
| dimensional_tolerance | ±5% (min ±0.35 mm) | evid-tol-001 | materialise specific |
| finishing_erosion_polished | 0.05-0.075 mm | evid-polish-001 | magnetic tumbler |
| finishing_erosion_sandblasted | 0.10-0.15 mm | evid-polish-001 | |
| finishing_erosion_brushed | 0.10-0.15 mm | evid-polish-001 | |
| finishing_erosion_hand_polished | 0.10-0.15 mm | evid-polish-001 | |
| finishing_erosion_production | up to 0.2 mm | evid-shank-001 | stuller, all processes |
| hollow_support | yes (materialise) / no (cooksongold) | evid-hollow-001, evid-hollow-002 | manufacturer capability |

---

## 4. severity assignment rationale

| constraint | severity | rationale |
|---|---|---|
| nested components | **error** | process cannot produce: confirmed by 2 manufacturers |
| hollow without evacuation | **error** | will cause casting failure: manufacturer requirement |
| max dimensions exceeded | **error** | manufacturer cannot accept the file |
| mesh not manifold | **error** | universal requirement: no manufacturer accepts non-manifold |
| wall thickness below min | **warning** | most sources say "advise" or "recommend", not "must" |
| feature size below min | **warning** | may fail to cast or survive finishing |
| engraving outside range | **warning** | may cause investment relocation or finishing loss |
| hole below minimum | **warning** | may cause investment relocation |
| clearance below minimum | **warning** | may cause fusion: single source |
| edge sharpness | **warning** | single source, quality issue not failure |
| polishing accessibility | **informational** | heuristic, not deterministic |
| finishing erosion | **informational** | profile parameter for prediction |
