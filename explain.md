# What Sculptura is

## The problem

Many people have a clear sense of what they like before they think of themselves as creators. They save jewelry references, collect images on Pinterest, notice unusual forms, combine details from different pieces, and imagine something they cannot find in a shop.

For most of them, the idea of becoming a jewelry designer never seriously occurs. The path appears to begin with expensive professional CAD software, a steep technical learning curve, knowledge of casting and precious metals, prototype costs, supplier relationships, inventory risk, photography, selling, shipping, and customer support. Even imagining the role can feel out of scope.

That means a large amount of creative taste never becomes creative output. The barrier is not necessarily a lack of ideas. It is the cost and complexity between an idea and a finished, sellable piece.

Sculptura exists to patch that gap.

It gives a person a path from visual intent to a controlled jewelry design, then connects that design to validation, offering, made-to-order manufacturing, and delivery. The creator does not need to become a conventional CAD operator, buy precious metal, fund inventory, own a workshop, or personally fulfill every order before they can discover whether people want their work.

Sculptura is not trying to replace taste or authorship. The creator decides what the piece should be. The system makes those decisions expressible, reproducible, manufacturable, and operable.

---

## What the system connects

Sculptura joins work that is normally spread across unrelated tools and specialist businesses:

1. Turning an idea and visual references into explicit design parameters
2. Constructing deterministic jewelry geometry from those parameters
3. Checking whether the result can be printed, cast, finished, and used safely
4. Freezing the approved result into a versioned production record
5. Presenting that release through listings and creator storefronts
6. Calculating a price from manufacturing, payment, platform, and creator values
7. Accepting ordinary purchases or structured commission requests
8. Selecting an eligible regional manufacturing route
9. Sending the approved production package to a casting partner
10. Tracking production, delivery, payout, refunds, and exceptions

These stages belong to separate system domains so a storefront cannot silently change geometry, a design assistant cannot invent prices, and a manufacturer integration cannot become the source of truth for a creator's project.

---

## Who uses it

### Creators

Creators operate the design studio. They bring the idea, references, judgment, and final decisions. They adjust proportions and details, review the three-dimensional result, respond to manufacturing checks, and decide when a design is ready to release.

An approved design can be offered through the shared Sculptura marketplace, a Sculptura creator storefront, a white-label storefront, or a connected channel such as shopify. Sculptura remains the source of truth for the production release and fulfillment state even when another channel produced the sale.

Creating a creator account does not automatically place someone on the homepage. Discovery begins with published work and can later use explicit eligibility, relevance, quality, curation, and performance rules.

### Buyers

Buyers browse released designs, choose an available material and size, and place an order. An ordinary print-on-demand purchase does not require a buyer account.

If a buyer realizes they want to author a new piece rather than purchase an existing release, Sculptura moves them into creator onboarding. They become the creator of a private project and use the Studio under that identity. This is how a passive buyer becomes an active co-designer without giving anonymous checkout direct access to Tessa or ParaCraft.

Checkout must re-establish the current production route and trusted price on the server. It cannot trust manufacturing costs, creator earnings, validation claims, or totals supplied by the browser.

### Commissioners

Commissioners are buyers who ask a creator to develop something specifically for them. They provide references, measurements, preferences, a budget, and a brief. The creator interprets that material and uses the studio to make the design.

Commissioners require accounts. A commission is not a guest form submission. It needs a persistent creator relationship, conversation history, revisions, approvals, payment protection, cancellation rules, delivery of the agreed result, and a dispute path.

Buyers and commissioners do not operate the studio assistant or geometry engine directly. The creator remains responsible for interpreting the brief and authoring the piece.

---

## Making CAD approachable without generating mystery geometry

Creators may work directly with the studio's structured controls. Those controls describe meaningful jewelry choices such as profile, dimensions, thickness, repetition, surface treatment, hardware, material intent, and size behavior.

For people who do not want to confront the full learning curve and expense of conventional jewelry CAD software, the studio also includes **Tessa**.

### Tessa

Tessa is a vision-model assistant, but her architectural role is an intuitive middle layer and operator. She can look at visual references, understand the creator's description, compare relationships in the imagery, and translate that intent into proposed values for the studio's predefined controls.

Tessa runs the middle leg of a relay. The creator supplies taste and intent. Tessa passes constrained numeric parameters forward. She does not draw the piece, generate OpenSCAD, create a mesh, emit vertices, decide castability, or create a production file. She cannot invent a new control or bypass the project schema.

### ParaCraft

ParaCraft is the deterministic compiler framework and the only component that constructs production geometry. OpenSCAD is the engine under its hood. ParaCraft converts accepted parameters into rigid mathematical code, compiles the model, and owns the physical safety lines, including wall thickness, shrinkage allowances, clearances, minimum features, and process-specific constraints.

Creators see the compiled OpenSCAD model in the browser through a WebGL rendering engine. This interactive rendering is a view of the deterministic build, not a second geometry source.

The same supported parameters, compiler version, rule-set version, and build inputs must produce the same geometry. That makes the result inspectable, reproducible, versionable, and testable. There is no model-generated production geometry to hallucinate. If Tessa misunderstands an intention, the mistake remains a visible parameter proposal that the creator can reject or correct before ParaCraft compiles anything.

---

## Checking whether the piece can be made

Looking good in a viewport does not prove that a design can survive pattern production, burnout, casting, finishing, shipping, and ordinary wear.

Before release, the studio validates constraints such as:

- Minimum wall thickness
- Minimum detail and engraving size
- Unsupported, fragile, or disconnected regions
- Trapped spaces and impossible cavities
- Overall dimensions and build envelope
- Estimated volume, metal mass, and center-of-mass concerns
- Tolerances between connected or moving parts
- Material-specific casting constraints
- Requirements imposed by eligible manufacturing processes

These checks require dated and reviewable manufacturing evidence. A rule cannot become trusted because a value sounds plausible or appears in an undated interface constant.

A failing design can remain a studio project and be revised. It cannot be represented to the platform as production-ready.

---

## The design release

When a design passes its required checks, the studio creates an immutable, versioned design release.

That release is the interface between the creative system and the offering system. It records the exact project and engine versions, parameter snapshot, generated files, hashes, renders, supported material and size combinations, validation evidence, and estimated physical properties for one approved version.

It does not contain a permanent retail price. Manufacturing, shipping, payment, tax, and risk costs vary by route and time.

Editing a studio project after release creates a new release version. Existing listings and orders continue to point to the version they actually used. A later creative edit can never silently replace the geometry behind a paid order.

---

## Publishing and storefronts

Platform listings refer to design releases. The platform adds offering information such as title, description, merchandising images, collection placement, discoverability state, available release variants, creator pricing intent, and channel configuration.

Creators can manage storefront identity, content, social links, collections, newsletter options, promotional codes, waitlists, materials they intend to offer, commission availability, and other selling preferences. Each control still needs a clear source of truth and an explicit distinction between a working backend feature and a local demonstration state.

Publishing should reject a release that is missing, revoked, incompatible with the selected offering, or no longer backed by an eligible manufacturing path.

---

## Pricing in either direction

Creators can approach pricing from either side.

### Fix creator earnings

If a creator wants to earn a specific amount per sale, Sculptura calculates the retail price required to cover the current manufacturing quote, payment costs, platform fee, delivery-related amounts, and that earning target.

### Fix retail price

If a creator wants a specific retail price, Sculptura subtracts the trusted current costs and shows the resulting creator earnings.

These are two views of one pricing model:

```text
retail price = manufacturing cost + payment cost + platform fee + creator earnings
```

Shipping, insurance, taxes, currency treatment, refunds, and risk reserves may also affect what is charged or settled. Every order needs an immutable financial snapshot so later quote or pricing changes do not rewrite history.

Client-calculated numbers are previews. Authoritative pricing and checkout values must be calculated from a trusted release, current route, current quote, and server-owned rules.

---

## Ordinary purchases and commissions

Ordinary listings are intended for passive print-on-demand sales. A guest can buy a released design without opening an account. The platform still records enough contact and delivery information to fulfill the purchase and lets a later authenticated account claim eligible guest orders safely.

Commissions are creator-enabled and relationship-based. Switching commissions on makes the creator open to requests, but the request path must require buyer authentication. The commission lifecycle also needs brief intake, conversation, terms, milestones or escrow, revisions, acceptance, cancellation, fulfillment, payout, and disputes before it can be considered complete.

---

## What happens after a purchase

Once payment reaches the required state, operations finds an eligible manufacturing route.

It removes any partner that cannot make the selected material, cannot satisfy the release constraints, cannot serve the destination, lacks the required hallmarking or documentation path, has not completed operational onboarding, or is unavailable.

Remaining routes can be compared using:

- Complete manufacturing cost
- Manufacturing and delivery time
- Distance from the customer
- Duties, customs, VAT, and tariff exposure
- Finishing capability
- Reliability and recent performance
- Insurance and claim limits
- Likely return and delivery complications

Nearest is not always best. The lowest quoted part can become the most expensive complete route after shipping, customs, failure risk, and rework. Routing selects the best approved complete path, not merely the first partner in a list.

---

## How the jewelry is produced

Launch scope is made-to-order metal jewelry.

For a typical cast piece, the selected partner receives the exact approved model and production instructions. The partner produces a castable resin or wax pattern, invests it, removes the pattern through burnout, casts the selected metal into the cavity, cleans and finishes the piece, and ships it with the required records.

Not every three-dimensional printing business can perform this workflow. Plastic prototyping and direct industrial metal printing do not prove precious-metal jewelry casting capability. Every manufacturer record therefore needs evidence for its processes, materials, limits, ordering method, service regions, finishing, hallmarking path, and commercial readiness.

Partners do not need a sculptura-facing portal. Sculptura connects outward through an approved adapter. That may use a public application programming interface, a private commercial integration, or a controlled manual process for a specialist regional casting house.

---

## Materials, stones, and hallmarking

Metal-only jewelry is a permanent product boundary. Sculptura does not supply, sell, source, inventory, grade, insure, or fulfill gemstones.

Whether a later release may support an empty bezel or prepared setting for a buyer-provided future stone is deliberately left open. That is a sand-drawn product line, not a promise. Supporting it would require separate measurement tolerances, liability, intake, shipping, setting, and manufacturer rules, while Sculptura itself would remain metal-only.

Precious-metal products can require fineness testing, assay-office involvement, responsibility marks, a common control mark, importer records, and destination-specific consumer information. Route eligibility therefore includes hallmarking and precious-metal compliance. No single mark or country grouping is assumed to solve every route.

---

## Rollout and geography

Creator signup availability, payout-provider coverage, customer delivery, customs, hallmarking, tax, carrier service, insurance, and returns are separate questions.

Market lists and rollout status change as routes are researched and approved, so they do not belong in this project explanation. The maintained source of truth is under [`operations/country-rollout`](operations/country-rollout/README.md), with locale and cross-border concerns under [`operations/shipping`](operations/shipping/README.md).

Shipping remains deny-by-default. Appearing in a planning cohort does not make a destination live until the complete route is approved.

---

## Payments, payouts, and protection

Creator exploration and design work should not require payout verification merely to begin. Identity and connected-account requirements are enforced when the relevant provider and payout state require them.

Creator earnings are not released simply because a card authorization occurred. Settlement must account for payment capture, manufacturing acceptance, cancellation, refund exposure, chargebacks, delivery, and the applicable claim window.

Shipping, insurance, refunds, and claims are first-class operational records. Corrections are append-only adjustments rather than edits that erase the original transaction.

---

## The operational control tower

Private admin tools supervise the real platform, manufacturing, and operations services. They do not maintain separate copies of business rules.

Operators need to be able to:

- Review design-release and listing exceptions
- Approve, suspend, and inspect manufacturing partners
- See connection and capability health
- Inspect why a route was selected
- Intervene in failed purchases, production, delivery, refund, and payout states
- Manage rollout and operational policy
- Review audit history for consequential changes

Admin access must use authenticated, role-based authorization enforced by the backend. A universal password in client code is not authentication.

---

## A complete example

Imagine someone has collected references for a wide silver ring with a folded-ribbon surface but has never thought of themselves as a jewelry designer.

1. They open a creator project and provide the references and description.
2. Tessa identifies likely design relationships and proposes supported parameters.
3. The creator accepts some suggestions and changes the band width, fold depth, repetition count, ring size, and smooth interior.
4. ParaCraft compiles the exact OpenSCAD model, applies the physical rule set, and exposes the result through the browser WebGL renderer.
5. Studio validation checks wall thickness, fragile details, dimensions, volume, estimated mass, and the applicable casting constraints.
6. The creator revises an area that is too thin.
7. The design passes and becomes design release version 1.
8. The creator publishes a listing and fixes either desired earnings or retail price.
9. A guest buyer selects a supported size and metal and proceeds to checkout.
10. Operations confirms the destination and route, obtains a valid manufacturing price, computes the trusted total, captures payment, and records the exact release, route, and financial snapshot.
11. The manufacturing adapter submits the approved package to an eligible casting partner.
12. The partner produces the pattern, casts and finishes the ring, and ships it with tracking and required documentation.
13. The buyer follows delivery, and the creator sees the sale and eventual payout in their console.
14. If the creator later changes the fold pattern, that becomes version 2. The earlier order still points to version 1.

That is the basic promise: let more people recognize themselves as creators, give their ideas a controlled path into metal, and handle the difficult work between a finished design and a delivered object.

---

## What Sculptura is not

Sculptura is not:

- A prompt box that emits an unexplained mesh
- A system where a vision model generates production geometry
- A marketplace that expects creators to manufacture every order themselves
- A general-purpose three-dimensional printing service
- A gemstone supplier, seller, grader, or inventory holder
- A replacement for a creator's judgment
- A claim that every route, metal, or manufacturer works from day one
- A commission form released without authentication, payment protection, and dispute rules

It is creator-led infrastructure for designing, offering, manufacturing, and delivering made-to-order metal jewelry.
