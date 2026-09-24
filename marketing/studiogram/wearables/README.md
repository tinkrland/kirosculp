# wearables: vr and ar try-on

a future-version folder, nested under [marketing/studiogram/](../README.md) because the idea is studiogram's photography concept taken one step further: instead of a photograph of the piece on a virtual hand, the buyer sees it on their own hand or body, in vr or ar, before it is ever cast.

## the idea

studiogram photographs the artifact on a parameterized hand in a reproducible scene. wearables goes further: the artifact rendered on the buyer's own view, at true scale, using the same compiled mesh the studio produced and the manufacturer will receive. no uploads, no separate marketing model, no drift between what is tried on and what is ordered.

like studiogram, this stays deterministic: the try-on consumes the design release's compiled mesh and the artifact's attachment information. it never becomes a source of geometry or a promise the physical piece cannot keep.

## enabler

the owner holds perfectcam api credits, which cover the camera and body-tracking side of a try-on flow. the remaining unknowns (which headset and web-ar targets, hand tracking accuracy at jewelry scale, and how try-on state connects to a purchase request) are open questions, deliberately not answered yet.

## status

**future version, not scheduled.** nothing here is built, integrated, or committed. the prerequisites are the same as studiogram's: the studio leg must first consolidate its project model, release flow, and compiled-artifact consumption, so wearables plugs into an existing release pipeline instead of inventing one. until then this folder records the intent and the enabler only.
