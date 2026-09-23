# the design studio

## making cad approachable without generating mystery geometry

creators may work directly with the studio's structured controls. those controls describe meaningful jewelry choices such as profile, dimensions, thickness, repetition, surface treatment, hardware, material intent, and size behavior.

for people who do not want to confront the full learning curve and expense of conventional jewelry cad software, the studio also includes **tessa**.

### tessa

tessa is a vision-model assistant, but her architectural role is an intuitive middle layer and operator. she can look at visual references, understand the creator's description, compare relationships in the imagery, and translate that intent into proposed values for the studio's predefined controls.

tessa runs the middle leg of a relay. the creator supplies taste and intent. tessa passes constrained numeric parameters forward. she does not draw the piece, generate openscad, create a mesh, emit vertices, decide castability, or create a production file. she cannot invent a new control or bypass the project schema.

### paracraft

paracraft is the deterministic compiler framework and the only component that constructs production geometry. openscad is the engine under its hood. paracraft converts accepted parameters into rigid mathematical code, compiles the model, and owns the physical safety lines, including wall thickness, shrinkage allowances, clearances, minimum features, and process-specific constraints.

creators see an interactive webgl preview in the browser. this is not the source of truth for production geometry. before a design release exists, a studio server worker independently recompiles the creator-approved revision with headless openscad, measures the exported mesh, and runs the manufacturing checks against that exact build. volume and bounding dimensions alone cannot prove wall thickness or castability.

the same supported parameters, compiler version, rule-set version, and build inputs must produce the same geometry. that makes the result inspectable, reproducible, versionable, and testable. there is no model-generated production geometry to hallucinate. if tessa misunderstands an intention, the mistake remains a visible parameter proposal that the creator can reject or correct before paracraft compiles anything.

---

## checking whether the piece can be made

looking good in a viewport does not prove that a design can survive pattern production, burnout, casting, finishing, shipping, and ordinary wear.

before release, the studio validates constraints such as:

- minimum wall thickness
- minimum detail and engraving size
- unsupported, fragile, or disconnected regions
- trapped spaces and impossible cavities
- overall dimensions and build envelope
- estimated volume, metal mass, and center-of-mass concerns
- tolerances between connected or moving parts
- material-specific casting constraints
- requirements imposed by eligible manufacturing processes

these checks require dated and reviewable manufacturing evidence. a rule cannot become trusted because a value sounds plausible or appears in an undated interface constant.

a failing design can remain a studio project and be revised. it cannot be represented to the platform as production-ready.

---

## the design release

when the server-built geometry passes its required checks and still matches the creator-approved revision, the studio creates an immutable, versioned design release.

that release is the interface between the creative system and the offering system. it records the exact project and engine versions, parameter snapshot, generated files, hashes, renders, supported material and size combinations, validation evidence, and estimated physical properties for one approved version.

it does not contain a permanent retail price. manufacturing, shipping, payment, tax, and risk costs vary by route and time.

editing a studio project after release creates a new release version. existing listings and orders continue to point to the version they actually used. a later creative edit can never silently replace the geometry behind a paid order.
