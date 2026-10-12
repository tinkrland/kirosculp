# hours audit: founder work in the repos (2026-10-12, rev 3)

status: audit, rev 3. rev 2 added the deprecated kqrla repos; rev 3
adds the content audit: instead of clustering commit timestamps, the
hours are estimated from what was actually built (the corpus), priced
at human production rates. both methods are reported because they
measure different true things.

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

## rev 3: content audit (look at the code, not the commits)

the timestamp method measures when work happened; it cannot see how
much. the content audit measures the artifact corpus directly: every
unique blob across all branches of all seven repos, deduped by content
hash (identical imports across repos count once), with generated
app scaffolding, vendor code, lockfiles, binary assets and scraped
datasets excluded:

| category | volume | production rate (base) |
|---|---|---|
| authored prose (md: specs, research, policy) | 778,082 words | 400 w/h |
| generated app code (.dev prototype + base44/lovable exports) | 103,661 LOC | 200 LOC/h |
| authored engine/tooling code (scad, py, sql, cypher, scripts) | 114,436 LOC | 50 LOC/h |
| researched data (country-rollout, payout policy json) | 39,067 lines | 30 lines/h |
| generated data (corpora, configs, evidence probes) | 67,710 lines | 400 lines/h |

human-equivalent hours (what professionals would need to produce this
corpus): **base ~6,200h** (tight ~4,300h, loose ~9,300h).

corpus replacement valuation:

| rate/hr | tight | base | loose |
|---|---|---|---|
| $24 (ruled) | $102,796 | **$149,370** | $222,678 |
| $40 | $171,326 | $248,950 | $371,131 |
| $50 | $214,158 | $311,187 | $463,913 |

## the two readings and what each is for

- **founder wall-clock (~111h proven, ruled 200h)**: the time the
  founder actually spent directing production. ai-assisted production
  is the point: the corpus is thousands of human-equivalent hours
  produced in ~a hundred directed hours.
- **corpus human-equivalent (~6,200h base)**: what a hired team would
  have needed to produce the same artifact. this is the replacement
  cost and the platform's build-value moat.

the retro (repayment) belongs to the first reading: keep it wall-clock
based ($5,600 ruled; restating at $30-50/hr market-band rates gives
$4,140-$6,367 incl tools, bracketing the ruled number). setting the
retro to the corpus valuation would be unpayable at a fair fee (the
$149k base at $281/mo contribution is ~44 years) and would push the
rate exactly where the fairness analysis says not to go.

the corpus valuation belongs in the fee story instead: the 10% + $0.50
fee amortizes a ~$150k-to-reproduce platform (at the most conservative
rate) across the platform's life, ~$1,245/mo over ten years. at launch
volumes that amortization exceeds fee revenue, which is the honest
statement of the runway: early orders are subsidized by the already-
built corpus, and the subscriptions (not a rate hike) are the lever
that closes the gap.
