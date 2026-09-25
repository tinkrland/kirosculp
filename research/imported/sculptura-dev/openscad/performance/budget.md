# performance budget: measured openscad-wasm numbers

research: 2026-09-11 · measured in-sandbox (node v20.20.2, openscad-wasm 0.0.4, single thread) · companion: `../../preview/index.html` (the harness these numbers came from)

## thesis

for band-class geometry, the $fn preview/export split is empirically justified: preview at $fn 12–48 compiles in 12–53 ms in-browser; export at $fn 96–192 compiles in 108–458 ms. the expensive operation in this family is not the band: it is `difference()` csg against text/groove geometry (18.7 s for a fully engraved ring at $fn 40/100).

## the numbers

### plain band (rotate_extrude of a circular profile, 20mm inner ø, 7mm wide, 2.5mm thick)

| $fn | compile | stl bytes | note |
|---|---|---|---|
| 12 | 39 ms | 72,649 | |
| 24 | 12 ms | 339,175 | |
| 48 | 29 ms | 1,402,207 | |
| 96 | 108 ms | 5,849,651 | |
| 192 | 458 ms | 23,630,719 | |
| 384 | 1,670 ms | 94,971,693 | stl size grows superlinearly; cap ui at 256 |

method: fresh wasm instance per compile (see finding below), ascii stl output, measured 2026-09-11.

### full engraved ring (engravedring v1.2, cc by-sa: pattern reference only, no code lift)

18.7 s at authored settings ($fn 40 global / 100 on the revolve), 6.3 mb stl. the band component of the same model at $fn 96 costs ~100 ms: **the text() subtractions are ~99% of the cost**. engraving is a late-stage operation, never a preview-time one.

### the shipped preview presets (verbatim from preview/index.html, $fn 32)

| preset | compile | tris |
|---|---|---|
| flat band | 53 ms | 2,048 |
| comfort-fit band (offset profile) | 29 ms | 2,304 |
| engraved band (difference() groove channel) | 914 ms | 2,160 |

## conditions and caveats

- **instance reuse across renders ooms the wasm heap.** consecutive renders on one `createOpenSCAD()` instance crashed at modest $fn; a fresh instance per compile (~95 ms init) is stable. the preview engine ships with per-compile instantiation. if the production worker reuses instances for queue throughput, it must dispose/recreate between large jobs: this is the single most important operational finding of this pass.
- **fonts: the wasm build ships no fonts.** `text()` renders nothing (fontconfig errors at compile). engraving-style features in-browser must be font-free until a font pipeline exists (groove channels, or geometric glyph construction). the worker/cli path is unaffected: it runs system-font openscad.
- numbers are for band-class geometry only. bezels, prongs, and `hull()` sweeps are a different cost family: the usedbytes jewellery post (blog.usedbytes.com/2019/06/making-jewellery/, retrieved 2026-09-11) documents hull()-based helix geometry at >1 hour renders on the desktop cli, which bounds expectations for that family from above.

## how this enters the engine

- preview path: browser wasm at $fn ≤ 48, budget < 100 ms per interaction: met with 10× headroom on band geometry
- export path: worker cli at $fn 96–192, budget < 1 s for band-class: met
- the parameter-hash cache (AGENTS.md §4.3) makes every one of these numbers a one-time cost per unique parameter set
- $fn is a first-class stored parameter of every design, never a global: preview fn and export fn are separate fields on the design record, and the emitted .scad pins `$fn` at the top so the file is self-describing and byte-deterministic

## sources

1. own measurements, node v20.20.2 / openscad-wasm 0.0.4 in-sandbox, 2026-09-11 (primary evidence: scripts in preview-lab/, reproduced in this note's tables)
2. blog.usedbytes.com/2019/06/making-jewellery/ (retrieved 2026-09-11): firsthand report of >1h hull() renders and the low-$fn dev-cycle workflow; used as an upper-bound sanity check only
