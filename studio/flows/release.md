# design release flow

1. the creator supplies intent and visual references
2. tessa translates that intent into bounded proposals for predefined project parameters
3. the creator accepts, rejects, or adjusts the proposals
4. studio persists a new canonical project revision
5. paracraft converts the accepted parameters into readable openscad and compiles the model
6. paracraft applies versioned physical design rules, including wall thickness, shrinkage allowances, clearances, minimum features, and process limits
7. the webgl layer renders that deterministic compiled result in the creator's browser
8. the studio server independently compiles the approved immutable revision in an isolated headless openscad worker, derives measurements from the exported mesh, and validates the exact geometry against versioned manufacturing constraints; the local webgl preview alone is never proof
9. failure remains saveable but cannot release or publish
10. server-verified creator approval, matching build hashes, and passing server validation create a new immutable design-release version
11. platform receives only the release, never tessa state or mutable studio project state

releasing twice from identical parameters, paracraft version, openscad compiler version, and rule-set version should resolve to the same parameter hash and cached geometry.
