# manufacturer layer

one normalized adapter interface per partner for upload, quote, order, and status. adapters return `null` for unavailable vendor fields and preserve raw responses for audit. capability truth comes from the reference dataset, not hardcoded adapter claims.

## audited implementation reference

**status: scaffold**

### existing source evidence

- `sculptura/src/components/canvas/PrintPanel.jsx` posts toward sculpteo from the client.
- `sculptura.dev/src/pages/admin/AdminManufacturers.jsx` stores manufacturer metadata.
- `manufacturing/manufacturer-layer/manufacturer-adapter.js` in this foundation defines an adapter shape.

### what exists now

- no production adapter is wired. the direct client sculpteo form bypasses trusted quoting, routing, release verification, order persistence, and reconciliation.

### required changes

- implement server-side adapters for capability sync, upload, quote, order, status, cancellation, tracking, and reconciliation.
- keep credentials in secrets and never in browser code or ordinary records.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
