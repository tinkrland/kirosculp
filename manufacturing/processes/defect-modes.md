# defect modes: how castings fail

recovered from the sculptura.dev-research defect catalog (2026-09-11). the thesis: defects happen when cad geometry violates fluid dynamics, heat transfer, and solidification constraints, and the prevention is quantitative guardrails enforced before a pattern is ever printed. that enforcement is paracraft's job; this page is the shared vocabulary.

liquid metal itself contracts [2.0% to 6.5%](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/) on solidification ([ganoksin defect analysis](https://www.ganoksin.com/article/defect-analysis-jewelry-casting/)), so every failure mode below is a version of "geometry made that contraction, or the metal's path to it, unmanageable".

## the catalog

- **porosity and gas defects:** subsurface voids and pitting from dissolved gas, investment debris, or carbon ash reacting with the melt. signs: rough cast surfaces, filled-in negative features ([formlabs](https://formlabs.com/resources/casting-direct-investment-jewelry/)).
- **incomplete fill and misruns:** thin or distant sections freeze before metal arrives; caused by undersized gates, cold metal, or sections below the castable minimum.
- **sharp internal corners:** stress raisers where solidification shrinkage tears the metal or shears the mold; internal corners need fillets.
- **fine points, pins, and prongs:** below the castable diameter, they misrun or snap at devesting; prong tips under about 0.4 mm fall outside iso casting tolerance coverage and become bench hand work.
- **thin flat plates:** warp and fin (thin metal flash) from uneven cooling across a broad thin section.
- **enclosed hollows and internal cavities:** trapped investment cores and gas pockets; cavities need drain paths and core aspect ratios the metal can feed around.
- **undercut traps and recesses:** pockets the burnout cannot fully evacuate or the metal cannot reach without turbulence.
- **sprue-related failures:** misruns and cold shuts from gates thinner than the thickest section, or placed at the furthest point from metal flow ([ganoksin sprue design](https://www.ganoksin.com/article/sprue-system-design/)).
- **quench cracking:** thermal shock from quenching too early after casting; the flask must cool 12-20 minutes first ([stuller](https://www.stuller.com/benchjeweler/resources/bencharticles/view/general-casting-tips-for-karat-golds/)).

## the preventive thresholds from the recovered study

| guardrail | value | source |
|---|---|---|
| minimum wall thickness | 0.6 mm (unpolished silver/gold) to 0.8 mm polished, 1.0 mm platinum | [shapeways](https://www.shapeways.com/materials/silver-930), [ganoksin platinum](https://www.ganoksin.com/article/an-overview-of-platinum-casting/) |
| minimum prong or pin diameter | 0.8 to 1.0 mm | [shapeways](https://www.shapeways.com/materials/silver-930), [cooksongold](https://www.cooksongold.com/precious-metal-casting/how-it-works) |
| minimum internal fillet radius | 0.3 mm | [ganoksin](https://www.ganoksin.com/article/sprue-system-design/) |
| parallel wall clearance | 0.5 to 0.8 mm | [sculpteo](https://www.sculpteo.com/en/materials/metal-casting-material/silver-material/), [shapeways](https://www.shapeways.com/materials/silver-930) |
| core aspect ratio | at most 4:1 | [ganoksin](https://www.ganoksin.com/article/sprue-system-design/) |

these ranges overlap with, and per-partner versions were re-harvested into, the [paracraft rule digest](../../buildplan/paracraft/rule-digest.md). where the two disagree the rule digest's per-source, dated values win for rule data, and the conflict list there records why.

## unpublished, and honestly so

the recovered study flagged what it could not verify: no public numeric guidance for quench timing by flask mass, sprue tree capacity by alloy, or defect-rate distributions by casting house. those are ask questions for partners, tracked in the [acquire plan](../../buildplan/paracraft/acquire.md), not numbers to guess.
