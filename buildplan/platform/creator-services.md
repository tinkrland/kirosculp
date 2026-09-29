# creator services: modular creator-side offerings (future, unscheduled)

direction capture only. nothing here is scheduled; each item is a
modular service toggle a creator could someday enable, priced a la
carte ("pick from a bowl") rather than fixed tiers. bundles can come
later; the unit is the toggle.

## the service toggles

- **whitelabel storefront** — extends the white-label storefront
  surface defined in
  [creator-surfaces.md](creator-surfaces.md) from a channel model into
  a priced add-on: creator's own domain, no sculptura chrome.
- **whitelabel email** — transactional mail (order confirmations,
  drop notifications) sent under the creator's brand. requires
  verified domain: dkim/spf records on a domain the creator controls,
  or a domain managed through us (next toggle).
- **creator-domain mail routing** — extends dns management: mx records
  route support@ / hello@ at the creator's domain into sculptura ops.
  buyers email what looks like (and is) the creator's front door;
  order-status and manufacturing questions are answered by sculptura
  ops under the creator's brand, no sculptura chrome, and the creator
  never frenzies about manufacturing. triage sends only the threads
  that genuinely need them (custom/design/commission questions) to
  the creator's real inbox, as a digest or per thread. boundary: ops
  replies speak as the brand's support identity, never impersonate
  the creator personally; anything signed as the creator is authored
  by the creator.
- **dns management** — lovable-style: the creator's domain is hosted or
  bought through us, and records for storefront + email are
  auto-wired. registrar candidates are the developer-forward trio
  with usable apis (porkbun's documented api, name.com's, spaceship);
  commitment is a later decision, and staying registrar-agnostic
  (creator holds the domain elsewhere, we only need record access)
  remains the fallback. boundaries: the creator always owns the
  domain name itself; renewal liability, transfer locks, and whois
  privacy are real operational costs we take on only if this ships.
- **free-subdomain creators (no custom domain)** — we own the parent
  zone, so we control subdomain records directly: no registrar is
  involved at all. a subdomain creator gets storefront + brand send-as
  + routed support (support@ handles manufacturing, triaged digest to
  their real inbox) with zero setup, identical in behavior to the
  custom-domain tiers, just at creator.sculptura-domain instead of
  their own name. what we deliberately do **not** do is provision
  actual mailboxes via a third party's free tier (e.g. zoho's five
  free inboxes): a free-tier dependency cannot be api-provisioned per
  subdomain at scale, its terms and limits are a shaky platform
  foundation, and it contradicts the routing model, which already
  means creators never need an inbox on their storefront domain. a
  real mailbox product (imap inboxes for creators) is a separate,
  unscheduled decision with spam/abuse and support liabilities of its
  own.
- **whitelabel shipping** — creator-branded packaging on partner
  shipments instead of sculptura's. growth-gated and the hardest one:
  orders ship directly from casting partners, so branded packaging
  means partners stocking creator-specific materials, with minimums
  and per-creator logistics. only viable with volume or a packaging
  collation step.
- **personal thank-you sticker (thermal, printed live)** — the
  cheaper alternative to whitelabel shipping, and it resolves the
  "partners will not print arbitrary cards" problem. the mechanism:
  the creator turns their handwriting into a custom font (glyph
  capture upload, font build stored in their brand profile), and
  writes a base html-like template with placeholders ({buyer_name},
  {order_reference}, optional free line). at fulfillment time the
  platform renders the template server-side per order, and the
  sticker prints live on a thermal label printer at the partner's
  dispatch station. it looks personal (their handwriting, the buyer's
  name), but it is deterministic rendering, and the partner stocks only
  commodity sticker rolls, never per-creator materials. the frenzy is
  zero: creator sets it once; every order gets it. partners need
  commodity hardware and the integration, which is the remaining
  deployment question, not a logistics one.

## paying with the wallet

in-platform services are purchasable directly from the creator's
wallet available balance. this is an internal ledger move (debit
creator available, credit platform revenue), no external rails, so
the double transaction fee of payout-then-repurchase never happens.
payout remains available for everything else. wallet-spend records
carry the same append-only guarantees as the rest of the ledger.

## samples (bonfire-style)

creators can order a sample of their own design: the **resin pattern
print only**, intercepted before casting. this is the sharp one:

- no casting partner is involved, so no partner routing, no metal
  costs: the pattern is printed at whatever capable resin hub is
  nearest the creator, making it cheaper and faster than any metal
  order could be. fulfillment is deliberately not a sculpteo flow:
  sculpteo stays a *casting-partner* candidate, and the sample path
  sources general resin printing services (the nearest capable
  print shop or service network, candidate discovery via the
  [voxelmatters directory](../../manufacturing/research/candidates/README.md)
  print-shop and sla/dlp service categories). sample hubs are their
  own candidate type, separate from precious-metal casting partners,
  with their own capability checks (castable-resin materials,
  resolution, finishing) and none of the metal compliance weight.
- the sample is the exact pattern geometry a partner would cast from
  the validated release, so it is a true preview, not an
  approximation. it is labeled a resin pattern, never finished
  jewelry.
- a sample order is a creator-direct order type referencing the
  release id; it is not a marketplace order, creates no escrow, and
  never surfaces in buyer discovery.
- pricing is production cost + local shipping, which doubles as an
  honest demonstration of the platform's cost transparency to the
  creator.

## boundaries

- nothing here changes escrow, payout, or trusted pricing mechanics;
  wallet spend and samples are new entries in the same ledger.
- whitelabel anything never re-brands legal compliance: hallmarking
  and any required markings stay exactly as the destination
  jurisdiction demands.
- services reference listings and releases, never raw geometry; and
  the studio/platform separation holds: toggles are platform-owned
  merchandising of infrastructure, not studio features.
