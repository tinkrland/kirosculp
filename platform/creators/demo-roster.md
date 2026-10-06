# platform: creators demo roster

demo creator fixtures populated oct 2026, captured from the populated
sheet for record keeping. these are demo-only people, not real users,
and none of their attributes should be read as creator policy. they
exist to stress the admission, payout corridor, and review designs the
way real edge-case users would.

status: 47 names captured across three sheet pastes (oct 6 2026).
columns not visible in the sheet stay tbd.

| artist | shop handle | residence | passport / rail note | age | pronouns | description | fixture intent |
|---|---|---|---|---|---|---|---|
| mahika jaiswal | @divajewels | piscataway, nj | in passport, nj bank | 20 | - | economics student @ rutgers | launch creator. passport/rail mismatch |
| juliette cavanaugh | @jewelsbyjules | tbd | - | - | - | - | launch-roster addition |
| gemma | @gemsbygemma | tbd | - | - | - | - | fields not yet captured |
| saskia crevillo | tbd | germany, eu | - | 24 | - | - | fields not yet captured |
| fiona oberoi | @daintydiva | tbd | - | - | - | - | fields not yet captured |
| juliana gorgova | @ringstackbarbie | northern macedonia | - | 22 | - | - | launch-roster addition |
| adriana phelps | tbd | valencia, spain | - | - | - | - | fields not yet captured |
| madison monroe | tbd | - | - | - | - | - | baseline, no distinguishing fields |
| janice o'hara | tbd | - | - | - | - | - | baseline, no distinguishing fields |
| phoebe kemper | tbd | scotland, uk | - | 21 | - | sibling (older) | shared-household fixture, pair with lucie |
| lucie kemper | tbd | scotland, uk | - | 19 | - | sibling (younger) | shared-household fixture, pair with phoebe |
| yasmin yazici | tbd | istanbul, turkey | - | 23 | - | - | west asia bloc fixture |
| dianne collier | tbd | toronto, ontario, ca | - | 20 | - | - | fields not yet captured |
| dominic fletcher | tbd | malmo, sweden | - | 26 | he/him | - | fields not yet captured |
| patrick miller | tbd | hoboken, nj | - | 22 | he/they | nyc fit alum -> nyu tisch grad student | fields not yet captured |
| kacey hayes | tbd | northern ireland, uk | - | 24 | - | - | fields not yet captured |
| delilah musgrave | tbd | - | - | 18 | - | - | at-majority boundary case |
| dasha melnyk | tbd | frankfurt, germany | ua passport, de bank | 26 | - | - | passport/rail mismatch |
| avi-ben malachi | tbd | beersheba, israel | - | 35 | - | - | west asia bloc fixture |
| darragh cromwell | tbd | galway, ireland | - | 29 | - | - | fields not yet captured |
| gabriel dubois | tbd | new caledonia (apac) | fr passport | 27 | - | - | overseas collectivity, rollout matrix gap |
| faizah aisler | tbd | saudi arabia | - | - | - | - | parked-market hold (gcc parked for v2) |
| zoya naqvvi | tbd | sydney, australia | - | - | - | - | launch creator |
| daniela hernandez | tbd | bogota, colombia | - | - | - | - | latam fixture |
| celia witherspoon | tbd | cupertino, california | - | 19 | - | - | fields not yet captured |
| aisha ahmad | tbd | dhaka, bangladesh | - | - | - | - | launch creator, south asia strict-corridor |
| palak kapoor | tbd | new delhi, india | - | - | - | - | south asia strict-corridor fixture |
| jiaa khurana | tbd | uttarakhand, india | - | - | - | - | south asia strict-corridor fixture |
| jeremiah brown jr. | tbd | baltimore, maryland | us rail | 17 | - | "asks ... till then y'all just hold it for me pls" | minor creator, open ruling on kyc evasion request |
| maya mason | tbd | arizona, united states | - | - | - | - | baseline us fixture |
| natalia devora | tbd | sao paulo, brazil | - | - | - | - | latam fixture |
| rhea patel | tbd | austin, texas | bailiwick of guernsey passport, us bank | - | - | - | crown-dependency passport/rail mismatch |
| maria mendoza | tbd | manila, philippines | - | - | - | - | southeast asia fixture |
| carmen castillo | tbd | manila, philippines | - | - | - | - | southeast asia fixture (same city as maria mendoza, no household note, unrelated) |
| anwesha rahman | tbd | jakarta, indonesia | - | - | - | - | southeast asia fixture |
| rachel shaw | tbd | - | - | - | - | - | baseline, no distinguishing fields |
| patricia everett | tbd | new zealand | - | - | - | - | fields not yet captured |
| melanie harris | tbd | - | - | - | - | - | baseline, no distinguishing fields |
| lee jin-woo | tbd | south korea | - | 22 | - | - | east asia fixture |
| kim seo-yeon | tbd | south korea | - | 24 | - | - | east asia fixture |
| fatima karim | tbd | cairo, egypt | - | - | - | - | west asia bloc fixture |
| jana rasheed | tbd | nigeria | - | - | - | - | sub-saharan africa, prioritized-market fixture |
| amelie ramos | tbd | mexico | - | - | - | - | latam fixture, closes the mexico gap |
| valeria torres | tbd | colombia | - | - | - | - | latam fixture |
| stella conklin | tbd | brazil | - | - | - | - | latam fixture |
| naomi da'silva | tbd | argentina | - | 58 | - | mom | shared-household fixture, generational pair with denise |
| denise da'silva | tbd | argentina | - | 26 | - | daughter | shared-household fixture, generational pair with naomi |

## what the fixtures stress

- passport/rail mismatch (mahika, dasha melnyk, rhea patel): corridor
  keys on the payout rail only. nationality never selects checks. at
  most needs_review, never auto-fail, never a trust input. rhea adds a
  crown-dependency document (guernsey, not uk, not eu) as a fresh
  flavor of the same rule.
- parked-market hold (faizah): admission and studio access are separate
  from payout enablement. no rail row exists for sa until v2, so payout
  onboarding cannot complete and earnings queue under the
  stranded-funds logic. not yet, not no.
- minor creator (jeremiah): no provider completes kyc below majority.
  the open question is whether an age attestation gates publication
  (nothing accumulates, nothing to hold) or whether earnings queue
  until 18. queueing a minor's sales proceeds is a custody exposure the
  stranded-funds policy was not built for.
- shared household, peer siblings (phoebe and lucie kemper): device
  hash is evidence attached to money moments, never a uniqueness key.
  same device plus different ages plus same address is a family, not
  multi-accounting.
- shared household, generational (naomi and denise da'silva): the same
  device-sharing logic across a parent/adult-child pair, not just
  age-close siblings. stresses whether the household heuristic holds
  when the age gap is large and the relationship isn't peer-to-peer.
- overseas collectivity (gabriel dubois): nc is a french overseas
  collectivity using the cfp franc; it is not covered by any bloc list
  in the rollout matrix yet. gap to resolve before seed data ships.
- regional coverage: south asia strict-corridor markets (palak kapoor,
  jiaa khurana, aisha ahmad), west asia bloc (yasmin yazici, avi-ben
  malachi, fatima karim), east asia (lee jin-woo, kim seo-yeon), latam
  (daniela hernandez, natalia devora, amelie ramos, valeria torres,
  stella conklin, the da'silvas), and a prioritized sub-saharan african
  market (jana rasheed, nigeria) are now all represented. several
  entries (madison monroe, janice o'hara, rachel shaw, melanie harris)
  are intentional plain baselines with no distinguishing attributes.

## source

populated by the owner across three pasted sheets, oct 6 2026 (29
names, then +6, then +12 = 47 total). artist names and the columns
shown above are authoritative where filled; remaining cells stay tbd
until the matching sheet columns are pasted. more names may still be
added.
