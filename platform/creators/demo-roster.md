# platform: creators demo roster

demo creator fixtures populated oct 2026, captured from the populated
sheet for record keeping. these are demo-only people, not real users,
and none of their attributes should be read as creator policy. they
exist to stress the admission, payout corridor, and review designs the
way real edge-case users would.

status: partially transcribed from the sheet. cells marked tbd need the
exact values pasted from the source sheet before this is used as
seed data.

| artist | shop handle | residence | passport | payout rail | age | household | fixture intent |
|---|---|---|---|---|---|---|---|
| mahika | @divajewels | us (nj) | in | us (nj bank) | tbd | solo | launch creator. passport/rail mismatch: indian passport, american bank, standard us checks |
| aisha ahmad | tbd | tbd | tbd | tbd | tbd | tbd | launch creator. fields not yet captured |
| zoya | tbd | tbd | tbd | tbd | tbd | tbd | launch creator. fields not yet captured |
| juliette cavanaugh | @jewelsbyjules | tbd | tbd | tbd | tbd | tbd | launch-roster addition. fields not yet captured |
| juliana gorgova | @ringstackbarbie | tbd | tbd | tbd | tbd | tbd | launch-roster addition. fields not yet captured |
| dasha kovalenko | tbd | tbd | ua | de | tbd | tbd | passport/rail mismatch: ukrainian passport, german bank, german corridor |
| aylin yilmaz | tbd | tr | tbd | tbd | tbd | tbd | west asia bloc fixture |
| yara haddad | tbd | il | tbd | tbd | tbd | tbd | west asia bloc fixture |
| gabriel dubois | tbd | nc (new caledonia) | fr | tbd | tbd | tbd | french overseas collectivity: french passport, cfp franc territory, rollout matrix gap |
| jeremiah brown jr. | tbd | us (baltimore) | tbd | us | 17 | tbd | minor creator. kyc impossible until majority; whether selling is gated at publication or earnings queue until 18 is an open ruling |
| faizah aisler | tbd | sa | tbd | sa (parked v2) | tbd | tbd | parked-market creator: admitted, no payout rail yet, earnings queue until the sa rail exists in v2 |
| kemper (two sisters) | tbd | tbd | tbd | tbd | different ages | same home | sibling fixture: same last name, same location, different ages, likely shared device; legitimate multi-creator household that naive multi-accounting detection would flag |

## what the fixtures stress

- passport/rail mismatch (mahika, dasha): corridor keys on the payout
  rail only. nationality never selects checks. at most needs_review,
  never auto-fail, never a trust input.
- parked-market hold (faizah): admission and studio access are separate
  from payout enablement. no rail row exists for sa until v2, so payout
  onboarding cannot complete and earnings queue under the
  stranded-funds logic. not yet, not no.
- minor creator (jeremiah): no provider completes kyc below majority.
  the open question is whether an age attestation gates publication
  (nothing accumulates, nothing to hold) or whether earnings queue
  until 18. queueing a minor's sales proceeds is a custody exposure the
  stranded-funds policy was not built for.
- shared household (kemper sisters): device hash is evidence attached
  to money moments, never a uniqueness key. same device plus different
  ages plus same address is a family, not multi-accounting. the fraud
  signal, if any, is payout patterns, which is behavior.
- overseas collectivity (gabriel dubois): nc is a french overseas
  collectivity using the cfp franc; it is not covered by any bloc list
  in the rollout matrix yet. gap to resolve before seed data ships.

## source

populated by the owner in a demo sheet, oct 6 2026. this page is the
record-keeping copy; the sheet remains the working source until the
tbd cells are filled in.
