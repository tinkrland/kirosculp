# Studio: project model

One canonical parametric model per design. OpenSCAD, meshes, renders, manufacturing reports, and releases derive from it. A hand-edited mesh never replaces the source model.

The [Tessa Protocol plan](../design-agent/architecture.md) proposes a typed, versioned canonical parameter state. Pydantic can validate a Python service; Protocol Buffers are optional transport, not a competing source of truth.

## Audited implementation reference

**Status: partial**

### Existing source evidence

- `sculptura/src/lib/studioStore.js`
- `sculptura/src/lib/jewelryDefaults.js`
- `sculptura/src/pages/studio/BuildPage.jsx`

### What exists now

- The present project is a nested JavaScript object deep-merged with defaults and saved under one local-storage key.
- No schema version, migrations, ownership, revision history, or server persistence exists.

### Required changes

- Define a canonical versioned project schema for all supported jewelry types.
- Add validated migrations, immutable revisions, autosave, ownership, and recovery.
- Separate creative intent from generated build artifacts and release records.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
