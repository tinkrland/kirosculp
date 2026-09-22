# what sculptura is

sculptura is a way for a person with a jewelry idea to design it, offer it for sale, and have it manufactured without needing to learn traditional cad software, buy precious metal, keep inventory, or run a workshop.

it is mainly built for independent jewelry creators. a creator may already know exactly what they want a piece to look like, but not know how to turn that idea into a precise three-dimensional model that can actually be cast. sculptura helps them describe the piece, shape it through a guided design process, check whether it can be manufactured, and publish it as a product.

when someone buys the piece, sculptura sends the approved design to a suitable manufacturing partner. that partner produces the jewelry in metal, finishes it, and ships it to the customer. the creator does not have to manufacture or ship each order themselves.

sculptura is not trying to replace the creator's taste. the creator makes the design decisions. the software helps turn those decisions into exact geometry and handles the practical work needed to sell and produce the result.

---

## who uses it

there are three main groups of people involved.

### creators

creators use the design studio. they describe an idea, adjust it, choose dimensions and materials, review the three-dimensional result, and decide when it is ready.

creators can then offer approved designs through a sculptura storefront, a white-label storefront using their own identity, or connected sales channels such as shopify. they can set prices, see estimated earnings, follow orders, and receive payouts without handling the physical manufacturing.

only creators use the design agent and geometry tools. sculptura does not give a buyer an automatic jewelry generator and let them bypass the person whose skill and judgment make the piece coherent.

### buyers

buyers browse finished designs, choose the available metal and size, and place an order. an ordinary purchase does not require an account.

behind the checkout, sculptura checks whether the chosen design, material, destination, manufacturer, price, and delivery route are still valid. the customer is charged from a price calculated by the system, not a number sent from their browser.

### commissioners

a commissioner is a buyer asking a creator to make something specifically for them.

commissioners do not operate the design agent directly. they give a creator references, measurements, preferences, a budget, and a written brief. the creator interprets that material and uses the studio to develop the piece.

commission requests require an account because they involve an ongoing conversation, payment protection, revisions, approval, cancellation rules, and possible disputes. sculptura will not enable commissions until those parts work together. a commission button without the payment and acceptance rules behind it would create more problems than it solves.

---

## how a design is made

rather than asking a creator to draw every surface manually in professional cad software, sculptura lets them work through understandable design choices.

for example, a creator designing a ring might describe:

- the overall profile and proportions
- the shape of the band
- the ring size
- how thick or narrow different areas should be
- whether the surface is plain, twisted, ribbed, engraved, or patterned
- where details repeat and how frequently
- which areas need to remain smooth
- which metals the finished design should support

references and ordinary language help the design agent suggest a set of parameters. the creator can accept, reject, or adjust those suggestions.

the final geometry is not drawn by a language model guessing where points should go. sculptura uses a deterministic jewelry-design engine called paracraft. the approved parameters are converted into readable openscad instructions, and those instructions produce the actual three-dimensional mesh.

this matters because the same parameters and the same engine version should always produce the same result. the design can be inspected, reproduced, and corrected. it is not an unexplained shape that changes every time it is generated.

---

## checking whether the piece can be made

looking good on a screen does not mean a piece can survive printing, casting, finishing, and normal use.

before a design can be offered for sale, sculptura checks practical constraints such as:

- minimum wall thickness
- minimum feature and engraving size
- unsupported or fragile areas
- trapped spaces and impossible cavities
- overall dimensions
- estimated metal volume and mass
- material-specific casting limits
- the requirements of available manufacturing processes

these rules have to come from dated, reviewable manufacturing sources. sculptura should not guess that a 0.6 millimeter wall is safe because it sounds plausible. silver, gold, brass, and bronze can have different limits, and the shape of a feature matters as much as its nominal thickness.

a design that fails a check can still be saved and revised. it simply cannot be published as ready for production.

---

## the approved design record

when a design passes its checks, sculptura creates a versioned design release.

this release is the exact production record for that version of the piece. it includes the design parameters, engine version, manufacturing files, renders, supported materials and sizes, validation result, and estimated mass.

it does not contain a permanent retail price because manufacturing and delivery costs can change by region and over time.

releases are not silently changed. if a creator edits the design later, sculptura creates a new version. an existing order still points to the exact version the customer bought. this prevents a later studio edit from changing the geometry behind a paid order.

---

## publishing and discoverability

passing the manufacturing checks does not automatically make a creator or design prominent.

creating a creator account also does not automatically place someone on the homepage. discoverability comes from published listings and may later depend on quality, relevance, curation, sales history, or other explicit rules.

a creator can decide where an approved design appears:

- the shared sculptura marketplace
- their own sculptura storefront
- a white-label storefront
- connected external sales channels

sculptura remains responsible for the exact design release and production state even when the customer found the product through another channel.

---

## pricing

creators can approach pricing in either direction.

### set the amount the creator wants to earn

if the creator says, “i want to earn $40 from each sale,” sculptura calculates the retail price needed to cover manufacturing, payment costs, platform fees, and the creator's $40 earnings.

### set the retail price

if the creator says, “i want this to sell for $120,” sculptura subtracts the current manufacturing and transaction costs and shows what the creator would earn.

these are two views of the same calculation, not two unrelated pricing systems.

in simplified form:

```text
retail price = manufacturing cost + payment cost + platform fee + creator earnings
```

real orders may also involve shipping, insurance, tax presentation, currency conversion, refunds, or a temporary risk reserve. sculptura records the exact values used for each purchase so a later price change does not rewrite the history of an earlier order.

because manufacturing costs depend on the piece, material, destination, and partner, a rough estimate should always be labeled as an estimate. checkout should use a current production quote whenever the manufacturing connection allows it.

---

## what happens after a purchase

once payment reaches the required state, sculptura finds an eligible way to manufacture the order.

it first removes any partner that cannot make the selected material, cannot meet the design constraints, cannot serve the destination, has not completed the required account setup, or is temporarily unavailable.

it then compares the remaining routes using factors such as:

- the complete manufacturing cost
- distance from the customer
- shipping time and price
- duties, customs, vat, and tariff exposure
- the partner's recent reliability
- finishing options
- insurance and claim limits
- likely delivery and return problems

“nearest” does not always mean best, and the lowest part price can become expensive after shipping and import costs. sculptura is meant to choose the most sensible complete route, not simply the first manufacturer in a list.

---

## how the jewelry is physically produced

sculptura focuses on metal jewelry.

for a typical cast piece, the manufacturing partner receives the exact approved model and production instructions. the partner produces a castable resin or wax pattern, surrounds it with investment material, removes the pattern through burnout, and casts metal into the remaining space. the piece is then cleaned, finished, and shipped.

not every company that offers three-dimensional printing can do this. printing a plastic prototype or a steel industrial part is not the same as producing a cast silver or gold ring. sculptura therefore records each manufacturer's actual processes, materials, limits, ordering method, regions, and evidence separately.

manufacturer records do not become eligible for automatic orders merely because a marketing page mentions jewelry. the required process and material support must be confirmed and approved.

sculptura can work with large services and smaller regional casting houses. a partner does not need a sculptura portal. sculptura connects outward through the partner's available interface. that may be an application programming interface for automatic upload, quotes, orders, and tracking, or a controlled manual process when a specialist casting house has no public interface.

---

## materials and stones

launch scope is metal-only jewelry.

sculptura does not supply gemstones, manage a stone inventory, or promise stone-setting services at launch. a later version may allow a creator to design an empty bezel or prepared setting for a buyer's own stone, but that requires separate tolerances, measurements, liability rules, shipping procedures, and manufacturer support.

supported metals are based on approved manufacturing capability, not a wish list. a metal becomes available only when sculptura has an eligible process, sourced design constraints, a usable quote path, and a manufacturer able to fulfill the route.

---

## hallmarking and precious-metal rules

precious-metal jewelry can require testing, fineness marks, responsibility marks, assay-office involvement, or destination-specific consumer information.

sculptura's manufacturing research includes the convention on the control and marking of articles of precious metals, often called the vienna convention, and the common control mark. the purpose is to establish which target countries participate in or recognize the relevant marking system and how that affects cross-border manufacturing.

sculptura cannot assume that one mark makes a piece legal everywhere. the exact requirements can depend on the country, alloy, fineness, article type, weight, manufacturing location, assay office, importer, and destination. those findings become part of route eligibility so sculptura does not send an order through a route that cannot produce the required marks or records.

---

## shipping rollout

creator signup and customer delivery are separate questions.

### creator signup

sculptura intends to allow creators to sign up wherever its connected payout provider supports the required type of account, subject to provider rules, sanctions restrictions, age requirements, and local law.

full identity verification is not intended to be required just to explore the studio or prepare designs. the planned payout threshold is $20 or €20. before earnings are released at that threshold, the creator must complete the required identity and payout verification.

stripe connect is the intended first payout provider. paypal may become a second option, and providers such as razorpay may be researched for regions where they improve access.

this timing is a product intention, not a way around provider requirements. a payment provider or legal rule may require information earlier, and sculptura must follow that requirement.

### first shipping cohort

sculptura's intended first group of delivery countries is:

- united states
- canada
- united kingdom
- australia
- germany
- france
- italy
- netherlands
- spain
- belgium
- austria
- switzerland
- sweden
- denmark
- ireland
- new zealand

canada, australia, switzerland, sweden, and denmark are marked as higher-purchasing-power priority markets in product planning.

ireland and new zealand carry an internal “freebie candidate” planning tag. that does not promise customers free products, shipping, fees, or immediate availability. it only marks them as intended low-friction additions if the operational checks support that conclusion.

japan, south korea, singapore, the united arab emirates, and norway are possible later additions after more research and suitable regional distributed casting zones are established. norway is also marked as higher-purchasing-power priority, but it remains outside the eu and needs its own import and route treatment.

being named in the first cohort does not automatically turn checkout on. each country still needs an approved manufacturing route, hallmarking review, customs and tax handling, carrier service, insurance, returns process, and customer terms. support is enabled country by country when those pieces are ready.

---

## payments, payouts, and protection

ordinary purchases can use guest checkout. the buyer pays sculptura through the supported payment flow, and sculptura records the manufacturing cost, platform fee, creator earnings, and any delivery-related amounts used for that order.

creator earnings are not simply sent out the instant a card is charged. the payout policy must account for manufacturing acceptance, cancellation, refunds, chargebacks, delivery, and the applicable claim window.

shipping, insurance, refunds, and claims are part of the product rather than loose links to carrier pages. buyers and creators should be able to see what happened, what is waiting, and who is responsible for the next action.

all financial corrections should be recorded as adjustments. sculptura should not erase the original transaction and pretend it never happened.

---

## the operational controls

sculptura needs a private control area for the people running the service.

this is where the team can:

- review design and listing exceptions
- approve or suspend manufacturing partners
- see whether partner connections are healthy
- inspect why a manufacturing route was selected
- intervene in a failed order
- manage country rollout and operational policy
- review payout, delivery, refund, and claim problems
- see an audit history of important changes

these controls should operate the real pricing, manufacturing, and delivery systems. they should not contain separate copies of those rules that slowly become inconsistent.

---

## a complete example

imagine a creator has an idea for a wide silver ring with a repeating folded-ribbon surface.

1. the creator explains the shape and supplies visual references.
2. the design agent helps convert the idea into understandable parameters.
3. the creator adjusts the band width, fold depth, repetition count, ring size, and smooth interior.
4. paracraft generates the exact openscad model and compiles the mesh.
5. sculptura checks wall thickness, fragile details, overall dimensions, volume, estimated mass, and silver-casting constraints.
6. the creator revises one area that is too thin.
7. the design passes and becomes design release version 1.
8. the creator publishes a listing and chooses whether to set desired earnings or a fixed retail price.
9. a buyer in canada selects their size and purchases the ring without creating an account.
10. sculptura confirms that canada is currently enabled, obtains a valid silver-production route and price, and records the exact checkout snapshot.
11. the order is sent to an eligible regional casting partner.
12. the partner produces the castable pattern, casts and finishes the silver ring, and ships it with tracking and the required documentation.
13. the buyer follows delivery through sculptura.
14. the creator sees the sale and eventual payout in their console.
15. if the creator later changes the fold pattern, that becomes version 2. the canadian order still points to version 1.

that is the basic promise: help a creator turn an idea into a controlled, reproducible piece of metal jewelry, let people buy it, and handle the difficult work between a finished design and a delivered object.

---

## what sculptura is not

sculptura is not:

- a prompt box that produces an unexplained mesh
- a marketplace that expects creators to manufacture every order themselves
- a general-purpose three-dimensional printing service
- a gemstone marketplace
- a replacement for a creator's judgment
- a claim that every country, metal, or manufacturer is supported from day one
- a commission feature released before payment and dispute rules exist

it is a focused system for creator-led, manufacturable, made-to-order metal jewelry.