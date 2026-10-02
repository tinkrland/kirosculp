# openscad engine landscape 2024–2026 for sculptura parametric jewelry engine

research: 2026-09-11 · source: https://github.com/CadQuery/cadquery, https://github.com/CadQuery/cadquery`, https://github.com/elalish/manifold (+19 more) · status: cited

## thesis
sculptura relies on a dual-path compilation pipeline: in-browser rendering via `openscad-wasm` (emscripten webassembly) and asynchronous backend rendering via native openscad cli workers. achieving byte-identical determinism and golden-file regression testing across both paths requires navigating a major shift in openscad's core architecture between 2021 and 2026: the transition from cgal's exact nef polyhedra to the manifold fast mesh boolean engine. because the current npm package `openscad-wasm@0.0.4` is built from a 2022 openscad snapshot lacking manifold, browser and cli compile paths currently evaluate csg models on different geometry backends, producing different vertex topologies, face orderings, and floating-point representations.

## the landscape: releases, backends, and per-item

### 1. openscad stable release 2021.01
* **version**: `2021.01` [source [1](https://openscad.org/downloads.html)]
* **date**: `2021-01-31` [source [1](https://openscad.org/downloads.html), [3](https://github.com/openscad/openscad/releases)]
* **what changed**: `2021.01` remains the official tagged stable release on `openscad.org`. it relies exclusively on the cgal (computational geometry algorithms library) nef polyhedra kernel for 3d csg boolean operations.
* **why it matters for our two compile paths**: while `2021.01` is widely available in linux distribution packages, its cgal rendering pipeline suffers from single-threaded performance bottlenecks and high memory consumption. complex parametric jewelry models (such as filleted bands, voronoi structures, or dense pavé gemstone settings) can take minutes or hours to compile under `2021.01`.
* **source**: `https://openscad.org/downloads.html` [1]

### 2. openscad development snapshots (2022–2026)
* **version**: nightly development snapshots (e.g., `2022.02.18` [source [7](https://github.com/openscad/openscad-wasm/releases)], `2024.11.14` [source [2](https://openscad.org/downloads.html#snapshots)], `2026.05.31` [source [2](https://openscad.org/downloads.html#snapshots)])
* **date**: `2022-02-18` through `2026-05-31` [source [2](https://openscad.org/downloads.html#snapshots), [7](https://github.com/openscad/openscad-wasm/releases)]
* **what changed**: due to the long gap following `2021.01`, the openscad user community, production cad pipelines, and 3d printer platforms adopted development snapshots as the de facto standard. snapshots introduced fast-csg, the manifold backend integration, 3mf export, upgraded text/font rendering, and improved multi-core scaling.
* **why it matters for our two compile paths**: cli worker nodes running modern snapshots execute csg operations orders of magnitude faster than `2021.01`. however, because snapshot builds are continuously compiled from `master`, golden-file testing requires strict pinning to exact commit hashes or snapshot dates.
* **source**: `https://openscad.org/downloads.html#snapshots` [2]

### 3. the manifold geometry backend integration
* **version**: pr `#4480` / issue `#4825` [source [4](https://github.com/openscad/openscad/issues/4825)], non-experimental status on `2024.09.28` [source [5](https://lists.openscad.org/empathy/thread/D6KV3ZLXHLBHSITSQ5GPUZUKHURU4ABE)]
* **date**: merged `2023-03-03` [source [4](https://github.com/openscad/openscad/issues/4825)], non-experimental `2024-09-28` [source [5](https://lists.openscad.org/empathy/thread/D6KV3ZLXHLBHSITSQ5GPUZUKHURU4ABE)]
* **what changed**: openscad integrated emmett lalish's c++ header-only `Manifold` mesh boolean library (`https://github.com/elalish/manifold`). manifold replaces cgal's exact arbitrary-precision rational arithmetic with lock-free, multi-threaded double-precision floating-point mesh booleans using exact geometric predicates and symbolic perturbations.
  * **speed**: 10x to 1000x rendering speedup compared to cgal (e.g., complex boolean rendering reduced from 1.3 minutes to 3.6 seconds).
  * **memory**: drastically reduced memory footprint and elimination of cgal out-of-memory crashes on dense meshes.
  * **output format**: guarantees 2-manifold watertight meshes upon export.
  * **default status**: promoted from experimental (`--enable=manifold`) to non-experimental on `2024-09-28` [source [5](https://lists.openscad.org/empathy/thread/D6KV3ZLXHLBHSITSQ5GPUZUKHURU4ABE)], becoming the default 3d csg engine in 2025/2026 development builds.
* **why it matters for our two compile paths**: essential for cli worker throughput. however, manifold produces different vertex coordinates, facet triangulations, and mesh connectivity compared to cgal.
* **source**: `https://github.com/openscad/openscad/issues/4825` [4] & `https://lists.openscad.org/empathy/thread/D6KV3ZLXHLBHSITSQ5GPUZUKHURU4ABE` [5]

### 4. openscad-wasm (npm package version 0.0.4)
* **version**: `0.0.4` [source [6](https://www.npmjs.com/package/openscad-wasm)]
* **date**: published `2022-07-18` (last cataloged `2025-07-18`) [source [6](https://www.npmjs.com/package/openscad-wasm)]
* **what changed**: `openscad-wasm` is an emscripten webassembly port compiled from the `openscad/openscad-wasm` repository [source [7](https://github.com/openscad/openscad-wasm/releases)]. version `0.0.4` wraps openscad snapshot `2022.02.18` [source [7](https://github.com/openscad/openscad-wasm/releases)].
* **why it matters for our two compile paths**: `openscad-wasm@0.0.4` is stagnant and unmaintained. because it predates the march 2023 manifold merge [source [4](https://github.com/openscad/openscad/issues/4825)], it relies entirely on the legacy cgal backend running in a 32-bit wasm heap limit (2gb, 4gb). as a result:
  1. browser compilation of complex jewelry models is slow and memory-constrained.
  2. browser wasm output (cgal) and cli worker output (manifold) diverge structurally, making cross-path byte-level golden file validation impossible under `openscad-wasm@0.0.4`.
* **source**: `https://www.npmjs.com/package/openscad-wasm` [6] & `https://github.com/openscad/openscad-wasm/releases` [7]

### 5. next openscad release roadmap (2026.0x release candidate)
* **version**: `2026.0X` release candidate (issue `#6410` / "next openscad release" milestone) [source [8](https://github.com/openscad/openscad/issues/6410)]
* **date**: active tracking through `2025-12-26` to `2026-06-06` [source [8](https://github.com/openscad/openscad/issues/6410)]
* **what changed**: maintainers are finalizing the first formal stable release tag since `2021.01`. this release stabilizes manifold as the primary csg engine, updates Qt/QScintilla dependencies, and modernizes 3MF/STL export options.
* **why it matters for our two compile paths**: once `2026.0X` is tagged, sculptura should pin both the native cli workers and a custom wasm emscripten build to this exact release tag to establish engine parity.
* **source**: `https://github.com/openscad/openscad/issues/6410` [8]

### 6. scad-adjacent kernels & alternative engines
* **libfive**: functional representation (f-rep) kernel created by matthew keeter (`https://github.com/libfive/libfive`) [source [9](https://github.com/libfive/libfive)]. uses interval arithmetic and dual contouring to render implicit surfaces directly on CPU/GPU without boundary representation (b-rep) or csg mesh boolean failures. guarantees watertight geometry at arbitrary resolution.
* **manifold core library**: standalone c++ mesh boolean library created by emmett lalish (`https://github.com/elalish/manifold`) [source [10](https://github.com/elalish/manifold)]. in addition to openscad, manifold was integrated into blender 4.x/5.x as the fast mesh boolean core.
* **cadquery / opencascade**: python-based code-cad framework (`https://github.com/CadQuery/cadquery`) [source [11](https://github.com/CadQuery/cadquery)] built on the opencascade technology (occt) b-rep kernel. supports exact STEP/IGES cad export with nurbs surfaces and analytical fillets/chamfers, ideal for industrial manufacturing.
* **why it matters for our two compile paths**: while libfive (f-rep) and cadquery (b-rep) represent alternative modeling paradigms, openscad's csg language remains sculptura's primary model definition format.

## conditions and caveats

1. **golden files are per-engine-version and per-backend**:
   * **cgal vs. manifold mismatch**: cgal constructs exact rational polyhedra and converts them to floating-point meshes upon file export. manifold performs operations on double-precision indexed triangle meshes. the same `.scad` script compiled under cgal vs. manifold produces non-identical vertex floating-point values, differing face counts, and distinct triangulation topology.
   * **multi-threaded non-determinism in manifold**: manifold parallelizes boolean operations using openmp or tbb. unless deterministic post-processing or canonical vertex/triangle sorting is applied to exported STL/3MF files, multi-threaded execution across varying cpu core counts can permute face and vertex index ordering.
   * **wasm vs. native floating-point variations**: emscripten wasm targets evaluate 32-bit/64-bit ieee 754 math within V8/JavaScript engines, which can introduce least-significant-bit discrepancies relative to native x86_64 cli binaries.
2. **harness rules for sculptura**:
   * never compare a wasm cgal output against a native manifold output expecting byte identity.
   * golden-file harnesses must maintain separate golden baselines for wasm (`openscad-wasm`) and native cli, or upgrade `openscad-wasm` to a custom webassembly build compiling openscad with the manifold backend (`--enable=manifold`).

## sources
1. openscad downloads page (stable release 2021.01): `https://openscad.org/downloads.html` (retrieved 2026-09-11)
2. openscad development snapshots: `https://openscad.org/downloads.html#snapshots` (retrieved 2026-09-11)
3. openscad github releases: `https://github.com/openscad/openscad/releases` (retrieved 2026-09-11)
4. openscad github issue #4825 (make manifold integration release ready): `https://github.com/openscad/openscad/issues/4825` (retrieved 2026-09-11)
5. openscad empathy archives (manifold non-experimental status 2024-09-28): `https://lists.openscad.org/empathy/thread/D6KV3ZLXHLBHSITSQ5GPUZUKHURU4ABE` (retrieved 2026-09-11)
6. npm openscad-wasm package details (v0.0.4): `https://www.npmjs.com/package/openscad-wasm` (retrieved 2026-09-11)
7. github openscad/openscad-wasm releases (wrapping openscad snapshot 2022.02.18): `https://github.com/openscad/openscad-wasm/releases` (retrieved 2026-09-11)
8. openscad github issue #6410 (cut 2026.0x release candidate): `https://github.com/openscad/openscad/issues/6410` (retrieved 2026-09-11)
9. libfive solid modeling kernel repository: `https://github.com/libfive/libfive` (retrieved 2026-09-11)
10. manifold c++ mesh boolean library repository: `https://github.com/elalish/manifold` (retrieved 2026-09-11)
11. cadquery code-cad framework repository: `https://github.com/CadQuery/cadquery` (retrieved 2026-09-11)
