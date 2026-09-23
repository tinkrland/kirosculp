# Contracts

## Audited implementation reference

**Status: schema drafted, not implemented**

### Existing source evidence

- `contracts/design-release.md`
- `contracts/design-release.schema.json`
- No corresponding source entity, endpoint, or release builder was found.

### What exists now

- The foundation defines the intended Studio-to-Platform interface, while both applications still exchange artifact-shaped records and client-provided fields.

### Required changes

- Version the schema formally.
- Implement producer and consumer contract tests.
- Persist release hashes and immutable files.
- Reject listings and orders that cannot resolve a valid release.

See the [complete source audit](../docs/current-state-audit.md) for cross-domain findings and build order.
