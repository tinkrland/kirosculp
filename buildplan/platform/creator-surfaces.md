# creator surfaces: three, never blurred

a creator exists on three surfaces. each has one job, and each has
things it never does. this page is the boundary contract, the same kind
of split that governs studio versus platform: when a feature request
lands, first ask which surface it belongs to, and if the answer is
"two of them", the request is probably two requests.

## 1. public creator page (platform-styled, in-marketplace)

the marketplace's surface for a creator. it earns discovery inside
sculptura, which is not automatic: appearing here at all is earned
through published listings and curation rules ([the discovery
decision](../scoping.md)).

tabs, in order:

- **overview:** curated featured pieces, short intro line, optionally
  one collection strip. sells the catalog without being the catalog;
  "view all" deep-links into catalog with a filter pre-applied.
- collections surface here and as their own view: creator-owned public
  groups of pieces per [discovery.md](discovery.md).
- **catalog:** the full grid, filterable by family, metal, price, and
  stock state. the only tab that reads directly from live listings.
  card previews come from the design release render, never raw
  geometry.
- **commissions:** renders only when the creator's commissions toggle
  is on. hosts the scheduling embed (calendly / zcal / cal.com) and the
  brief form (references, preferences, budget band). the brief form is
  inert for logged-out buyers, per the existing rule that commissions
  require login: the logged-out state explains commissions and shows
  examples with "sign in to start yours". completed commission work may
  show as a small gallery, only when the creator publishes it with
  buyer permission or anonymized, and distinct from catalog items for
  sale.
- **about:** bio, philosophy, process shots. converts a browser into a
  buyer who trusts one creator.
- **links / contact:** socials, external storefronts, contact email,
  and a booking shortcut synced from the same connected calendar when
  commissions are on.

it never does: studio work, geometry editing, listings management,
payouts, or anything that requires creator authentication. it is a
marketing surface only.

## 2. creator console (authenticated working area)

where the creator actually works: studio access and tessa, releases,
listings management, commissions inbox, scheduling connections,
payouts. fully separate from the public page: same person, no shared
tabs, no console chrome leaking into the public view.

it never does: public marketing. if a creator wants to change what the
public sees, they edit content that the public page consumes (featured
picks, bio, gallery), not the page itself.

## 3. white-label storefront (creator-branded, platform-powered)

the creator's own domain, their own brand, powered by the platform
underneath: same design releases, same orders, same escrow, zero
sculptura chrome. it is a sales channel in the same model as shopify
or etsy: orders flow back as release-bound purchase requests regardless
of where the buyer clicked ([the channel
decision](../../manufacturing/README.md) context).

it never does: earn in-marketplace discovery, and it never links back
to the public creator page. two different jobs: the creator page wins
strangers inside sculptura; the white-label site serves the audience
the creator already brings.

## the rule that keeps them straight

- discovery and trust happen on the **public creator page**.
- work happens in the **console**.
- the creator's own audience transacts on the **white-label site** (or
  any connected channel).

when a feature seems to need two surfaces, define the boundary: what
one surface owns, the other consumes. the release-bound order model
already forces this: every surface, including white-label and external
channels, submits the same release-bound purchase request and the
platform owns pricing, escrow, and fulfillment behind it.
