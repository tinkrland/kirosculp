# console: creators

creator views over operations: earnings, payout status, order progress, delivery exceptions, refunds, and support. the records remain owned by operations.

## audited implementation reference

**status: partial**

### existing source evidence

- `sculptura.dev/src/pages/market/MarketDashboard.jsx`
- `sculptura.dev/src/components/market/sections/OverviewSection.jsx`
- `ArtifactsSection.jsx`
- `OrdersSection.jsx`
- `AnalyticsSection.jsx`
- `FinanceSection.jsx`
- `InsightsSection.jsx`
- `sculptura.dev/src/components/dashboard/WalletSection.jsx`

### what exists now

- A broad creator console shell exists. Some sections read real Supabase rows, while finance, wallet, insights, and analytics include placeholder or derived presentation values.

### required changes

- Back each card with explicit operational events and permissioned queries.
- Show release, listing, order, production, delivery, balance, payout, refund, and dispute state without reimplementing those domains.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
