# paracraft resources: what can be checked online

these are published sources worth mining for geometry rules, process limits, and reference models. none of them is a complete jewelry-castability dataset on its own: the point is to fetch from all sides and consolidate. every extracted number gets recorded with its source url and retrieval date, and stays `drafted` until cross-checked.

## pattern material and process documentation

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
