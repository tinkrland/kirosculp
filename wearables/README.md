# wearables: vr and ar try-on

a future-version folder. the concept: a buyer sees the piece on themselves before it is ever cast, using the same compiled artifact the studio produced and the manufacturer will receive.

## the idea

studiogram photographs the artifact on a parameterized hand in a reproducible scene. wearables goes one step further: the artifact rendered on the buyer's own view, in vr or ar, at true scale, with the same geometry that would be manufactured. no uploads, no separate marketing model, no drift between what is tried on and what is ordered.

like studiogram, this stays deterministic: the try-on consumes the design release's compiled mesh and the artifact's attachment information. it never becomes a source of geometry or a promise the physical piece cannot keep.

## enabler

the owner holds perfectcam api credits, which cover the camera and body-tracking side of a try-on flow. the remaining unknowns (which headset and web-ar targets, hand tracking accuracy at jewelry scale, and how try-on state connects to a purchase request) are open questions, deliberately not answered yet.

## status

**future version, not scheduled.** nothing here is built, integrated, or committed. the prerequisites are the same as studiogram's: the studio leg must first consolidate its project model, release flow, and compiled-artifact consumption, so wearables plugs into an existing release pipeline instead of inventing one. until then this folder records the intent and the enabler only.

the marketing-facing re-explanation lives in [marketing/](../marketing/README.md).
