# contracts

## audited implementation reference

**status: schema drafted, not implemented**

### existing source evidence

- `contracts/design-release.md`
- `contracts/design-release.schema.json`
- no corresponding source entity, endpoint, or release builder was found.

### what exists now

- the foundation defines the intended studio-to-platform interface, while both applications still exchange artifact-shaped records and client-provided fields.

### required changes

- version the schema formally.
- implement producer and consumer contract tests.
- persist release hashes and immutable files.
- reject listings and orders that cannot resolve a valid release.

see the [complete source audit](../docs/current-state-audit.md) for cross-domain findings and build order.
