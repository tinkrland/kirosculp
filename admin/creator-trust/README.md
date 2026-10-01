# private creator trust schema

internal operational confidence, visible to admins only. this is not the
creator-facing progression system, a paid subscription tier, a badge or a
statement of criminal suspicion. no trust field is added to creator_profiles,
storefronts, creator dashboards or public progression responses.

## artifacts and current implementation

- [0009 migration](../../migrations/0009_private_creator_trust.sql): private
  tables, administrator read policies and checked administrative mutation rpc.
- [snapshot contract](../../contracts/creator-trust.schema.json): strict json
  shape for an internal assessment, never a public api payload.
- [local database tests](../../scripts/test-private-creator-trust.mjs): actual
  migration execution with postgres role/rls tests through pglite.

this change is committed schema/code, not an applied live supabase migration
or an implemented admin screen. review/apply after 0008 on the foundation
project, not the original lovable project, unless separately instructed.

[local verification record](verification.md): 63 focused assertions passed;
the repository-wide checks retain documented pre-existing failures.

## model

| private table | purpose |
|---|---|
| sculptura_private.creator_trust_levels | allowed internal level keys and descriptions |
| sculptura_private.creator_trust | one latest assessment per immutable creator profile id |
| sculptura_private.creator_trust_events | append-only before/after decision history |

an assessment records level_key, separate review_state, policy_version,
decision_reason, scoped evidence references, revision, authenticated assessor
and timestamps. evidence references allow case/order/commission/provider-event/
audit-event identifiers, not raw documents or biometrics. a short reason is not
permission to paste secrets or identity documents into the record.

only unassessed is seeded. absence of a record means no assessment; neither
means suspicious. names such as new/established/trusted and their criteria
remain proposals, not a finalized or seeded taxonomy. additional definitions
require a reviewed database migration by the database operator; they are not
self-service creator settings. disabling a definition prevents new assignments
without rewriting historical decisions.

review_state is none, context_requested or in_review. it is independent of
level_key, not an aml clearance, payout block or enforcement verdict. there are
no numeric guilt probabilities, public progression ranks, auto-advancement,
revenue thresholds or automatic payout effects in this schema.

## access and safe administrative changes

- keep sculptura_private out of postgrest's exposed schemas. no public views
  or creator-facing joins may project these tables.
- anonymous clients have neither schema/table access nor rpc execution.
- authenticated non-admins see zero private rows under rls; both admin rpc
  functions reject them before inspecting the requested creator id.
- admins may read private rows. writes go through admin_set_creator_trust;
  even an admin cannot bypass the audit by direct client table writes.
- the existing trusted service_role has read-only database access for future
  restricted backend operations. never ship that credential to any user. it
  cannot directly write these tables or execute the admin mutation rpc.
- human access and administrative rpc require auth.uid() plus a current
  database admin role. caller-supplied actor ids are not accepted. revoking the
  role invalidates later calls even with the same session identity.

admin_get_creator_trust returns a private snapshot or null. admin_set_creator_trust
accepts creator_profile_id, level_key, review_state, policy_version,
decision_reason, evidence_refs, expected_revision and request_id through its
p_-prefixed sql arguments. expected_revision is zero for the first assessment.

changes lock the request and creator, reject stale revisions, and atomically
write current state plus an event. exact same-actor/request/payload replay
returns the original snapshot without overwriting newer decisions. request-id
reuse with changed input or another actor fails. mutation requests require a
fresh unique request id after rereading a changed revision.

audit update/delete/truncate are rejected, including ordinary owner-level
statements, but this is not tamper-proof against a database administrator who
can alter ddl or disable triggers. creator and assessor deletion use restrict
foreign keys deliberately: define lawful retention, preservation and account-
deletion handling before production. no indefinite retention period is approved.

## boundaries and remaining work

the creator id is the existing creator_profiles.id, not a mutable handle or
email. this migration does not repair legacy creator ownership or establish
one human per profile. [creator integrity](../../platform/creator-integrity/solution.md)
and secure [admin roles](../README.md) remain prerequisites.

classification does not change creator-set prices, the monthly 15th payout
schedule, required identity/sanctions checks or contractual hold terms. any
future operational use needs its own reviewed policy and server enforcement.
user-visible terms/review notices must not disclose a level or advertise a
trust progression program. public creator progression is a different model.

next implementation steps: finalize taxonomy and evidence rules, admin-only
ui/history pagination, retention handling, and live supabase/postgrest access
verification. local tests cover sql/rls, replay, stale revisions and atomicity;
actual concurrent sessions and deployment schema exposure still require testing.

see [admin audit](../audit/README.md), [private-risk considerations](../../security/aml/README.md)
and [contracts](../../contracts/README.md).

## buyer side

[buyer trust](../buyer-trust/README.md) is a separate private classification
keyed to registered buyer identity. one person can have both roles without
automatically sharing assessments.
