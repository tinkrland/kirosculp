# Payout

Connected creator identity, payout destination, eligibility, schedule, holds, reversals, and reconciliation. Stripe Connect is the intended eventual production execution layer, after a pre-Stripe Spree + mock-provider finance prototype. The domain contract stays provider-neutral.

See `stripe-vs-paddle.md` for the provider decision.

## Audited implementation reference

**Status: shell**

### Existing source evidence

- `sculptura.dev/src/components/market/settings/SettingsPayout.jsx`
- Payout fields on market accounts
- `sculptura.dev/src/components/dashboard/WalletSection.jsx`

### What exists now

- Creators can enter payout preferences and see wallet-like UI, but no connected account, balance ledger, verification, payout schedule, reserve, or transfer exists.

### Required changes

- Use a payout provider such as Stripe Connect through protected server flows.
- Store provider identifiers rather than raw payout details.
- Add verification gates, ledger balances, holds, transfers, failures, and reconciliation.

See the [complete source audit](../../../docs/current-state-audit.md) for cross-domain findings and build order.
