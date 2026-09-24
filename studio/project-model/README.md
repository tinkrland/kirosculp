# studio: project model

one canonical parametric model per design. openscad, meshes, renders, manufacturing reports, and releases derive from it. a hand-edited mesh never replaces the source model.

the [tessa protocol plan](../design-agent/architecture.md) proposes a typed, versioned canonical parameter state. pydantic can validate a python service; protocol buffers are optional transport, not a competing source of truth.

## audited implementation reference

**status: partial**

### existing source evidence

- [`sculptura/src/lib/studioStore.js`](../../what-exists/base44/src/lib/studioStore.js)
- [`sculptura/src/lib/jewelryDefaults.js`](../../what-exists/base44/src/lib/jewelryDefaults.js)
- [`sculptura/src/pages/studio/BuildPage.jsx`](../../what-exists/base44/src/pages/studio/BuildPage.jsx)

### what exists now

- the present project is a nested javascript object deep-merged with defaults and saved under one local-storage key.
- no schema version, migrations, ownership, revision history, or server persistence exists.

### required changes

- define a canonical versioned project schema for all supported jewelry types.
- add validated migrations, immutable revisions, autosave, ownership, and recovery.
- separate creative intent from generated build artifacts and release records.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
