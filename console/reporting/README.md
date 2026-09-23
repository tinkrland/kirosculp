# Console: reporting

Read models and exports for creators and buyers. Reports must reconcile to immutable settlement and fulfillment events rather than recomputing history from current settings.

## Audited implementation reference

**Status: shell**

### Existing source evidence

- `sculptura.dev/src/components/market/sections/AnalyticsSection.jsx`
- `InsightsSection.jsx`
- `sculptura.dev/src/pages/admin/AdminOverview.jsx`

### What exists now

- Reporting cards and charts exist, but there is no event model, metric definition catalog, warehouse, or reconciliation process.

### Required changes

- Define canonical events and metric formulas.
- Separate creator analytics, operational health, financial reporting, and audit reporting.
- Make every number traceable to source records.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
