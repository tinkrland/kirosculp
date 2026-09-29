# security leg: kiro execution brief

## goal and source baseline

make security containment reproducible and prove cross-role denial before
building further product flows. start from main, not this orphan branch.
source baseline at preparation: c76881a plus instruction-removal commits
through 8a9173f. verify current head rather than assume that baseline is latest.

read fully:

- README.md, repo.md, buildplan/scoping.md
- buildplan/security/README.md and audit/security.md
- security/README.md, policy-inventory.md and denial-test-matrix.md
- every original what-exists/lovable/supabase/migrations/ file and root migration
- the referenced admin component and all three historical edge functions
- contracts/README.md, design-release.md and its schema
- package.json, scripts/ and directly linked audit/implementation docs

continue the full supplied-repository pass, keeping an inventory. do not
pretend grep hits or this brief replace reading the evidence.

## existing evidence, not a blank slate

0001-0006 contain privacy and policy corrections. the matrix records anonymous
probes against the fresh foundation project on 2026-09-26, after a grant-layer
repair. those are historical recorded results, not a fresh verification by
kiro. authenticated buyer/commissioner/creator/admin cells remain unverified.
0007 adds finance tables; 0008 adds a unique purchase-request key. neither
proves a safe complete checkout service. historical lovable code is evidence,
not the deployment target for the separated product.

## first vertical slice

1. reconcile the policy matrix with effective sql, recording explicit conflicts
   and getting policy decisions reviewed before altering behavior.
2. build a local cumulative-schema replay and role-seeded test harness.
3. prove guest, owning user, unrelated user, addressed creator and named admin
   allow/deny paths, with positive controls and private-column assertions.
4. add corrective migrations only for demonstrated gaps; re-run the matrix.
5. record reproducible commands, results, skips and deployment state.

this slice is complete only when role assertions actually run against the
cumulative schema. root validation and unit tests alone are insufficient.

## next slices, dependency-ordered

- replace the client-password pattern with authenticated server-authorized
  admin access in the real product target; do not cosmetically fix a snapshot
  and call the product secured.
- constrain service-role operations: authenticated identity/ownership,
  allowed fields and trusted release/quote/pricing values. unavailable trusted
  services require explicit failure or labeled test fixtures, never a bypass.
- protect mutation boundaries with scoped idempotency and replay tests,
  server-enforced rate limits and append-only privileged-action audit events.
- storage controls have recorded platform-rebuild dependencies; preserve
  public display assets while keeping production geometry private. do not
  silently mark deferred bucket ownership work complete.

no live migrations, production deployment, provider charging or credential
rotation is authorized by this preparation brief.

## spec and evidence outputs

use .kiro/specs/security-containment/requirements.md, design.md and tasks.md.
link every requirement to its evidence and verification command. keep these
on agent-instructions. preserve product tests, scripts, migrations and audit
changes on the main-based implementation branch. retain useful progress even
if the reported 25-hour window ends; do not race by skipping denial tests.

## paste-ready starting prompt

```text
use the installed sculptura steering and AGENTS.md. read the full repository
and the security sources named in the security handoff without skimming.
create a requirements-first feature spec named security-containment.
start with the reproducible cumulative-schema replay and authenticated-role
denial harness, not another broad audit or a rewrite of the old lovable app.
trace requirements to source files, list policy contradictions explicitly,
and stop for requirements/design review before implementation. then plan
small dependency-ordered tasks with executable positive and negative tests.
no live deployment, no real payments, no secrets in output. keep .kiro/specs
on agent-instructions and implementation on a main-based branch. report
verified, blocked and deferred work separately.
```
