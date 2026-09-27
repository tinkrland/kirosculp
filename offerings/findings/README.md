# findings: platform-supplied hardware, never creator geometry

a finding (earring catch, post, hook, clasp, bail, clip) is standard
hardware, and the creator never models or uploads it. the design
release covers the decorative piece plus an **attachment interface**;
the platform supplies the finding itself from an approved hardware
catalog. this is the missing half of the earrings work and it spans
families: earring mechanisms ([earrings/backings.md](../earrings/backings.md)),
chain and bracelet clasps, pendant bails, non-pierced clip and cuff
fittings.

why platform-supplied, structurally:

- a creator designing a front should not have to engineer a butterfly
  catch or a clasp spring; the studio's job is the piece.
- findings carry the safety-relevant contact surface (post gauge,
  nickel release, retention) and need verified vendors and standards,
  which is supply-chain work, not creative work.
- findings legitimately differ from the body alloy (a silver stud can
  ship with a surgical steel or titanium catch), so the finding is a
  separate line item, never an assumption that "same material" holds.

## the custom override

creators **can** opt out of the catalog for fancy custom findings: a
bespoke clasp, an ornate back, a signature leverback. the trade is
structural: a custom finding is creator geometry, so it enters the
release and falls under everything catalog hardware avoids:

- paracraft validates it against the same safety-relevant interface
  spec (post gauge, retention, contact surface) that catalog findings
  publish; "custom" is not an exemption from the spec, only from the
  catalog.
- material and finishing rules apply (contact alloy, nickel release,
  no blanket hypoallergenic), with partner process evidence.
- assembly evidence is mandatory: a custom finding almost always
  attaches, and a bespoke catch must survive wear.
- the platform keeps no supply guarantee: no vendor fallback if a
  partner can't assemble it, and listing publication gates on the
  same approved-path rule, so a custom finding is slower to publish
  and the creator carries the delay.

in practice the catalog is the fast lane and custom is the craft lane;
most pieces stay on catalog hardware.

## the interface is a validated geometric fact

each finding family publishes an **interface spec**: post gauge and
length, catch threading, loop inner diameter, bail aperture, clasp
ring gauge. paracraft validates the piece's interface geometry against
the chosen family's spec before a release is created. same pattern as
stackability in [wear-contexts](../styles/wear-context-vocabulary.jsonl):
a geometric fact validated by the engine, never a self-declared tag.
a "drop earring" release with no validated loop for any approved
wire or leverback simply cannot release.

## material pairing, stored and disclosed

the finding's material and the body's material are stored explicitly
(always the existing rule) and pairing rules live with the catalog:
which catch options are approved for which body alloys, and what the
buyer sees. the listing shows included findings with their materials
("backs: titanium"), because a mixed-material pairing is honest and
common; hiding it invites the allergy question we cannot answer with
a blanket "hypoallergenic" claim (existing rule). nickel release and
regional contact-material rules need their own evidence per region.

## supply gates publication

the hard boundary already says a listing needs an approved finding and
assembly path. concretely: a listing that requires a finding cannot
publish without (a) an approved finding in the catalog whose interface
matches the release, (b) current vendor availability in the routing
region, and (c) assembly evidence where the finding attaches (solder
or weld at the partner), while detachable findings (friction catches)
need none. finding sourcing is part of route quoting, not an
afterthought in fulfillment.

## boundaries

- findings are hardware, not geometry: the studio never generates
  finding models, and a finding never appears in a release mesh.
- this folder is vocabulary and gating rules; the catalog itself is
  operational truth, verified by
  [manufacturing](../../manufacturing/materials-supported/README.md)
  and shipped by [operations](../../operations/country-rollout/README.md).
- nothing here licenses a body-contact or medical claim; the piercing
  area keeps its [research hold](../piercings/README.md).
