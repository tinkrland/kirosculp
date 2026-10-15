# ring sizing reality: why raw size numbers fail buyers

the gap: sculptura listings present sizes as "US 2", "US 6" etc. most buyers
cannot map a number to a real finger, especially when the purchase is
occasion-driven (proposal, gift) or wear-style-driven (pinky, thumb, stacking,
midi). this file collects the measured reality and what it implies for the
listing/checkout experience. hypothesis notes, oct 2026.

## the numbers (verified math)

us ring sizes convert by inner diameter: dia mm = 11.63 + 0.8128 x size
(checked against published charts, serendipity diamonds, martin jewelers,
ootbjewelry):

| us size | dia mm | circ mm | what it actually fits (typical) |
|---------|--------|---------|----------------------------------|
| 2       | 13.26  | 41.64   | child, or a midi ring on a small hand. will not fit an adult pinky |
| 3       | 14.07  | 44.20   | smallest common adult finger size; slim women's pinky |
| 4       | 14.88  | 46.75   | the most common women's pinky size |
| 5       | 15.69  | 49.30   | women's pinky on wider hands; slim women's ring finger |
| 6       | 16.51  | 51.86   | average adult woman's ring finger; uk size l |
| 6.5     | 16.91  | 53.13   | most common us engagement size (us) |
| 7       | 17.32  | 54.41   | upper end of women's ring finger |
| 9       | 18.95  | 59.52   | women's thumb / slim men's ring finger |
| 10      | 19.76  | 62.07   | average adult man's ring finger; uk t 1/2 |
| 12      | 21.38  | 67.18   | upper men's range |

key anchor facts from research:

- average us woman's ring finger: size 6 to 6.5 (sources cluster on 6, 6.5,
  or "6-7"; engagement most common sizes are 6 and 6.5)
- average us man's ring finger: size 10, common range 8-12
- average us woman's pinky: size 3-5, size 4 most common. a pinky is usually
  two to three sizes smaller than the same person's ring finger
- average us man's pinky: size 6-8, size 7 average
- so us size 2 sits below the smallest common adult finger size (3). a size 2
  "ring" colloquially reads as: child's ring, toe ring, or a midi ring
  (worn above the knuckle, where fingers run 3-4 sizes smaller)

## finger reality that breaks naive sizing

- there is no single correct size for a person. a finger changes size through
  the day, with temperature, with seasons, and across ring styles (aitaca)
- band width matters: bands 6mm or wider typically need half a size up
  (ootbjewelry)
- wide signet styles rotate on the pinky if not fitted; knuckle-to-base
  taper differs per person
- fit feel: slight resistance over the knuckle, snug at the base (bluenile)

## the proposal buyer: sizing blind on purpose

- jewelers of america 2023 retail pulse: nearly half of men admit they
  guessed the size when buying an engagement ring; 1 in 3 couples need a
  resize before the first photo shoot
- common self-workarounds: tracing a ring from the jewelry box, borrowing a
  ring, recruiting friends/family, casual jeweler trips, sizers during sleep
  (bluenile guide documents the whole folk practice)
- deliberate strategy: many men knowingly buy larger, reasoning she can
  resize down but cannot wear a too-small ring at all (serendipity diamonds)
- resizing is not universal: gold and platinum resize easily (+-1 size
  typical); tungsten and titanium often cannot be resized at all
- implication for precious-metal parametric rings: metal choice and resize
  friendliness should surface in the proposal-gift flow

## the cost of bad sizing (return data)

- us ecommerce average return rate 2025: 19.3% (nrf / happy returns);
  jewelry-specific average is lower, around 8% (loopreturns)
- ring-specific deployments: one measured jewelry deployment cut monthly ring
  returns from 17.2% to 6.1% (65% reduction) after adding proper sizing
  capture (aitaca); incorrect fit is the primary driver of fashion returns
  in a peer-reviewed study of ~496k items
- a further hidden group: buyers who deliberately order multiple sizes
  planning to return the losers. the seller pays the return either way
- printable charts fail in practice: browser scaling breaks the 100% print
  scale assumption; physical sizing kits suffer non-return after signup

## market-by-market size systems

buyers outside the us read "US 6" as a foreign language:

- us/ca: numeric 3-13
- uk/au: letters a-z+ (us 6 = uk l, us 7 = uk n, us 10 = uk t 1/2)
- eu: inner circumference in mm (51.9 = us 6)
- jp: its own numeric scale
- in: local numeric scale commonly shown alongside us sizes in retail charts

listing rule implication: show the size in the buyer's market system, and show
mm circumference as the universal neutral ground truth alongside it.

## colloquial fit layer (proposed, not ruled)

the core product idea this research supports. numeric sizes stay as data, but
the buyer-facing surface adds fit language keyed to occasion and finger:

- fit descriptors: "average women's ring finger", "typical women's pinky",
  "child size", "midi fit", "men's thumb range"
- occasion hints on listings where the style implies them: stacking sets,
  signets, promise-style dainty bands, engagement-style solitaires
- "buying for someone else?" guidance: discreet sizing steps, resize-friendly
  metal notes, larger-size strategy
- deny-list the ambiguity: never present a size number alone with no
  circumference or fit anchor

open questions for sculptura (not ruled here):

- whether colloquial fit language lives in the listing schema, the render, or
  a checkout-side adapter
- how this interacts with paracraft parameters (inner diameter is already an
  engineered param, so mm is the natural primary; us/uk/eu/in are derived)
- whether occasion tagging duplicates or feeds the jewelfinity/affinity layer
