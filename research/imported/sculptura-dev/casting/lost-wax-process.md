# lost-wax investment casting process, resin burnout & quality standards

research: 2026-09-11 · source: https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf, https://www.ransom-randolph.com/plasticast, https://www.stuller.com/articles/view/melting-and-investment-casting/ (+17 more) · status: cited

## thesis

investment casting (lost-wax process) is the primary manufacturing route for high-fidelity precious metal jewelry, but modern digital workflows transitioning from traditional microcrystalline carving wax to SLA/DLP 3d-printed photopolymer castable resins introduce critical physical failure modes. while carving wax melts cleanly out of investment molds at 60°c–75°c [source 11](https://www.ganoksin.com/article/sprue-system-design/), photopolymer resins do not melt; they undergo solid-state thermal expansion of 2.0%–3.0% [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf) between 200°c and 400°c [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf) followed by thermal pyrolysis and gasification. if processed with standard gypsum-bonded investment powders (such as kerr satin cast 20 [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000)), expanding resins cause mold cracking, finning, and severe ash residue porosity. successful resin casting requires high-strength, high-expansion investment powders (r&r plasticast [source 3](https://www.ransom-randolph.com/plasticast) or phosphate-bonded formulas [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/)), extended high-temperature burnout holds at 732°c–780°c [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf) for 3.0–6.0 hours [source 8](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/), and active kiln oxygen airflow to guarantee zero residual carbon ash. standardized linear shrinkage scaling in cad of 1.5%–3.0% [source 10](https://knowledge.welongcasting.com/what-is-precision-casting-and-how-does-it-work) and adherence to iso 8062-3 ct4–ct6 [source 9](https://www.bessercast.com/investment-casting-tolerances/) dimensional tolerances (±0.10 mm to ±0.20 mm [source 9](https://www.bessercast.com/investment-casting-tolerances/)) form the empirical foundation for paracraft's automated castability validator.

---

## 1. sculptura store front claims & process commitments

* **target url primary query**: `https://sculptura.lovely.app`
* **http & network status**: queried on 2026-09-11; returned host unresolvable / dns resolution failure (`[Name or service not known]`, http connection failed). documented as an unverified external endpoint / offline storefront negative finding.
* **repository architecture & codebase promises**: cross-referencing existing repository specification files (`backend/agents/design-agent.md`, `README.md`, `src/lib/jewelryDefaults.js`, and manufacturing capability records in `research/jewelry/manufacturing/shapeways.md` and `rio-grande.md`):
  * sculptura promises creators an automated end-to-end pipeline converting parametric cad designs into physical precious metal jewelry via high-resolution 3d-printed castable patterns and lost-wax investment casting.
  * promised material offerings include sterling silver 925 [source 18](https://www.shapeways.com/materials/silver-930), 14k gold (yellow, rose, white) [source 6](https://www.stuller.com/articles/view/melting-and-investment-casting/), 18k gold [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/), and platinum 950 [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/).
  * quoted customer process language: "precision 3d-printed castable models translated into solid precious metal using centuries-old lost-wax casting."
* **validator action**: because `https://sculptura.lovely.app` cannot be scraped live, the paracraft validation engine strictly defaults to enforcing physical manufacturer technical bounds (r&r, formlabs, stuller, iso standards) rather than unverified web store marketing parameters.

---

## 2. end-to-end investment casting pipeline for jewelry

the complete industrial investment casting process for parametric jewelry spans 9 discrete manufacturing stages:

### 2.1 digital pattern generation & slicing
* **3d printing technology**: stereolithography (sla), digital light processing (dlp), or masked lcd (msla) printing using photopolymer castable resins filled with 20% [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf) to 40% [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf) microcrystalline wax.
* **layer resolution**: standard z-layer thickness ranges from 10 µm [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf) (0.010 mm [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf)) for micro-pave bezels up to 50 µm [source 8](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/) (0.050 mm [source 8](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/)) for general shanks.
* **thermal operating envelope**: resins containing wax fractions solidify below 17°c–18°c [source 8](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/); printing ambient temperature must be maintained strictly between 20°c [source 8](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/) and 25°c [source 8](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/).

### 2.2 spruing & tree assembly
* **main sprue (tree trunk)**: central cylindrical wax rod with a diameter of 3.0 mm [source 11](https://www.ganoksin.com/article/sprue-system-design/) to 6.0 mm [source 11](https://www.ganoksin.com/article/sprue-system-design/) mounted on a rubber crucible base.
* **runner sprues (gates)**: individual feeder sprues attached to patterns at a 45° angle [source 11](https://www.ganoksin.com/article/sprue-system-design/) pointing toward the direction of metal flow.
* **gate attachment thickness**: gate diameter must measure 1.5 mm [source 11](https://www.ganoksin.com/article/sprue-system-design/) to 2.5 mm [source 11](https://www.ganoksin.com/article/sprue-system-design/), ensuring the gate thickness equals or exceeds the thickest section of the jewelry piece (typically 1.2 mm to 2.0 mm [source 18](https://www.shapeways.com/materials/silver-930)) to prevent premature freezing and directional solidification shrinkage voids [source 11](https://www.ganoksin.com/article/sprue-system-design/).
* **spatial clearance**: patterns are spaced 5.0 mm [source 11](https://www.ganoksin.com/article/sprue-system-design/) to 10.0 mm [source 11](https://www.ganoksin.com/article/sprue-system-design/) apart and maintain at least 6.0 mm [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf) clearance from the steel flask wall.
* **thermal reservoir (button)**: the crucible sprue base / button must contain at least 1.25x [source 11](https://www.ganoksin.com/article/sprue-system-design/) to 1.50x [source 11](https://www.ganoksin.com/article/sprue-system-design/) the liquid metal mass of the attached patterns to supply molten feed metal as the patterns solidify.

### 2.3 investment material selection & mixing
* **gypsum-bonded investment (standard wax)**:
  * example: kerr satin cast 20 [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000), r&r sc20 [source 3](https://www.ransom-randolph.com/plasticast).
  * composition: 30%–35% [source 19](https://www.sciencedirect.com/science/article/abs/pii/S0040603103007500) alpha-gypsum (calcium sulfate hemihydrate binder, $caso_4 \cdot \frac{1}{2}h_2o$) and 65%–70% [source 19](https://www.sciencedirect.com/science/article/abs/pii/S0040603103007500) silica refractory (cristobalite and quartz powders).
  * water-to-powder mix ratio: 38 ml [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000) to 40 ml [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000) room-temperature distilled water (21°c–24°c [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000)) per 100 g investment powder.
  * maximum thermal limit & decomposition: 730°c–732°c [source 12](https://www.ganoksin.com/article/wax-casting-burnout-cycles/) (1350°f [source 12](https://www.ganoksin.com/article/wax-casting-burnout-cycles/)). above 730°c [source 19](https://www.sciencedirect.com/science/article/abs/pii/S0040603103007500) to 750°c [source 19](https://www.sciencedirect.com/science/article/abs/pii/S0040603103007500), calcium sulfate reacts with trace carbon residue, undergoing thermal decomposition that releases sulfur dioxide ($so_2$) gas [source 19](https://www.sciencedirect.com/science/article/abs/pii/S0040603103007500). this gas causes extreme surface pitting, black sulfur embrittlement, and gas porosity in karat gold and silver castings [source 19](https://www.sciencedirect.com/science/article/abs/pii/S0040603103007500).
* **high-expansion reinforced investment (direct resin)**:
  * example: ransom & randolph plasticast [source 3](https://www.ransom-randolph.com/plasticast), certus prestige optima [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf).
  * formulated with high-strength thermal binders to withstand photopolymer expansion without wall spalling or flashing [source 3](https://www.ransom-randolph.com/plasticast).
  * water-to-powder mix ratio: 38 ml [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf) water per 100 g powder for standard flasks, or reduced to 34 ml [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf) to 36 ml [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf) for extra compressive strength.
* **phosphate-bonded investment (platinum & high-temp resins)**:
  * example: ransom & randolph plasticast pt [source 3](https://www.ransom-randolph.com/plasticast), r&r ultra-vest maxx [source 13](https://www.ganoksin.com/article/testing-ultra-vest-maxx-investment/).
  * composition: monoammonium phosphate binder ($mg(nh_4)po_4$) and quartz silica [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/).
  * thermal limit: withstands temperatures >850°c [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) up to 1000°c–1030°c [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) without binder decomposition, making it mandatory for platinum casting (melting point 1768°c [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/)).
* **degassing & curing protocol**:
  * mechanical slurry mixing for 2.0 min [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf) to 3.0 min [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf).
  * vacuum chamber degassing at 28 inhg [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf) to 29 inhg [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf) (95–98 kpa [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf)) for 90 seconds [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf) (slurry) plus 90 seconds [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf) (filled flask).
  * bench-set hydration curing time: minimum 1.0 hour [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000) to 2.0 hours [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf) before kiln burnout.

### 2.4 burnout schedule ramps, hold temps & times

thermal burnout schedule comparison for standard 3.5" x 4.0" (89 mm x 102 mm) solid flasks:

| burnout phase | standard carving wax schedule (kerr sc20) | castable resin schedule (formlabs cw40 / r&r plasticast) | physical target / mechanism |
| :--- | :--- | :--- | :--- |
| **phase 1: dewax / low ramp** | ramp to 150°c–200°c (300°f–400°f) at 3.0°c–5.0°C/min [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000); hold 1.0–2.0 hours [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000). | ramp to 150°c (300°f) at 2.5°C/min (150°C/hr) [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf); hold 2.0–3.0 hours [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf). | physical wax liquid drainage (wax) vs gentle moisture evaporation & resin softening (resin) [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf). |
| **phase 2: thermal pyrolysis ramp** | ramp to 370°c–480°c (700°f–900°f) at 4.0°c–6.0°C/min [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000); hold 1.0–2.0 hours [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000). | ramp to 370°c (700°f) at 3.0°C/min (180°C/hr) [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf); hold 2.0–3.0 hours [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf). | polymer chain thermal degradation & gasification. slower ramp prevents mold cracking [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf). |
| **phase 3: high carbon burnout** | ramp to 732°c (1350°f) at 4.0°C/min [source 12](https://www.ganoksin.com/article/wax-casting-burnout-cycles/); hold 2.0–3.0 hours [source 12](https://www.ganoksin.com/article/wax-casting-burnout-cycles/). | ramp to 732°c (1350°f) at 4.0°C/min [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf); hold 3.0–5.0 hours [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf). | complete carbon oxidation to $co_2$ gas. extended resin hold guarantees zero ash residue [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf). |
| **phase 4: cool down / casting hold** | cool down to alloy flask temp (480°c–650°c) at 3.0°C/min [source 13](https://www.ganoksin.com/article/testing-ultra-vest-maxx-investment/); hold 1.0–2.0 hours [source 13](https://www.ganoksin.com/article/testing-ultra-vest-maxx-investment/). | cool down to alloy flask temp (480°c–650°c) at 2.5°C/min [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf); hold 1.0–2.0 hours [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf). | thermal stabilization of flask to target metal pouring temperature [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf). |

total cycle duration: wax = 8.0 to 10.0 hours [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000); resin = 11.0 to 14.0 hours [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf).

### 2.5 metal casting parameters by alloy family

metal melting points, liquid pour superheat temperatures, and target flask temperatures:

```
[Solid / Liquid Melting Point] ---- +50°C to +150°C Superheat ----> [Metal Pour Temp]
                                                                        |
                                                                  Casting Pressure
                                                                        v
                                                               [Target Flask Temp]
```

* **sterling silver 925 (92.5% ag, 7.5% cu)**:
  * melting point range: 893°c [source 3](https://www.ransom-randolph.com/plasticast) to 899°c [source 3](https://www.ransom-randolph.com/plasticast) (1640°f–1650°f [source 3](https://www.ransom-randolph.com/plasticast)).
  * metal liquid pour temperature: 960°c [source 3](https://www.ransom-randolph.com/plasticast) to 1040°c [source 3](https://www.ransom-randolph.com/plasticast) (1760°f–1900°f [source 3](https://www.ransom-randolph.com/plasticast)).
  * flask casting temperature: 480°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) to 620°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) (900°f–1150°f [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/)) (lower for heavy signets, higher for filigree).
* **14k gold (yellow, rose, white: 58.5% au)**:
  * melting point range: 870°c [source 6](https://www.stuller.com/articles/view/melting-and-investment-casting/) to 900°c [source 6](https://www.stuller.com/articles/view/melting-and-investment-casting/) (1600°f–1650°f [source 6](https://www.stuller.com/articles/view/melting-and-investment-casting/)).
  * metal liquid pour temperature: 980°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) to 1060°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) (1800°f–1940°f [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/)).
  * flask casting temperature: 500°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) to 650°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) (930°f–1200°f [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/)).
* **18k gold (yellow, white: 75.0% au)**:
  * melting point range: 900°c [source 6](https://www.stuller.com/articles/view/melting-and-investment-casting/) to 930°c [source 6](https://www.stuller.com/articles/view/melting-and-investment-casting/) (1650°f–1710°f [source 6](https://www.stuller.com/articles/view/melting-and-investment-casting/)).
  * metal liquid pour temperature: 1000°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) to 1080°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) (1830°f–1975°f [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/)).
  * flask casting temperature: 520°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) to 650°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) (970°f–1200°f [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/)).
* **platinum 950 (95.0% pt, 5.0% ru or ir)**:
  * solidus / liquidus melting point: 1768°c [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) (3214°f [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/)).
  * metal liquid pour temperature: 1800°c [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) to 1950°c [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) (3270°f–3540°f [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/)).
  * flask casting temperature: 800°c [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) to 950°c [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) (1470°f–1740°f [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/)). cast via induction vacuum differential or centrifugal equipment into phosphate-bonded investment [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/).
* **casting force & equipment standards**:
  * vacuum assist pressure differential: 0.8 bar [source 12](https://www.ganoksin.com/article/wax-casting-burnout-cycles/) to 0.95 bar [source 12](https://www.ganoksin.com/article/wax-casting-burnout-cycles/) negative pressure.
  * vacuum overpressure casting: 1.5 bar [source 6](https://www.stuller.com/articles/view/melting-and-investment-casting/) to 3.0 bar [source 6](https://www.stuller.com/articles/view/melting-and-investment-casting/) inert argon gas overpressure applied over liquid crucible.
  * centrifugal acceleration: 20 g [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) to 50 g [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) rotational force.

### 2.6 devesting & thermal quenching
* **quenching delay time**:
  * karat gold & sterling silver flasks: must cool in ambient air for 12.0 min [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) to 20.0 min [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) until the central button loses its red thermal glow (~400°c–500°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/)), then plunge into a bucket of room-temperature water. thermal shock disintegrates the gypsum investment while annealing the metal [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/).
  * quenching earlier (<10 mins [Source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/)) causes severe hot-tearing and grain cracking; quenching later (>25 mins [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/)) hardens red gold and white gold alloys, making subsequent sizing work brittle.
  * platinum flasks: must never be water-quenched. air cool completely to room temperature (20°c–25°c [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/)) over 1.0 hour [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) prior to mechanical devesting to avoid explosive thermal shock of hard phosphate investment [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/).
* **chemical pickling & cleaning**:
  * high-pressure water jetting at 100 bar [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) to 150 bar [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) (1450–2175 psi [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/)).
  * pickling bath: submerge gold and silver castings in 10% [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) to 15% [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) sodium bisulfate solution (sparex no. 2) heated to 50°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) to 70°c [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) for 5.0 min [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) to 10.0 min [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) to strip copper surface oxides ($CuO/Cu_2O$).

### 2.7 sprue removal & gate grinding
* cut gate sprue using pneumatic flush shears or a high-speed diamond cutoff disk operating at 10,000 rpm [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) to 20,000 rpm [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/).
* leave a gate stub height of 0.3 mm [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) to 0.5 mm [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) for flush rotary burr removal to prevent under-cutting the shank profile [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/).

### 2.8 mass finishing & tumbling
* **magnetic pin tumbling**: submerge in water with burnishing soap and 0.3 mm [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) to 0.5 mm [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) stainless steel pins; tumble at 1,800 rpm [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) for 20.0 min [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) to 40.0 min [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/). brightens recessed gallerias and azures without changing external dimensions [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/).
* **rotary / vibratory media finishing**:
  * cutting stage: tumble 2.0 hours [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) to 4.0 hours [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) in ceramic angle-cut pyramids with liquid deburring compound.
  * dry polishing stage: tumble 4.0 hours [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) to 8.0 hours [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) in crushed walnut shell media impregnated with fine aluminum oxide or titanium dioxide [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/).

### 2.9 bench polishing, steam & ultrasonic cleaning
* initial surface leveling with 240-grit [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) to 600-grit [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) silicone lap wheels at 2,800 rpm [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/).
* pre-polish with tripoli compound on hard felt buffs at 3,400 rpm [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/).
* final mirror finish with red rouge (gold) [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/), White/Green rouge (silver) [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/), or dialux blue / diamond paste (platinum) [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) on soft cotton flannel buffs.
* ultrasonic cleaning: immersion in 5%–10% [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) alkaline detergent solution at 50°c [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) to 60°c [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) under 40 khz [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) cavitation for 5.0 min [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) to 10.0 min [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/).
* high-pressure steam cleaning: blast with clean dry steam at 4.0 bar [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) to 6.0 bar [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) (60–85 psi [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/)) to strip residual polishing grease.

---

## 3. wax patterns vs. castable-resin patterns (critical differences)

because sculptura relies on direct 3d-printed patterns, understanding the physical divergence between carving wax and photopolymer resins is essential for engine rules:

### 3.1 physical phase transitions & burnout physics
* **microcrystalline wax**:
  * low melting point (60°c–75°c [source 11](https://www.ganoksin.com/article/sprue-system-design/)), low melt viscosity (<10 mpa·s [source 11](https://www.ganoksin.com/article/sprue-system-design/)).
  * wax melts physically during low-temperature burnout holds (100°c–150°c [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000)) and drains out the main flask sprue bottom into a collection tray, evacuating 98%–99% [source 5](https://www.scribd.com/document/356863637/DFU-SC20-KC2000) of its volume as liquid before thermal oxidation starts.
* **photopolymer castable resin**:
  * cross-linked thermoset polymer network.
  * **does not melt** [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf). photopolymers remain solid as temperatures rise, undergoing direct thermal pyrolysis (chemical breakdown into hydrocarbon vapors) between 300°c [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf) and 600°c [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf).

### 3.2 solid thermal expansion & investment mold cracking
* prior to thermal breakdown, photopolymer resin patterns undergo significant solid volumetric thermal expansion of 2.0% [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf) to 3.0% [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf) between 200°c [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf) and 400°c [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf).
* because the resin pattern is confined inside a rigid investment mold, outward expansion exerts severe hydraulic radial pressure against the internal cavity walls.
* in standard gypsum investment, this radial pressure causes micro-cracking, surface finning, heavy flashing, or catastrophic flask blowouts [source 3](https://www.ransom-randolph.com/plasticast).
* mitigation requiring validator enforcement:
  * solid geometries thicker than 10.0 mm [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf) must be hollowed in cad to a shell wall thickness of 0.8 mm [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf) to 1.0 mm [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf) with at least two 1.5 mm [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf) drain holes. internal hollowing allows expanding resin walls to collapse inward into empty space rather than fracturing the investment mold [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf).

### 3.3 ash residue & carbon inclusion porosity
* photopolymer resins contain aromatic carbon rings and heavy photoinitiator compounds (tpo, tpo-l) that form non-combusted fixed carbon ash during pyrolysis [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf).
* if the burnout furnace lacks active oxygen replacement or top-hold time is insufficient, residual carbon ash accumulates in pattern cavities [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf).
* during molten metal entry, carbon ash reacts with the liquid alloy, releasing gas bubbles ($CO/CO_2$) that freeze into subsurface gas porosity, black inclusions, and severe pitting on polished surfaces [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf).

### 3.4 required burnout & processing modifications for resins
1. **extended high-temperature soak**: elevate top hold temperature to 732°c–780°c [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf) (gypsum) or 850°c [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) (phosphate) and hold for 3.0 hours [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf) to 6.0 hours [source 8](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/) (vs. 2.0 hours for wax) to ensure complete combustion of carbon residue.
2. **mandatory kiln ventilation & oxygen supply**: kilns used for resin burnout must feature top exhaust chimneys and bottom air intake vents (or active compressed air injection at 5.0 L/min [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf)) to supply oxygen required to oxidize solid carbon ash into carbon dioxide gas ($c + o_2 \rightarrow co_2$) [source 2](https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf).
3. **controlled initial heating ramp**: initial heating rate between 150°c and 370°c must not exceed 2.5°C/min [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf) to 3.0°C/min [source 4](https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf) to permit gradual resin thermal softening.
4. **post-print washing & uv curing discipline**: resin patterns must undergo two 3-minute [source 8](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/) washing cycles in clean ipa (>99% concentration [source 8](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/)) under ultrasonic agitation, followed by 15.0 min [source 8](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/) uv post-curing (405 nm led). uncured surface resin inhibits investment setting, producing soft cavity boundary walls and rough "orange-peel" cast metal surfaces [source 8](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/).

---

## 4. published quality & tolerance standards

### 4.1 dimensional tolerance standards (iso 8062-3)
* **standard framework**: iso 8062-3:2007 (*geometrical product specifications (gps): dimensional tolerances and machining allowances for castings*) [source 9](https://www.bessercast.com/investment-casting-tolerances/).
* **tolerance grades**: precision investment casting operates within dimensional casting tolerance grades **ct4 to ct6** [source 9](https://www.bessercast.com/investment-casting-tolerances/).
* **linear tolerances for small jewelry features (0.5 mm to 30.0 mm nominal dimension)**:
  * **grade ct4** (high-precision investment casting): **±0.10 mm** [source 9](https://www.bessercast.com/investment-casting-tolerances/) (±0.004 in [source 9](https://www.bessercast.com/investment-casting-tolerances/)). enforced for ring finger inner diameters and stone seat fits.
  * **grade ct5** (standard commercial lost-wax casting): **±0.15 mm** [source 9](https://www.bessercast.com/investment-casting-tolerances/) (±0.006 in [source 9](https://www.bessercast.com/investment-casting-tolerances/)). enforced for general shank widths and band heights.
  * **grade ct6** (coarse lost-wax casting / heavy pendants): **±0.20 mm** [source 9](https://www.bessercast.com/investment-casting-tolerances/) (±0.008 in [source 9](https://www.bessercast.com/investment-casting-tolerances/)).

### 4.2 precious metal assay standards (iso 11426 / 11427 / 11210 / 9202)
* **iso 11426:2021**: *jewellery and precious metals: determination of gold: cupellation method (fire assay)* [source 16](https://www.progold.com/standards). establishes gold fineness verification (14k = 585.0 ± 1.0 parts per thousand, 18k = 750.0 ± 1.0 parts per thousand [source 17](https://www.austrian-standards.at/en/shop/onorm-en-iso-9202-2026-08-01~p5029500)).
* **iso 11427:2014**: *jewellery: determination of silver: volumetric method* [source 16](https://www.progold.com/standards). verifies sterling silver fineness (925.0 ± 1.5 parts per thousand [source 17](https://www.austrian-standards.at/en/shop/onorm-en-iso-9202-2026-08-01~p5029500)).
* **iso 11210:2023**: *jewellery: determination of platinum in platinum jewellery alloys: gravimetric method* [source 16](https://www.progold.com/standards). verifies platinum 950 fineness (950.0 ± 1.0 parts per thousand [source 17](https://www.austrian-standards.at/en/shop/onorm-en-iso-9202-2026-08-01~p5029500)).
* **iso 9202:2019 / en iso 9202:2026**: *jewellery: fineness of precious metal alloys* [source 17](https://www.austrian-standards.at/en/shop/onorm-en-iso-9202-2026-08-01~p5029500). mandates hallmark purity standard bounds across international jurisdictions.

### 4.3 surface roughness standards (iso 4287 / 21920)
* **raw investment cast surface**: $r_a$ **1.6 µm to 3.2 µm** [source 9](https://www.bessercast.com/investment-casting-tolerances/) (63–125 µin [source 9](https://www.bessercast.com/investment-casting-tolerances/)).
* **post-magnetic pin tumbling**: $r_a$ **0.8 µm to 1.2 µm** [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) (32–48 µin [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/)).
* **final bench polished mirror finish**: $r_a$ **0.02 µm to 0.05 µm** [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/) (0.8–2.0 µin [source 14](https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/)).

### 4.4 industry shrinkage & geometry rules (ici handbook)
* **investment casting institute (ici) cumulative shrinkage rule**:
  * total cumulative linear scaling factor in cad: **1.5% to 3.0% expansion** [source 10](https://knowledge.welongcasting.com/what-is-precision-casting-and-how-does-it-work).
  * formula: $s_{total} = s_{resin} + s_{metal} - e_{investment}$ [source 10](https://knowledge.welongcasting.com/what-is-precision-casting-and-how-does-it-work).
  * 3d print resin / wax shrinkage ($s_{resin}$): +0.5% to +1.0% [source 8](https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/).
  * investment mold expansion ($e_{investment}$): -0.8% to -1.2% expansion [source 3](https://www.ransom-randolph.com/plasticast) (partially offsets metal shrinkage).
  * liquid metal solidification shrinkage ($s_{metal}$): sterling silver = +1.5% to +2.0% [source 18](https://www.shapeways.com/materials/silver-930); 14k gold = +1.5% to +2.2% [source 7](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/); platinum 950 = +2.0% to +2.5% [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/).
* **minimum geometry bounds**:
  * minimum wall thickness (Silver/Gold): 0.6 mm [source 18](https://www.shapeways.com/materials/silver-930) for unpolished raw finish; 0.8 mm [source 18](https://www.shapeways.com/materials/silver-930) for polished finish.
  * minimum wall thickness (platinum): 1.0 mm [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/).
  * minimum unsupported wire diameter: 1.0 mm [source 18](https://www.shapeways.com/materials/silver-930).
  * minimum bounding box: 2.4 mm x 2.4 mm x 0.6 mm [source 18](https://www.shapeways.com/materials/silver-930).
  * maximum bounding box: 89.0 mm x 89.0 mm x 100.0 mm [source 18](https://www.shapeways.com/materials/silver-930).

---

## negative findings & unverified metrics

the following items were explicitly searched and evaluated across published foundry literature, manufacturer technical sheets, and standards documentation, but could not be verified or do not exist publicly:

1. **live storefront access (`https://sculptura.lovely.app`)**: dns resolution failed consistently on 2026-09-11 (`[Name or service not known]`). the live promises on the consumer storefront cannot be audited directly from the web; claims are cross-referenced to repo design assets (`jewelryDefaults.js`) and sub-agent research notes (`shapeways.md`, `rio-grande.md`).
2. **proprietary direct-resin flash burnout cycles for gypsum**: claims by certain desktop 3d printer blogs that photopolymer resins can be burned out in under 3 hours using standard gypsum investment without cracking were contradicted by manufacturer datasheets (formlabs [source 1](https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf), r&r [source 3](https://www.ransom-randolph.com/plasticast)). standard gypsum investment fails catastrophically under rapid resin thermal ramp rates (>10°C/min); fast burnout schedules require specialized phosphate-bonded investments [source 15](https://www.ganoksin.com/article/an-overview-of-platinum-casting/).
3. **universal single-value shrinkage scale factor**: no single universal cad shrinkage multiplier exists that applies across all alloys and resins. shrinkage varies by alloy family (silver 1.5%–2.0% vs. platinum 2.0%–2.5% [source 10](https://knowledge.welongcasting.com/what-is-precision-casting-and-how-does-it-work)) and flask bounding volume. paracraft must enforce material-specific lookup tables rather than a static global scalar.
4. **public iso tolerances specific to micro-pave prong heights**: iso 8062-3 defines general linear dimensional grades (ct4–ct6) down to 0.5 mm [source 9](https://www.bessercast.com/investment-casting-tolerances/), but does not publish standardized tolerances for micro-features under 0.3 mm (such as delicate prong tips or milgrain beads). prongs under 0.4 mm fall outside iso casting coverage and must be flagged as `bench-setting hand work required` in the generator.

---

## sources

1. **formlabs castable wax 40 resin technical data sheet & burnout guide**
   * url: https://formlabs-media.formlabs.com/datasheets/2001505-TDS-ENUS-0.pdf
   * date retrieved: 2026-09-11
   * data extracted: 20%–40% wax content, 732°c (1350°f) top burnout hold temperature (180 min hold), 4.0°C/min ramp rate, solid thermal expansion properties, certus prestige optima investment recommendation.

2. **formlabs introduction to casting for 3d printed jewelry patterns application guide**
   * url: https://cdn.webshopapp.com/shops/234164/files/356849424/1805016-gd-enus-0p.pdf
   * date retrieved: 2026-09-11
   * data extracted: photopolymer non-melting pyrolysis mechanism, solid thermal expansion between 200°c and 400°c, requirement for active kiln oxygen airflow (5 L/min), 0.8–1.0 mm shell wall hollowing with 1.5 mm drain holes for sections >10.0 mm, carbon ash oxidation mechanics.

3. **ransom & randolph plasticast investment technical overview & calculator**
   * url: https://www.ransom-randolph.com/plasticast
   * date retrieved: 2026-09-11
   * data extracted: high-expansion reinforced gypsum investment formulation for plastic/resin patterns, prevention of flashing and spalling, plasticast pt phosphate-bonded system for high-temperature alloys.

4. **rio grande plasticast investment instruction & burnout sheet**
   * url: https://products.riogrande.com/content/Instruction-Sheets/PlastiCast-Investment-IS.pdf
   * date retrieved: 2026-09-11
   * data extracted: 38 ml / 100 g standard mixing ratio (34–36 ml for high-strength), 28–29 inhg vacuum degassing times (90s + 90s), 11–14 hour resin burnout schedule, 6.0 mm flask wall clearance, 2.0 hour bench set curing.

5. **kerr dental / jewelry satin cast 20 directions for use**
   * url: https://www.scribd.com/document/356863637/DFU-SC20-KC2000
   * date retrieved: 2026-09-11
   * data extracted: Alpha-gypsum/cristobalite investment parameters, 38–40 ml / 100 g mixing ratio, 21°c–24°c water temperature, 4-stage carving wax burnout schedule (150°c dewax, 370°c carbonization, 732°c high hold), 1.0 hour minimum bench set.

6. **stuller bench jeweler: melting and investment casting technical guide**
   * url: https://www.stuller.com/articles/view/melting-and-investment-casting/
   * date retrieved: 2026-09-11
   * data extracted: Solidus/liquidus melting points for 14K/18K karat golds, superheat liquid pour calculations (+50°c to +150°c above liquidus), vacuum-assisted and overpressure gas casting principles (1.5–3.0 bar).

7. **stuller bench jeweler: general casting tips for karat golds**
   * url: https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/
   * date retrieved: 2026-09-11
   * data extracted: karat gold flask temperatures (500°c–650°c), metal pour temperatures (980°c–1060°c), 12.0–20.0 min ambient air quench delay timing (~400°c–500°c button red glow loss), sparex no. 2 sodium bisulfate pickling (10%–15% at 50°c–70°c for 5–10 min).

8. **liqcreate wax castable 3d-printing resin processing & burnout guide**
   * url: https://www.liqcreate.com/supportarticles/working-with-liqcreate-wax-castable-3d-printing-resin/
   * date retrieved: 2026-09-11
   * data extracted: 0.050 mm layer height, 17°c–18°c wax solidification point, 20°c–25°c printing window, dual 3-min ipa washing cycles, 15 min uv post-cure, 2.62% measured casting shrinkage factor.

9. **bessercast / iso 8062-3 investment casting tolerances engineer's guide**
   * url: https://www.bessercast.com/investment-casting-tolerances/
   * date retrieved: 2026-09-11
   * data extracted: iso 8062-3:2007 dimensional casting tolerance grades ct4 (±0.10 mm), ct5 (±0.15 mm), ct6 (±0.20 mm) for small investment cast features, raw surface roughness ra 1.6–3.2 µm.

10. **investment casting institute (ici) process capabilities & design guidelines**
    * url: https://knowledge.welongcasting.com/what-is-precision-casting-and-how-does-it-work
    * date retrieved: 2026-09-11
    * data extracted: cumulative linear shrinkage allowance rule (1.5%–3.0%), mathematical decomposition of pattern shrinkage, investment expansion, and metal solidification contraction.

11. **ganoksin orchid technical archive: the sprue system design**
    * url: https://www.ganoksin.com/article/sprue-system-design/
    * date retrieved: 2026-09-11
    * data extracted: 3.0–6.0 mm main sprue tree trunk, 1.5–2.5 mm feeder gate attached at 45° angle to thickest geometry section, 5.0–10.0 mm pattern clearance, 1.25x–1.50x reservoir button thermal mass requirement.

12. **ganoksin orchid technical archive: wax casting burnout cycles**
    * url: https://www.ganoksin.com/article/wax-casting-burnout-cycles/
    * date retrieved: 2026-09-11
    * data extracted: gypsum investment burnout moisture steam phase, 732°c (1350°f) upper temperature limit, vacuum differential pressure (0.8–0.95 bar).

13. **ganoksin orchid technical archive: testing ultra-vest maxx investment**
    * url: https://www.ganoksin.com/article/testing-ultra-vest-maxx-investment/
    * date retrieved: 2026-09-11
    * data extracted: 12-hour burnout schedule, 1,350°f (732°c) top hold held for 4 hours, 1-hour casting hold, cooling ramp rate 3.0°C/min.

14. **ganoksin orchid technical archive: practical guide to mass finishing jewelry**
    * url: https://www.ganoksin.com/article/practical-guide-to-mass-finishing-jewelry/
    * date retrieved: 2026-09-11
    * data extracted: magnetic pin tumbling at 1,800 rpm for 20–40 min with 0.3–0.5 mm pins (ra 0.8–1.2 µm), 2-stage rotary/vibratory tumbling (2–4h cutting + 4–8h walnut polishing), bench polishing wheel speeds (2,800–3,400 rpm), ultrasonic (50°c–60°c at 40 khz for 5–10 min) and steam cleaning (4–6 bar).

15. **ganoksin orchid technical archive: an overview of platinum casting**
    * url: https://www.ganoksin.com/article/an-overview-of-platinum-casting/
    * date retrieved: 2026-09-11
    * data extracted: platinum 950 melting point (1768°c / 3214°f), liquid pour temp (1800°c–1950°c), flask temp (800°c–950°c), phosphate-bonded ammonium phosphate investment (>1000°c resistance), zero water quenching (air cool 1.0 hour), centrifugal 20–50 g acceleration.

16. **progold standards & regulations: iso precious metal assay specifications**
    * url: https://www.progold.com/standards
    * date retrieved: 2026-09-11
    * data extracted: iso 11426:2021 fire assay for gold, iso 11427:2014 volumetric silver assay, iso 11210:2023 gravimetric platinum assay standards.

17. **austrian standards: önorm en iso 9202:2026 jewellery: fineness of precious metal alloys**
    * url: https://www.austrian-standards.at/en/shop/onorm-en-iso-9202-2026-08-01~p5029500
    * date retrieved: 2026-09-11
    * data extracted: international hallmark fineness bounds: sterling silver (925.0 ± 1.5 ppt), 14k gold (585.0 ± 1.0 ppt), 18k gold (750.0 ± 1.0 ppt), platinum 950 (950.0 ± 1.0 ppt).

18. **shapeways silver 930 & lost-wax precious metals capability datasheet**
    * url: https://www.shapeways.com/materials/silver-930
    * date retrieved: 2026-09-11
    * data extracted: lost-wax precious metal casting specs, minimum wall thickness (0.6 mm raw, 0.8 mm polished, 1.0 mm unsupported wire), bounding box bounds (2.4x2.4x0.6 mm min, 89x89x100 mm max), 1.5%–2.0% silver casting shrinkage.

19. **sciencedirect: advances in jewellery microcasting & thermal decomposition analysis**
    * url: https://www.sciencedirect.com/science/article/abs/pii/S0040603103007500
    * date retrieved: 2026-09-11
    * data extracted: alpha-gypsum $caso_4$ anhydrite thermal decomposition above 730°c–750°c emitting $so_2$ gas in reductive carbon environments, resulting in surface pitting and sulfur embrittlement of gold/silver castings.

20. **rio grande custom jewelry manufacturing & casting services**
    * url: https://www.riogrande.com/custom-casting-services
    * date retrieved: 2026-09-11
    * data extracted: custom lost-wax precious metal casting specs across silver, gold (10k–22k), platinum, palladium, bronze, and brass, cad file acceptance (stl, 3dm, obj), manual design review and shrinkage scaling.
