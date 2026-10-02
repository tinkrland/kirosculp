# research notes and evidence boundaries

research used the connected tavily search and firecrawl page reader. the sources below support *patterns* and terminology, not product approval, castability, supplier availability or permission to reproduce a proprietary design.

| source | what it actually supports | boundary |
|---|---|---|
| [jweel's browser-based creator overview](https://www.jweel.com/index.html), [text-ring editor](https://www.jweel.com/html/textring.html), [embossed-ring editor](https://www.jweel.com/html/embossed-ring.html) | browser 3d preview, quick font/text choice and raised/recessed image-ring interactions; useful interaction inspiration | not evidence of current fulfillment availability, paracraft compatibility or permission to copy its designs |
| [national museum of ireland: claddagh rings](https://www.museum.ie/en-IE/Collections-Research/Folklife-Collections/Folklife-Collections-List-%281%29/Other/Curators-Choice/Claddagh-Rings) | traditional hands holding a crowned heart; meanings associated with friendship, love and loyalty | no supplied openscad model or manufacturing rules; honor the cultural motif without copying a jeweler's distinct design |
| [quick jewelry repairs: earring-back types](https://quickjewelryrepairs.com/articles/earring-back-types) | butterfly/push, threaded screw, french wire, clip/omega and leverback mechanisms, including the need for a matching threaded post | one repairer's description is not a supplier specification or proof a selected post and back fit |
| `repo-audit/sculptura/src/lib/jewelryDefaults.js` | existing categories, earring mechanisms, chains, finishes and browser defaults | client controls only, not approved castable designs or interchangeable components |
| `repo-audit/sculptura/src/lib/jewelryTemplates.js` | initials/names, signet, hoop/drop starter templates; also stone-bearing presets | stone templates contradict sculptura's metal-only direction and are excluded here |
| `repo-audit/sculptura.dev/src/components/market/settings/SettingsMaterials.jsx` | creator-editable material suggestions, including nonmetal resin and ceramics | do not equate a profile tag with release support or a current manufacturer route |

## research gaps before enabling checkout

get a real manufacturer or findings supplier to specify supported alloys, post gauges, matched back/closure part numbers, attachment method, available finish and tested retention. obtain dated metal/process rules for each archetype and each size, including engraving/emboss thickness and artifact proof. verify regional metal-contact, hallmarking and consumer requirements. map each published choice to a validated release and current route. nothing in this folder completes those gates.

## style vocabulary sprawl (2026-09-27)

sources used for the [style vocabulary](../styles/README.md), all supporting
terminology and pattern claims only, not product approval:

| source | what it actually supports | boundary |
|---|---|---|
| [antique jewellery company: a journey through the eras](https://www.antiquejewellerycompany.com/a-journey-through-the-eras) | era bounds and defining motifs for georgian, victorian, art nouveau, edwardian, art deco, retro; e.g. victorian hearts/hands/knots/serpents, art nouveau curved lines and nature motifs, edwardian bows/garlands/ribbons/lace | dealer prose, not a neutral taxonomy; era dates are conventions |
| [lang antiques university: art deco jewelry](https://www.langantiques.com/university/learn-with-lang/art-deco-jewelry) | art deco geometry, angularity, industrial-era context | dealer education content |
| [velvetmatter: brutalist jewelry design style](https://velvetmatter.art/design_styles/brutalist-jewelry) | brutalist raw/heavy/industrial descriptors | art-design blog, single-source for those descriptors until corroborated |
| tavily search results on customer jewelry language | descriptor axes actually used by shoppers: dainty, chunky, ornate, minimalist/maximalist, statement | search snippets, not behavioral data; treat phrase weights as drafted |

### style vocabulary v0.1.1 refinement (2026-09-27)

| source | what it actually supports | boundary |
|---|---|---|
| [mozeris fine antiques: art deco jewellery](https://www.mozerisfineantiques.com/blogs/guide-to-art-deco-jewellery), [filigree jewelers era guide](https://filigreejewelers.com/blogs/articles/what-defines-art-deco-jewelry), [beladora art deco bracelets guide](https://www.beladora.com/blogs/blog/the-definitive-guide-to-art-deco-bracelets) | art deco motifs: sunburst, chevron, zigzag, platinum-and-diamond idiom, strong color contrast | dealer guides; corroborate the lang university account of the era |
| lang university art deco page (above) | cubist reading of deco geometry; egyptian revival motifs (lotus, pyramid, eye of horus, scarab) after tutankhamun 1922; calibre settings; islamic and persian motif borrowings | dealer education content; islamic/persian motif families held out of v0.1.1 with the culturally loaded names |
| retail coverage of the everyday-fine category (mejuri-adjacent coverage in vogue, the good trade) | retailers name the category "everyday fine jewelry"; "minimalist" is a descriptor, not a style name | brand-adjacent editorial, not neutral taxonomy; rename recorded in vocabulary lineage |

### symbol vocabulary v0.1.0 (2026-09-27)

| source | what it actually supports | boundary |
|---|---|---|
| [astro ak: the seven metals, alchemy and the planets](https://www.astroak.com/en/blog/the-seven-metals-alchemy-and-the-planets), [wikipedia: planetary symbols](https://en.wikipedia.org/wiki/Planetary_symbols) | the classical planetary metal correspondences (gold/sun, silver/moon, copper/venus, iron/mars, tin/jupiter, lead/saturn, mercury/mercury) | historical/symbolic tradition, not efficacy claims; non-castable metals stay informational |
| element metal-affinity pairings in the vocabulary | sculptura merchandising hints, explicitly flagged `hint_is_ours` | our own suggestion, not a classical claim; opt-in labeling by customers and creators |

### promotions sprawl (2026-09-27)

| source | what it actually supports | boundary |
|---|---|---|
| [spri.ng (teespring) creator resources: promotions](https://www.spri.ng/creator-resources/promotions) | creator-level promo codes exist on creator commerce platforms and cannot be stacked there | single-platform practice; our lane rule goes further by defining the funding side rather than blanket-forbidding stacking |

### registrar and subdomain email note (2026-09-27)

| source | what it actually supports | boundary |
|---|---|---|
| [porkbun api documentation](https://porkbun.com/api/json/v3/documentation), [porkbun api knowledge base](https://kb.porkbun.com/article/307-getting-started-with-the-porkbun-api) | a documented api exists for domain registration and dns management | api surface verified for porkbun; name.com and spaceship api depth not independently verified yet |
| zoho mail free tier (five free inboxes per custom domain) | free inbox provisioning exists as a category | not a platform dependency: free tiers are not api-provisionable per subdomain at scale, and the routing model removes the need for creator mailboxes on storefront domains |

### style vocabulary v0.3.0 evidence pass (2026-09-28)

| source | what it actually supports | boundary |
|---|---|---|
| [estatediamondjewelry: history of 7 jewelry eras](https://www.estatediamondjewelry.com/eras-of-antique-jewelry), [solitaire jewelers antique guide](https://www.solitairejewelers.com/pages/antique-jewelry-guide.html), [lillianes: art deco or edwardian](https://lillianesjewelry.com/art-deco-or-edwardian-how-to-spot-your-jewelry) | era signatures: georgian hand metalwork, victorian softer gold with serpent/heart/knot, edwardian platinum delicacy, nouveau freeform asymmetry | dealer-era guides; corroborate existing records, add modest features |
| [lindseyscoggins: moon and star jewelry history](https://lindseyscoggins.com/blogs/the-rough/moon-and-star-jewelry-a-history), [linknecklaces: celestial stories](https://linknecklaces.com/blogs/backstage/celestial-stories), [enroute: what is celestial jewelry](https://www.enroutejewelry.com/blogs/index/what-is-celestial-jewelry-a-guide-to) | celestial motifs: moon/star/sun, crescents, constellation dot patterns; personal-symbolism meaning | dedicated guides; symbolism cross-links the symbol layer, never an efficacy claim |
| [american gem society: quick guide to gothic jewelry](https://www.americangemsociety.org/quick-guide-to-gothic-jewelry), [bikerringshop: what is gothic style jewelry](https://www.bikerringshop.com/blogs/jewelry/what-is-gothic-style-jewelry) | gothic motifs: crosses, daggers, skulls, chains, oxidized silver idiom; biker adjacency | ags is an industry body; bikerringshop is a specialist shop guide |
| 1stdibs/pinterest listing corpora (mid-century, brutalist, organic modern) | corroborate abstract/geometric, raw stark, and natural-modern readings | marketplace listings, not guides; kept as corroboration only, dedicated sources still needed |

### search store note (2026-09-28)

| source | what it actually supports | boundary |
|---|---|---|
| [falkordb docs: vector indexing](https://docs.falkordb.com/cypher/indexing/vector-index), [falkordb: hybrid search in ai](https://www.falkordb.com/blog/what-is-hybrid-search-in-ai) | knn vector similarity on vector node properties (cosine/euclidean), hybrid with graph and keyword query | docs corroborate the two-track latent model in one store; query-time behavior to be verified in the supabase+falkordb prototype leg |

### style vocabulary v0.3.1: weak-style evidence pass (2026-09-28)

| source | what it actually supports | boundary |
|---|---|---|
| [lang antiques university: retro era jewelry](https://www.langantiques.com/university/retro-era-jewelry), [robinsons jewelers: rise and fall of retro](https://robinsonsjewelers.com/blogs/news/the-rise-and-fall-of-quot-retro), [antique jewellery company: guide to retro](https://www.antiquejewellerycompany.com/a-guide-to-retro-jewellery) | retro era (1940s-50s): gold bows, scrolls, florals, three-dimensional goldwork, fabric motifs, movement/realism | dealer education + two dealer guides; corroborated |
| [lang antiques university: brutalist jewelry](https://www.langantiques.com/university/brutalist-jewelry), [antiquesage: vintage avant-garde](https://www.antiquesage.com/vintage-avant-garde-brutalist-modernist-jewe) | 1960s-70s brutalist: raw textures, chunky forms, architecture-inspired, rough finishes | dealer education + specialist dealer; corroborated |
| [element79: mid-century modern jewelry guide](https://www.element79jewelry.com/blogs/element-79s-jewelry-blog/a-guide-), [skyjems: scandinavian modern jewellery](https://skyjems.ca/pages/encyclopedia-scandinavian-modern-jewellery), [jensensilver + bard graduate center georg jensen scholarship](https://www.jensensilver.com/braving-the-modern-georg-jensen-jewelry-192) | mid-century/scandinavian modernist: sculptural abstract forms, organic + geometric, jensen/skonvirke lineage linking to art nouveau | dealer education + academic center; corroborated |
| same scandinavian/jensen scholarship | organic modern reading: sculptural organic forms, nature-plus-modern | shares sources with mid-century; confusable edge stands |

### 2026 bridal and fine jewelry trend signals (2026-09-28)

| source | what it actually supports | boundary |
|---|---|---|
| [adorabysimona: 2026 wedding fashion trends](https://www.adorabysimona.com/blogs/bridal-styling-guides/2026-wedding-fashion-trends-the-jewelry-accessories-defining-next-year-brides) | structured/sculptural gowns pair with geometric metal earrings, arcs/bars, sculptural smooth metal cuffs, high-shine metallics | bridal styling guide by a bridal shop; trend language evidence, not taxonomy |
| [dickinson jewelers: 2026 bridal jewelry trends](https://www.dickinsonjewelers.com/blog/wedding/2026-bridal-jewelry-trends-what-brides-are-actually-wearing-this-year) | statement/sculptural earrings, chain layering in bridal, deliberate asymmetry, mixed metals accepted, 12-hour comfort, "close enough" custom pitch | retailer blog (gabriel & co dealer); sells custom design, so custom framing is self-interested |
| [gabriel & co: jewelry trends 2026](https://www.gabrielny.com/blog/jewelry-trends-2026/) | single sculptural hero pieces, chunky chains evolving to curved/inflated/hollow links, two-tone metals, brushed/satin over mirror finishes; visual check of spike bypass ring, wave stackable, geometric and hollow-tube link chains (browserbase) | brand trend blog with product placement; examples are their catalog, visual confirmation via browserbase session 2026-09-28 |

### dainty minimal stacking trends (2026-09-28)

| source | what it actually supports | boundary |
|---|---|---|
| [isabellacelini: stackable jewelry trend 2026](https://isabellacelini.com/blogs/news/stackable-jewelry-trend-2026) | explicit layering formulas (necklace lengths, 3-5 bracelet stacks with one focal, thin multi-band rings), same-metal-tone polish, texture mixing over oversized pendants | gold-filled jewelry shop styling guide; sells the aesthetic it describes |
| [michael agnello jewelers: 2026 fine jewelry trends](https://www.michaelagnellojewelers.com/blog/2026-fine-jewelry-trends) | bold-yet-wearable direction, unique silhouettes, mixed metals in everyday-scale fine jewelry | retailer trend page built around designer brands it stocks |

### manufacturing partner discovery (2026-09-28)

| source | what it actually supports | boundary |
|---|---|---|
| [voxelmatters directory: 3d printing companies](https://www.voxelmatters.directory/companies/) | a maintained industry directory with directly relevant categories for us: jewelry 3d printer manufacturer, precious metal powders, metal 3d printing service, finishing service provider, 3d print shop/service networks | directory of the additive manufacturing industry, not jewelry-specific; category filtering is js-driven and resisted automated scraping, so per-category company extraction is an unfinished manual pass. verdict: bookmark as a partner-discovery resource, not yet mined |

### channel integration tooling (2026-09-29)

| source | what it actually supports | boundary |
|---|---|---|
| [openship docs: order routing](https://docs.openship.org/docs/openship/ecommerce) | openship is a real open-source order-routing oms (shops as sources, channels as fulfillment destinations, links, item matches); repo ships shopify and openfront adapters; docs state credential handling and non-durable callback paths require hardening before production orders | project documentation of an early-stage oss project; adapter coverage is thin, so wix/amazon/weebly/bigcartel/bigcommerce support is not present out of the box |
| [openlinker.io](https://openlinker.io/en/) and [integrations page](https://openlinker.io/en/integrations/) | correction: real open-source (apache 2.0, v0.12.0 alpha) self-hosted integration platform; port/adapter architecture, resumable cursor-based ingestion, bidirectional inventory sync, listing wizard; live integrations are poland-market (allegro, erli, ksef, polish invoicing) with prestashop/woocommerce destinations | an earlier search pass failed to surface it and wrongly called it confabulated, corrected 2026-09-29; alpha software, no shopify/wix/amazon adapters live, so reference implementation only |
| [headless commerce comparisons (vendure, contracollective, pkgpulse)](https://vendure.io/blog/best-headless-commerce-platforms) | medusa v2 and saleor are real, self-hostable headless commerce engines (node vs python, permissive licenses, storefront sdks) | vendor-comparison content; confirms category (commerce engines, not channel connectors), not fitness for our stack |
