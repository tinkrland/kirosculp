# programmatic jewelry cad techniques: domain extraction for paracraft-jewelry

research: 2026-09-11 · source: https://a-m.shop/blogs/news/9990381-how-wide-should-my-ring-be, https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf, https://gemvy.com/blog/semi-mount-ring-settings-a-complete-guide.html (+9 more) · status: cited

## thesis

open-source programmatic cad (openscad, cadquery, build123d, freecad) and commercial gui jewelry cad systems (matrixgold, rhinogold, crossgems, rhinoartisan) operate on identical underlying jeweler manufacturing physics. while gui tools rely on interactive sweep wizards, profile placers, and dynamic cutters, a csg-based engine (`paracraft-jewelry`) can represent all domain-standard jewelry features, from seat cutters and gallery rails to azures, milgrain, and sizing bars, by composing native openscad 2D/3D primitives (`rotate_extrude`, `linear_extrude`, `offset`, `hull`, `polyhedron`, `difference`). every geometric parameter used in the engine's validation and generation pipelines must trace to production bench-setting and casting specifications; unverified numbers are strictly flagged as viz-grade or omitted.

## the techniques: organized by jewelry feature

### 1. ring shank profiles & sweeps
- **what it is**: the main finger band created by sweeping a closed 2d cross-sectional profile (e.g., flat, comfort-fit, d-shape, knife-edge, court, tapered) along a circular or elliptical finger rail.
- **how cad tools construct it**: in matrixgold / rhinogold / crossgems, a `Ring Rail` curve defines the inner finger boundary, while `Profile Placer` positions 2d cross-section sketches at cardinal stations (12, 3, 6, 9 o'clock). a `Sweep1` or `Sweep2` operation constructs the solid shank. in cadquery / build123d, a 2d `Sketch` (e.g., rounded rectangle or stadium) is swept along a circular wire via `.sweep()`. freecad's ring workbench sweeps 2d sketches along circular paths using `Part Sweep`.
- **which scad primitive could express it**: `rotate_extrude()` applied to a 2d profile created via `polygon()` or `offset()`. for non-uniform or tapered shanks (cathedral, bypass, tapered shoulders), a sequence of 2d profiles lofted/skinned using `hull()` or csg slices along the ring rail axis.
- **source url & cited metrics**:
  - post-polish minimum shank wall thickness: 1.5 mm minimum for general wear ([aide-memoire / rio grande](https://a-m.shop/blogs/news/9990381-how-wide-should-my-ring-be)); 1.8 mm minimum thickness at the sizing bar ([engagement ring designs](https://www.reddit.com/r/EngagementRingDesigns/comments/1sn24pv/ring_measurements_concern/)).
  - band width: 1.5 mm to 2.5 mm for delicate/women's bands ([blue nile ring width guide](https://www.bluenile.com/blog/diamonds-jewelry/ring-band-width)); 4.0 mm to 8.0 mm for men's bands ([larson jewelers](https://www.larsonjewelers.com/pages/ring-width-guide)).
  - finishing cleanup allowance: add +0.1 mm to desired finished measurements across outer surfaces ([ganoksin orchid / cadsmithing](https://orchid.ganoksin.com/t/basic-guidelines-for-jewelry-design/42291)).

### 2. stone seat cutters & bearing geometry
- **what it is**: an inverse conical or stepped cutting geometry boolean-subtracted from prongs, bezels, or channels to create a flat or angled bearing ledge where the gemstone girdle rests level and secure.
- **how cad tools construct it**: matrixgold / rhinogold `Gem Cutter` builds a multi-stepped cutter matching the gemstone profile (crown clearance cylinder, girdle belt, pavilion cone, culet piercer). bench stone setting relies on 70° or 45° hart (bearing) burs to cut seats in metal.
- **which scad primitive could express it**: `difference()` subtracting a composite revolved cutter built from `rotate_extrude()` or combined `cylinder()` and `cone` (`cylinder(r1, r2)`) primitives aligned with the stone's z-axis.
- **source url & cited metrics**:
  - seat cutter angle: 70° bearing (hart) bur angle (35° half-angle relative to z-axis) matching diamond pavilion geometry ([tom weishaar / ganoksin channel setting](https://www.ganoksin.com/article/channel-setting-round-diamonds/)).
  - seat depth into wall: indicator seat indentations cut no deeper than 0.35 mm into metal ([ganoksin orchid / cadsmithing](https://orchid.ganoksin.com/t/basic-guidelines-for-jewelry-design/42291)).
  - seat placement: places gemstone girdle approximately 0.5 mm below the top rim of the mounting wall ([tashvi bezel cad guide](https://tashvi.ai/blog/step-by-step-bezel-setting-cad-tutorial)).

### 3. gallery rails & trellis architecture
- **what it is**: horizontal metal wire loops or bars connecting vertical prongs below the gemstone girdle to reinforce head stability, prevent prong sprawling, and visually frame the stone pavilion.
- **how cad tools construct it**: matrixgold `Under Bezel` or rhino `Pipe` / `Sweep1` along a curve offset from the stone girdle, placed at a specific height along the prong cluster.
- **which scad primitive could express it**: `rotate_extrude()` of a circular wire profile along a girdle-conformal ring path, or a `hull()` chain of cylinders connecting prong centers at a fixed z-elevation.
- **source url & cited metrics**:
  - rule of thirds placement: divide girdle-to-culet height into 3 equal z-segments. upper gallery wire centered at 1/3 z-depth below girdle ([charlie herner / ganoksin prong settings](https://www.ganoksin.com/article/cad-modeling-prong-settings/)).
  - gallery wire thickness: wire diameter >= 1/3 of the girdle-to-culet height ([charlie herner / ganoksin prong settings](https://www.ganoksin.com/article/cad-modeling-prong-settings/)).
  - pavilion clearance gap: 0.2 mm to 0.3 mm clearance between upper gallery wire and pavilion for diamonds; 0.3 mm to 0.5 mm for colored gemstones with bulging pavilions ([charlie herner / ganoksin prong settings](https://www.ganoksin.com/article/cad-modeling-prong-settings/)).
  - top-down occlusion: gallery wire diameter must remain within the stone girdle footprint so wires are hidden when viewed top-down ([charlie herner / ganoksin prong settings](https://www.ganoksin.com/article/cad-modeling-prong-settings/)).

### 4. prongs & claws (prong builder)
- **what it is**: vertical or angled metallic posts extending up from the shank/head past the gemstone girdle, designed to be bent over the crown facets by a stone setter.
- **how cad tools construct it**: matrixgold `Prong Builder` / rhinogold `Prong Studio` generates tapered cylindrical/capsule solids with spherical top caps, placed relative to gem perimeter points and projected down to intersect the head/shank.
- **which scad primitive could express it**: tapered `cylinder(r1, r2, h)` or a `hull()` of two spheres (`sphere(r)`), oriented using `rotate()` and `translate()` around the stone center.
- **source url & cited metrics**:
  - center stone prong diameter: 0.8 mm to 1.2 mm minimum diameter for center stone settings ([gemvy semi-mount guide](https://gemvy.com/blog/semi-mount-ring-settings-a-complete-guide.html); [zuanfa buying guide](https://smartbuy.alibaba.com/buyingguides/zuanfa-jewelry)).
  - micro-pave prong diameter: 0.5 mm minimum diameter with a height of 0.65 mm above girdle ([ganoksin orchid / cadsmithing](https://orchid.ganoksin.com/t/basic-guidelines-for-jewelry-design/42291)).
  - bench setting extension length: add +1.0 mm prong length extending above the girdle for 2–4 mm center stones to allow setter bending and trimming ([ganoksin orchid / cadsmithing](https://orchid.ganoksin.com/t/basic-guidelines-for-jewelry-design/42291)).
  - absolute minimum prong thickness: no prongs thinner than 0.5 mm ([ganoksin orchid / cadsmithing](https://orchid.ganoksin.com/t/basic-guidelines-for-jewelry-design/42291)).

### 5. bezel settings & lip geometry
- **what it is**: a continuous metal collar surrounding the gemstone girdle, whose top lip is burnished down over the crown facets to encapsulate the stone.
- **how cad tools construct it**: matrixgold / rhinogold `Bezel Studio` / freecad extracts the girdle outline, offsets it outward by the wall thickness, extrudes vertically, and subtracts an interior stone seat and culet hole.
- **which scad primitive could express it**: `difference()` between an outer extruded shape (`linear_extrude()` of 2d `offset()`) and an inner subtracted cone/cylinder seat cutter.
- **source url & cited metrics**:
  - bezel wall thickness: 0.5 mm to 1.0 mm ([tashvi bezel cad guide](https://tashvi.ai/blog/step-by-step-bezel-setting-cad-tutorial)).
  - bezel lip extension height: lip extends 0.3 mm to 0.5 mm above girdle edge for burnishing over crown ([tashvi bezel cad guide](https://tashvi.ai/blog/step-by-step-bezel-setting-cad-tutorial)).
  - cabochon bezel wall height: finished wall height >= 33% (1/3) of total stone height; heights below 25% risk stone dislodgement ([tashvi bezel cad guide](https://tashvi.ai/blog/step-by-step-bezel-setting-cad-tutorial)).
  - stone diameter tolerance sensitivity: bezel settings require stone diameter fit within 5% variation (compared to 10–20% for prong settings) ([tashvi bezel cad guide](https://tashvi.ai/blog/step-by-step-bezel-setting-cad-tutorial)).

### 6. channel settings
- **what it is**: a continuous metallic channel/groove holding a row of stones edge-to-edge without individual prongs between them.
- **how cad tools construct it**: matrixgold / rhino `Channel Cutter` extrudes a channel profile along a rail and boolean-subtracts grooved seats using 70° bearing bur geometry.
- **which scad primitive could express it**: `difference()` subtracting a continuous 70° cutter extrusion or a linear array of revolved seat cutters from parallel extruded channel walls.
- **source url & cited metrics**:
  - channel width: 90% to 95% of gemstone diameter ([tom weishaar / ganoksin channel setting](https://www.ganoksin.com/article/channel-setting-round-diamonds/)).
  - channel depth: 75% to 100% of stone total depth ([tom weishaar / ganoksin channel setting](https://www.ganoksin.com/article/channel-setting-round-diamonds/)).
  - stone table depth: stones <= 3.0 mm set table flush with metal surface; stones > 3.0 mm set table slightly above metal surface ([tom weishaar / ganoksin channel setting](https://www.ganoksin.com/article/channel-setting-round-diamonds/)).
  - inter-stone clearance gap: 0.1 mm gap (thickness of two paper sheets) between adjacent stones to prevent girdle overlapping and chipping during setting ([tom weishaar / ganoksin channel setting](https://www.ganoksin.com/article/channel-setting-round-diamonds/)).

### 7. azures & light holes (culet openings)
- **what it is**: tapered or faceted cutouts pierced through the underside of stone seats to let light reach transparent stones and facilitate bench cleaning/ultrasonic fluid flow.
- **how cad tools construct it**: matrixgold `Azure Cutter` / `Honeycomb Azure` projects conical, pyramid, or hexagonal cutters through the base plate beneath each stone center.
- **which scad primitive could express it**: `difference()` subtracting a cone `cylinder(r1, r2)` or polygonal pyramid `cylinder(r1, r2, $fn=6)` through the setting floor.
- **source url & cited metrics**:
  - minimum azure / drill hole diameter: 0.7 mm minimum diameter; narrow holes (e.g. 0.3 mm diameter x 3.0 mm depth) cause investment failure/breakage during casting resulting in voids ([ganoksin orchid / cadsmithing](https://orchid.ganoksin.com/t/basic-guidelines-for-jewelry-design/42291)).
  - inset engraving / lettering depth: 0.35 mm to 0.40 mm max depth ([ganoksin orchid / cadsmithing](https://orchid.ganoksin.com/t/basic-guidelines-for-jewelry-design/42291)).

### 8. milgrain & decorative beading
- **what it is**: a vintage decorative border composed of a close-packed linear array of tiny hemispherical/spherical metal beads along edges or seams.
- **how cad tools construct it**: rhinoartisan / matrixgold / rhino `Milgrain` tool distributes small spheres along a curve with fixed pitch/spacing, followed by boolean union with the main model.
- **which scad primitive could express it**: `union()` of `translate()` sphere primitives arrayed using a openscad `for()` loop along a 3d curve, with interpenetration to ensure manifold geometry.
- **source url & cited metrics**:
  - bead sphere diameter: 0.2 mm to 0.3 mm (up to 0.4 mm for bold vintage borders) ([tashvi bezel cad guide](https://tashvi.ai/blog/step-by-step-bezel-setting-cad-tutorial)).
  - bead pitch / overlap: spaced at pitch slightly less than sphere diameter (~0.05 mm overlap) to eliminate zero-thickness non-manifold edges during boolean union ([tashvi bezel cad guide](https://tashvi.ai/blog/step-by-step-bezel-setting-cad-tutorial)).

### 9. hollowing, weight reduction & scooping
- **what it is**: shelling or removing internal metal volume beneath signet heads, thick shanks, or heavy pendants to minimize precious metal mass, reduce thermal mass during casting, and prevent sink marks.
- **how cad tools construct it**: matrixgold 4.0 `Scoop Tool` / rhino `Shell` offsets internal surfaces inward by a target wall thickness, adding cylindrical escape/drain holes for uncured resin or investment removal.
- **which scad primitive could express it**: `difference()` subtracting an inner offset volume (`offset(delta=-wall_thickness)` in 2d or scaled csg shape in 3d), plus subtraction of cylindrical drain holes.
- **source url & cited metrics**:
  - general castable minimum wall thickness: 0.7 mm minimum for general casting ([ganoksin orchid / cadsmithing](https://orchid.ganoksin.com/t/basic-guidelines-for-jewelry-design/42291)).
  - hollowing shell wall thickness: 0.8 mm to 1.0 mm shell thickness for cast silver/gold patterns ([formlabs jewelry casting guide](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf)).
  - solid metal hollowing threshold: solid sections thicker than 10.0 mm must be hollowed ([formlabs jewelry casting guide](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf)).
  - drain / escape hole diameter: 1.5 mm to 2.0 mm minimum diameter for resin/slurry cleanout ([formlabs jewelry casting guide](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf)).

### 10. sizing bars & stretch marks
- **what it is**: a smooth, un-patterned, solid segment at the bottom (6 o'clock position) of an engagement ring or wedding band, specifically reserved for bench resizing (cutting, stretching, or soldering extra metal without ruining shoulder detailing or stone layouts).
- **how cad tools construct it**: matrixgold / rhino models a flat profile region at 6 o'clock interrupting eternity or textured patterns on the shank.
- **which scad primitive could express it**: csg conditional blending or `difference()` replacing patterned geometry with a solid rectangular/stadium cross-section along the bottom arc angles (-20° to +20° relative to 6 o'clock).
- **source url & cited metrics**:
  - post-polish minimum thickness at sizing bar: 1.8 mm minimum thickness ([engagement ring designs](https://www.reddit.com/r/EngagementRingDesigns/comments/1sn24pv/ring_measurements_concern/)).
  - sizing bar arc width: 3.0 mm to 5.0 mm minimum unpatterned section width along bottom arc ([westover jewelers eternity bands guide](https://www.westoverjewelers.com/eternity-bands-vs-anniversary-bands)).

### 11. production & casting shrinkage compensation
- **what it is**: global or feature-specific linear scale expansion applied to cad geometry before 3d printing and investment casting to ensure finished metal pieces match target dimensions after shrinkage and polishing.
- **how cad tools construct it**: global 3d `Scale` matrix transform applied prior to mesh export.
- **which scad primitive could express it**: `scale([s, s, s])` wrapping the top-level module.
- **source url & cited metrics**:
  - direct 3d print resin casting shrinkage scale: 2% to 3% linear scale-up ([tashvi bezel cad guide](https://tashvi.ai/blog/step-by-step-bezel-setting-cad-tutorial); [ganoksin orchid / cadsmithing](https://orchid.ganoksin.com/t/basic-guidelines-for-jewelry-design/42291)).
  - mold vulcanization + wax injection shrinkage scale: 5% to 8% cumulative scale-up ([tashvi bezel cad guide](https://tashvi.ai/blog/step-by-step-bezel-setting-cad-tutorial); [ganoksin orchid / cadsmithing](https://orchid.ganoksin.com/t/basic-guidelines-for-jewelry-design/42291)).

## conditions and caveats

- **phase 1 (band-class geometry) scope**: phase 1 generator support is strictly restricted to plain, single-surface band-class geometries (flat, comfort-fit, d-shape, knife-edge, signet, tapered shanks) with continuous rotational symmetry (`rotate_extrude()`) and optional flat sizing bar regions.
- **phase 2 & 3 reach features**:
  - *stone setting & head cutters*: conical seat cutters, prong clusters, gallery rails, and bezel walls are phase 2 features requiring multi-body csg `difference()` and exact stone asset bounding boxes.
  - *channel settings & azures*: multi-stone channel cuts and honeycomb azure drill patterns require csg repetition loops and spatial collision checks (phase 2.5).
  - *milgrain & filigree*: high-density sphere arrays (`for()` loops of 0.2–0.3 mm spheres) introduce significant openscad `$fn` facet count inflation and compilation overhead; they belong in phase 3 fine-detail embellishment modules.
  - *hollowing & shelling*: csg hollowing requires clean interior offset evaluations without self-intersecting faces; phase 1 models remain solid or single-lathe extruded.
- **validator discipline**: every numerical constraint enforced in `casting-tolerances.json` and the openscad generator must carry a citable production source url. any visual approximation parameter without a published manufacturing benchmark is explicitly tagged `viz-grade, calibrate before production` and blocked from production gating.

## sources

1. [ganoksin orchid forum: basic guidelines for jewelry design (thomas / cadsmithing)](https://orchid.ganoksin.com/t/basic-guidelines-for-jewelry-design/42291): retrieved 2026-09-11
2. [tashvi: step-by-step guide to creating a bezel setting in cad](https://tashvi.ai/blog/step-by-step-bezel-setting-cad-tutorial): retrieved 2026-09-11
3. [ganoksin learning center: cad modeling prong settings (charlie herner)](https://www.ganoksin.com/article/cad-modeling-prong-settings/): retrieved 2026-09-11
4. [ganoksin learning center: channel setting round diamonds (tom weishaar)](https://www.ganoksin.com/article/channel-setting-round-diamonds/): retrieved 2026-09-11
5. [formlabs: introduction to casting for 3d printed jewelry patterns](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf): retrieved 2026-09-11
6. [reddit r/EngagementRingDesigns: ring measurements concern & sizing bar thickness](https://www.reddit.com/r/EngagementRingDesigns/comments/1sn24pv/ring_measurements_concern/): retrieved 2026-09-11
7. [aide-memoire jewelry: how wide or thick should my ring be?](https://a-m.shop/blogs/news/9990381-how-wide-should-my-ring-be): retrieved 2026-09-11
8. [blue nile: choosing your ring band width guide](https://www.bluenile.com/blog/diamonds-jewelry/ring-band-width): retrieved 2026-09-11
9. [larson jewelers: ring width guide](https://www.larsonjewelers.com/pages/ring-width-guide): retrieved 2026-09-11
10. [gemvy: semi-mount engagement ring settings guide](https://gemvy.com/blog/semi-mount-ring-settings-a-complete-guide.html): retrieved 2026-09-11
11. [zuanfa jewelry: buying guide for claw settings](https://smartbuy.alibaba.com/buyingguides/zuanfa-jewelry): retrieved 2026-09-11
12. [westover jewelers: eternity bands vs. anniversary bands & sizing bars](https://www.westoverjewelers.com/eternity-bands-vs-anniversary-bands): retrieved 2026-09-11
