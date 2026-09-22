# payout

connected creator identity, payout destination, eligibility, schedule, holds, reversals, and reconciliation. stripe connect is the current intended execution layer; the domain contract stays provider-neutral.

see `stripe-vs-paddle.md` for the provider decision.

## audited implementation reference

**status: shell**

### existing source evidence

- `sculptura.dev/src/components/market/settings/SettingsPayout.jsx`
- payout fields on market accounts
- `sculptura.dev/src/components/dashboard/WalletSection.jsx`

### what exists now

- Creators can enter payout preferences and see wallet-like UI, but no connected account, balance ledger, verification, payout schedule, reserve, or transfer exists.

### required changes

- Use a payout provider such as Stripe Connect through protected server flows.
- Store provider identifiers rather than raw payout details.
- Add verification gates, ledger balances, holds, transfers, failures, and reconciliation.

see the [complete source audit](../../../docs/current-state-audit.md) for cross-domain findings and build order.
