# design release flow

1. creator and design agent settle on a candidate parameter set
2. studio persists the canonical project model
3. deterministic workers generate readable openscad and compile the mesh
4. validation checks geometry against sourced manufacturing constraints
5. failure remains saveable but cannot publish
6. success creates a new immutable design-release version
7. platform receives only the release, never mutable studio state

releasing twice from identical parameters and engine version should resolve to the same parameter hash and cached geometry.