# studio: design agent

turns creator language and references into a candidate parameter set for review. inference may suggest parameters; it may not generate final geometry, compute price, or decide castability.

## audited implementation reference

**status: missing**

### existing source evidence

- No Tessa implementation was found in either source repository.
- `sculptura/src/pages/studio/BuildPage.jsx` exposes the parameter controls Tessa will eventually be allowed to propose.

### what exists now

- There is structured creator input, but no vision-model ingestion, proposal schema, approval log, or parameter-operation boundary.

### required changes

- Build Tessa as a vision-to-parameter assistant only.
- Validate proposals against a versioned allowlist and project schema.
- Require creator acceptance before applying a proposal.
- Never permit Tessa to emit OpenSCAD, meshes, vertices, validation results, prices, or production files.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
