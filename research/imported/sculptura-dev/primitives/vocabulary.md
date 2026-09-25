# parameter vocabulary: seeded from the sculptura studio

research: 2026-09-11 · source: kqrla/sculptura @ 43fc6d7 (`src/lib/jewelryDefaults.js`, `src/components/canvas/RingControls.jsx`, `src/components/canvas/RingViewport.jsx`) · status: cited (product-design decisions, owner-authored)

## finding

the marketplace app already contains the full design-space taxonomy that phase 3.4 was scoped to define: not as research, but as a working studio's parameter model. it should seed `vocabulary.md` directly rather than being re-derived. this is a different evidence class than casting research: these are **product design decisions authored by the owner**, cited to the repo commit. the citation rule still applies (every enum and default below traces to `jewelryDefaults.js`), but no external source is needed for *what the options are*: only for *what physics allows*.

**the line that matters:** this file defines the option space. it does **not** define constraint values. slider ranges like wall thickness 0.8–4.0 mm are ui affordances, not castability bounds: the validator still enforces cited per-material minimums from `casting-tolerances.json`, and a value legal in the studio ui may still fail the build.

## the taxonomy (as shipped in the studio)

**types:** ring, pendant, bracelet, earring, piercing, chain, keychain

**materials** (with studio render properties): sterling silver, 18k yellow gold, rose gold, brass, oxidized silver, copper · **finishes:** polished, brushed, hammered, matte, satin (each with a roughness value: visual only, never a manufacturing spec)

**ring profiles (11):** flat, comfort, knife-edge, barrel, signet, wave, twist, split, open, tapered, bypass: each with profile-specific params already modeled: `openGap` (open/bypass), `taperRatio` (tapered), `twistTurns` (twist), `waveCycles` + `waveAmplitude` (wave), `signetWidth` + `signetHeight` (signet). shared: `innerRadius` (mm), `bandWidth` (mm), `thickness` (mm)

**earring categories (8):** stud, hoop, drop, climber, cuff, wrap, threader, crawler: each with its shape list, and critically **a validity table of backing mechanisms per category**: studs take butterfly / disc-back / screw-back / push-fit / la-pousette / clip-on; hoops take huggie-snap / click-ring / wire-hook / latch-back / continuous; drops take french-wire / lever-back / omega / wire-hook / clip-on; cuffs, wraps, and threaders take none. params include `postDiameter` (0.8 mm default), `dropLength`, `hoopDiameter`, `climbLength`, `cuffOpening`

**pendant:** 12 shapes, 8 bail styles · **bracelet:** 6 styles, 12 clasp types · **chain:** 10 styles, 8 clasps · **keychain:** 6 ring styles

**stones:** settings (prong, bezel, channel, flush, pave, tension, illusion), shapes (round, oval, square, marquise, trillion, heart, pear, baguette), gems (8), `sizeMm`, `count`, `placementAngle`

## studio ↔ engine mapping (the continuity points)

| studio concept | engine concept |
|---|---|
| `segments` slider (16–128, default 64, drives `LatheGeometry` smoothness) | `$fn`: same role, and the preview/export split maps onto it directly: studio preview ≈ low $fn, export = high $fn |
| `innerRadius` (mm) + us size selector | `ring_size_mm`: sizing-tables.json must carry the cited us→mm table (studio ships us 4 = 14.8 … us 12 = 21.4 mm; needs one citable source before it reaches the validator) |
| `RingViewport` three.js `LatheGeometry` | visual only: never manufacturing geometry. the paracraft engine's compiled geometry becomes the single source of truth; the viewport will display *engine output*, replacing its hand-built lathe |
| `MATERIALS` color/roughness/metalness | render properties, carried into the studio viewer; alloy identity for casting comes from the cited alloy table, not from a color hex |
| `DEFAULT_JEWELRY` object | the design-record schema seed: type-keyed parameter objects with units in mm |

## conditions and caveats

- the studio taxonomy includes shapes the engine will not support in v1 (twist, wave, split, bypass, chandelier): they stay in the vocabulary as named-but-unimplemented, so the design agent never proposes what cannot compile
- `patternDepth 0.3 mm` / engraving depths in the studio are unvalidated defaults; castable minimums come from cited research, and the validator is the arbiter
- piercing (labret, gauge, etc.) and chain/link geometries are out of scope for the first engine phases; vocabulary lists them so the taxonomy is complete from day one

## sources

1. kqrla/sculptura @ 43fc6d7, `src/lib/jewelryDefaults.js`: full taxonomy and default parameter state (retrieved 2026-09-11)
2. kqrla/sculptura @ 43fc6d7, `src/components/canvas/RingControls.jsx`: us sizing selector, slider ranges, segments control
3. kqrla/sculptura @ 43fc6d7, `src/components/canvas/RingViewport.jsx`: lathegeometry render path, mm→scene-unit conversion
