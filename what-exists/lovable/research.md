# research.md

the research contract for the sculptura model engine.

nothing in the engine gets built until the research behind it exists in writing, with sources. this document defines what has to be studied, how the findings are stored, and what "done" looks like for each research track.

read [agents.md](AGENTS.md) first. that file is the build contract. this file is the study contract that must precede it.

---

## 0. why research comes first

parametric jewelry cad fails in two places, and both failures are research failures rather than engineering failures.

1. the geometry compiles but cannot be cast. a wall is too thin, a volume traps wax, a prong is under-dimensioned for the stone it holds. the code was correct. the constraint was unknown.
2. the parameter vocabulary is wrong. a creator is handed sliders that do not correspond to how jewelry is actually described, dimensioned, or manufactured, so the output is technically parametric and practically useless.

both are avoided by studying the domain before defining the schema. this is the single highest leverage phase of the project and it is cheap compared to rewriting a generator.

---

## 1. two tracks, run in parallel, kept separate

these are deliberately separated. mixing them produces a schema that encodes openscad limitations as jewelry rules, which is how you get an engine that can only make what its first prototype could make.

```text
track a: jewelry domain          track b: openscad and geometry
─────────────────────────        ──────────────────────────────
what jewelry is                  how to express it in code
how it is dimensioned            which libraries carry their weight
how it is cast                   what compiles fast and what does not
what breaks in casting           how to keep generated source readable
what stones require              how to test geometry deterministically
```

track a defines *what must be true*. track b defines *how we express it*. track a is the authority. if openscad cannot express a jewelry constraint cleanly, that is a track b problem to solve, not a track a rule to soften.

both tracks write into the same research directory, in separate subtrees:

```text
backend/engines/paracraft-jewelry/research/
├── jewelry/
│   ├── casting/
│   ├── stones/
│   ├── sizing/
│   ├── primitives/
│   └── manufacturing/
├── openscad/
│   ├── libraries/
│   ├── patterns/
│   ├── performance/
│   └── testing/
├── reference/
│   └── (raw captured artifacts, scad files, scraped tables as json)
└── index.md
```

`index.md` is a running table of contents with one line per note and its current status: `open`, `drafted`, `cited`, `accepted`. a note is only `accepted` when every number in it has a source.

---

## 2. the citation rule

this is not negotiable and it is the reason this document exists.

**an uncited number never reaches the validator.**

every tolerance, clearance, shrinkage rate, minimum thickness, and stone seat dimension in the engine must trace back to a research note, and that note must carry a source. a source is one of:

- published manufacturer documentation or a manufacturer's own tolerance table
- casting or metallurgy literature
- an established jewelry trade standard
- a measurement we took ourselves, with the method written down

"a forum post said" is not a source. "the model suggested" is not a source, and inference is explicitly forbidden from producing constraint values. inference may only summarize material that tavily and firecrawl retrieved, and the summary must keep the citation attached.

note format:

```markdown
# minimum wall thickness, silver, lost wax

**status:** cited
**last reviewed:** yyyy-mm-dd

## finding
<the number, and the conditions under which it holds>

## conditions and caveats
<span, unsupported vs supported, surface finish assumptions>

## sources
1. <name, url, what specifically was taken from it>

## how this enters the engine
<which validator rule, which parameter bound>
```

---

## 3. track a: jewelry domain research

### 3.1 lost wax casting

this is the manufacturing path for the pilot. resin printing in castable resin, then lost wax casting. everything the validator knows comes from here.

study and document:

- the full process chain, stage by stage, and what each stage constrains about the geometry that enters it
- minimum wall thickness per alloy, and how it varies with the unsupported span
- minimum feature size that survives burnout and fill
- draft and undercuts: what the mold can actually release
- sprue and gate placement, and what geometry makes a piece unsprueable
- trapped volumes and wax drainage, including the "closed void" failure case
- shrinkage rates per alloy from wax to metal, and whether we compensate in geometry or in sizing
- porosity risk factors driven by wall thickness transitions
- surface finish expectations and how much material polishing removes, since that eats into thin walls
- what castable resin printing itself constrains, separately from casting

deliverables:

- `jewelry/casting/process-chain.md`
- `jewelry/casting/wall-thickness.md`
- `jewelry/casting/shrinkage-by-alloy.md`
- `jewelry/casting/sprue-and-drainage.md`
- `jewelry/casting/resin-print-constraints.md`
- `reference/casting-tolerances.json`, a machine-readable table the validator imports directly

`casting-tolerances.json` is the artifact that matters most. it is the bridge between research and code. it should be structured per alloy and per rule, with a `source` field on every entry. a rule without a `source` field fails schema validation at build time. build that check.

### 3.2 stones and settings

- standard stone sizes and shapes, and the size to seat dimension relationships
- bezel geometry: wall height, thickness, and the clearance a stone needs to actually sit
- prong geometry: count, thickness, height, and coverage as a function of stone diameter
- girdle position and how deep the seat must be
- channel and pave basics, even if the pilot does not ship them, so the schema does not have to be broken later
- bring-your-own-stone designs: what tolerances allow a local jeweler to set a stone we never saw
- which settings are castable in one piece and which require post-cast work

deliverables:

- `jewelry/stones/size-tables.md`
- `jewelry/stones/bezel-geometry.md`
- `jewelry/stones/prong-geometry.md`
- `jewelry/stones/byo-stone-tolerances.md`
- `reference/stone-seats.json`

### 3.3 sizing

we already ship `src/lib/sizing.js`. treat it as a hypothesis to be validated, not as settled.

- us, uk, eu, and japanese ring size systems and the conversions between them
- inner diameter and inner circumference per size, and which of the two we treat as canonical
- how band width changes perceived fit, and whether wide bands need a size compensation rule
- bracelet, bangle, and cuff sizing conventions
- earring post and back dimensions
- pendant bail sizing against common chain gauges, which matters because we tell buyers chains are not included

deliverables:

- `jewelry/sizing/ring-size-systems.md`
- `jewelry/sizing/band-width-compensation.md`
- `jewelry/sizing/non-ring-sizing.md`
- `reference/sizing-tables.json`
- a written diff against the current `src/lib/sizing.js`, listing every value we got wrong

### 3.4 the primitive vocabulary

this is the output that phase 3 of the build plan consumes directly.

for each of bands, band profiles, bezels, prongs, bails, clasps, posts, backs, hinges, and shanks:

- what it is, what it attaches to, and how it is normally dimensioned in the trade
- its parameters, with units and sensible ranges
- its clearances against neighbouring features
- its casting constraints, cross-referenced to the casting notes
- which parameter combinations are invalid and why

deliverable: `jewelry/primitives/<name>.md` for each, plus a single `jewelry/primitives/vocabulary.md` that pulls them into one schema proposal.

### 3.5 manufacturing partners

- capabilities and tolerances of each pilot manufacturer, captured as structured data rather than prose
- their file format requirements and what metadata they need alongside the geometry
- turnaround, minimums, and what they refuse outright
- pricing structure so the mass estimate can drive a real quote

deliverable: `jewelry/manufacturing/<partner>.md` plus entries in `reference/manufacturer-capabilities.json`. do not hardcode any of this. it feeds the admin panel's routing config.

---

## 4. track b: openscad and geometry research

### 4.1 the language, studied properly

openscad is not a general programming language and treating it like one produces slow, unreadable output. study it on its own terms.

- csg semantics and how the tree is actually evaluated
- the module and function split, and what can be computed versus what must be constructed
- how variables scope and why that surprises people coming from other languages
- `$fn`, `$fa`, `$fs` and their real cost curve on curved jewelry surfaces, which are everywhere in this domain
- `minkowski` and `hull`: exactly when each is worth its cost, and when it is a trap
- `offset`, `polygon`, and `linear_extrude` for band profiles
- `rotate_extrude` for rings and bezels, and its limitations
- `polyhedron` and when hand-built faces beat composition
- text and engraving, including depth control and font handling
- the manifold backend and what changed in current versions
- known numerical robustness failure modes at boolean intersections

deliverable: `openscad/patterns/language-notes.md`, written as an engineer's working reference rather than a tutorial.

### 4.2 library survey

- bosl2, in depth. it is the strongest candidate and it is large. document which modules we would actually use, its rounding and chamfer tooling, its attachment system, and its compile cost
- dotscad and the smaller geometry libraries
- any jewelry-specific forks and scad collections in the wild
- the genkeyboard reference scad already sitting in the keeberia repo, read as prior art in how to structure a generator

for each library, record: license, maintenance status, compile cost, dependency weight, and a clear recommendation with reasoning.

deliverable: `openscad/libraries/survey.md` and `openscad/libraries/recommendation.md`. the recommendation must pick, not enumerate.

### 4.3 generator patterns

this is how we make generated source readable, which is a stated product requirement rather than a nicety.

- how existing high-quality generators structure their emitted scad
- parameter block conventions and how to document a parameter inside the file itself
- one module per feature, and how to keep the composition tree shallow
- how to emit comments that explain intent rather than restating the operation
- how to keep the file editable by hand after generation without it becoming the source of truth
- customizer annotation syntax, and whether we adopt it

deliverable: `openscad/patterns/generated-source-style.md`, plus at least three hand-written exemplar `.scad` files in `reference/` showing the target quality. those exemplars become the golden-file baseline for phase 4.

### 4.4 performance

jewelry is curved and detailed, which is the worst case for csg compile time. a creator moving a slider cannot wait a minute.

- what actually dominates compile time in curved detailed geometry
- resolution strategy: low `$fn` for the interactive preview, high for the export, and how to guarantee they describe the same object
- caching on a parameter hash, and what belongs in the key
- incremental strategies, and whether any are worth the complexity
- realistic compile budgets for a preview loop, measured rather than guessed

deliverable: `openscad/performance/budget.md` with real measurements from real jewelry geometry, not synthetic benchmarks.

### 4.5 testing geometry

- golden-file testing of emitted scad, and how to keep the diffs reviewable
- mesh-level assertions: volume, bounding box, manifoldness, watertightness
- how to detect trapped volumes computationally, which is the hardest validator rule
- wall thickness measurement on a mesh, and which method is tractable
- determinism verification: same parameters, byte-identical output, across versions and machines

deliverable: `openscad/testing/strategy.md` and a proposed test harness layout.

---

## 5. the agent in the middle

this shapes what the research must produce, so it belongs here rather than only in the build plan.

**the creator never touches the engine.**

```text
creator  ──talks to──>  design agent  ──drives──>  engine  ──renders──>  preview
   ^                                                                        |
   └────────────────────────── sees ────────────────────────────────────────┘
```

the creator describes what they want in plain language. the design agent translates that into concrete parameter changes, turns the knobs, and the engine deterministically produces geometry and a preview. the creator reacts to the preview and the loop continues.

the boundary is strict and it is the same boundary stated in agents.md:

- the agent chooses parameter values
- the engine turns parameter values into geometry
- the agent never produces geometry, never decides castability, never computes price, never renders

this puts three additional requirements on the research, and they are easy to miss:

1. **every parameter needs a natural language surface.** the primitive vocabulary notes must record, for each parameter, what a creator would plausibly call it, including the vague phrasings. "chunkier", "more delicate", "sit lower", "wider at the top". a parameter the agent cannot map language onto is a parameter the creator cannot reach.
2. **every parameter needs a valid range and a default.** the agent proposes values and must be prevented from proposing impossible ones. ranges come from the casting research, not from taste.
3. **every rejection needs an explanation the agent can relay.** when the validator refuses a parameter set, it must return a reason in domain language, so the agent can tell the creator "that band is too thin to cast in silver at that width" instead of surfacing a rule id.

deliverable: `jewelry/primitives/language-surface.md`, mapping the parameter vocabulary to creator phrasing and to the bounded ranges the agent is allowed to move within.

---

## 6. backend context: xano

the backend runs on [xano](https://xano.com). that is a fixed constraint and it shapes the engine architecture, so research it alongside the two main tracks.

what has to be established before phase 5:

- how long-running work is handled, since an openscad compile is not a request-response operation
- background tasks and queues in xano, and their real timeouts and limits
- how an external compile worker authenticates back into xano and writes results
- file and artifact storage for scad source, meshes, renders, and exports, and the size limits on each
- webhook patterns for a worker reporting completion or failure
- where the parameter-hash cache lives, and whether xano or the worker owns it
- how the deterministic-cache invariant survives across environments

the working assumption to validate: xano owns the data model, auth, the design records, and orchestration. openscad compilation, validation, and rendering run in dedicated external workers that xano dispatches to over a queue and that report back over webhooks. confirm or replace this assumption with evidence before any worker is written.

deliverable: `backend/xano-architecture.md` with the queue and worker topology drawn out, the timeouts documented, and the failure and retry behaviour specified.

---

## 7. tool assignments for this phase

use the right tool. do not use an inference call where a retrieval or a measurement will do.

**tavily** is the primary tool for track a. casting literature, alloy shrinkage, stone standards, sizing systems, prior art in parametric jewelry cad. every finding carries its citation into the note.

**firecrawl** is the primary tool for structured extraction. openscad and bosl2 documentation into markdown. manufacturer tolerance tables into json against an explicit schema. competitor sizing charts for validating our own. use `formats: ['json']` with a schema when pulling a spec table, markdown when pulling prose.

**browserbase** handles what plain fetching cannot. manufacturer portals and quote calculators behind javascript or a login, and reference product photography for later material and lighting calibration.

**inference** summarizes and organizes what the other three retrieved, and drafts documentation. it does not originate a constraint value. ever.

**adaptionlabs.ai** does not apply to this phase but its instrumentation plan should be sketched now, because the funnel it will measure is the creator-to-agent conversation that this research defines.

---

## 8. sequencing

the two tracks run in parallel, but they converge at fixed points.

```text
week-scale sequence

track a          3.1 casting ──> 3.2 stones ──> 3.3 sizing ──> 3.4 primitives ──> 3.5 partners
track b          4.1 language ──> 4.2 libraries ──> 4.3 patterns ──> 4.4 perf ──> 4.5 testing
xano             section 6, runs alongside, must land before phase 5 of agents.md

converge 1       after 3.1 and 4.1: is every casting constraint expressible? write the gap list.
converge 2       after 3.4 and 4.3: the primitive vocabulary must map cleanly onto the
                 generator pattern. if it does not, track a wins and track b adapts.
converge 3       after 4.4 and 4.5: the compile budget must support the agent-driven
                 preview loop described in section 5. if it does not, we change the
                 preview strategy, not the geometry quality.
```

---

## 9. definition of done

the research phase is complete, and phase 3 of [agents.md](AGENTS.md) may begin, when all of the following are true.

- `research/index.md` lists every note and each is marked `accepted`
- `reference/casting-tolerances.json`, `reference/stone-seats.json`, and `reference/sizing-tables.json` exist, validate against their schemas, and carry a source on every entry
- the build-time check that rejects an uncited constraint entry is written and passing
- `openscad/libraries/recommendation.md` names one library choice and defends it
- three exemplar `.scad` files exist in `reference/` at the readability standard we intend to generate
- `openscad/performance/budget.md` contains measured numbers from real jewelry geometry
- `jewelry/primitives/vocabulary.md` proposes a complete schema
- `jewelry/primitives/language-surface.md` maps every parameter to creator phrasing and a bounded range
- `backend/xano-architecture.md` specifies the queue, worker, storage, and webhook topology
- a written gap list exists for anything track a requires that track b cannot yet express

anything short of this list is not done. shipping a generator on top of incomplete research means discovering the constraint later, in metal, at a manufacturer, on a creator's order.
