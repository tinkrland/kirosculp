# paracraft benchmarks

benchmarks differ per metal and per pattern material: a rule that holds for bronze in a sculpteo casting run (0.8 mm walls, per their published page) does not automatically transfer to sterling silver, and formlabs' 0.7 mm hollow-shell guidance is a property of their castable wax resin patterns, not of any alloy. so paracraft cannot have one benchmark; it needs a small comparative suite, per (alloy, pattern process) pair, that makes rule changes measurable instead of vibes.

## what a benchmark run is

a benchmark run compiles a fixed, versioned set of parametric test pieces with paracraft, exports meshes, and evaluates them against a specific rule set version. everything is deterministic: the same paracraft version, openscad pin, test set, and rule set version must produce the same verdicts, and the run records all four hashes.

## the test set

start small and purposeful, each piece targeting one rule family:

- **wall ladder:** a series of bands stepping wall thickness across the plausible minimum, to locate each rule set's actual pass/fail boundary instead of its advertised one.
- **feature ladder:** wires, prong-like stubs, holes, and engraved text at descending sizes, to find minimum feature, hole, and engraving limits per alloy.
- **hollow shell:** a hollow pendant at several shell thicknesses with and without drain holes, to verify shelling and drain rules.
- **size family:** one ring profile across the full ring-size range, to expose how tolerance and proportion constraints move with size.
- **symbolic stress:** a claddagh-like motif and a double-heart base at production scale, since thin joined sections are where symbolic designs actually fail.
- **pathological cases:** disconnected components, trapped volumes, near-tangent unions: pieces that must fail, to prove the harness catches them rather than passing everything.

each test piece declares its expected verdict per rule set (pass, fail, or needs-manual-review) in a checked-in manifest. a rule set that produces unexpected verdicts on the pathological set is wrong, not the pieces.

## what a benchmark proves

- a new (alloy, process) rule set behaves consistently with its acquired sources before it becomes active.
- a rule change's blast radius is visible: exactly which test pieces flip verdicts, and by how much in millimeters.
- paracraft version changes don't silently alter geometry: the same parameters must hash to the same mesh across versions, or the change is documented as a geometry change with downstream release impact.
- claims like "0.8 mm walls for bronze" are anchored to a dated source and reproduced in the harness, not copied from a marketing page.

## what a benchmark does not prove

it does not prove a real casting succeeds. physical casting trials with a partner remain the final evidence; the harness's job is to catch predictable failures early and cheaply, and to keep rule sets honest between physical trials. it also does not benchmark price, lead time, or route eligibility, which belong to [manufacturing](../../manufacturing/README.md) and [operations](../../operations/README.md).

## on external benchmark partners

we assessed using an outside service for this. [adaptionlabs.ai](https://adaptionlabs.ai/) is an adaptive ai / adaptive-data company (continual-learning models, synthetic dataset generation). it is not a casting or manufacturing-measurement lab, and paracraft's benchmark is deterministic and self-hostable, so there is no clear role for it here today. if tessa later needs generated evaluation corpora for intent parsing, that is the point where a dataset partner would earn reconsideration, recorded in the [tessa leg](../tessa/README.md). the benchmark harness itself we build and own, alongside the [studio release gate](../studio/README.md) that consumes its verdicts.

## running the harness

### requirements

- docker desktop (or docker engine on linux) with access to `openscad/openscad:2021.01`
- node.js >= 18
- the repo checked out on the `bob` branch with `npm install` completed

### first run

```
npm run bench
```

the harness will:
1. verify docker is available and refuse with a clear error if it is not
2. pull `openscad/openscad:2021.01` if not already cached locally
3. compile each `benchmarks/*.scad` file to `benchmarks/stl/<family>.stl` using the pinned image
4. measure each stl using the five ready measurements in `paracraft/measure/measurements.js`
5. validate each measurement against `research/profiles/profile-001-lost-wax-silver-general.json`
6. compare each actual validation status against the expected verdicts in `benchmarks/manifest.json`
7. write `benchmarks/report.json` (deterministic, stable key order) and `benchmarks/report.md`
8. exit 0 if all verdicts match; exit 1 with a clear mismatch list if any do not

### re-running without recompile

if the stl files already exist (from a previous run with the pinned image), skip compilation:

```
npm run bench:no-compile
```

or directly:

```
node scripts/run-benchmarks.mjs --no-compile
```

note: `--no-compile` results are only valid when the stl files in `benchmarks/stl/` were produced by the pinned image. check `benchmarks/stl/provenance.json`.

### single-family run

```
node scripts/run-benchmarks.mjs --family wall-ladder
```

### reading the output

- `benchmarks/report.json` -- the machine-readable report. the `summary` field gives the top-level pass/fail. `families[].model_results[].results` gives per-model verdict comparison rows. `metadata` contains the provenance (image digest, library paths, manifest hash); it is separated from the result rows so the body remains deterministic across runs on different machines.
- `benchmarks/report.md` -- human-readable markdown summary of the same data.
- `benchmarks/stl/provenance.json` -- records the docker image digest and sha256 of each compiled stl.

### verdict matching

the manifest uses: `"fail"`, `"warning"`, `"needs-manual-review"`. the validator returns: `"invalid"`, `"warning"`, `"manual_review"`, `"valid"`. the harness maps these and applies one leniency rule: a manifest entry of `"warning"` is satisfied by an actual status of either `"warning"` or `"manual_review"`, because every family mesh contains unmeasured constraints that push the status to `manual_review` even when a wall warning is present.

### verdict mismatch means the rule set is wrong

per the benchmark spec: "a rule set that produces unexpected verdicts on the pathological set is wrong, not the pieces." if the harness reports a mismatch, do not edit the manifest to match the unexpected result. instead, investigate whether the rule set or the measurement has a bug.

### docker not available

if docker is not installed, the harness exits immediately with the exact `docker pull` command needed. the harness never fakes a pass and never skips the docker check unless `--no-compile` is passed explicitly.

**delivery note (batch 3):** docker was not available on the build machine when the harness was delivered. `npm run validate` and `npm test` (17/17) both pass without docker. the harness itself was delivered untested against the pinned image. to run a full end-to-end pass, install docker desktop, then run:

```
docker pull openscad/openscad:2021.01
npm run bench
```

the harness will compile all six scad families, measure and validate each stl, compare verdicts against the manifest, and exit 0 if all match. font verification for `feature-ladder.scad` (liberation sans under the pinned image) happens on that first run; see the font note below.

### toolchain pin

| component | pin |
|---|---|
| openscad docker image | `openscad/openscad:2021.01` |
| image digest | recorded at runtime in `benchmarks/stl/provenance.json` |
| measurement library | `paracraft/measure/measurements.js` (this repo) |
| validation library | `paracraft/validate/validate.js` (this repo) |

the harness refuses to run with any other image tag. the digest is not hardcoded in the harness because it varies by registry and pull time; it is observed and recorded at runtime as the authoritative pin for that run.

### font note (text sub-family)

`feature-ladder.scad` uses `text()` + `linear_extrude()` with font `"Liberation Sans"`. this font is bundled with the `openscad/openscad:2021.01` docker image. if the compile step produces a warning about a missing font, the harness will record it in the compile stderr tail and continue. check `families[family="feature-ladder"].compile.stderr_tail` in `benchmarks/report.json` after the first run to confirm whether `"Liberation Sans"` rendered successfully. if it failed, the fallback observed by the harness will be noted there; update `benchmarks/feature-ladder.scad` and this section with the verified font name.

