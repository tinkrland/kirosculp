# the design release

studio and platform do not share mutable internal state. the studio does not know what a listing, coupon, or payout is. the platform does not know how an openscad parameter, wall-thickness rule, or engine worker operates.

what crosses the boundary is a **design release**: a versioned, immutable snapshot produced after authoritative server-side paracraft compilation and validation. creator-facing webgl is a preview, not a release gate.

## why immutable

a creator can keep editing after a piece is listed. an order must still point to the exact geometry the customer bought, even while the studio project moves on to version seven. edits therefore create a new release; they never mutate an existing one. updating a listing to a newer release is a deliberate platform action.

## contract

[`design-release.schema.json`](design-release.schema.json) is authoritative. at minimum, every release identifies:

- stable design id and unique release id
- monotonically increasing version
- creator id and creation time
- paracraft version, openscad compiler version, physical-rule-set version, and deterministic parameter hash
- canonical parameters
- openscad, mesh, and render assets
- offered metals and sizes
- versioned castability result
- mass estimate by offered metal

prices do not belong in this object. they are regional and time-sensitive. console combines the release's mass estimate with a current manufacturing quote, platform fees, payment costs, shipping policy, and the creator's pricing mode.

## publication invariant

platform may create a listing only when `castability.passed` is `true`. platform does not rerun or override studio validation. an exceptional override belongs to admin, must be logged, and still does not change the original release record.

## metal and stone boundary

metal-only is permanent scope. sculptura does not source, sell, grade, inventory, insure, or fulfill stones.

the current schema constrains `bring_your_own_stone.supported` to `false` and `bezel_spec` to `null`. whether a later schema may describe an empty bezel or prepared setting for a buyer-provided future stone is intentionally undecided. that remains a provisional extension, not a product promise, and it would not change sculptura's metal-only responsibility.
