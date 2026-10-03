# prop library

background set dressing for studiogram scenes: ottomans, couches, plants, whimsical mugs, and other non-arm staging. props are reconstructed from single reference images with meta sam 3d, curated by sculptura, and prepopulated into a platform library. they exist so scenes convey a mood, never a capability.

## who makes props

- the library is platform-prepopulated. sculptura runs the ingestion pipeline, curates every entry, and publishes it. creators never upload, reconstruct, or generate props.
- per-prop provenance is recorded in scene state when a prop is placed: source type, reconstruction method, and utc timestamp.

## ingestion pipeline (planned, not built)

1. a single platform-supplied reference image (licensed or owned) enters the pipeline.
2. sam 3d reconstructs the object.
3. decimation: reconstruction meshes arrive dense and are reduced to a scene-friendly budget. they are not game-ready and never need to be; they are bokeh and background geometry.
4. artifact rejection: reconstructions with floating debris, broken shells, or unusable geometry are rejected, not repaired.
5. provenance is recorded and the input image is purged after reconstruction.
6. curation: only reviewed props enter the library.

the ingestion gate exists for visual reliability and provenance. it is not a paracraft validation, not a castability claim, and not a safety claim. see the [scene assets vs release assets](../scene-system/scene-assets-vs-release-assets.md) boundary.

## where props may appear

- background and bokeh only. never close-up, never in focus at product-adjacent range.
- never worn, never attached to the hand, never product-adjacent anatomy. in-focus product-adjacent anatomy is authored geometry (the hand, the ear), not sam output; out-of-focus scenery can be sam.
- never paracraft-validated, never in the release chain, never priced, never purchasable.

## taste, never capability

props convey taste, never capability. no forge, anvil, torch, casting equipment, bench tools, or workshop-implying props. a couch says the creator has a mood; an anvil says the creator manufactures. the scene must never imply the latter.

## license

meta sam 3d carries a permissive custom meta license (verified oct 2026): commercial use is fine and reconstruction outputs are owned by us. it is not osi foss, so nothing sam-derived is marketed as open source.

## status

**planned, not built.** the library, ingestion scripts, and curation flow do not exist yet. this page is the specification the ingestion task will implement. back to the [studiogram guide](../README.md).
