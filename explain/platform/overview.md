# listings, pricing, and buying

## publishing and storefronts

platform listings refer to design releases. the platform adds offering information such as title, description, merchandising images, collection placement, discoverability state, available release variants, creator pricing intent, and channel configuration.

creators can manage storefront identity, content, social links, collections, newsletter options, promotional codes, waitlists, materials they intend to offer, commission availability, and other selling preferences. each control still needs a clear source of truth and an explicit distinction between a working backend feature and a local demonstration state.

publishing should reject a release that is missing, revoked, incompatible with the selected offering, or no longer backed by an eligible manufacturing path.

---

## pricing in either direction

creators can approach pricing from either side.

### fix creator earnings

if a creator wants to earn a specific amount per sale, sculptura calculates the retail price required to cover the current manufacturing quote, payment costs, platform fee, delivery-related amounts, and that earning target.

### fix retail price

if a creator wants a specific retail price, sculptura subtracts the trusted current costs and shows the resulting creator earnings.

these are two views of one pricing model:

```text
retail price = manufacturing cost + payment cost + platform fee + creator earnings
```

shipping, insurance, taxes, currency treatment, refunds, and risk reserves may also affect what is charged or settled. every order needs an immutable financial snapshot so later quote or pricing changes do not rewrite history.

client-calculated numbers are previews. authoritative pricing and checkout values must be calculated from a trusted release, current route, current quote, and server-owned rules.

---

## ordinary purchases and commissions

ordinary listings are intended for passive print-on-demand sales. a guest can buy a released design without opening an account. the platform still records enough contact and delivery information to fulfill the purchase and lets a later authenticated account claim eligible guest orders safely.

commissions are creator-enabled and relationship-based. switching commissions on makes the creator open to requests, but the request path must require buyer authentication. the commission lifecycle also needs brief intake, conversation, terms, protected milestones, revisions, acceptance, cancellation, fulfillment, payout, and disputes before it can be considered complete.
