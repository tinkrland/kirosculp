# sizes beyond rings: every other jewelry type, and ring types

research pass (2026-10-15, tavily search). question asked: what size systems
exist for jewelry types other than rings, and what ring types do buyers
actually name? sources in [research/sources](../research/sources.md).
status: hypothesis notes, not ruled decisions. repo context checked on
kirosculp main: the release schema's `size_system` enum (`unisize`,
`us_ring_size`, `s_m_l`, `custom`) is the only sizing vocabulary today.

## the structural finding

rings are the only common type where size is a body measurement mapped
through a market-specific label system. everything else splits into four
simpler patterns:

1. **chosen length** (chains, necklaces, anklets): the buyer picks where the
   piece sits, not a fit. no "wrong body size", only style mismatch.
2. **fit-critical closed forms** (bangles, rigid bracelets): like rings,
   need a measurement, and the measurement is the hand over the knuckles,
   not the wrist.
3. **product dimensions** (hoops, studs, huggies): the "size" is a property
   of the item (inner diameter, post length), not of the buyer. no buyer
   measurement needed; placement vocabulary is the colloquial layer.
4. **piercing hardware** (gauge, wearable length): safety-critical,
   standardized, already gated in this repo
   ([piercings](piercings/README.md)).

this matters for the release schema: one `size_system` enum cannot express
all four. lengths want a length field, bangles want a diameter or
hand-circumference chart, hoops want component dimensions.

## chains and necklaces: length is a style choice

named length tiers (retail-standard, in inches with cm):

| name | length | where it sits |
|---|---|---|
| collar | 12-14 in (30-36 cm) | tight at the neck |
| choker | 14-16 in (36-41 cm) | base of the neck |
| princess | 17-19 in (43-48 cm) | collarbone; the default pendant length |
| matinee | 20-24 in (51-61 cm) | below the collarbone / mid-chest |
| opera | 28-36 in (71-91 cm) | below the bust, often doubled |
| rope / lariat | 36+ in (91+ cm) | waist-adjacent, looped styles |

- women's most common: 18 in (princess)
- men's ladder: 18 in at the base of the neck, 20 in most common, 22 in for
  layering and pendants, 24 in mid-chest, 26+ below the chest
- sizing guidance is placement guidance (where it falls relative to
  necklines), not a measurement of the buyer
- repo gate: chains are already gated on a `chain` release type that does not
  exist yet ([chains](chains/README.md)); when it does, the size axis is
  length in cm/inch, unambiguous and market-neutral, no conversion systems
  like rings have

## bracelets: wrist plus ease, or hand for bangles

**flexible bracelets (chains, tennis, link)**

- measure wrist just below the wrist bone, add ease: snug +0.25-0.5 in,
  standard +0.5-0.75 in, loose +1 in
- women standard range 6.5-7 in, 7 most common; men 7.5-9 in, 8 most common
- colloquial layer equivalent: "fits a 6.5-7 in wrist" alongside the length

**bangles (closed rigid)**

- sized by the widest point of the hand (knuckles squeezed), not the wrist:
  the bangle must pass the hand but not slip off the wrist
- expressed as inner diameter: xs ~2.1 in (5.3 cm), s ~2.25 in (5.7 cm),
  m ~2.4 in (6.1 cm), l ~2.6 in (6.6 cm); hinged styles close at roughly
  60-64 mm
- s/m/l charts are why the schema's `s_m_l` enum exists; but the underlying
  ground truth is again an mm diameter
- open-ended bangle charts run ~153-195 mm circumference (wrist-based)

**cuffs (open, adjustable)**

- open form means a forgiving fit; most are adjustable or wrist-based with
  a chart; many are effectively one-size with bend-to-fit
- the repo's ring families already include open/bypass forms; the same
  "sizing sidestep" logic applies to cuffs

## anklets

- standard 9-10 in, full range 9-11 in
- measure ankle circumference, add 0.5 in snug to 1 in loose ("boho" drape)
- same length-choose pattern as chains

## earrings and hoops: product dimensions, buyer vocabulary

- standard earring post: 20g gauge (0.8 mm thickness), 6 mm post length;
  18g (1.0 mm) for some studs and heavier hoops
- hoop inner diameters, the retail tiers: huggies 5-11 mm, small 10-20 mm,
  medium 20-40 mm, large 45 mm+
- the colloquial layer here is placement language, not numbers: "huggie"
  (hugs the lobe), "everyday small hoop", "statement hoop". buyers do not
  measure their ears; they know where on the ear they want it to sit
- ear cuffs: no piercing, no size system at all; friction-fit adjustable
- repo gate: [earrings](earrings/README.md) already tracks post type,
  gauge, mass, back compatibility per item, candidate-stage

## piercings: gauge and wearable length (already mapped)

- gauge runs inverse (bigger number = thinner): 22g 0.6 mm, 20g 0.8 mm,
  18g 1.0 mm, 16g 1.2 mm, 14g 1.6 mm; retail-typical per placement is
  already tabled in [piercings/placements](piercings/placements.md)
- two buyer-facing numbers per item: gauge (thickness, must match the
  piercing) and wearable length or inner diameter (must match anatomy)
- this is the one type where "size" is a compatibility constraint, not a
  preference; errors are not comfort issues but health issues. the repo
  correctly holds the whole family at research-stage, not for sale

## ring types: what buyers name, and what each implies for size

the repo's geometry families ([rings](rings/README.md): bands, barrel,
knife-edge, wave, twist, split, open, tapered, bypass, signet) are
manufacturing families. buyers name rings by occasion and placement, and
each name carries an implicit size range, which is where the colloquial
fit layer plugs in:

| buyer-facing ring type | implicit finger / size range (us, women unless noted) |
|---|---|
| engagement | ring finger; the 6-6.5 average cluster is this population |
| wedding band | ring finger; same cluster |
| eternity / anniversary | ring finger, often stacked with wedding band |
| promise | any finger, dainty scale; commonly sizes 4-7 |
| everyday band | any finger |
| stacking | typically 4.5-7, sold as sets across adjacent sizes |
| statement / cocktail | middle or index finger, larger scale |
| signet | pinky traditionally (5-8), index increasingly (8-10) |
| thumb ring | thumb: women ~9-11, men ~11-13 |
| pinky ring | women 3-5 (4 most common), men 6-8 (7 average) |
| midi / knuckle ring | worn above the knuckle: half to one full size smaller than the finger's normal size; most women wear 1-5 |
| toe ring | women's most common 3-4; often adjustable |
| open / adjustable | sidesteps numeric sizing entirely: gap or bend-to-fit |

two structural notes:

- midi and toe rings occupy exactly the "size 2 and below" zone where the
  us ring-size chart stops mapping to ring fingers. this is the colloquial
  answer to "who buys size 2": midi, toe, and child sizes
- open/adjustable forms (repo families: open, bypass) eliminate the size
  question at the cost of fit precision; a legitimate strategy for
  gift-buyers who cannot know the size

## open questions

- does the release schema grow per-type size fields (length for chains,
  hand diameter for bangles, component dimensions for hoops) or keep one
  enum and external detail?
- s/m/l for bangles vs mm diameter: same ground-truth-first logic as rings
  (store mm, derive letter views)?
- whether the colloquial type names (huggie, midi, cocktail) become
  listing tags, style-vocabulary entries, or both; the style vocabulary
  already lives in [styles](styles/README.md)
