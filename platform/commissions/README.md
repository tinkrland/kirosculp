# platform: commissions

future buyer-to-creator intake. the buyer supplies references, preferences, budget, and a brief; the creator interprets them and works in studio. this stays muted until authentication, escrow, messaging, acceptance, revision, cancellation, and dispute policy ship together.

## audited implementation reference

**status: unsafe partial**

### existing source evidence

- `sculptura.dev/src/pages/CommissionPage.jsx`
- `sculptura.dev/src/components/commissions/CommissionRequestForm.jsx`
- `CommissionTermsEditor.jsx`
- `sculptura.dev/src/components/market/settings/SettingsCommissions.jsx`
- commission request migration

### what exists now

- Creators can configure commission presentation and visitors can submit a form. The live path currently permits anonymous requests, and the original database policy exposes requests publicly.

### required changes

- Require an authenticated commissioner before any request is created.
- Add conversation, terms acceptance, milestones or escrow, revisions, approval, cancellation, fulfillment, payout, and disputes.
- Keep the public commission call to action muted until the complete lifecycle is enforceable.

see the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
