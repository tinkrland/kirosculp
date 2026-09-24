# agents.md

rules for any human or coding agent building the sculptura model engine and virtual studio.

this file is the contract. the research that must precede it is in [research.md](research.md), the product surface lives at `/productstudio`, the feature list in [features.md](features.md), the architecture notes in [underthehood.md](underthehood.md), and the future plan in [roadmap.md](roadmap.md).

the backend runs on xano. the creator never touches the engine directly: they talk to a design agent, and that agent turns the parameters that drive the engine. see section 5 of research.md.

read all of this before writing code.

---

## 1. what you are building

two systems that share one data model.

```text
sculptura
├── the model engine   (parametric jewelry geometry, openscad source of truth)
└── the virtual studio (3d scene system for product photography)
```

the model engine turns creator-facing parameters into manufacturable jewelry geometry.
the virtual studio takes that geometry and renders it on a configurable hand model.

the same jewelry object flows through both. do not build two representations of a piece.

---

## 2. prior art you must read first

we are already running this pattern in a sibling project.

- repository: <https://github.com/kqrla/keeberia>
- read `AGENTS.md`, `README.md`, `scope/product.md`, `scope/vision.md`
- read `backend/engines/cad/` in full, especially:
  - `research/notes/generative-openscad.md`
  - `research/notes/prior-art-deep-dive-paracraft-upgrade.md`
  - `research/notes/prior-art-round-3-kle-and-scad-keyboards.md`
  - `stack/tradeoffs.md`
  - `research/reference/genkeyboard/*.scad`

keeberia's cad engine is named **paracraft**. it takes a visual project model, emits readable parametric openscad, and compiles that to manufacturable output. it is deterministic. there is no model inference anywhere in the geometry path.

sculptura's engine is **paracraft extended to jewelry**. same architecture, different domain primitives. keyboards become rings, plates become bands, screw bosses become bezels and prongs.

do not reinvent the architecture. port it, then specialize it.

---

## 3. core principle

there is one canonical design model. every representation derives from it.

```text
design model
├── type            (ring, earring, bracelet, brooch, pendant, other)
├── parameters      (dimensions, band profile, stone settings, engraving)
├── sizing variants (unisize, s/m/l, us ring sizes, custom)
├── metals offered  (multi-select, buyer picks at checkout)
├── openscad source (generated, readable, editable)
├── mesh            (compiled, for viewer + studio)
└── manufacturing   (castability report, wall thickness, mass estimate)
```

if a parameter changes, every downstream representation must be derivable again. never let a hand-edited mesh become the source of truth.

**openscad is canonical. stl is an export.**

---

## 4. engine rules

### 4.1 generated scad must be readable

a creator who opens the generated `.scad` should be able to understand and edit it. meaningful parameter names at the top of the file, one module per feature, comments that explain the intent.

```text
ring_size_us, band_width_mm, band_thickness_mm, profile,
bezel_height_mm, stone_diameter_mm, prong_count, engraving_depth_mm
```

no minified output. no thousand-line monolithic difference trees.

### 4.2 domain primitives are data, not code

a `setting`, a `bail`, a `clasp`, a `prong` is a reusable definition with dimensions, clearances, and casting constraints attached. do not hardcode individual jewelry features across the ui. this is what later enables a community template library.

start from the existing local reference: `src/lib/jewelryTemplates.js`, `src/lib/jewelryDefaults.js`, `src/lib/multiPieceJewelry.js`, `src/lib/sizing.js` in the base44 export. treat these as the seed vocabulary, not the final schema.

### 4.3 determinism

same parameters in, byte-identical geometry out. cache on a hash of the parameter set. an agent may help a creator *choose* parameters. an agent must never sit between the parameters and the geometry.

### 4.4 manufacturing validation is part of the engine

every compile emits a castability report before the piece can be listed:

- minimum wall thickness against the manufacturer's lost wax tolerance
- unsupported floating geometry
- trapped volumes that cannot drain wax
- prong and bezel thickness against stone size
- estimated metal mass per offered metal, which feeds pricing

a design that fails validation can still be saved. it cannot be published.

### 4.5 pipeline

```text
parameters → scad generation → openscad compile → mesh
           → validation → mass + price estimate
           → studio scene → render
           → export (stl / 3mf) → manufacturer
```

each stage is a separate worker. follow keeberia's `backend/daemons/` pattern: independent workers with their own deploy config, talking over a queue, not one giant serverless function.

---

## 5. virtual studio rules

the studio is a 3d scene system. it is not image generation. if you find yourself calling an image model to produce the product shot, you have built the wrong thing.

scene structure:

```text
scene
├── hand model
│   ├── morphology parameters
│   ├── surface parameters
│   └── pose state
├── jewelry objects
│   ├── geometry
│   ├── transforms
│   └── attachment state
├── camera
├── lighting
└── environment
```

rules:

- the hand is one parameterized base mesh with blendshape or morph-target driven morphology. never ship a separate hand asset per skin tone or proportion combination.
- surface appearance is a separate material layer from topology.
- jewelry attaches to a named coordinate space on the rig (`finger_index_proximal`, `wrist`, `earlobe_left`). when the rig poses, the transform follows automatically.
- posing drives the rig. it does not repaint pixels.
- rendering is the final step and is reproducible from the saved scene state.
- a saved hand configuration is a reusable creator asset, like a preset.

---

## 6. tools available to you

use them for what they are good at. do not use an inference call where a deterministic function will do.

### browserbase

headless browser sessions. use for:

- pulling manufacturer portals and quote calculators that block plain http fetches
- capturing reference product photography for material and lighting calibration
- automated visual regression on the studio renderer: same scene state, same pixels
- end-to-end runs of the publish flow against a real preview

### firecrawl

structured scraping and crawling. use for:

- mapping and scraping openscad library documentation (bosl2, dotscad, and the jewelry-specific forks)
- extracting casting tolerance tables from manufacturer documentation into structured json
- gathering competitor sizing charts to validate `src/lib/sizing.js`
- `formats: ['json']` with an explicit schema when you need a spec table, `markdown` when you need prose

### tavily

research-grade search with citations. use for:

- lost wax casting literature, draft angles, sprue placement, shrinkage rates per alloy
- prior art on parametric jewelry cad before you design a new primitive
- gemstone setting standards and stone size to seat dimension tables

always cite the source in the research note you write. an uncited tolerance number is not allowed into the validator.

### inference

model calls. permitted only in these places:

- turning a creator's plain language description into a *candidate parameter set* that the creator then reviews
- writing and maintaining documentation
- classifying and tagging uploaded artifacts
- summarizing research gathered by tavily and firecrawl

forbidden in these places:

- generating geometry directly
- deciding castability
- computing price
- producing the final product render

### adaptionlabs.ai

creator adoption and onboarding instrumentation. use for:

- tracking where creators drop out of the publish and studio flows
- measuring which templates and presets convert to published artifacts
- feeding the analytics surfaced in the creator dashboard
- running onboarding experiments before we hardcode a default flow

instrument the funnel before you optimize it. do not guess where creators are getting stuck.

---

## 7. how to sequence the work

do these in order. each phase ends with something a creator can actually use.

**phase 1: port paracraft**

read the keeberia cad engine. write `backend/engines/paracraft-jewelry/README.md` describing what carries over unchanged, what needs domain replacement, and what does not apply. do not write engine code before this document exists.

**phase 2: research spine**

follow [research.md](research.md) in full. it is the study contract for this phase and it defines the two parallel tracks (jewelry domain, openscad), the citation rule, the xano backend questions, and the exact definition of done. do not start phase 3 until its checklist passes.

**phase 3: primitive vocabulary**

define bands, profiles, bezels, prongs, bails, clasps, posts, backs as data definitions with clearances. one schema file. no ui yet.

**phase 4: scad generator**

parameters in, readable scad out. golden-file tests: fixed parameter sets committed alongside their expected scad output. any diff is a deliberate review, not an accident.

**phase 5: compile and validate workers**

openscad compile worker plus the castability validator. wire the report into the publish flow so failures block listing.

**phase 6: studio scene**

hand base mesh with morph parameters, attachment coordinate spaces, camera and lighting state, deterministic render. browserbase visual regression from day one.

**phase 7: creator surface**

the editing ui, presets, saved hand configurations, and the render export. adaptionlabs instrumentation ships with it, not after it.

---

## 8. conventions

these are not stylistic suggestions. they are part of the product identity.

- all user-facing text and all markdown is lowercase, including proper nouns
- no emojis anywhere
- no em dashes anywhere
- lucide icons only
- descriptive multi-word names, no single-letter variables outside simple loops
- comments explain why a decision was made, not what the line does
- group files by feature or domain, not by file type
- keep documentation actionable. vague documentation is treated as a bug

---

## 9. what not to do

- do not make stl or any mesh format the canonical design representation
- do not put a model in the geometry, castability, pricing, or render path
- do not build a general purpose cad application. sculptura is an abstraction layer over parametric cad for one domain
- do not create a second copy of a piece's geometry for the studio
- do not hardcode a manufacturer. routing is configured in the admin panel
- do not ship a validator rule without a cited source
- do not add a slider before you know what parameter it drives in the scad
