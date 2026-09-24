# paracraft resources: what can be checked online

these are published sources worth mining for geometry rules, process limits, and reference models. none of them is a complete jewelry-castability dataset on its own: the point is to fetch from all sides and consolidate. every extracted number gets recorded with its source url and retrieval date, and stays `drafted` until cross-checked.

## pattern material and process documentation

harvested on 2026-09-23 (machine-extracted tables in the [rule digest](rule-digest.md)):

- [morris and watson: cad design guidelines for casting](https://morrisandwatson.com/casting/cad-design-guidelines): a working casting house's published cad rules: 0.125 mm minimum edge/corner radii, holes wider than 0.20 mm with depth no more than the opening, 0.20 mm minimum gaps between non-touching components, watertight models. notably publishes no numeric wall thickness.
- [cooksongold: design tips for precious metal casting](https://www.cooksongold.com/blog/learn/top-design-tips-for-our-precious-metal-casting-service): 0.8 mm external walls, 0.5 mm small elements (claws, bezels), 0.3 mm/0.6 mm raised-text rules, 30 x 50 x 70 mm processing envelope, no hollow or interlocking pieces, roughly 0.1 mm removed by polishing, and they apply shrinkage scaling themselves.
- [sculpteo: sterling silver casting page](https://www.sculpteo.com/en/materials/metal-casting-material/silver-material/): 0.8 mm minimum walls (1 mm unsupported or stemmed), 0.4 mm minimum detail, 0.3 mm minimum clearances for wax drain, 2.4 x 2.4 x 0.8 mm minimum object, 125 x 125 x 100 mm maximum, up to 2% raw / 3% polished shrinkage, no hollowing, no interlocking, no assembly.
- [hi3dp: sla design guidelines](https://hi3dp.com/blog/design-guidelines-for-sla-printed-parts): generic sla reference (not casting-specific): 25-50 µm layers, 0.8 mm minimum walls, 0.5-1 mm features, 1-2% post-cure shrinkage, orientation and drain-hole practice.
- [openscad manual: stl import and export](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/STL_Import_and_Export): import formats, manifold requirements, $fn/$fa/$fs behavior, and the failure modes of unclean meshes. notes the export side is not covered there.
- [openscad manual: customizer](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Customizer): parameterization constraints relevant to the control schema: supported value types, the expression prohibition, and drop-down/slider annotations.
- [openscad downloads and versions](https://openscad.org/downloads.html): stable 2021.01 artifacts with sha256/sha512 checksums, gpg signatures, and official docker images (2021.01 on debian buster) for the pinned build worker.

earlier entries:

- [formlabs: introduction to casting for 3d printed jewelry patterns](https://formlabs.com/white-papers/introduction-to-casting-for-3d-printed-jewelry-patterns/): the strongest single document found so far. concrete guidance includes shelling parts thicker than 3 mm, drain holes for hollow interiors, and 0.7 mm minimum walls for hollow shells printed in castable wax resin. covers the full workflow: pattern printing, post-cure (noting under 1% post-cure shrinkage), sprue tree assembly, burnout, and casting equipment.
- [formlabs: using castable wax 40 resin](https://formlabs.com/support/Using-Castable-Wax-40-Resin/): prints at 25 and 50 micron layer heights, targeted at heavy signet and class rings, pendants and medallions, and custom bridal. compatible with leading gypsum investments and clean burnout across a wide range of workflows. the safety and technical data sheets linked from that page carry the material-level specifics.
- [formlabs: true cast resin](https://formlabs.com/blog/announcing-true-cast-resin/) and the [castable resin lineup](https://formlabs.com/products/materials/): multiple castable materials with different geometry limits (one resin documented for intricate casting up to about 5 mm thick). a good example of why rules must be bound to the specific pattern material, not to "resin" generically.
- [sculpteo: metal casting service](https://www.sculpteo.com/en/materials/metal-casting-material/) and their [bronze page](https://www.sculpteo.com/en/materials/metal-casting-material/bronze-material/): per-material design guidelines. the bronze page lists a 0.8 mm minimum wall thickness (1 mm for stemmed elements and particular design aspects), a 125 x 125 x 100 mm build envelope, 25 µm layers, and an accuracy note of up to 0.8 mm. their silver and other metal pages need the same treatment.

## what to extract from each source

for every (alloy, pattern process) pair, record: minimum wall thickness, minimum feature and wire thickness, minimum hole and engraved detail size, maximum and minimum build volume, per-axis and per-volume shrinkage compensation, required drain holes and shelling thresholds, supported investment types, burnout schedule requirements, surface finish effects, and tolerance guarantees. where a source gives a range rather than a number, record the range and the condition, not a flattened average.

## openscad and geometry-side references

- [openscad documentation](https://openscad.org/documentation.html): language, csg operations, and the `text()`, `import`, and export behaviors that paracraft templates rely on. pin a specific version.
- [openscad cheat sheet](https://openscad.org/cheatsheet/index.html): quick syntax reference for template authoring.
- parametric jewelry and parametric design collections on thingiverse, printables, and github: useful as inspiration for control decompositions, but none of these models is production-validated. treat them as control-scheme references only, never as rule sources.
- mesh analysis libraries (trimesh, manifold): candidates for the server-side measurement of watertightness, signed volume, wall proximity, and mass estimation. the studio release gate owns that step; paracraft feeds it exact geometry.

## alloy data

- published alloy density and melting-range tables for sterling silver, 14k/18k gold variants, brass, and bronze: needed for mass estimates and shrinkage compensation. prefer supplier or standards body data over aggregator sites, and date-stamp each value.
- the [manufacturing materials research](../../manufacturing/materials-supported/README.md) and [tasks](../../manufacturing/tasks/find-manufacturers.md) hold the sculpteo/shapeways verification work already started there; keep rule values consolidated here and referenced there rather than duplicated.

## known gaps

nothing online reliably gives: per-alloy casting shrinkage factors used by a real casting house, tolerance behavior across ring-size families, minimum castable wall thickness per alloy independent of the pattern material vendor, sprue placement rules, or failure-rate evidence for any of it. those move to [acquire.md](acquire.md) as custom questions.
