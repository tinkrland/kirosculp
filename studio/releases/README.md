# Studio: releases

Creates immutable, versioned design releases after validation. See the root `contracts/` folder for the interface consumed by platform.

Only a [server-side validated, creator-approved](../validation/server-release-gate.md) immutable project revision can produce a release. The Platform consumes its exact asset hashes; no local preview can authorize a transaction.

## Audited implementation reference

**Status: missing**

### Existing source evidence

- `sculptura/src/pages/PublishArtifact.jsx` and `sculptura.dev/src/pages/PublishArtifact.jsx` create artifact or listing records, not immutable design releases.
- `contracts/design-release.schema.json` defines the target boundary in this foundation.

### What exists now

- No source table, service, or file bundle represents an immutable studio release.

### Required changes

- Implement release creation only after trusted validation.
- Store engine version, project snapshot, output hashes, renders, files, supported variants, mass properties, and validation evidence.
- Make listings reference a release ID and version.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
