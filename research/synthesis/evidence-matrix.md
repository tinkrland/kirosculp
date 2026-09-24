# evidence matrix

**produced:** 2026-09-24
**scope:** first vertical slice (ring + lost-wax + sterling silver)

---

| concept | physical meaning | sources | scope | measurable from geometry | measurement method | constraint candidate | severity | confidence |
|---|---|---|---|---|---|---|---|---|
| wall thickness (solid) | Structural/manufacturing thickness | materialise, ecadcam, jfd, cooksongold, stuller (5 sources) | lost-wax, Ag/Au/precious | yes | sphere mis / ray casting | min ≥ 0.8 mm | warning | high |
| wall thickness (ring band) | wear durability | materialise (2 sources) | lost-wax, Ag/Au | yes | sphere mis | min ≥ 1.0 mm | warning | medium |
| wall thickness (small elements) | Claw/bezel structural integrity | cooksongold, stuller (2 sources) | lost-wax, precious metals | yes | sphere mis | min ≥ 0.5 mm | warning | medium |
| feature size (raised) | castable detail resolution | materialise, ecadcam (2 sources) | lost-wax, ag | partially | local thickness + segmentation | min ≥ 0.35 mm | warning | medium |
| engraving (raised text) | castable lettering | cooksongold, stuller (2 sources) | lost-wax, precious metals | partially | feature segmentation | 0.3/0.6/0.3 mm | warning | high |
| engraving (recessed text) | castable recessed detail | cooksongold, stuller, h&s, materialise (4 sources) | lost-wax, precious metals | partially | recess depth analysis | 0.3/0.5/0.3 mm, 2:1 ratio | warning | high |
| hole diameter | opening castability | cooksongold, stuller (2 sources) | lost-wax, precious metals | yes | cross-section analysis | min ≥ 0.5 mm | warning | medium |
| clearance | part fusion prevention | materialise (1 source) | lost-wax, Ag/Au | yes | pairwise distance | min ≥ 0.3 mm | warning | medium |
| hollow evacuation | Wax/resin removal | materialise (1 source) | lost-wax, Ag/Au | yes | cavity + hole detection | 2+ holes, ≥ 1.5 mm | error | high |
| hollow support | manufacturer capability | materialise (yes), cooksongold (no) | lost-wax | N/A | profile flag | manufacturer-specific | Error/Info | high |
| nested components | process limitation | materialise, cooksongold (2 sources) | lost-wax, Ag/Au | yes | component containment | not supported | error | high |
| max dimensions | build envelope | materialise, cooksongold (2 sources) | lost-wax, Ag/Au | yes | bounding box | manufacturer-specific | error | high |
| edge sharpness | print quality | cooksongold (1 source) | lost-wax, precious metals | partially | dihedral angle | min 0.30 mm fillet | warning | low |
| mesh manifoldness | printability | cooksongold, stuller (2 sources) | all processes | yes | Edge/normal check | required | error | high |
| casting shrinkage | dimensional compensation | ecadcam, jewelcad (2 sources) | lost-wax, ag | no (profile param) | N/A | 1.5-2.1% scale | info | medium |
| finishing erosion | material removal | materialise, stuller (2 sources) | lost-wax, ag | no (profile param) | N/A | 0.05-0.2 mm | info | high |
| polishing accessibility | surface reachability | materialise (1 source) | lost-wax, ag | partially (heuristic) | accessibility analysis | warning only | info | low |
| prong parameters | stone setting integrity | stuller, ecadcam (2 sources) | lost-wax, precious metals | partially | feature measurement | 0.45-1.1 mm | warning | medium |
| stone clearance | stone-to-rail gap | stuller (1 source) | lost-wax, precious metals | yes (if stone known) | distance measurement | min 0.5 mm | warning | medium |
| dimensional tolerance | accuracy expectation | materialise, bessercast (2 sources) | lost-wax / industrial | yes (bounding box) | trivial | ±5%/±0.35 mm | info | medium |
| max solid thickness | shrinkage void prevention | saqlain, jfd (2 sources) | lost-wax | yes | local thickness | review > 4 mm | warning | low |
| mesh thickness measurement | algorithm | meshinspector, inui 2016 (2 sources) | N/A (algorithm) | N/A | ray / sphere / distance field | N/A | N/A | high |

---

## source count summary

| sources | concepts |
|---|---|
| 5+ sources | wall thickness (solid) |
| 4 sources | engraving (recessed) |
| 3 sources | wall thickness (ring band), feature size |
| 2 sources | wall thickness (small elements), engraving (raised), hole diameter, hollow support, nested components, max dimensions, mesh manifoldness, casting shrinkage, finishing erosion, prong parameters, dimensional tolerance, max solid thickness, mesh measurement |
| 1 source | clearance, hollow evacuation, edge sharpness, polishing accessibility, stone clearance |

---

## confidence summary

| confidence | concepts |
|---|---|
| **high** | wall thickness (solid), engraving (raised), engraving (recessed), hollow evacuation, hollow support, nested components, max dimensions, mesh manifoldness, finishing erosion, mesh measurement |
| **medium** | wall thickness (ring band), wall thickness (small elements), feature size, hole diameter, clearance, casting shrinkage, prong parameters, stone clearance, dimensional tolerance |
| **low** | edge sharpness, polishing accessibility, max solid thickness |