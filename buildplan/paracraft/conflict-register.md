# conflict register: the rules that disagree, and what happens until a partner settles them

this is the internal resolution ledger for the casting-rule conflicts the
build plan flags (shelling, shrinkage, sprue dimensions) plus the other
unresolved contradictions from
[research/contradictions/contradictions.jsonl](../../research/contradictions/contradictions.jsonl).
each entry records: the disagreement with its sources, the conservative
interim rule paracraft enforces today, and the single partner ask that
settles it. the paste-ready partner phrasing lives in
[partner-brief.md](partner-brief.md); never send this page.

principle: when reputable sources disagree, we do not average. we take
the most conservative defensible value, mark it `drafted`, and let one
named partner answer replace it. a `drafted` rule never gates a real
release on its own ([acquire.md](acquire.md) evidence contract).

## 1. shrinkage (contradictions-002, 010)

- the spread: 1.5-2.1% documented (src-0003, src-0005); 0.5-1.4%
  empirically measured on real cast rings (src-0020); 5-7% is what
  casters say aloud (src-0020); cooksongold applies its own scaling
  (src-0010). the numbers disagree in kind, not just in size, and the
  real hazard is double compensation: a pre-scaled model sent to a shop
  that compensates itself comes out oversize.
- interim rule (profile-001 v0.2.0, parameter `casting_shrinkage`,
  status `drafted`): models ship at nominal scale, zero model-side
  compensation. tight-tolerance work (ring sizes) is flagged pending a
  partner answer.
- settles when: a casting partner answers the partner-brief ask
  "the shrinkage compensation you apply or expect the model to apply,
  and your tolerance on final dimensions".
- first to ask: cooksongold (they publish that they scale; their number
  is the load-bearing one for any shop that self-compensates), then the
  regional partners who will actually cast pilot orders.

## 2. shelling and hollow parts (contradiction-004, plus per-shop policy)

- the spread: materialise accepts hollow with 2+ evacuation holes
  > 1.5 mm (src-0001); cooksongold refuses hollow pieces outright
  (src-0010); a real hollow bangle with 0.9 mm walls needed multiple
  holes, a single 3.5 mm hole was insufficient (src-0019). resolved in
  principle (shop-dependent), but no shop publishes its full hollow
  numbers.
- interim rule (profile-001 v0.2.0, `ctr-hollow-001`, severity error):
  solid-only. a design needing shelling is redesigned or rejected, never
  shelled blind. sections thicker than 4 mm are flagged for review
  (`ctr-thick-001`, warning) because of uneven cooling and shrinkage
  voids (src-0004, src-0006, src-0015).
- settles when: a casting partner answers "your hollow piece policy:
  drain hole count and diameter, shelling thickness".
- first to ask: the regional partners in the pilot routing set; their
  answer either unlocks shelling with real hole numbers or keeps
  solid-only, per shop, in that partner's profile.

## 3. sprue dimensions (unpublished by every source in the digest)

- the spread: there is no published minimum sprue diameter relative to
  section thickness anywhere in the rule digest. formlabs gives
  qualitative guidance only (feed sprues straight or tapered down, real
  wax sprues preferred, never use preform supports as sprues, printed
  sprues only where wax sprues cannot reach). the decisive numbers live
  inside casting houses.
- interim rule (profile-001 v0.2.0, parameter `sprue_placement`, status
  `drafted`): no sprue geometry in models at all. partners place sprues.
  the model never pre-prints sprues or attachment posts until a partner
  intake spec asks for them.
- settles when: a casting partner answers "who places sprues and your
  sprue rules relative to section thickness".
- first to ask: every partner in the pilot set; this is the cheapest
  question on the sheet and the answer changes intake format, not
  geometry rules.

## 4. minimum hole diameter (contradiction-005)

- the spread: 0.5 mm (src-0010) versus 0.4 mm (src-0011).
- interim rule (unchanged, `ctr-hole-001`): 0.5 mm, the conservative
  end. already safe against both published values.
- settles when: the per-partner question "minimum hole diameter per
  alloy". a partner answering 0.4 gets their own profile value.

## 5. finishing erosion (contradiction-006)

- the spread: 0.05-0.15 mm by finish type (src-0001) versus up to
  0.2 mm in production (src-0011). partially resolved: these are
  different scopes, not different facts.
- interim rule (unchanged, parameter `finishing_erosion`): keep the
  per-finish table and treat 0.2 mm as the worst-case erosion budget for
  detail survival.
- settles when: the partner ask "finishes you offer per alloy and how
  each finish affects minimum detail survival".

## 6. dmls walls, holes, roughness (contradictions-007, 008, 009)

- out of scope for profile-001 (lost-wax sterling silver). recorded in
  the register so they do not resurface as surprises: dmls minimum wall
  1.0 mm (src-0013) versus 0.4 mm (src-0016); dmls hole 0.5 mm versus
  1.5 mm; roughness contradiction resolved (as-printed versus shot
  peened are different states).
- interim rule: none. dmls is not a supported process in any current
  profile; no profile values are drafted from these sources.
- settles when: a dmls-capable partner enters the candidate set and
  gets their own profile, not a general one.

## status table

| conflict | interim rule | severity | settles with |
|---|---|---|---|
| shrinkage | nominal scale, no model-side compensation | drafted parameter | partner compensation + tolerance answer |
| shelling/hollow | solid-only; 4 mm thick-section review flag | error + warning | partner hollow policy answer |
| sprue dimensions | no sprue geometry; partner places sprues | drafted parameter | partner sprue rules answer |
| hole diameter | 0.5 mm minimum | warning (active) | partner per-alloy minimum answer |
| finishing erosion | per-finish table, 0.2 mm worst case | parameter (active) | partner finish + detail survival answer |
| dmls set | none; unsupported process | n/a | future dmls partner profile |

when a partner answer lands, the flow is fixed: record it as dated
evidence in [research/evidence](../../research/evidence/evidence.jsonl),
resolve the contradiction jsonl entry, and cut the per-partner profile
version that replaces the interim rule. the general profile keeps its
interim values only for partners that have not answered.
