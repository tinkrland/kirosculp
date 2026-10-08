# admin: the internal operations surface

the admin panel is the fourth surface, the one users never see. it
exists because the ids, internal classifications and account states
are join keys and operations data, and operations work needs a place
to resolve and act on them. every user-facing rule about ids, trust
levels and internal classifications still holds inside it: admins see
operational data because their job requires it, and none of it is
ever rendered back to creators or buyers.

the role split is ratified. sculptura has one human today, and the
owner deliberately holds both roles as different logins with different
views: same person, two hats, and the audit log always records which
role acted. the separate views are a feature, not an overhead: routine
operations happen in the admin view, and escalating to the superadmin
login is the human version of least privilege.

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

no role grants itself: role grants are superadmin-only, so a staff
admin can never promote themselves. when staff join later, onboarding
is a grant into the existing admin role, never a share of the
superadmin login.

## the two views

the roles are two different logins, and the views are deliberately
not nested: the superadmin view is not the admin view plus buttons.
each screen exists in exactly one view, so the login itself is the
privilege boundary and there is no role switch mid-session.

- **admin view (staff login).** lookup cli (all three verbs: cin,
  sin, bin), admission review queue, needs_review escalation queue,
  parked queues (minor-creator age park, parked-market funds), the
  invite tree as read-only lineage, embargo-list state as read-only,
  and the actor's own audit slice. no issuer controls, no gate
  parameters, no role screens, no credential custody.
- **superadmin view (owner login).** the policy screens: invite-issuer
  authorization and quotas, gate and threshold parameters, embargo-list
  review sign-off, role grants, break-glass overrides, and the full
  append-only audit log with break-glass entries pinned at the top.
  queue triage and routine lookups stay in the admin view; the owner
  logs in as staff for routine work and escalates by switching
  logins, which is the human version of least privilege in practice.

## capabilities inventory

- **lookup cli.** one verb per id, per [identity model](../identity-model.md):
  `lookup cin <number>` resolving username, storefront and
  idv_complete; `lookup sin <number>` resolving storefront and the
  owner's cin; `lookup bin <number>` resolving the buyer's display
  name, since buyers carry no public handle. lookup by id, never by
  name: admin resolution runs id to join keys and handles, the reverse
  is not offered, and sin output chains to cin for handles rather than
  mixing namespaces.
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
