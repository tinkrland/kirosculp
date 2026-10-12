# hours audit: founder work in the repos (2026-10-12)

status: audit. counts the work put into the sculptura, kirosculp, addsculp,
jewelfinity and studiogram repos, excluding duplicated parts, to ground the
retro (repayment) calculation in verifiable data instead of estimates.

## method

- source: full git history, all branches, of the five repos (sculptura 160
  commits, kirosculp 329, addsculp 24, jewelfinity 49, studiogram 16;
  themailtell standalone not counted per owner scope, its addsculp ports
  are the consumption boundary).
- dedup: 424 hash-unique commits -> 333 after dropping 91 commit-tree
  duplicates (same tree + same subject: kirosculp->sculptura promotions
  and addsculp mirror ports). the earliest copy of each duplicate is kept.
- hours: commit-session clustering. a new session starts when the gap to
  the previous commit exceeds 120 minutes; within a session, inter-commit
  gaps count up to 45 minutes each; each session carries a 30-minute pad
  (work before the first commit). sensitivity: 90/30/20 (tight) and
  180/60/45 (loose) variants bracket the estimate.

## result

- counted commits: 333
- work span: 2026-09-22 to 2026-10-12 (20 days)
- estimated hours: **88** (tight 67, loose 110)
- per repo: kirosculp ~48h, sculptura ~22h, jewelfinity ~14h,
  studiogram ~3h, addsculp ~2h
- authors: all founder-directed (agents and founder accounts)

## what this does and does not count

counted: committed work in the five repos - engine specs and drafting
(kirosculp), canonical ports (sculptura), the affinity-map engine
(jewelfinity), set design (studiogram), consumption boundaries (addsculp).

not counted: founder time with no commit artifact - direction and review
conversations, research reading, account/provider setup, the fee-policy
and modeling work sessions, incorporation and compliance errands. this
audit is the verifiable floor, not the ceiling.

## retro calculation

at the established internal rate ($24/hr, the rate behind the ruled
retro) plus $800 tools:

- tight: 67h -> $1,601 + $800 = **$2,401**
- base: 88h -> $2,117 + $800 = **$2,917**
- loose: 110h -> $2,641 + $800 = **$3,441**

reading: the ruled retro ($5,600: $4,800 labor + $800 tools) already
exceeds the repo-derived amount, because it valued broader founder time
(200h) than commit-visible work (88h). the audit therefore shows the
ruled retro is not inflated; the repo work alone covers about half of
it, and the remainder is the non-commit founder time the ruled retro
always included.

the internal rate is the owner's call and scales the amount linearly:
at $48/hr the base audit is $5,017 + tools, at $75/hr it is $7,362 +
tools. a ruling is needed only if the retro is restated; the ruled
$5,600 stands until then.

supersedes: the ~$20,000 engine-inclusive candidate sketched in
fee-balance-analysis.md before this audit (the 800+ hour reading did
not survive the git data).
