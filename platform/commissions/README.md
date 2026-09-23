# Platform: commissions

Future buyer-to-creator intake. The buyer supplies references, preferences, budget, and a brief; the creator interprets them and works in studio. This stays muted until authentication, escrow, messaging, acceptance, revision, cancellation, and dispute policy ship together.

## Audited implementation reference

**Status: unsafe partial**

### Existing source evidence

- `sculptura.dev/src/pages/CommissionPage.jsx`
- `sculptura.dev/src/components/commissions/CommissionRequestForm.jsx`
- `CommissionTermsEditor.jsx`
- `sculptura.dev/src/components/market/settings/SettingsCommissions.jsx`
- Commission request migration

### What exists now

- Creators can configure commission presentation and visitors can submit a form. The live path currently permits anonymous requests, and the original database policy exposes requests publicly.

### Required changes

- Require an authenticated commissioner before any request is created.
- Add conversation, terms acceptance, milestones or escrow, revisions, approval, cancellation, fulfillment, payout, and disputes.
- Keep the public commission call to action muted until the complete lifecycle is enforceable.

See the [complete source audit](../../docs/current-state-audit.md) for cross-domain findings and build order.
