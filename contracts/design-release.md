# The design release

Studio and platform do not share mutable internal state. The studio does not know what a listing, coupon, or payout is. The platform does not know how an OpenSCAD parameter, wall-thickness rule, or engine worker operates.

What crosses the boundary is a **design release**: a versioned, immutable snapshot produced after authoritative server-side ParaCraft compilation and validation. Creator-facing WebGL is a preview, not a release gate.

## Why immutable

A creator can keep editing after a piece is listed. An order must still point to the exact geometry the customer bought, even while the studio project moves on to version seven. Edits therefore create a new release; they never mutate an existing one. Updating a listing to a newer release is a deliberate platform action.

## Contract

[`design-release.schema.json`](design-release.schema.json) is authoritative. At minimum, every release identifies:

- Stable design id and unique release id
- Monotonically increasing version
- Creator id and creation time
- ParaCraft version, OpenSCAD compiler version, physical-rule-set version, and deterministic parameter hash
- Canonical parameters
- OpenSCAD, mesh, and render assets
- Offered metals and sizes
- Versioned castability result
- Mass estimate by offered metal

Prices do not belong in this object. They are regional and time-sensitive. Console combines the release's mass estimate with a current manufacturing quote, platform fees, payment costs, shipping policy, and the creator's pricing mode.

## Publication invariant

Platform may create a listing only when `castability.passed` is `true`. Platform does not rerun or override studio validation. An exceptional override belongs to admin, must be logged, and still does not change the original release record.

## Metal and stone boundary

Metal-only is permanent scope. Sculptura does not source, sell, grade, inventory, insure, or fulfill stones.

The current schema constrains `bring_your_own_stone.supported` to `false` and `bezel_spec` to `null`. Whether a later schema may describe an empty bezel or prepared setting for a buyer-provided future stone is intentionally undecided. That remains a provisional extension, not a product promise, and it would not change Sculptura's metal-only responsibility.
