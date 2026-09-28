# comparable platforms: reference list

names kept handy for future research passes on positioning, mechanics,
and pricing models. this is a reference list, not an integration plan
and not an endorsement; nothing here is committed to the roadmap.

## creator storefront / merch platforms
- fourthwall
- spreadshop
- teemill

## print-on-demand marketplaces
- redbubble
- teepublic
- zazzle
- teespring
- spreadshirt
- threadless

## pod fulfillment providers
- bonfire.com
- printify
- printful
- gelato

## commissions / bespoke work marketplaces
- vgen
- booth.pm
- skeb
- custommade.com (deposit-then-final-payment on approval and shipment, close to our escrow model)
- contra (no-fee commission marketplace; fee-structure inspo candidate for how a platform can fund itself without taking a cut of creator work)

## tip-jar / support monetization
- ko-fi
- throne
- patreon
- buymeacoffee
- whop

## art print / decor storefronts
- inprnt
- society6
- spoonflower
- contrado
- arcade.ai (ai-designed, made-on-demand jewelry; product-concept cousin only, see mapping)

## checkout / digital sales tooling
- gumroad (source available)
- artistree
- unvale
- kirke
- anzu

## why these matter to sculptura

- vgen, skeb, booth.pm, custommade, contra: the commission rails comparables for
  [commissions.md](commissions.md) (terms surfaces, escrow, dispute, fee structures).
- fourthwall, spreadshop, teemill: creator storefront + white-label
  comparables for [creator-services.md](creator-services.md).
- arcade.ai: nearest *product-concept* cousin (ai-designed jewelry,
  made on demand), but architecturally different in the way that
  matters: arcade generates an image, then an artisan interprets that
  image and hand-makes the piece. there is no deterministic geometry,
  no parametric model, no server-side manufacturability validation, and
  no immutable design release; manufacturability judgment lives in the
  artisan, not the system. sculptura is the inverse: parametric
  openscad geometry, validated before sale, exact reproducible releases.
  worth a dedicated research pass for their routing and artisan-network
  mechanics, not their pipeline.
- gumroad (source available): a checkout codebase we can read freely
  when prototyping the payments leg.
- the pod set (printify, printful, gelato): routing/orchestration
  patterns from a mature make-on-demand industry, mirroring our
  regional casting routing.

research passes against these stay in
[research sources](../../offerings/research/sources.md).
