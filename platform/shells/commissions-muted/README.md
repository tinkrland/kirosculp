# Commissions muted shell

## Audited source reference

`CommissionsMutedTab.jsx` preserves the intended creator-facing commission sections while the live source remains unsafe and incomplete.

Relevant existing files are:

- `sculptura.dev/src/components/market/settings/SettingsCommissions.jsx`
- `sculptura.dev/src/pages/CommissionPage.jsx`
- `sculptura.dev/src/components/commissions/CommissionRequestForm.jsx`
- `sculptura.dev/src/components/commissions/CommissionTermsEditor.jsx`
- `sculptura.dev/src/components/market/sections/CommissionRequestsSection.jsx`
- `sculptura.dev/supabase/migrations/20260502200217_38ecd397-62c4-47c7-a19e-4917a8d5d17e.sql`

## Why it stays muted

Commissioner authentication, private request ownership, creator conversation, accepted terms, milestones or escrow, revisions, approval, cancellation, fulfillment, payout, and disputes are not implemented as one enforceable lifecycle. The original request policy also permits anonymous submission and public reads.

Unmuting requires the acceptance conditions in [`../../commissions/README.md`](../../commissions/README.md).
