# axis one: fineness, marking and assay recognition

researched 2026-09-30. the [country records](countries.json) cover all 22 planned
markets; the [source index](sources.json)
resolves every source identifier below. no record is an approved production rule.

## what the convention actually provides

`convention-members` lists 22 contracting states worldwide, including italy
since 15 december 2023. ten of our planned destinations are on that list.

`convention-working` and `convention-faq` distinguish the ccm, authorised assay
office mark, responsibility mark and fineness mark. only an authorised office
can apply the ccm. domestic eligibility still matters, including the metal,
fineness and article type. a manufacturer cannot turn an ordinary purity stamp
into a ccm certificate by naming it one.

the convention permits voluntary ccm use and does not require every contracting
state to institute compulsory national assay. this is not a statement that
national hallmarking or responsibility marking is optional everywhere.

the responsibility mark for a ccm article is registered in the applying state;
the treaty route can remove duplicate destination registration. non-ccm imported
articles need their own destination-recognition and sponsor treatment.

## country evidence matrix

| planned destination | convention member | domestic evidence and routing consequence | primary source ids |
|---|---|---|---|
| united states | no | apply jewelry-specific marketing and quality-claim rules; ftc guides are not the entire federal/state stamping regime | `us-ecfr-guides` |
| canada | no | quality marking is conditional; authorized marks and associated trademark rules have explicit foreign-mark exceptions | `ca-marking-act`, `ca-marking-regulations`, `ca-marking` |
| united kingdom | yes | compulsory hallmarking above applicable exemption limits; use exact article/metal and recognized-mark path, including online sales | `uk-hallmarking`, `profile-united-kingdom-direct` |
| australia | no | consumer-law evidence is available, but it does not establish a national no-hallmarking exemption; marking position remains open | `au-consumer-firecrawl` |
| germany | no | gold/silver jewelry is governed by section 5, not the section 2 marking limits for other articles; foreign nonconforming descriptions and seller liability need handling | `de-fineness` |
| france | no | domestic/import guarantee and responsibility marks apply; cited third-country import procedure contains small-weight guarantee exemptions, not blanket exemption from all obligations | `fr-imports`, `fr-guarantee` |
| italy | yes | independent control can be voluntary while fineness and identification marking remain required; confirm importer/foreign-mark path | `it-metrology`, `profile-italy-direct` |
| netherlands | yes | government guide requires hallmarking at gold 1g, silver 8g and platinum 0.5g and above; use current recognition and office rules, not an old transition notice | `nl-assay`, `profile-netherlands-direct` |
| spain | no | consolidated regulation supplies legal standards, identification and guarantee-mark rules; import recognition and small-article alternatives still need article-specific interpretation | `es-law` |
| belgium | no | official mint faq requires fineness and signature marks on created/imported jewelry; do not confuse these with compulsory independent state assay | `be-marking-faq` |
| austria | yes | consolidated national act governs fineness and responsibility marks; its gold/metal definitions and exemptions must be read directly | `at-full-law`, `profile-austria-direct` |
| switzerland | yes | jewelry control and watch-case control differ; ordinary article fineness/responsibility duties coexist with recognized foreign/ccm paths | `ch-control`, `ch-responsibility`, `profile-switzerland-direct` |
| sweden | yes | convention profile reports mixed control; validate current national compulsory marks and article thresholds | `se-control`, `profile-sweden-direct` |
| denmark | yes | compulsory registration/inspection can coexist with voluntary control marking; confirm current implementing authority/rules | `dk-regulations-direct`, `profile-denmark-direct` |
| ireland | yes | 2019 amendment commenced on 30 september 2019; use the commencement order and current assay-office guidance, not the old pending notice | `priority-ie-commencement-order`, `priority-ie-assay-law`, `profile-ireland-direct` |
| new zealand | no | no sufficiently specific primary hallmarking determination obtained in this pass; customs/gst evidence does not answer this axis | national marking review remains open |
| japan | no | mint offers fineness certification and lists offices; retrieved application scope is domestic corporations, not universal clearance for imported jewelry | `jp-certification-direct` |
| south korea | no | retrieved customs guides do not establish jewelry fineness/marking law; keep that review open | national marking review remains open |
| singapore | no | investment-precious-metal criteria do not establish jewelry hallmarking law; keep that review open | national marking review remains open |
| united arab emirates | no | federal law requires official or recognized foreign hallmark for offered wrought articles, with specific exemptions and identification-card alternative; verify executive recognition conditions | `ae-law-firecrawl` |
| norway | yes | fineness/responsibility duties and non-ccm imported-mark notification need separate treatment from ccm rights | `no-control-direct`, `profile-norway-direct` |
| israel | yes | assay services and convention directory are evidenced; mixed/gold control and ambiguous profile threshold need current legal clarification | `il-assay-direct`, `profile-israel-direct` |

non-membership means no automatic treaty entitlement, not that the country rejects
all foreign marks. canada's act section 4(4), for example, explicitly treats
certain uk/foreign-government marks differently from ordinary quality marking.
france and spain need their own recognition paths rather than a false ccm-only
acceptance model.

## fineness and exemption data

[countries.json](countries.json) transcribes the four metal columns in each of
the ten convention profiles, preserving raw values such as italy's `>750` gold
entry. it also preserves the reported weight cells rather than guessing strict
or inclusive exemption boundaries.

important differences include:

- uk profile: gold 1g, silver 7.78g, platinum 0.5g and palladium 1g exemption
  cells. confirm the legal boundary and article scope in the current act.
- netherlands government guidance: hallmarking starts at gold 1g, silver 8g
  and platinum 0.5g. the three metals are not interchangeable.
- france third-country import guidance: guarantee-mark exemption below 3g for
  gold/platinum and below 30g for silver; fineness and other duties still apply.
- uae law article 6: gold/platinum/platinum-group articles below 1g and silver
  below 5g are among the listed hallmarking exemptions; recognition and current
  executive conditions remain to be checked.
- israel profile: its gold exemption cell literally shows `>= 2g` (rendered
  with a mathematical greater-than-or-equal symbol). that is ambiguous under an
  exemption heading and must not be converted into an executable test.

finished article mass and composition matter, not just nominal mesh mass or a
broad commercial material label. components, solder, plating, mixed metals and
article type can change the applicable rule. geometry validation is not assay
certification.

## office leads, not service contracts

country records include the convention's office-directory leads: uk's four
assay offices; the two listed dutch offices; italy's vicenza, arezzo and valenza
paths; and offices in austria, denmark, ireland, sweden, norway, switzerland and
israel. directory inclusion is not proof of current appointment scope, accepted
alloys, available ccm service, overseas submission terms, fees or turnaround.

a non-member manufacturing facility may need an approved assay detour through
a designated office. that introduces real transport, customs, cost and custody
steps; it is not equivalent to stamping a ccm at the original facility.

## unresolved work before promotion

verify the current legal article categories, exact exemption boundaries,
component rules, supported fineness, mark size/placement and responsibility
registration for the selected facility and destination. resolve profile age and
commencement notices against current national law. obtain actual assay-service
and evidence arrangements before promoting a route.

see [imports](imports.md), [route evidence](route-evidence-contract.md), and
[the research overview](README.md).

[the regional follow-up](europe-north-america.md) adds the post-brexit gb/ni
recognition distinction and national law evidence. [quebec](quebec.md) adds
provincial obligations without inventing a provincial hallmarking regime.
