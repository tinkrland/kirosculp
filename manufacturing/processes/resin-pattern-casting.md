# resin-pattern casting

the variant of investment casting sculptura actually runs: the pattern is a 3d printed photopolymer (castable resin) rather than carved wax. same mold family, very different burnout physics. recovered from the sculptura.dev-research study (2026-09-11), citations inline.

## the core divergence: resins do not melt

- **microcrystalline wax** melts at [60-75°C](https://www.ganoksin.com/article/sprue-system-design/), flows out of the flask as a liquid at the low-temperature holds, and evacuates [98-99% of its volume](https://www.scribd.com/document/356863637/DFU-SC20-KC2000) before oxidation even begins.
- **photopolymer resin** is a cross-linked thermoset: [it does not melt](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf). heated inside the mold it first expands as a solid by [2.0-3.0% between 200°C and 400°C](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf), then breaks down by pyrolysis into hydrocarbon vapor between [300°C and 600°C](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0p.pdf).

## why that breaks naive workflows

1. **mold cracking and finning:** the solid expansion presses outward against the rigid investment cavity. in standard gypsum investment this causes micro-cracking, finning, heavy flashing, or flask blowouts ([r&r](https://www.ransom-randolph.com/plasticast)).
2. **ash porosity:** resin aromatics and photoinitiators (tpo, tpo-l) leave fixed carbon ash. without oxygen and hold time the ash stays in the cavity, then reacts with molten metal and freezes in as gas porosity, black inclusions, and pitting ([formlabs guide](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf)).
3. **sulfur attack:** if ash remains above roughly 730-750°C in gypsum investment, the binder decomposes and [releases sulfur dioxide](https://www.sciencedirect.com/science/article/abs/pii/S0040603103007500), ruining silver and gold surfaces.

## the required modifications

| requirement | value | source |
|---|---|---|
| investment | high-expansion reinforced (r&r plasticast) or phosphate-bonded | [r&r](https://www.ransom-randolph.com/plasticast) |
| ramp 150-370°C | max 2.5-3.0°C/min | [formlabs](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0p.pdf) |
| top hold | 732-780°C (gypsum) held 3.0-6.0 h, versus 2 h for wax | [formlabs](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0p.pdf), [liqcreate](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/) |
| kiln ventilation | top exhaust, bottom intake, or active air injection at 5 L/min | [formlabs guide](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf) |
| washing and cure | two clean-ipa wash cycles, controlled uv cure before casting | [liqcreate](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/) |
| hollowing rule (recovered study) | solid sections thicker than 10 mm shelled to 0.8-1.0 mm walls with two 1.5 mm drain holes | [formlabs guide](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf) |

burnout phase table (3.5 x 4.0 in flasks) from the recovered study:

| phase | wax schedule | resin schedule | mechanism |
|---|---|---|---|
| dewax / low ramp | to 150-200°C at 3-5°C/min, hold 1-2 h ([kerr sc20](https://www.scribd.com/document/356863637/DFU-SC20-KC2000)) | to 150°C at 2.5°C/min, hold 2-3 h ([rio grande plasticast sheet](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf)) | liquid wax drainage versus moisture evaporation and resin softening |
| pyrolysis ramp | to 370-480°C at 4-6°C/min, hold 1-2 h | to 370°C at 3°C/min, hold 2-3 h ([formlabs](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0p.pdf)) | polymer chain degradation; slow ramp prevents mold cracking |
| high burnout | to 732°C, hold 2-3 h ([ganoksin](https://www.ganoksin.com/article/wax-casting-burnout-cycles/)) | to 732°C, hold 3-5 h | complete carbon oxidation |
| cool to flask temp | to 480-650°C, hold 1-2 h | to 480-650°C, hold 1-2 h | thermal stabilization before pour |

## conflict with the 2026-09-23 harvest, unresolved

the recovered study's hollowing rule (shell anything over 10 mm thick) conflicts with the [formlabs casting whitepaper](https://formlabs.com/resources/casting-direct-investment-jewelry/) value in the [rule digest](../../buildplan/paracraft/rule-digest.md): shell at 3 mm, with 0.7 mm minimum shell walls. both cite formlabs materials. per house rules this is recorded, not averaged: it stays on the conflict list and moves to the ask questions for partners, because the safe threshold depends on the specific resin and investment pairing.

## what this means for sculptura

the burnout discipline belongs to the casting partner, not sculptura. what belongs to sculptura is the geometry side: patterns must arrive hollowed and drained per the resin rules, negative features wider than deep, and nothing so thick that expansion has nowhere to go. those are paracraft validation rules, sourced from this page and the [defect catalog](defect-modes.md), and enforced before any release can be listed.
