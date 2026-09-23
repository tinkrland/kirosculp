# studio release gate leg

this leg builds the server-side gate described in [studio/validation/server-release-gate.md](../../studio/validation/server-release-gate.md): the only component allowed to turn a validated project revision into an immutable design release.

## steps

1. **canonical project model:** versioned, serialized project state (typed schema, revision history, ownership). replaces the unversioned browser store found in the source audit.
2. **pinned build worker:** an isolated container running a specific openscad version, generating source from trusted templates and validated parameters only. cpu, memory, runtime, and filesystem limits; no raw openscad from the browser or tessa.
3. **mesh measurement:** a vetted analysis library computes watertightness, signed volume, bounding box, components, and mass per alloy density. units verified; invalid meshes rejected.
4. **rule application:** apply the versioned rule sets from the [paracraft leg](../paracraft/README.md) to the exact exported mesh, per offered variant. volume and bounds alone never prove castability.
5. **release issuance:** one conditional server-side transition: approved revision, matching hashes, all variants passed, current rule/engine versions, then the immutable release is written with full provenance.

## waiting on

- paracraft's first consolidated, dated rule set (the gate checks against rules that actually exist).
- the security posture from the [security leg](../security/README.md) before the worker holds any real assets.

## hands over

the [design release](../../contracts/design-release.md): the baton the [platform leg](../platform/README.md) consumes.
