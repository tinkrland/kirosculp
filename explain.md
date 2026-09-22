# what sculptura is

## the problem

many people have a clear sense of what they like before they think of themselves as creators. they save jewelry references, collect images on pinterest, notice unusual forms, combine details from different pieces, and imagine something they cannot find in a shop.

for most of them, the idea of becoming a jewelry designer never seriously occurs. the path appears to begin with expensive professional cad software, a steep technical learning curve, knowledge of casting and precious metals, prototype costs, supplier relationships, inventory risk, photography, selling, shipping, and customer support. even imagining the role can feel out of scope.

that means a large amount of creative taste never becomes creative output. the barrier is not necessarily a lack of ideas. it is the cost and complexity between an idea and a finished, sellable piece.

sculptura exists to patch that gap.

it gives a person a path from visual intent to a controlled jewelry design, then connects that design to validation, offering, made-to-order manufacturing, and delivery. the creator does not need to become a conventional cad operator, buy precious metal, fund inventory, own a workshop, or personally fulfill every order before they can discover whether people want their work.

sculptura is not trying to replace taste or authorship. the creator decides what the piece should be. the system makes those decisions expressible, reproducible, manufacturable, and operable.

---

## what the system connects

sculptura joins work that is normally spread across unrelated tools and specialist businesses:

1. turning an idea and visual references into explicit design parameters
2. constructing deterministic jewelry geometry from those parameters
3. checking whether the result can be printed, cast, finished, and used safely
4. freezing the approved result into a versioned production record
5. presenting that release through listings and creator storefronts
6. calculating a price from manufacturing, payment, platform, and creator values
7. accepting ordinary purchases or structured commission requests
8. selecting an eligible regional manufacturing route
9. sending the approved production package to a casting partner
10. tracking production, delivery, payout, refunds, and exceptions

these stages belong to separate system domains so a storefront cannot silently change geometry, a design assistant cannot invent prices, and a manufacturer integration cannot become the source of truth for a creator's project.

---

## who uses it

### creators

creators operate the design studio. they bring the idea, references, judgment, and final decisions. they adjust proportions and details, review the three-dimensional result, respond to manufacturing checks, and decide when a design is ready to release.

an approved design can be offered through the shared sculptura marketplace, a sculptura creator storefront, a white-label storefront, or a connected channel such as shopify. sculptura remains the source of truth for the production release and fulfillment state even when another channel produced the sale.

creating a creator account does not automatically place someone on the homepage. discovery begins with published work and can later use explicit eligibility, relevance, quality, curation, and performance rules.

### buyers

buyers browse released designs, choose an available material and size, and place an order. an ordinary print-on-demand purchase does not require a buyer account.

if a buyer realizes they want to author a new piece rather than purchase an existing release, sculptura moves them into creator onboarding. they become the creator of a private project and use the Studio under that identity. this is how a passive buyer becomes an active co-designer without giving anonymous checkout direct access to Tessa or ParaCraft.

checkout must re-establish the current production route and trusted price on the server. it cannot trust manufacturing costs, creator earnings, validation claims, or totals supplied by the browser.

### commissioners

commissioners are buyers who ask a creator to develop something specifically for them. they provide references, measurements, preferences, a budget, and a brief. the creator interprets that material and uses the studio to make the design.

commissioners require accounts. a commission is not a guest form submission. it needs a persistent creator relationship, conversation history, revisions, approvals, payment protection, cancellation rules, delivery of the agreed result, and a dispute path.

buyers and commissioners do not operate the studio assistant or geometry engine directly. the creator remains responsible for interpreting the brief and authoring the piece.

---

## making cad approachable without generating mystery geometry

creators may work directly with the studio's structured controls. those controls describe meaningful jewelry choices such as profile, dimensions, thickness, repetition, surface treatment, hardware, material intent, and size behavior.

for people who do not want to confront the full learning curve and expense of conventional jewelry cad software, the studio also includes **tessa**.

### tessa

tessa is a vision-model assistant, but her architectural role is an intuitive middle layer and operator. she can look at visual references, understand the creator's description, compare relationships in the imagery, and translate that intent into proposed values for the studio's predefined controls.

tessa runs the middle leg of a relay. the creator supplies taste and intent. tessa passes constrained numeric parameters forward. she does not draw the piece, generate OpenSCAD, create a mesh, emit vertices, decide castability, or create a production file. she cannot invent a new control or bypass the project schema.

### paracraft

paracraft is the deterministic compiler framework and the only component that constructs production geometry. OpenSCAD is the engine under its hood. paracraft converts accepted parameters into rigid mathematical code, compiles the model, and owns the physical safety lines, including wall thickness, shrinkage allowances, clearances, minimum features, and process-specific constraints.

creators see the compiled OpenSCAD model in the browser through a WebGL rendering engine. this interactive rendering is a view of the deterministic build, not a second geometry source.

the same supported parameters, compiler version, rule-set version, and build inputs must produce the same geometry. that makes the result inspectable, reproducible, versionable, and testable. there is no model-generated production geometry to hallucinate. if tessa misunderstands an intention, the mistake remains a visible parameter proposal that the creator can reject or correct before paracraft compiles anything.

---

## checking whether the piece can be made

looking good in a viewport does not prove that a design can survive pattern production, burnout, casting, finishing, shipping, and ordinary wear.

before release, the studio validates constraints such as:

- minimum wall thickness
- minimum detail and engraving size
- unsupported, fragile, or disconnected regions
- trapped spaces and impossible cavities
- overall dimensions and build envelope
- estimated volume, metal mass, and center-of-mass concerns
- tolerances between connected or moving parts
- material-specific casting constraints
- requirements imposed by eligible manufacturing processes

these checks require dated and reviewable manufacturing evidence. a rule cannot become trusted because a value sounds plausible or appears in an undated interface constant.

a failing design can remain a studio project and be revised. it cannot be represented to the platform as production-ready.

---

## the design release

when a design passes its required checks, the studio creates an immutable, versioned design release.

that release is the interface between the creative system and the offering system. it records the exact project and engine versions, parameter snapshot, generated files, hashes, renders, supported material and size combinations, validation evidence, and estimated physical properties for one approved version.

it does not contain a permanent retail price. manufacturing, shipping, payment, tax, and risk costs vary by route and time.

editing a studio project after release creates a new release version. existing listings and orders continue to point to the version they actually used. a later creative edit can never silently replace the geometry behind a paid order.

---

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

commissions are creator-enabled and relationship-based. switching commissions on makes the creator open to requests, but the request path must require buyer authentication. the commission lifecycle also needs brief intake, conversation, terms, milestones or escrow, revisions, acceptance, cancellation, fulfillment, payout, and disputes before it can be considered complete.

---

## what happens after a purchase

once payment reaches the required state, operations finds an eligible manufacturing route.

it removes any partner that cannot make the selected material, cannot satisfy the release constraints, cannot serve the destination, lacks the required hallmarking or documentation path, has not completed operational onboarding, or is unavailable.

remaining routes can be compared using:

- complete manufacturing cost
- manufacturing and delivery time
- distance from the customer
- duties, customs, vat, and tariff exposure
- finishing capability
- reliability and recent performance
- insurance and claim limits
- likely return and delivery complications

nearest is not always best. the lowest quoted part can become the most expensive complete route after shipping, customs, failure risk, and rework. routing selects the best approved complete path, not merely the first partner in a list.

---

## how the jewelry is produced

launch scope is made-to-order metal jewelry.

for a typical cast piece, the selected partner receives the exact approved model and production instructions. the partner produces a castable resin or wax pattern, invests it, removes the pattern through burnout, casts the selected metal into the cavity, cleans and finishes the piece, and ships it with the required records.

not every three-dimensional printing business can perform this workflow. plastic prototyping and direct industrial metal printing do not prove precious-metal jewelry casting capability. every manufacturer record therefore needs evidence for its processes, materials, limits, ordering method, service regions, finishing, hallmarking path, and commercial readiness.

partners do not need a sculptura-facing portal. sculptura connects outward through an approved adapter. that may use a public application programming interface, a private commercial integration, or a controlled manual process for a specialist regional casting house.

---

## materials, stones, and hallmarking

metal-only jewelry is a permanent product boundary. sculptura does not supply, sell, source, inventory, grade, insure, or fulfill gemstones.

whether a later release may support an empty bezel or prepared setting for a buyer-provided future stone is deliberately left open. that is a sand-drawn product line, not a promise. supporting it would require separate measurement tolerances, liability, intake, shipping, setting, and manufacturer rules, while sculptura itself would remain metal-only.

precious-metal products can require fineness testing, assay-office involvement, responsibility marks, a common control mark, importer records, and destination-specific consumer information. route eligibility therefore includes hallmarking and precious-metal compliance. no single mark or country grouping is assumed to solve every route.

---

## rollout and geography

creator signup availability, payout-provider coverage, customer delivery, customs, hallmarking, tax, carrier service, insurance, and returns are separate questions.

market lists and rollout status change as routes are researched and approved, so they do not belong in this project explanation. the maintained source of truth is under [`operations/country-rollout`](operations/country-rollout/README.md), with locale and cross-border concerns under [`operations/shipping`](operations/shipping/README.md).

shipping remains deny-by-default. appearing in a planning cohort does not make a destination live until the complete route is approved.

---

## payments, payouts, and protection

creator exploration and design work should not require payout verification merely to begin. identity and connected-account requirements are enforced when the relevant provider and payout state require them.

creator earnings are not released simply because a card authorization occurred. settlement must account for payment capture, manufacturing acceptance, cancellation, refund exposure, chargebacks, delivery, and the applicable claim window.

shipping, insurance, refunds, and claims are first-class operational records. corrections are append-only adjustments rather than edits that erase the original transaction.

---

## the operational control tower

private admin tools supervise the real platform, manufacturing, and operations services. they do not maintain separate copies of business rules.

operators need to be able to:

- review design-release and listing exceptions
- approve, suspend, and inspect manufacturing partners
- see connection and capability health
- inspect why a route was selected
- intervene in failed purchases, production, delivery, refund, and payout states
- manage rollout and operational policy
- review audit history for consequential changes

admin access must use authenticated, role-based authorization enforced by the backend. a universal password in client code is not authentication.

---

## a complete example

imagine someone has collected references for a wide silver ring with a folded-ribbon surface but has never thought of themselves as a jewelry designer.

1. they open a creator project and provide the references and description.
2. tessa identifies likely design relationships and proposes supported parameters.
3. the creator accepts some suggestions and changes the band width, fold depth, repetition count, ring size, and smooth interior.
4. paracraft compiles the exact OpenSCAD model, applies the physical rule set, and exposes the result through the browser WebGL renderer.
5. studio validation checks wall thickness, fragile details, dimensions, volume, estimated mass, and the applicable casting constraints.
6. the creator revises an area that is too thin.
7. the design passes and becomes design release version 1.
8. the creator publishes a listing and fixes either desired earnings or retail price.
9. a guest buyer selects a supported size and metal and proceeds to checkout.
10. operations confirms the destination and route, obtains a valid manufacturing price, computes the trusted total, captures payment, and records the exact release, route, and financial snapshot.
11. the manufacturing adapter submits the approved package to an eligible casting partner.
12. the partner produces the pattern, casts and finishes the ring, and ships it with tracking and required documentation.
13. the buyer follows delivery, and the creator sees the sale and eventual payout in their console.
14. if the creator later changes the fold pattern, that becomes version 2. the earlier order still points to version 1.

that is the basic promise: let more people recognize themselves as creators, give their ideas a controlled path into metal, and handle the difficult work between a finished design and a delivered object.

---

## what sculptura is not

sculptura is not:

- a prompt box that emits an unexplained mesh
- a system where a vision model generates production geometry
- a marketplace that expects creators to manufacture every order themselves
- a general-purpose three-dimensional printing service
- a gemstone supplier, seller, grader, or inventory holder
- a replacement for a creator's judgment
- a claim that every route, metal, or manufacturer works from day one
- a commission form released without authentication, payment protection, and dispute rules

it is creator-led infrastructure for designing, offering, manufacturing, and delivering made-to-order metal jewelry.
