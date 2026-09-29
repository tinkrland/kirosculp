---
inclusion: always
---

# repository map and ownership

- buildplan/: leg scope and sequencing, not an implemented system
- contracts/: versioned studio/platform interface
- studio/ and paracraft/: project, compiler, validation and release ownership
- platform/, console/, operations/, manufacturing/: their named domains
- security/ and audit/: findings, policy inventory and verification evidence
- migrations/: ordered foundation corrections; never rewrite applied history
- what-exists/: historical source snapshots, retained as evidence
- marketing/: separate content shell, never the authenticated product

verify each path in the current checkout. buildplan/security/README.md
contains stale relative links: its referenced migrations are at root
migrations/ and policy docs at root security/, not buildplan/migrations/.
record path repairs in product docs without changing requirements.

keep .kiro and this instruction overlay untracked in the product checkout.
store generated agent specs back on the agent-instructions branch.
