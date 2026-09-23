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
