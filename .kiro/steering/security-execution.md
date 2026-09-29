---
inclusion: manual
---

# security session

use this steering explicitly for the security leg. read the run brief at
handoffs/security.md from the instruction branch; it is not in main.

live guest-role results dated 2026-09-26 are recorded in
security/denial-test-matrix.md. authenticated-role cells are not verified.
reproduce against the cumulative schema using real role identities and
positive controls. zero rows means denied visibility; a blanket missing
grant does not demonstrate that rls works.

known policy conflicts to resolve explicitly in requirements: 0004 still
permits authenticated self-insert into orders as a temporary path, while
later docs describe server-only purchase creation. 0008 supplies a unique
request key but does not revoke that policy or implement full idempotency.
commission matrix insert wording also confuses role identity with ownership:
an unrelated authenticated user can create their own request, not forge
another commissioner's uid. document expected behavior before assertions.

review grant defaults from 0006 against later tables too. service-role
bypasses demand separate caller, ownership and field-provenance tests.
never add real charging or deploy to a live database during this run.
