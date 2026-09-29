# provenance metadata: values-based routing and honest origin claims

companion to [regional-routing.md](regional-routing.md) and
[README.md](README.md). buyers have values-based preferences: some
only want recycled metals, some want us-mined or us-made ("american
grown"), some care about smelter country or refinery certification.
routing decides the partner per order, so a provenance claim can never
be a static listing fact unless the listing *constrains* routing. that
is the whole design: evidence-backed partner profiles, creator-set
listing constraints, and order-time disclosure of what actually
happened. (owner-confirmed direction, 2026-09-29.)

## layer 1: the partner provenance profile (evidence or nothing)

onboarding and audit data, never self-declared marketing. a claim
exists in the profile only with its evidence attached:

- **metal sourcing type:** recycled content (with certification, e.g.
  a recognized recycled-content certification body), virgin/mined, or
  mixed; per alloy, since a caster's silver sourcing says nothing
  about their gold.
- **refiner/supplier chain:** refiner or supplier identity and country;
  recognized good-delivery or chain-of-custody standing where it
  applies (e.g. lbma good delivery for gold); oecd due-diligence /
  conflict-minerals posture for tin/tungsten/tantalum/gold where
  relevant.
- **manufacturing site country:** the actual casting/finishing site(s),
  not the company's headquarters; one partner may have several sites
  and provenance is per site.
- **environmental management:** certifications only (e.g. iso 14001);
  "sustainable", "eco-friendly", "green" are banned words with no
  evidence mapping.
- **hallmarking capability per jurisdiction:** already tracked for
  compliance ([the vienna convention/ccm research
  item](../research/)); it doubles as provenance marking since a
  hallmark states assay origin.

banned-claim rule: any buyer-facing provenance word must map to a
profile field that itself maps to evidence. no mapping, no claim.

## layer 2: listing provenance constraints (the honest facet)

a creator opts a listing into guarantees, each of which is a hard
routing constraint:

- **recycled metals only** — routes only to partners whose profile
  shows certified recycled content for that alloy.
- **made in usa** (or any country) — routes only to manufacturing
  sites in that country.
- **chain-of-custody certified** — routes only to partners holding the
  named certification.

because routing enforces the constraint, the guarantee is a real
product attribute: it can be a search facet
([search-facets.md](../../buildplan/platform/discovery/search-facets.md))
honestly, and the listing can display it as a badge. constraints
narrow the partner pool, so they may raise the routed price; the
console shows the creator that trade-off at listing time rather than
surprising them at settlement.

## layer 3: order-time disclosure

the chosen route's actual facts are written to the order record and
shown on the order/receipt: manufacturing site country, metal sourcing
type, and the certifications the partner holds. if a listing carries
no constraint, the buyer still sees what actually happened, just
without a guarantee made in advance. partner *identity* (company
name) stays platform-side by default; disclosure scope is origin and
provenance facts, with partner naming only where a jurisdiction or
hallmark requires it.

## why this shape

- a static "made in usa" flag on a listing would be a lie whenever
  routing picks a better foreign partner; the constraint makes it true
  by construction.
- "prefer" vs "require" is deferred: v1 is require-only. a soft
  preference is a scoring weight on tier-3 routing and deserves its
  own debate about what the buyer is actually promised.
- this integrates with, not duplicates, existing routing: tier-2
  eligibility gains the constraint fields as additional hard filters;
  the partner profile fields are the same fields the constraint
  checks.

## boundaries

- the profile is refreshed at audit cadence; a lapsed certification
  removes the claim (and any listing constraint whose pool empties
  becomes unroutable and is flagged, never silently re-routed).
- no geometry or studio involvement: provenance is platform and
  routing data; the studio never knows it exists.
- white-label orders inherit the same constraints and disclosures;
  whitelabel never rebrands compliance away
  ([creator-services](../../buildplan/platform/creator-services.md)).
