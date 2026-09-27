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
