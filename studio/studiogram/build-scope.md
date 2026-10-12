# studiogram: standalone build scope

this is a single, self-contained specification for studiogram. it assumes the reader has no access to any repository and no prior context: everything needed to understand, evaluate, or begin scoping the work is in this file. studiogram is planned, not built; this document is the scope of record for its first pass.

provenance is tagged inline where it matters: (repo) means it comes from recovered internal guides and audited source snapshots, (ruling) means it comes from recorded owner decisions. items with no tag follow directly from the tagged material.

---

## 1. the context: what sculptura is

sculptura is a made-to-order jewelry platform where creators design pieces as deterministic 3d geometry, and buyers order those designs for physical manufacture. it is split into two systems that must never share a codebase or responsibilities:

- **the studio**, the creative engine: it turns creator intent into deterministic, manufacturable metal geometry.
- **the platform**, the offering system: it handles accounts, listings, storefronts, discovery, checkout, orders, shipping, and payouts.

the studio is for creation; the platform is for commerce. studiogram lives entirely on the studio side.

### the studio legs, in build order (ruling)

1. **paracraft**, the deterministic geometry compiler framework built on openscad. it takes typed parameter state and compiles it to a mesh, enforcing physical design rules: wall thickness, shrinkage, clearances, minimum features, process limits. same parameters, compiler version, and rule-set version in must produce the same geometry out. it is fully decoupled from everything above it and never imports from any agent or scene system.
2. **tessa**, the intent relay: she translates human intent into constrained parameter proposals that the creator reviews and approves. inference never generates geometry and never decides whether something is castable.
3. **the studio server**, which independently compiles the approved revision headlessly (server-side openscad), runs mesh analysis and physical rules, and is the only authority that may validate and issue a release.
4. **the console**, the creator's marketplace management surface.
5. **studiogram, last.** it cannot be built before the studio's project model and release flow are settled, because its only product input is that flow's output.

### the design release: the interface between the two systems (ruling)

the **design release** is a versioned, immutable bundle the studio server produces after isolated headless validation passes. it contains:

- openscad source
- the compiled mesh
- validation renders
- mass estimates
- validation evidence
- exact asset hashes

the release is the only thing the platform may consume, and the only thing that can authorize a listing, order, or manufacturing run. the studio owns it; the platform consumes it by reference. this same object is studiogram's only product input.

---

## 2. what studiogram is

studiogram is the virtual product photography studio: it photographs jewelry before the piece physically exists. (repo)

a creator finishes a design, and the exact compiled 3d artifact that will be sent for manufacturing is placed on a configurable hand, posed, lit, and photographed. no sample, no model, no camera, no shoot. because the photograph is a rendering of the real compiled design, the image and the product can never drift apart: there is no second copy of the design anywhere in the flow. (repo)

the problem it closes: in made-to-order jewelry, traditional product photography begins only after a piece is manufactured, which makes every new listing depend on an upfront physical sample. the design is already real as geometry, with defined dimensions, materials, and manufacturing constraints; studiogram photographs that existing object instead of asking another system to invent an approximation of it. (repo)

studiogram is a deterministic 3d scene system, not image generation. the framing question is never "what would this jewelry probably look like on a hand?" it is: "given this hand geometry, this jewelry geometry, this pose, this camera, and this lighting setup, what does the scene render as?" (repo)

---

## 3. what exists today (repo)

- no engine, no scene state model, no backend. nothing of studiogram is built.
- what exists is recovered product explanation from an earlier public site build: an overview page plus guides (why, how it works, hand, jewelry, scene, capture, behind the scenes), and an older single-page version that carried a scene graph and a movement step the newer guides dropped. that explanatory build was content pages only, clearly labeled upcoming.
- the legacy studio navigation (build, templates, styles, presets, materials, print, code pages) is a set of alternative or earlier paths, not one coherent lifecycle. studiogram absorbs these as its scene-system surface. the required consolidation: one project model, educational previews kept distinct from production validation, every page connected to revision and release state instead of copied local state.
- a reference service exists in the wild for comparison: ijewel.design, an upload-to-showcase 3d jewelry platform with material configurators and a shareable live viewer. studiogram's core difference is that it never accepts uploads: it photographs the canonical compiled artifact, not a separate copy. listed for design context only; no partnership or integration.

---

## 4. core invariants

1. **one artifact.** the scene renders the same compiled artifact that goes to manufacturing. image and product cannot diverge because no second version exists. (repo)
2. **deterministic.** explicit geometry plus saved scene state reconstructs the same view every time. no generative imagery anywhere in the chain. (repo)
3. **one-way asset rule.** releases enter scenes by reference (id, version, asset hash), never by copy. nothing flows back: a scene cannot modify, extend, or re-version a release. no scene asset is ever validated as a product, priced, listed, or sold. (repo)
4. **reproducible scenes.** pose, camera, lighting, environment, and object transforms are saved as scene state; the same values reconstruct the same view for later edits, exports, and visual checks. (repo)
5. **quantitative state only.** scene state stores values: transforms, poses, light values, capture order. qualitative inputs are purged after use, per the same clean-room retention rule the release chain follows. (repo)

---

## 5. the creator journey (repo)

1. **prepare the subject.** choose a saved hand or shape a new one, then add one or more compiled artifacts. every piece attaches to a named location and stays an independent object in the scene.
2. **direct the scene.** set the hand pose, camera framing, lighting, and environment. each control changes one part of the scene while preserving every other choice.
3. **capture the set.** save a frame, adjust the scene, save another. the image set can be reviewed, ordered, and exported as png files for a product carousel.

---

## 6. the scene model

the scene graph, from the recovered source (repo):

```
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

every element is an independent thing in the scene: the hand, each jewelry instance, each light, each camera, the backdrop. each control changes one thing while preserving every other choice.

### the hand (repo)

one parameterized base hand model, never a library of different people.

- **presentation and build are separate controls.** neutral, masculine, and feminine presentation presets; independent build controls. finer controls shape hand width, finger length, finger thickness, and palm proportions. this keeps every setup flexible without maintaining a different hand model per combination.
- **surface details stay separate from morphology.** skin tone, body hair, and nail appearance (length, shape, appearance) affect the surface, not the underlying shape. tattoos are placed on the skin and become part of its surface so they continue to move naturally when the hand is posed.
- **save a hand once.** a saved hand configuration keeps the complete shape-plus-surface set. creators can maintain several configurations and reuse them across shoots, selecting jewelry separately each time.

### jewelry arrangement (repo)

- **the real artifact enters the scene.** the scene consumes the same compiled mesh the artifact viewer shows. placement information (which locations a piece supports: finger, wrist, earlobe) belongs to the canonical design record and travels with the design; the scene never recreates it after the fact.
- **attachment follows the pose.** a piece placed at a named location follows that location when the hand changes pose, rather than freezing in space. posing deforms the hand's rig; jewelry transforms follow the attachment reference instead of being repainted.
- **stacks and multiple pieces.** several pieces share a scene as independent objects: reorderable stacks, adjustable supported positions, removable pieces, and combining available work from more than one creator, each artifact remaining its own object.

### camera

full orbit of an already-composed scene; position, angle, and framing change the view, not the jewelry or hand underneath. (repo)

the adopted scripting model, from a reference platform's scripting docs; adopt the model, not the code (ruling):

- any scene thing can be a camera, with its local +z axis as the view direction
- two modes: free exploratory orbit, and pinned deterministic shots
- capture returns a photo object; an ordered capture set references named cameras
- the parameter trio: fieldofview, focallength (bigger is blurrier), and focaldistance

### lighting and environment (repo + ruling)

lighting and backdrop are independent from the camera. presets provide a starting point, and the same values remain manually adjustable.

adopted model (ruling):

- lights are scene things with enable, color, and intensity
- global ambience is a coarse preset (bright, dim, dark)
- runtime changes are ephemeral by default; edit-mode originals are restored on reset
- add named light recipes in scene state beyond the reference vocabulary: repeatable key/fill setups tuned for rendering metal
- live in-scene video streaming belongs to the reference platform, not to us; export for listings is ours

first pass: plain backdrops and light presets. the curated background prop library does not exist yet (see later phases).

### capture and export (repo)

- a capture records the current scene as one photograph. change the pose or camera, capture another view, without rebuilding the hand or replacing the jewelry.
- a typical session produces three or four complementary shots: different angles, closer details, or a new pose, with consistent artifact geometry throughout.
- the finished set is reviewed, ordered, and exported as clean png images ready for a product carousel.
- captures are creator outputs for product presentation. they may later be attached to platform listing content as marketing images, but they are not release assets, they never modify the release, and no capture can authorize a transaction. the platform owns listing content, the studio owns the release, the scene owns the view.

---

## 7. later phases, deliberately out of the first pass

### props (far later, meta sam) (repo + ruling)

background set dressing (ottomans, couches, plants, whimsical mugs, non-arm staging) will come from a platform-prepopulated, curated library. creators never upload, reconstruct, or generate props. the planned ingestion pipeline: one platform-supplied licensed or owned reference image enters; meta sam 3d reconstructs the object from that single image; the dense mesh is decimated to a scene-friendly budget (reconstructions are not game-ready and never need to be: they are bokeh and background geometry); reconstructions with floating debris, broken shells, or unusable geometry are rejected, never repaired; provenance is recorded in scene state (source type, reconstruction method, utc timestamp); the input image is purged after reconstruction; only reviewed props enter the library through curation.

placement rules when it exists: background and bokeh only; never close-up, never in focus at product-adjacent range; never worn, never attached to the hand, never product-adjacent anatomy. in-focus product-adjacent anatomy is authored geometry (the hand, the ear), never sam output; out-of-focus scenery can be sam.

taste, never capability: props convey a mood, never manufacturing capability. no forge, anvil, torch, casting equipment, bench tools, or anything workshop-implying. a couch says the creator has a mood; an anvil says the creator manufactures. the scene must never imply the latter.

license, verified october 2026: meta sam 3d carries a permissive custom meta license; commercial use is fine and reconstruction outputs are owned by us. it is not osi foss, so nothing sam-derived is ever marketed as open source.

the ingestion gate is for visual reliability and provenance only. it must never be described as, or confused with, a castability, safety, or quality claim about a product; product geometry validation belongs solely to the studio's manufacturing gate upstream.

this phase is far later and irrelevant to the first pass: scene state carries no prop slots until then.

### movement (open owner decision) (repo)

the older recovered page had a step the newer guides dropped: alternate views, movement previews, short animations, and gifs from the same rigged scene, with jewelry following the attachment geometry throughout. the newer guides' journey is prepare, direct, capture, with no movement step. treat movement as a candidate later pass, not first-pass scope; whether it returns is an open owner decision.

### wearables (future version, not scheduled) (repo + ruling)

vr and ar try-on: the buyer sees the artifact on their own hand or body, at true scale, from the same compiled mesh. no uploads, no separate marketing model, no drift between what is tried on and what is ordered. it stays deterministic and consumes the release's compiled mesh and attachment information. open unknowns, deliberately unanswered: headset and web-ar targets, hand tracking accuracy at jewelry scale, and how try-on state connects to a purchase request. the platform already holds body-camera api credits relevant to this direction, but nothing is committed.

---

## 8. boundaries: what studiogram is not

- not a source of geometry. it never generates, modifies, or re-versions product geometry.
- not a commerce surface. no pricing, listings, orders, or checkout; those belong to the platform.
- not an upload service. no creator geometry, images, or props enter through the creator.
- not an image generator. every photographic-looking output is a deterministic render of explicit geometry and saved state.
- not the marketing shell. public-facing copy about studiogram is a separate concern from this build.
- not a validator. no scene asset or capture ever carries a castability, safety, or quality claim; those live only in the studio's release gate.

---

## 9. working rules

- all prose lowercase throughout, including product names when natural. no emojis, no em dashes. preserve exact case in code, schemas, identifiers, urls, and citations. (ruling)
- deterministic validation over generative approaches, everywhere. (ruling)
- the release is the only product interface: everything studiogram shows must trace to a release id, version, and asset hash. (repo)
- gpu capacity, when provisioned, is reserved for studiogram's rendering workload (three.js/webgl light rendering). tentative, not settled. (ruling)

---

## 10. glossary

- **artifact**: the compiled 3d form of a design, the object that goes to manufacturing and the only object studiogram photographs.
- **design release**: the immutable validated bundle (openscad source, mesh, validation renders, mass estimates, evidence, asset hashes) issued by the studio server; the interface between studio and platform.
- **scene state**: the saved quantitative values (hand configuration, pose, attachments, camera, lighting, environment, capture order) that reconstruct a scene exactly.
- **capture**: one recorded photograph of the current scene state.
- **capture set**: the ordered set of captures exported as png images for a product carousel.
- **scene asset**: anything a scene contains that is not a release asset: the hand, props, backdrops, lights, cameras, poses, saved state. scene assets never enter releases.
- **prop**: a background set-dressing object from the platform library, reconstructed with meta sam 3d; later phase, not first pass.
