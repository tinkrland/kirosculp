# review, audit and acceptance cases

## operating requirements to design

assign a responsible compliance/risk owner and qualified reviewers. establish
alert triage, reason codes, restricted evidence access, lawful communications,
review cadence, escalation, independent oversight and appeal/correction paths
where permitted. risk controls must be executable by people, not just prose.

hold/release authority, scope, duration/review deadlines and consequences need
reviewed contracts, provider capabilities and legal treatment. neither mandatory
blocking nor legitimate funds may be handled by arbitrary indefinite freezes.
record policy/version, evidence, provider references, reviewer, decision and
timestamps, including corrections and later outcomes. account for lawful
anti-tipping-off/confidentiality restrictions when explaining a decision.

## proposed acceptance cases, not executed tests

| case | expected evidence/outcome |
|---|---|
| connected buyer/creator with corroborating adverse signals | review before external payout; reason and related transactions retained |
| legitimate launch with high margin and many repeat buyers | no categorical conviction, price recommendation or nationality penalty |
| shared household/network alone | insufficient by itself for definitive laundering/identity finding |
| authenticated duplicate/out-of-order provider events | no duplicated payout/refund or invented capture |
| uncertain payout response followed by another rail | reconcile original result first; no blind second payment |
| compliance-denied payout submitted to payoneer | denial preserved; no coverage-fallback bypass |
| unsupported stripe corridor with otherwise cleared artist | payoneer considered only after actual approval/capability verification |
| beneficiary changed after review | stale approval cannot authorize payment to the new recipient |
| impersonation or untrusted browser clearance | financial eligibility cannot be set by a client claim |
| refund after external payout | documented allocation and compensating events; no silent deletion |
| new supplier/provenance change | prior supplier approval cannot clear substituted sourcing |
| forged commission milestone or delivery evidence | no unverified financial release |
| list update, ambiguous name match or revoked clearance | correct scoped re-review; no reliance on stale/false-positive approval |
| fatf grey-list inclusion alone | not silently promoted into the authorized blacklist policy |
| public creator/storefront query | no private jurisdiction, documents, beneficiary or review evidence |
| terminal escrow plus later risk issue | truth-preserving separate restriction/reconciliation, not illegal state reopen |

add positive and negative tests, concurrency, reviewer permissions and actual
provider failure cases when implementing. every claim of deployed protection
requires named test/run evidence; none of these cases is marked passed here.

see [scenario index](../scenarios/README.md),
[transaction controls](transaction-and-release-controls.md), and
[considerations](README.md).
