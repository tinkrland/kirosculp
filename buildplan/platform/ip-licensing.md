# ip and licensing: rights follow the release, grants follow the path

how intellectual property works on sculptura. the goal the owner
stated, kept in its plain form: **if you order through sculptura as a
creator, the ip for the ring is yours; if you take the stl and run to
sculpteo or another third party on the free tier, that is a breach.**

this doc turns that into a design that can actually be enforced at
terms level, with the legal reality written down honestly.

## what sculptura actually holds (the honest inventory)

- the **engine**: paracraft, tessa, the validation pipeline. ours,
  unambiguous.
- the **templates and parameter families**: house line templates,
  platform-authored bases. ours, including the geometry they emit.
- the **creator's design contributions**: their parameters, custom
  openscad overrides, creative direction. theirs.
- the **generated geometry of a release**: built from both. generated
  geometry is where clean statutory ip claims get murky; sculptura can
  only *grant* what it holds, and the defensible instrument for the
  rest is the license, not the copyright claim.

so the model is a licensing layer on the design release, not an ip
heist in either direction.

## the license field on the release

every design release carries a license state, set by the platform,
never editable from any client:

- **personal-use license (default, free tier):** the exported stl
  (and any preview artifact) is licensed for personal, non-commercial
  use only: the creator's own prototypes, local prints, visual use.
  commercial manufacturing through any third party (sculpteo, a local
  caster, anyone) from the exported artifact is a **license
  violation**: a breach of the terms of service, and where the design
  uses house templates or platform parameter families, also an ip
  claim we can genuinely make, because those components are ours.
- **full commercial grant (earned by the platform path):** the moment
  a release is produced through a sculptura-routed order (a listing
  sale of any unit, a channel sale, a commission that includes the
  piece, or an explicit commercial-license purchase), the release
  converts: the creator receives full commercial rights to the design
  as embodied in that release, including everything sculptura holds in
  it. "order through us and the ring's ip is yours" is the literal
  promise. from then on they may manufacture it anywhere; we keep the
  business because production, routing, escrow, and quality are our
  value, not because a terms trap holds them.

the grant is an append-only ledger event referencing the release id,
so the chain of title is provable. exported artifacts carry release-id
metadata so a stray stl always names its source release.

## the stick and its honest limits

- enforcement is detection-limited: we cannot scan sculpteo's order
  book. the terms give us takedown and account-termination rights and
  a clean position when we *do* find a breach (a creator marketing
  third-party production of a personal-licensed design is visible),
  but the design must not depend on catching people.
- the carrot is the load-bearing wall: platform production is the
  easiest path to a clean, provable, full grant; self-manufacturing on
  a free tier leaves the creator with a personal-use license, no
  chain of title, and no ability to commercialize the design honestly.
- naming discipline in all copy: "license violation" for free-tier
  self-manufacture; "ip infringement" reserved for template, house
  line, and engine misuse, where the claim is real.
- counsel review is required before any enforcement posture is
  finalized: generated-geometry rights are contested territory and
  this doc is a product design, not legal advice.

## buyer side (commissions)

- the buyer receives the physical piece and personal-use rights;
  design ip stays with the creator unless the terms say otherwise.
- a **buyout** can be offered as a commission term: creator-priced
  (they know what the design is worth to them), granted as a full
  commercial grant on completion and recorded the same way.
- this is the structured "rights" term already rendered on the
  commissions surface ([commissions.md](commissions.md)); nothing
  here replaces it, the release grant is just what stands behind it.

## boundaries

- the license layer lives on the platform side; the studio stays
  geometry-only and never enforces or checks licensing
  ([the split](../scoping.md)).
- house line pieces are pure platform ip; creators cannot earn grants
  over house templates themselves, only over their release-specific
  design contributions.
- nothing about this document touches tessa/paracraft independence:
  the license is metadata on releases, a platform concern.
