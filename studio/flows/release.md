# Design release flow

1. The creator supplies intent and visual references
2. Tessa translates that intent into bounded proposals for predefined project parameters
3. The creator accepts, rejects, or adjusts the proposals
4. Studio persists a new canonical project revision
5. ParaCraft converts the accepted parameters into readable OpenSCAD and compiles the model
6. ParaCraft applies versioned physical design rules, including wall thickness, shrinkage allowances, clearances, minimum features, and process limits
7. The WebGL layer renders that deterministic compiled result in the creator's browser
8. The Studio server independently compiles the approved immutable revision in an isolated headless OpenSCAD worker, derives measurements from the exported mesh, and validates the exact geometry against versioned manufacturing constraints; the local WebGL preview alone is never proof
9. Failure remains saveable but cannot release or publish
10. Server-verified creator approval, matching build hashes, and passing server validation create a new immutable design-release version
11. Platform receives only the release, never Tessa state or mutable Studio project state

Releasing twice from identical parameters, ParaCraft version, OpenSCAD compiler version, and rule-set version should resolve to the same parameter hash and cached geometry.
