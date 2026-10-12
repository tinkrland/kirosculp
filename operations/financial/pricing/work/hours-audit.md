# hours audit: founder work in the repos (2026-10-12, rev 2)

status: audit, rev 2 adds the deprecated pre-tinkrland repos
(kqrla/sculptura, kqrla/sculptura.dev) to the original five. counts the
work put into the repos, excluding duplicated parts, to ground the
retro (repayment) calculation in verifiable data instead of estimates.

## method

- source: full git history, all branches, of seven repos: the five
  current (sculptura 160 commits, kirosculp 329, addsculp 24,
  jewelfinity 49, studiogram 16) plus the deprecated kqrla/sculptura
  (1 commit: a base44 export, no countable work) and kqrla/sculptura.dev
  (296 commits: the lovable/gpt-engineer prototype era, april-may 2026
  plus september additions; the 2025-01-01 lovable template stamp is a
  placeholder and is excluded). zero commit hashes shared with the
  tinkrland repos, so no cross-era duplicates.
- dedup: 721 hash-unique commits -> 631 after dropping commit-tree
  duplicates (same tree + same subject: kirosculp->sculptura promotions
  and addsculp mirror ports). the earliest copy of each duplicate is kept.
- hours: commit-session clustering. a new session starts when the gap to
  the previous commit exceeds 120 minutes; within a session, inter-commit
  gaps count up to 45 minutes each; each session carries a 30-minute pad
  (work before the first commit). sensitivity: 90/30/20 (tight) and
  180/60/45 (loose) variants bracket the estimate.

## result

- counted commits: 631
- work span: 2026-04-29 to 2026-10-12 (prototype era included)
- estimated hours: **111** (tight 85, loose 140)
- per repo: kirosculp ~48h, kqrla-sculptura.dev ~23h, sculptura ~22h,
  jewelfinity ~14h, studiogram ~3h, addsculp ~2h, kqrla-sculptura ~0h
- authors: all founder-directed (agents, gpt-engineer/lovable tool runs
  under founder direction, and founder accounts)

## what this does and does not count

counted: committed work in the five repos - engine specs and drafting
(kirosculp), canonical ports (sculptura), the affinity-map engine
(jewelfinity), set design (studiogram), consumption boundaries (addsculp).

not counted: founder time with no commit artifact - direction and review
conversations, research reading, account/provider setup, the fee-policy
and modeling work sessions, incorporation and compliance errands. this
audit is the verifiable floor, not the ceiling. on the owner's lived
estimate of total hours (200-300+): git can prove 111h of commit-cluster
wall-clock; everything above that is real only if it includes the
non-commit time, and only the owner can attest it. the ruled retro's 200h
is the reasonable mid estimate of floor plus unmeasurable direction time.

## retro calculation

retro at various internal rates (base 111h, tight 85h, loose 140h),
plus $800 tools:

| rate/hr | tight 85h | base 111h | loose 140h |
|---|---|---|---|
| $24 (ruled) | $2,829 | $3,472 | $4,162 |
| $40 | $4,181 | **$5,253** | $6,404 |
| $50 | $5,026 | $6,367 | $7,805 |

## market rate: the no-degree question

degrees do not set market rates; the role performed and the output do,
and the repos themselves are the portfolio. replacement cost (what it
would cost to hire someone to produce the same work), anchored 2026-10-12:

- junior technical writers start ~$25/hr; experienced run $63-105
  (golance 2026).
- freelance software developers: junior $30-60/hr, mid $60-110/hr
  (arc.dev 2026); us/ca average $82-130/hr.
- fractional product managers: $110-175/hr (gofractional 2026).

the committed work is a mix: product/marketplace ops, technical spec
writing, manufacturing and compliance research, prototype direction
through ai tools, and direction of parametric-engine work. the bulk maps
to the junior-to-mid technical band; the parametric castable engine
direction is the rare-skill slice.

reading: the ruled $24/hr is below every anchor (conservative). a
defensible restatement band for the committed 111h is $30-50/hr, which
lands at $4,140-$6,367 including tools - the ruled $5,600 sits inside
that band at roughly $43/hr on the base hours, or equivalently 200h at
$24 + tools. the ruled retro therefore survives both the hours audit
and the rate question without restatement. going above $50/hr would
need to be justified by the engine work specifically; going below $24
would be underpricing by any market anchor.

supersedes: the ~$20,000 engine-inclusive candidate sketched in
fee-balance-analysis.md before this audit (the 800+ hour reading did
not survive the git data).
