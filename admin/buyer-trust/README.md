# private buyer trust schema

buyer-side internal confidence is admin-only, just like
[creator trust](../creator-trust/README.md). no buyer badge, visible tier,
progression system, suspicion percentage or account-facing trust field.

## what the eyebrow means

four separate claddagh ring orders with different initials can produce the
internal "man..." reaction. the owner is describing an amusing contextual
observation, not proof of fraud or permission to investigate a relationship.
gifts, group purchases or other ordinary explanations may account for it.

this example is not classified as an aml signal or implemented detector. the
number four is an example, not an enforcement threshold. nothing automatically
requests an explanation, lowers trust, pauses an order or blocks payment because
initials differ. any operational review needs its own relevant evidence and
reason; it is not an infidelity judgment. no relationship-status or cheating-
probability field belongs in the schema.

## artifacts and identity boundary

- [0010 migration](../../migrations/0010_private_buyer_trust.sql), applied after
  [0009](../../migrations/0009_private_creator_trust.sql).
- [internal snapshot contract](../../contracts/buyer-trust.schema.json).
- [database tests](../../scripts/test-private-buyer-trust.mjs).

private tables are sculptura_private.buyer_trust_levels, buyer_trust and
buyer_trust_events. buyer_user_id references auth.users.id, not a shipping name,
email string, initials or inferred household. it currently covers registered
buyers only; guest identity mapping remains unresolved. this does not change
checkout registration policy or create a guest fingerprinting scheme.

a person may both buy and create. buyer and creator classifications remain
independent; one role's assessment does not automatically establish confidence
in the other. only unassessed is seeded, and no record is an unassessed account,
not an accusation. tier names and advancement criteria are still undecided.

## access and administrative integrity

keep sculptura_private out of postgrest exposed schemas. anonymous clients lack
schema/table and rpc access. authenticated buyers, creators and other non-admins
cannot read private rows, including their own assessment. no public user/profile
projection is extended.

admin_get_buyer_trust returns an internal snapshot or null. admin_set_buyer_trust
checks current database admin authority and takes buyer_user_id, level_key,
review_state, policy_version, decision_reason, evidence_refs, expected_revision
and request_id as p_-prefixed arguments. the actor is derived from auth.uid(),
never a submitted identity. revision zero means first assessment.

changes write state and append-only before/after history in one transaction.
stale revisions fail; exact same-actor/request/payload replay returns the original
result without changing newer state. reused request ids with changed input or
actor fail. direct client writes and audit edit/delete/truncate are denied.

trusted service_role has read-only database access, not user-facing access or
permission to perform admin changes. database operators capable of changing ddl
remain privileged; audit triggers are not tamper-proof against such an operator.
subject/actor deletion uses restrict foreign keys. retention and deletion
handling need reviewed procedures before live deployment, not assumed forever.

## scope and verification

review_state is separate from level_key: none, context_requested or in_review.
these are administrative states, not automatic enforcement. the schema does not
implement purchasing-pattern analytics, new holds, provider integration or
relationship monitoring. evidence refs are scoped order/case/commission/provider-
event/audit-event identifiers, not raw identity documents or biometrics.

`npm run test:buyer-trust` passed 66 local database/contract assertions;
`npm run test:creator-trust` still passed 63. tests include own-buyer read denial,
admin checks, role revocation, replay, stale revisions, audit rollback and
independence from creator classifications. actual multi-session races and live
supabase/postgrest exposure are not verified. no live migration or admin ui was
deployed. the [pre-existing repository failures](../creator-trust/verification.md)
remain outside this change.
