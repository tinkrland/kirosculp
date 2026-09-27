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
- **dns management** — lovable-style: the creator's domain is hosted or
  bought through us, and records for storefront + email are
  auto-wired. boundaries: the creator always owns the domain name
  itself; renewal liability, transfer locks, and whois privacy are
  real operational costs we take on only if this ships.
- **whitelabel shipping** — creator-branded packaging on partner
  shipments instead of sculptura's. growth-gated and the hardest one:
  orders ship directly from casting partners, so branded packaging
  means partners stocking creator-specific materials, with minimums
  and per-creator logistics. only viable with volume or a packaging
  collation step.
- **printed card / thank you note** — the cheaper alternative to
  whitelabel shipping. open question recorded honestly: casting
  partners will not print arbitrary cards. candidate mechanisms, none
  chosen: (a) bulk pre-printed cards stocked at the partner for
  insertion, (b) a collation hub that opens, inserts, reseals
  (expensive per parcel), (c) a printed card mailed separately from a
  card service near the buyer (cheap but arrives separately, partially
  defeating the point). unresolved until partner conversations.

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
  order could be.
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
