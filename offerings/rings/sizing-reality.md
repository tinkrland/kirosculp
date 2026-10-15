# ring sizing reality and the colloquial fit layer

research pass (2026-10-15, tavily search + firecrawl scrapes, math verified
by calculation). question asked: what does a size number actually mean to a
buyer, and what should sculptura's listing and checkout surfaces say besides
"US 2"? sources logged in [research/sources](../research/sources.md).

status: hypothesis notes, not ruled product decisions. the release schema
already supports a size array per release ([design-release
schema](../../contracts/design-release.schema.json)); this doc proposes what
the buyer-facing display and guidance layer should look like around it.

## why raw numbers fail

a listing that says "US size 2" tells most buyers almost nothing. the
colloquial reality: us 2 will not fit an adult woman's pinky. buyers think
in fingers and occasions (proposal, daily wear, stacking, pinky, thumb,
midi, signet), not in abstract numbers. occasion-driven buyers (proposals,
gifts) often do not know the recipient's size at all and guess on purpose.

## the numbers (math verified)

us sizes convert by inner diameter: dia mm = 11.63 + 0.8128 x size, checked
against every cited chart row.

| us size | dia mm | circ mm | colloquial fit |
|---------|--------|---------|----------------|
| 2       | 13.26  | 41.64   | child, toe, or midi ring on a small hand. not an adult pinky |
| 3       | 14.07  | 44.20   | smallest common adult size; slim women's pinky |
| 4       | 14.88  | 46.75   | the most common women's pinky size |
| 5       | 15.69  | 49.30   | women's pinky on wider hands; slim women's ring finger |
| 6       | 16.51  | 51.86   | average adult woman's ring finger (uk l) |
| 6.5     | 16.91  | 53.13   | most common us engagement size |
| 7       | 17.32  | 54.41   | upper women's ring finger (uk n) |
| 9       | 18.95  | 59.52   | women's thumb / slim men's ring finger |
| 10      | 19.76  | 62.07   | average adult man's ring finger (uk t 1/2) |
| 12      | 21.38  | 67.18   | upper men's range |

anchor facts:

- average us woman's ring finger: size 6-6.5 (sources cluster 6, 6.5 or
  "6-7"); most common engagement sizes 6 and 6.5
- average us man's ring finger: size 10, common range 8-12
- women's pinky: size 3-5, size 4 most common; a pinky runs two to three
  sizes smaller than the same person's ring finger
- men's pinky: size 6-8, size 7 average

## finger reality that breaks naive sizing

- there is no single correct size for a person: a finger changes through the
  day, with temperature and season, and across ring styles
- band width matters: bands 6mm or wider typically need half a size up
- wide signet styles rotate on the pinky if not fitted
- correct fit feel: slight resistance over the knuckle, snug at the base

## the proposal buyer sizes blind on purpose

- jewelers of america 2023 retail pulse: nearly half of men admit guessing
  engagement ring size; 1 in 3 couples resize before the first photo shoot
  (figures via secondary retellings; primary not fetched)
- documented folk practice: tracing a ring from the jewelry box, borrowing
  a ring, recruiting friends, sizers during sleep (bluenile documents the
  whole practice)
- deliberate buy-large strategy: she can resize down but cannot wear a
  too-small ring at all (serendipity diamonds)
- resizing is not universal: gold/platinum resize easily (about one size);
  tungsten/titanium often cannot at all. for a made-to-order metal
  platform, resize-friendliness is a material fact worth surfacing, and
  re-make (recompile) is a natural post-proposal path

## the cost of bad sizing

- us ecommerce average return rate 2025: 19.3% (nrf/happy returns);
  jewelry average lower, around 8% (loopreturns)
- one measured deployment cut monthly ring returns from 17.2% to 6.1% (65%
  reduction) after adding proper sizing capture (aitaca, vendor-reported)
- incorrect fit is the primary driver of fashion returns (peer-reviewed
  study of ~496k items, via aitaca)
- a further group orders multiple sizes on purpose, planning to return the
  losers; the seller pays the return either way
- printable charts fail in practice (browser scaling breaks 100% print
  scale); physical kits suffer signup drop-off

## size systems inventory: what sculptura supports today

repo evidence, kirosculp main (checked 2026-10-15):

- the release schema's `size_system` enum is exactly: `unisize`,
  `us_ring_size`, `s_m_l`, `custom`
  ([design-release.schema](../../contracts/design-release.schema.json)). the
  only named ring system is us ring sizes
- the benchmark family runs us whole sizes 3 to 13 mapped to gia 4cs chart
  inner diameters 14.10 to 22.20 mm, gia rounding flagged as loose
  ([benchmarks/manifest](../../benchmarks/manifest.json)); quarter and half
  sizes are not in the family
- checkout-intake validates the selected size against the release's offered
  sizes; the listing inherits sizes from its release only

so today: us whole sizes 3-13 (gia chart), plus unisize / s m l / custom
buckets for non-ring items. no uk, iso/eu, de, ch, jp or in display system
exists anywhere in the repo yet.

## non-us size systems: mechanics (math verified)

the conversion ground truth is the official relationship (wikipedia / iso
8653:2016 summary): iso circumference mm = 2.55 x us size + 36.5, checked
against the gia-derived values (us 3 -> 44.15, us 6 -> 51.80, us 10 ->
62.00; all within gia's one-decimal rounding).

the systems that exist, by mechanics:

| system | markets | mechanics | example: us 6 (51.8mm circ, 16.49mm dia) |
|---|---|---|---|
| iso 8653:2016 | continental eu (standard range 49-72) | inner circumference in mm, the number is the mm | 52 |
| us numeric | us, ca, mx | quarter steps; whole size = 0.81mm dia; iso circ = 2.55 x size + 36.5 | 6 |
| uk letters | uk, ie, au | a to z+ with half letters; a = 37.8mm circ, each full letter = ~1.28mm | l 1/2 |
| de/nl (german) | de, nl, sometimes ar | inner diameter in mm, the number is the mm | 16.5 |
| ch (swiss) | it, es, ch | circumference minus 40mm | 11.8 |
| jp numeric | jp | own numeric scale (1 to ~27); jp 4 = us 3, jp 14 = us 7, so ~1.02mm circ per jp step in the mid range | 12 |
| in numeric | in | own numeric scale; in 14 = us 7, in 16 = us 8 (~58mm). wikipedia notes in/jp/cn whole sizes are not linearly correlated with diameter, so charts are the source of truth, not a formula | 12 |
| cn numeric | cn | own numeric scale, commonly charted against jp | (not verified, see open questions) |

notes from the research:

- retailers in each market chart their local system alongside us sizes and
  mm (in-market practice, e.g. jewelove in in); buyers think in their local
  system
- the uk average woman is size l (us 6), the us average is 6.5: same anatomy,
  different labels
- quarter/half steps exist in us and uk but not in iso (whole mm), jp or in
  whole sizes. an iso or in buyer cannot buy "6.5" in her own system, which
  matters if sculptura ever treats a display system as more than a view

## display rule (proposed, consistent with ruled routing)

"US 6" is a foreign language outside us/ca. display rule implication,
consistent with the ruled routing model (checkout sees destination market
only): show the size in the destination market's system with mm circumference
always shown as neutral ground truth.

architecture note: paracraft's inner diameter is already an engineered
parameter, so the natural storage is mm diameter (or iso circumference mm),
with us/uk/iso/de/ch/jp/in as derived display views per destination market.
this also matches the gia-rounding caveat in the benchmark manifest: store
the engineered mm, never store "us 6" as ground truth.

## proposed colloquial fit layer (not ruled)

numeric sizes stay as data; the buyer-facing surface adds fit language keyed
to finger and occasion:

- fit descriptors per size range: "average women's ring finger", "typical
  women's pinky", "child size", "midi fit", "men's thumb range"
- occasion hints where the style implies them: stacking sets, signets,
  promise-style bands, engagement-style silhouettes (occasion language
  already exists in [configure/rings](../configure/rings.md))
- "buying for someone else?" guidance: discreet sizing steps, resize or
  recompile path, resize-friendly metals note, buy-large strategy
- never present a bare size number with no circumference or fit anchor

open questions:

- where the layer lives: listing schema fields, render labels, or a
  checkout-side adapter
- interaction with paracraft: inner diameter is already an engineered
  parameter, so mm is the natural primary and us/uk/eu/in/jp are derived
  displays
- whether occasion tagging feeds or duplicates the affinity layer
- how releases bind fit descriptors without asserting unvalidated
  combinations (the release schema's size array is data, not proof)
