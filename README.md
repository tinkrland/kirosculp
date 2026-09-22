# sculptura-foundation

> the boundary contract between the studio, the platform, the console, and the admin control tower — written before any more engine code, so the four systems stop leaking into each other.

## why this exists

right now there are two live repos (`sculptura` and `sculptura.dev`) plus a third referenced but not yet built (`paracraft-jewelry`, ported from keeberia's cad engine). they grew fast, shell by shell, in the normal way things grow when you're figuring out the product as you build it. that's fine. that's how this stuff always starts.

but a few things happened as a side effect of that speed:

- financial logic (payouts, margins, wallet balances) is scattered across the same files as storefront customization.
- the admin control tower assumes a single shared password instead of the role system that's already sitting right there in the database (`user_roles`, `has_role()` — it's built, just not wired to admin).
- a market account's payout details and access-key hash are readable by anyone who queries the table, because the read policy is `using (true)`.
- commissions have a full intake form and a database table, but no escrow, no payment hold, and no login gate — despite the plan requiring both before it ships for real.

none of this is a crisis. it's just what happens before someone draws the lines. this repo draws the lines.

## the four systems

sculptura is not one app pretending to be simple. it is four systems that happen to share a brand and, in places, share data:

```text
studio      — turns intent into a manufacturable design
             (paracraft-jewelry engine, agent conversation, castability validation)
             creators only. buyers and commissioners never touch it directly.

platform    — turns a design into something buyable
             (listings, storefronts, discovery, cart, checkout, commission intake)
             buyers need no account. commissioners will, once escrow exists.

console     — turns a sale into money that actually lands somewhere
             (pricing math, payouts, margins, wallet balances, coupons, shipping)
             this is the part that has to be right, not just working.

admin       — the control tower that operates all three
             (manufacturer connections, order routing, review queue, platform settings)
             sees everything. changes routing and defaults. does not do the studio's job.
```

the rule that matters most: **studio only produces designs. platform only sells them. console only moves money. admin only operates the machine.** none of the four should contain another's job, even a small piece of it, even temporarily.

## the interface between studio and platform: the design release

a studio design and a platform listing are not the same object, and treating them as one is most of why the boundary blurs. the interface between them is a **design release** — a versioned, immutable snapshot the studio hands to the platform once a design passes validation.

see [`docs/design-release.md`](docs/design-release.md) for the full shape. short version: the platform never reads studio internals (parameters, scad source, engine version). it only ever reads a design release, and it can only list a design release that has `castability.passed = true`.

## what's in this repo

```text
docs/
  architecture.md       full boundary map — every file in both existing repos,
                         sorted into studio / platform / console / admin, plus
                         what's genuinely shared and what's just leftover.
  design-release.md      the versioned object between studio and platform.
  security-fixes.md      the two real vulnerabilities found in sculptura.dev,
                          with the exact fix for each.
  payouts.md              paddle vs stripe, and why the answer is stripe connect.
shells/
  commissions-muted/     the disabled commissions tab — visible, honest about
                          what's coming, wired to nothing yet.
migrations/
  0001_admin_roles_and_market_account_privacy.sql
                          fixes the two flagged issues. not applied automatically —
                          review it, then run it against the sculptura.dev project.
```

## what this repo is not

it's not the engine. paracraft-jewelry isn't built here. no geometry, no openscad generation, no castability validator. that work is real and it's next, but it needs the primitive vocabulary and research spine from `sculptura.dev/AGENTS.md` and `research.md` done properly first, in that repo, not bolted on here.

it's also not a rewrite. every existing page in `sculptura` and `sculptura.dev` stays where it is. this repo says which existing files belong to which system, fixes two concrete security holes, and adds one honest placeholder for commissions. that's the whole scope, on purpose.
