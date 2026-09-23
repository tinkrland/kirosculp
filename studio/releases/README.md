# studio: releases

creates immutable, versioned design releases after validation. see the root `contracts/` folder for the interface consumed by platform.

only a [server-side validated, creator-approved](../validation/server-release-gate.md) immutable project revision can produce a release. the platform consumes its exact asset hashes; no local preview can authorize a transaction.

## audited implementation reference

**status: missing**

### existing source evidence

- `sculptura/src/pages/PublishArtifact.jsx` and `sculptura.dev/src/pages/PublishArtifact.jsx` create artifact or listing records, not immutable design releases.
- `contracts/design-release.schema.json` defines the target boundary in this foundation.

### what exists now

- no source table, service, or file bundle represents an immutable studio release.

### required changes

- implement release creation only after trusted validation.
- store engine version, project snapshot, output hashes, renders, files, supported variants, mass properties, and validation evidence.
- make listings reference a release id and version.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
