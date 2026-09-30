# console: reporting

read models and exports for creators and buyers. reports must reconcile to immutable settlement and fulfillment events rather than recomputing history from current settings.

## creator telemetry policy

umami is the primary product telemetry and default creator-facing traffic and
engagement analytics. creators may supplement it with their own google analytics
configuration for their storefront. reporting remains scoped to the owning creator.

see [the storefront analytics contract](../../platform/storefronts/analytics.md).
traffic telemetry is not the financial ledger, payout verification or security
audit trail. integration and scoped reporting are requirements, not implemented
capabilities of the current reporting shell.

## audited implementation reference

**status: shell**

### existing source evidence

- [`sculptura.dev/src/components/market/sections/AnalyticsSection.jsx`](../../what-exists/lovable/src/components/market/sections/AnalyticsSection.jsx)
- [`InsightsSection.jsx`](../../what-exists/lovable/src/components/market/sections/InsightsSection.jsx)
- [`sculptura.dev/src/pages/admin/AdminOverview.jsx`](../../what-exists/lovable/src/pages/admin/AdminOverview.jsx)

### what exists now

- reporting cards and charts exist, but there is no event model, metric definition catalog, warehouse, or reconciliation process.

### required changes

- define canonical events and metric formulas.
- separate creator analytics, operational health, financial reporting, and audit reporting.
- make every number traceable to source records.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
