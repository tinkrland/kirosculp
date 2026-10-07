# payout

connected creator identity, payout destination, eligibility, schedule, holds, reversals, and reconciliation. stripe connect is the intended eventual production execution layer, after a pre-stripe spree + mock-provider finance prototype. the domain contract stays provider-neutral.

see `stripe-vs-paddle.md` for the provider decision.

## audited implementation reference

**status: shell**

### existing source evidence

- [`sculptura.dev/src/components/market/settings/SettingsPayout.jsx`](../../../what-exists/lovable/src/components/market/settings/SettingsPayout.jsx)
- payout fields on market accounts
- [`sculptura.dev/src/components/dashboard/WalletSection.jsx`](../../../what-exists/lovable/src/components/dashboard/WalletSection.jsx)

### what exists now

- creators can enter payout preferences and see wallet-like ui, but no connected account, balance ledger, verification, payout schedule, reserve, or transfer exists.

### required changes

- use a payout provider such as stripe connect through protected server flows.
- store provider identifiers rather than raw payout details.
- add verification gates, ledger balances, holds, transfers, failures, and reconciliation.

see the [complete source audit](../../../docs/current-state-audit.md) for cross-domain findings and build order.

see [dpms-provider-research.md](dpms-provider-research.md) for how stripe,
payoneer and paypal each classify the dpms category (restricted, pre-approval,
and checkout-prohibited respectively), the demo-mode story per provider, and
the spec outline for the mock payoneer service.
