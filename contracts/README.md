# contracts

## audited implementation reference

**status: schema drafted, not implemented**

### existing source evidence

- `contracts/design-release.md`
- `contracts/design-release.schema.json`
- No corresponding source entity, endpoint, or release builder was found.

### what exists now

- The foundation defines the intended Studio-to-Platform interface, while both applications still exchange artifact-shaped records and client-provided fields.

### required changes

- Version the schema formally.
- Implement producer and consumer contract tests.
- Persist release hashes and immutable files.
- Reject listings and orders that cannot resolve a valid release.

see the [complete source audit](../docs/current-state-audit.md) for cross-domain findings and build order.
