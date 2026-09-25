# paracraft

the deterministic engine leg: it turns typed geometry into measurements, applies versioned manufacturing profiles, and returns structured findings. this is the seed of the `measure(geometry)` and `validate(geometry, profile)` halves of the paracraft api; the `compile(parameters)` half is the headless openscad worker specified in [studio/validation/server-release-gate.md](../studio/validation/server-release-gate.md).

run the tests: `npm test`. run all repo checks including these: `npm run validate`.

## the five ready measurements

each method comes from the research corpus ([research/synthesis/geometry-to-manufacturing.md](../research/synthesis/geometry-to-manufacturing.md)), and each maps to constraints with evidence lineage in [research/profiles/](../research/profiles/):

| measurement | method | profile constraints it can serve |
|---|---|---|
| mesh manifoldness | edge manifoldness plus winding consistency check | `ctr-mesh-001` |
| nested components | connected component analysis plus containment check | `ctr-nested-001` |
| clearance | pairwise distance between disconnected components, brute-force vertex-to-triangle | `ctr-clear-001` |
| wall thickness | ray cast along inward face normals, nearest hit whose own outward normal opposes the launch surface | `ctr-wall-001` |
| bounding box | vertex min/max | envelope limits (e.g. a future `ctr-size-*`) |

`measure(mesh)` also reports signed volume, component count, and degenerate faces, since the release gate requires them before a release record may exist.

## validate semantics

`validate(measurements, profile)` applies every constraint in a [versioned profile](../research/profiles/profile-001-lost-wax-silver-general.json) and returns one finding per constraint with `status`:

- `passed`: measured and within threshold
- `failed` / `warning` / `info`: violated at the constraint's severity (errors fail, warnings warn)
- `unmeasured`: outside the five-measurement scope, or the geometry yields no reliable value

overall status: `invalid` if anything failed, else `manual_review` if anything is unmeasured, else `warning` if anything warned, else `valid`. `passed` is true only for `valid` or `warning`. this encodes the release gate rule: a check that cannot be made reliably never produces `passed=true`.

## assumptions and limits, stated not hidden

- wall thickness needs a watertight, consistently wound mesh; on nested geometry the rays read the inner shell's own walls, but nested components are an error before wall thickness matters
- thickness is sampled at face centroids; finer tessellation refines the minimum
- clearance is brute-force o(vertices x faces) per component pair; a bounding volume hierarchy replaces it when production meshes demand it
- containment testing uses one oblique ray per candidate; highly non-convex containers may need a stronger point-in-mesh test before this leaves `drafted` status
- profiles cite evidence ids; [scripts/validate-research.mjs](../scripts/validate-research.mjs) enforces that those ids exist

## decoupling rule

tessa may depend on paracraft; paracraft never depends on tessa. this folder imports no agent structures and consumes only typed geometry and profile json, so it stays independently extractable and testable. see [buildplan/paracraft/README.md](../buildplan/paracraft/README.md).

## layout

```text
paracraft/
  measure/mesh.js          mesh representation, stl loaders, vector and intersection math
  measure/measurements.js  the five measurements plus volume, components, topology
  validate/validate.js     profile application, structured findings, release-gate semantics
  test/measure.test.js     known-answer tests on hand-built meshes
```
