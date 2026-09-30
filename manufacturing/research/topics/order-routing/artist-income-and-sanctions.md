# artist income, withholding and sanctions: separate research layers

researched 2026-09-30. this is evidence and a classification question, not an
approved tax design, a guarantee of no itin or an enacted artist-country ban.
source identifiers resolve in [sources.json](sources.json).

## the quoted artist-margin claim is too broad

retail price minus manufacturing costs and platform fees is an economic payout
formula. calling that amount an artist margin does not make it an irs income
category, prove foreign source or eliminate withholding obligations.

foreign residence and creating a design abroad do not establish the source of
every physical-product or digital-content sale. the irs source table in
`withholding-irs-inventory-table` distinguishes:

| income / transaction | relevant sourcing factor |
|---|---|
| services | where services are performed |
| purchased inventory | where sold, subject to applicable title/office and other sourcing rules |
| produced inventory | where produced; allocation may be necessary |
| copyright/patent royalties | where the rights/property are used |
| other personal-property sales | tax-home rule with statutory exceptions; inventory cannot be silently treated as this category |

`withholding-produced-inventory-code` and
`withholding-purchased-inventory-code` add the relevant irc 863/865 distinctions.
actual taxpayer ownership, manufacturing contracts, seller/agent identity,
rights transferred and us business activity must be classified. us manufacturing
can matter; it does not automatically decide the result without those facts.
a digital item can involve different rights or services and is not universally
foreign-source simply because the creator uses a marketplace from abroad.

## backup withholding is not all withholding

`withholding-irs-w8-instructions` describes foreign-status documentation and
exceptions from domestic information reporting/backup withholding in applicable
cases. the payer must establish the relevant facts and valid documentation;
"strictly exempt" is not a substitute for those requirements.

backup withholding under irc 3406 is distinct from nonresident withholding under
chapter 3. `withholding-irs-fdap` describes the usual 30% treatment of qualifying
us-source non-eci fdap income, including royalties, subject to treaty relief and
other applicable exceptions. this is not a command to withhold 30% from every
foreign artist or every retail sale. effectively connected income needs its own
treatment and may create us return/tax-id obligations.

absence of a 1099, a non-us payment processor, a foreign bank account, a foreign
payer or a wallet balance label proves neither income source nor exemption.

## what redbubble's public documents establish

`withholding-rb-agreement-firecrawl`, the user agreement, describes the artist
as principal in the transaction with the buyer. redbubble supplies facilitation
services and arranges fulfillment/payment under the artist's instructions.
its content license is royalty-free, and its taxation provisions describe
artist responsibilities alongside redbubble's applicable indirect-tax duties.

`withholding-rb-1099-firecrawl` says independent artists are sellers, not
redbubble employees/contractors, and that it does not issue them tax forms.
`withholding-rb-payment-firecrawl` explains base price, artist markup and
applicable marketplace tax handling. these are not official rulings that all
artist receipts are foreign-source or that no foreign artist can ever need an
itin. public materials reviewed here do not establish a universal chapter-3
withholding or w-8ben policy.

redbubble's seller/facilitator structure is a useful comparison, not a loophole
created by renaming royalties. the actual sculptura agreements and conduct must
support whichever relationship and income classification they establish.

## an itin need not be the default, but cannot be ruled out universally

`withholding-irs-w8-instructions` states that for applicable treaty-benefit
claims, an itin is generally required if the person does not provide the tax
identifier issued by their tax-residence jurisdiction. a valid foreign tin can
therefore generally be used in place of an itin in those claims, subject to the
specific requirements. w-8ben establishes foreign status for eligible individuals;
entities, us persons and effectively connected income need the appropriate
separate forms/rules.

proposed product objective: avoid imposing an itin by default where law permits,
collect appropriate private tax documentation, and apply only legally required
withholding/reporting. do not promise universal no-itin/no-withholding treatment
or make artist nationality a substitute for verified tax status.

before implementation, obtain a reviewed classification of physical inventory,
commission services and any ip/digital licensing; withholding/reporting duties;
foreign-tin/treaty handling; and the legally relevant payment/crediting event.
merely postponing bank withdrawal does not establish that wallet crediting has
no tax consequences. payout identity verification and tax-document timing are
separate compliance questions.

## artist-scope proposals versus sanctions obligations

the owner's possible exclusion of artists in eaeu member/observer jurisdictions
remains tentative. it is an artist-admission business-policy proposal, not proof
that every such jurisdiction is comprehensively prohibited by us law. it does
not authorize a buyer/manufacturer ban or a new geographic allowlist here.

`withholding-ofac-country-scope` expressly says ofac does not maintain one
specific list of countries that us persons cannot do business with. programs
vary between broad geographic and targeted restrictions. use current
`withholding-ofac-programs`, applicable regulations, person/entity screening,
ownership rules, payment intermediaries and any relevant license/exemption.
country membership and nationality are not substitutes for that analysis;
sanctioned persons can be located outside a broadly restricted jurisdiction.

observer status must also be current and separately verified. the official eec
search evidence identifies iran's observer accession on 26 december 2024; older
observer lists can omit it. other retrieved references include historical
material and an eurasian development bank participation list, which must not
be mistaken for current eaeu membership. no complete validated admission list
has been frozen in this pass.

define residence, operating location, payment jurisdiction and any applicable
citizenship criteria explicitly before an admission policy is implemented.
keep legally required private compliance data separate from public creator
geography and do not conflate this screening with the two product-routing axes.

## implementation boundaries

studio geometry/release validation does not determine tax source, withholding
or sanctions. platform/operations need their own reviewed legal/payment facts.
preserve fixed-net/fixed-retail pricing, and separately disclose lawful income
withholding rather than disguising it as a platform fee or assuming quoted
creator earnings necessarily equal the eventual bank transfer.

see [regional routing](europe-north-america.md), [quebec](quebec.md), and
[the route evidence contract](route-evidence-contract.md).
