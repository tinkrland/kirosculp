# Manufacturer layer

One normalized adapter interface per partner for upload, quote, order, and status. Adapters return `null` for unavailable vendor fields and preserve raw responses for audit. Capability truth comes from the reference dataset, not hardcoded adapter claims.

## Audited implementation reference

**Status: scaffold**

### Existing source evidence

- `sculptura/src/components/canvas/PrintPanel.jsx` posts toward Sculpteo from the client.
- `sculptura.dev/src/pages/admin/AdminManufacturers.jsx` stores manufacturer metadata.
- `manufacturing/manufacturer-layer/manufacturer-adapter.js` in this foundation defines an adapter shape.

### What exists now

- No production adapter is wired. The direct client Sculpteo form bypasses trusted quoting, routing, release verification, order persistence, and reconciliation.

### Required changes

- Implement server-side adapters for capability sync, upload, quote, order, status, cancellation, tracking, and reconciliation.
- Keep credentials in secrets and never in browser code or ordinary records.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
