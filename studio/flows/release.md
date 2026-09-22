# design release flow

1. the creator supplies intent and visual references
2. Tessa translates that intent into bounded proposals for predefined project parameters
3. the creator accepts, rejects, or adjusts the proposals
4. Studio persists a new canonical project revision
5. ParaCraft converts the accepted parameters into readable OpenSCAD and compiles the model
6. ParaCraft applies versioned physical design rules, including wall thickness, shrinkage allowances, clearances, minimum features, and process limits
7. the WebGL layer renders that deterministic compiled result in the creator's browser
8. validation checks the same geometry against sourced manufacturing constraints
9. failure remains saveable but cannot release or publish
10. creator approval plus passing validation creates a new immutable design-release version
11. Platform receives only the release, never Tessa state or mutable Studio project state

releasing twice from identical parameters, ParaCraft version, OpenSCAD compiler version, and rule-set version should resolve to the same parameter hash and cached geometry.
