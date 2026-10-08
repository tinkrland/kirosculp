# admin: the internal operations surface

the admin panel is the fourth surface, the one users never see. it
exists because the ids, internal classifications and account states
are join keys and operations data, and operations work needs a place
to resolve and act on them. every user-facing rule about ids, trust
levels and internal classifications still holds inside it: admins see
operational data because their job requires it, and none of it is
ever rendered back to creators or buyers.

this is a planning doc. the role split below is proposed, not
ratified; today a solo owner holds all duties by default.

## roles: admin is not one blob

two proposed roles, cut by what the actions can do, not by hierarchy
flavor:

- **admin (staff operations):** admission review, application review,
  queue triage, embargo-list maintenance via reviewed migrations,
  support lookups. can run the lookup cli and act on queues, but
  cannot authorize invite issuers, change gates or thresholds, grant
  roles, or touch provider credential custody.
- **superadmin (owner policy):** invite-issuer authorization, role
  grants, gate and threshold parameter changes, embargo-list review
  sign-off (owner duty today), break-glass actions.

when there is more than one human, the split is load-bearing: a staff
admin must not be able to promote themselves, so role grants are
superadmin-only and no role can grant itself. in the solo phase the
same person holds both; the boundary is recorded now so staff
onboarding later is a grant, not a redesign.

## capabilities inventory

- **lookup cli.** `lookup cin <number>` resolving username,
  storefront and idv_complete, per [identity model](../identity-model.md).
  lookup by id, never by name: admin resolution runs id to handle,
  the reverse is not offered.
- **invite tree.** vgen-style admission lineage, not referral codes:
  which authorized issuer issued each invite, which creator redeemed
  it, whom those admitted creators later invite when separately
  authorized. multi-hop chains render as a tree to reveal potentially
  coordinated accounts, without treating shared ancestry as proof of
  fraud. issuer eligibility and quotas remain open, per
  [creator access](../creator-access.md).
- **admission review queue.** the manual-review signup path, plus
  application review when designed.
- **idv and gate states.** idv_complete and the creator progression
  gates (email, phone, publication, release, payout) as read-only
  states; gates clear through their own flows, not by admin edit.
- **parked queues.** minor-creator age park (jeremiah fixture: accrual
  without payout rail) and parked-market stranded funds (faizah
  fixture: 'not yet', never 'no'), per the signals-leg rulings.
- **embargo and sanctions lists.** deny-by-default market files and
  the embargo list, owner-reviewed quarterly and on major sanctions
  news, revisions via reviewed migrations.
- **needs_review escalations.** compliance-evidence queues (ip geo
  mismatch at money moments, address anomalies), needs_review for
  human review, never auto-fail, per the corridor and sanctions
  rulings.

## never does

- no admin role moves money directly: payout release goes through
  the provider, provider results are inherited, and no admin edits a
  provider onboarding state by hand.
- no admin edits ids, mints ids out of sequence, or reassociates a
  payout record from one account to another; those records are
  immutable joins.
- no admin sets or reveals trust levels, or discusses internal
  classifications with users; the levels stay private in-house
  operational data.
- no admin bypasses a gate for an account without a logged,
  superadmin-owned reason code; overrides are exceptional, recorded,
  and visible in the audit log.
- no id-derived handles, and no handle-based money-path records.

## audit

every admin action is logged: actor, action, target id, reason code,
timestamp. superadmin role grants and any gate override are
break-glass entries surfaced at the top of the log, not buried. the
audit log is append-only and readable by superadmin; staff admins see
their own actions.
