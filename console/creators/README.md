# console: creators

creator views over operations: earnings, payout status, order progress, delivery exceptions, refunds, and support. the records remain owned by operations.

## private dashboard preferences

[language, regional variants, currency, units and tone](dashboard-preferences.md)
are independent private preferences. v1 is english-only with regional
subtoggles; v2 adds french, german, portuguese and spanish. a creator's
dashboard language is independent of their public storefront language.
this specifies localization requirements, not an implemented feature.

## audited implementation reference

**status: partial**

### existing source evidence

- [`sculptura.dev/src/pages/market/MarketDashboard.jsx`](../../what-exists/lovable/src/pages/market/MarketDashboard.jsx)
- [`sculptura.dev/src/components/market/sections/OverviewSection.jsx`](../../what-exists/lovable/src/components/market/sections/OverviewSection.jsx)
- [`ArtifactsSection.jsx`](../../what-exists/lovable/src/components/market/sections/ArtifactsSection.jsx)
- [`OrdersSection.jsx`](../../what-exists/lovable/src/components/market/sections/OrdersSection.jsx)
- [`AnalyticsSection.jsx`](../../what-exists/lovable/src/components/market/sections/AnalyticsSection.jsx)
- [`FinanceSection.jsx`](../../what-exists/lovable/src/components/market/sections/FinanceSection.jsx)
- [`InsightsSection.jsx`](../../what-exists/lovable/src/components/market/sections/InsightsSection.jsx)
- [`sculptura.dev/src/components/dashboard/WalletSection.jsx`](../../what-exists/lovable/src/components/dashboard/WalletSection.jsx)

### what exists now

- a broad creator console shell exists. some sections read real supabase rows, while finance, wallet, insights, and analytics include placeholder or derived presentation values.

### required changes

- back each card with explicit operational events and permissioned queries.
- show release, listing, order, production, delivery, balance, payout, refund, and dispute state without reimplementing those domains.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
