# research gap matrix

**produced:** 2026-09-24
**phase:** 2: research gaps
**scope:** first vertical slice (ring + lost-wax + sterling silver)

---

## gap matrix

| # | concept | geometry concept exists | measurement exists | manufacturing threshold | process scope | material scope | research required | priority | status |
|---|---|---|---|---|---|---|---|---|---|
| 1 | wall thickness (solid) | yes | proposed (ray/sphere) | yes (0.6-0.8 mm ag, 3+ sources) | partial (lost-wax) | partial (ag, au) | expand sources | **1** | in progress |
| 2 | wall thickness (ring band) | yes | proposed (ray/sphere) | yes (1.0 mm, 2 sources) | partial (lost-wax) | partial (ag, au) | confirm wear vs casting | **2** | in progress |
| 3 | feature size (raised) | partial | proposed (local thickness) | yes (0.35 mm, 2 sources) | partial (lost-wax) | partial (ag, au) | finishing survival | **3** | in progress |
| 4 | engraving depth | partial | proposed (recess analysis) | yes (0.2-0.5 mm, 3 sources) | partial (lost-wax) | partial (ag, au) | draft angle, width | **4** | in progress |
| 5 | clearance (between parts) | yes | proposed (pairwise distance) | yes (0.3 mm, 1 source) | partial (lost-wax) | partial (ag, au) | more sources | **5** | in progress |
| 6 | hollow evacuation | yes | proposed (cavity detection) | yes (2+ holes, 1.5 mm, 1 source) | partial (lost-wax) | partial (ag, au) | more sources | **6** | in progress |
| 7 | casting shrinkage | N/A (profile param) | N/A | yes (1.5-2.1% ag, 2 sources) | partial (lost-wax) | partial (ag, au, pt) | manufacturer-specific | **7** | in progress |
| 8 | finishing erosion | N/A (profile param) | N/A | yes (0.05-0.15 mm, 1 source) | partial (lost-wax) | partial (ag) | more sources, au | **8** | in progress |
| 9 | max part dimensions | yes (bounding box) | trivial | yes (88×88×125 mm, 1 source) | partial (lost-wax) | partial (ag, au) | more manufacturers | **9** | in progress |
| 10 | nested parts | yes (component analysis) | proposed | yes (not supported, 1 source) | partial (lost-wax) | partial (ag, au) | confirm universality | **10** | in progress |
| 11 | polishing accessibility | partial | heuristic proposed | partial (qualitative, 1 source) | partial (lost-wax) | partial (ag) | quantitative data | **11** | not started |
| 12 | prong dimensions | partial | not started | yes (0.9-1.1 mm, 1 source) | partial (lost-wax) | partial (ag, au, pt) | more sources | **12** | not started |
| 13 | shank height | partial | not started | yes (1.5 mm min, 1 source) | partial (lost-wax) | unknown | more sources | **13** | not started |
| 14 | gallery bar cross-section | partial | not started | yes (0.9 mm, 1 source) | partial (lost-wax) | unknown | more sources | **14** | not started |
| 15 | thick section limit | no | not started | yes (4 mm review, 1 source) | partial (lost-wax) | unknown | more sources | **15** | not started |
| 16 | bezel wall thickness | partial | not started | yes (0.4-0.6 mm, 1 source) | partial (lost-wax) | unknown | more sources | **16** | not started |
| 17 | pavé spacing | partial | not started | yes (0.3 mm, 1 source) | partial (lost-wax) | unknown | more sources | **17** | not started |
| 18 | dimensional tolerance | yes (bounding box) | trivial | yes (±5%/±0.35 mm, 1 source) | partial (lost-wax) | partial (ag, au) | iso 8062 mapping | **18** | in progress |
| 19 | Overhang/support | no | not started | no | no | no | required | **19** | not started |
| 20 | surface finish (as-cast) | no | not started | partial (ra values, industrial) | partial (industrial) | no | jewelry-specific | **20** | not started |
| 21 | draft angle (engraving) | partial | not started | yes (7°, 1 source) | partial (lost-wax) | unknown | more sources | **21** | not started |
| 22 | undercuts | partial | not started | partial (qualitative) | partial (lost-wax) | unknown | quantitative | **22** | not started |
| 23 | sprue placement | no | N/A (manufacturing) | partial (qualitative) | partial (lost-wax) | unknown | not geometry | **23** | N/A |

---

## priority justification

**priority 1-6 (in progress):** these are the core constraints for the first vertical slice. a ring geometry can be validated against these. evidence exists from 2+ sources for most.

**priority 7-10 (in progress):** profile parameters and hard limits. needed for a complete manufacturing profile, but not geometry measurements per se.

**priority 11-18 (not started):** important for production readiness but not blocking the first vertical slice. each has only 1 source currently.

**priority 19-22 (not started):** overhang and surface finish are more relevant to direct metal additive manufacturing than lost-wax casting. undercuts and draft angles are relevant but lower urgency for a simple band ring.

**priority 23 (N/A):** sprue placement is a manufacturing process concern, not a geometric validation concern. sculptura should not validate sprue placement: that's the manufacturer's job.