# platform: creators demo roster

demo creator fixtures populated oct 2026, captured from the populated
sheet for record keeping. these are demo-only people, not real users,
and none of their attributes should be read as creator policy. they
exist to stress the admission, payout corridor, and review designs the
way real edge-case users would.

status: the artist names below are the authoritative list pasted from
the sheet (29 artists). residence, passport, rail, age and handle
cells are tbd pending the matching sheet columns; only cells discussed
with the owner are filled.

| artist | shop handle | residence | passport | payout rail | age | household | fixture intent |
|---|---|---|---|---|---|---|---|
| mahika jaiswal | @divajewels | us (nj) | in | us (nj bank) | tbd | solo | launch creator. passport/rail mismatch: indian passport, american bank, standard us checks |
| juliette cavanaugh | @jewelsbyjules | tbd | tbd | tbd | tbd | tbd | launch-roster addition |
| gemma | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| saskia crevillo | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| fiona oberoi | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| juliana gorgova | @ringstackbarbie | tbd | tbd | tbd | tbd | tbd | launch-roster addition |
| adriana phelps | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| madison monroe | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| janice o'hara | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| phoebe kemper | tbd | tbd | tbd | tbd | tbd | same home as lucie | sibling fixture: same last name, same location, different age from lucie, likely shared device; legitimate multi-creator household |
| lucie kemper | tbd | tbd | tbd | tbd | tbd | same home as phoebe | sibling fixture: the other kemper sister |
| yasmin yazici | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| dianne collier | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| dominic fletcher | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| patrick miller | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| kacey hayes | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| delilah musgrave | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| dasha melnyk | tbd | tbd | ua | de | tbd | tbd | passport/rail mismatch: ukrainian passport, german bank, german corridor |
| avi-ben malachi | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| darragh cromwell | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| gabriel dubois | tbd | nc (new caledonia) | fr | tbd | tbd | tbd | french overseas collectivity: french passport, cfp franc territory, rollout matrix gap |
| faizah aisler | tbd | sa | tbd | sa (parked v2) | tbd | tbd | parked-market creator: admitted, no payout rail yet, earnings queue until the sa rail exists in v2 |
| zoya naqvvi | tbd | tbd | tbd | tbd | tbd | tbd | launch creator (surname now filled) |
| daniela hernandez | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| celia witherspoon | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| aisha ahmad | tbd | tbd | tbd | tbd | tbd | tbd | launch creator. fields not yet captured |
| palak kapoor | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| jiaa khurana | tbd | tbd | tbd | tbd | tbd | tbd | fields not yet captured |
| jeremiah brown jr. | tbd | us (baltimore) | tbd | us | 17 | tbd | minor creator. kyc impossible until majority; whether selling is gated at publication or earnings queue until 18 is an open ruling |

## what the fixtures stress

- passport/rail mismatch (mahika, dasha melnyk): corridor keys on the
  payout rail only. nationality never selects checks. at most
  needs_review, never auto-fail, never a trust input.
- parked-market hold (faizah): admission and studio access are separate
  from payout enablement. no rail row exists for sa until v2, so payout
  onboarding cannot complete and earnings queue under the
  stranded-funds logic. not yet, not no.
- minor creator (jeremiah): no provider completes kyc below majority.
  the open question is whether an age attestation gates publication
  (nothing accumulates, nothing to hold) or whether earnings queue
  until 18. queueing a minor's sales proceeds is a custody exposure the
  stranded-funds policy was not built for.
- shared household (phoebe and lucie kemper): device hash is evidence
  attached to money moments, never a uniqueness key. same device plus
  different ages plus same address is a family, not multi-accounting.
  the fraud signal, if any, is payout patterns, which is behavior.
- overseas collectivity (gabriel dubois): nc is a french overseas
  collectivity using the cfp franc; it is not covered by any bloc list
  in the rollout matrix yet. gap to resolve before seed data ships.

## source

populated by the owner in a demo sheet, oct 6 2026. artist names are
the authoritative pasted list; this page is the record-keeping copy
and the sheet remains the working source until the tbd columns are
pasted in.
