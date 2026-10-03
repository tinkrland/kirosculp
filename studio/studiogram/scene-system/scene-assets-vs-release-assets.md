# scene assets vs release assets

the boundary between what a studiogram scene may contain and what a design release may contain. the two asset worlds never mix, and the flow between them is one-way: releases can enter scenes, scene assets can never enter releases.

## the two worlds

**release assets** are the immutable bundle the studio server produces after isolated headless paracraft validation: openscad source, compiled mesh, validation renders, mass estimates, validation evidence, and exact asset hashes. they are defined by [design-release.schema.json](../../../contracts/design-release.schema.json), consumed by the platform, and they are the only thing that can authorize a listing, order, or manufacturing run.

**scene assets** are everything a studiogram scene is made of that is not a release asset: the parameterized hand, background props from the [prop library](../props/README.md), backdrops, lights, cameras, poses, and saved scene state.

## the one-way rule

- scene state references a release by id, version, and asset hash. it never contains release assets, never rewrites them, and never substitutes its own geometry for the artifact.
- nothing flows back. a scene cannot modify a release, extend it, or create a new version.
- no scene asset is ever validated by paracraft, recorded in a release, priced, listed, or sold.

## why scene assets skip paracraft

paracraft validation is a castability and physical-safety gate for manufacturable geometry. scene assets are visual furniture with no manufacturing claim attached. they pass a lighter [ingestion gate](../props/README.md) that exists for visual reliability and provenance, and that gate must never be described as a safety, castability, or quality claim about a product.

## what captures are

exported png frames from a scene are creator outputs for product presentation. they may later be attached to platform listing content as marketing images, but they are not release assets, they never modify the release, and no capture can authorize a transaction. the platform owns listing content, the studio owns the release, the scene owns the view.

## retention

scene state stores quantitative values only: transforms, poses, light values, capture order, and prop provenance. qualitative inputs such as the reference images used for prop ingestion are purged after ingestion, per the same clean-room retention rule the release chain follows.

see also [behind the scenes](../behind-the-scenes/README.md) for how one saved scene keeps the artifact, rig, and output connected, and [studio releases](../../releases/README.md) for the release side of the boundary.
