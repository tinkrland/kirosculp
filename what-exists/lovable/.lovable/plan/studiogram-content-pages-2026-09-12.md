# studiogram content pages

## goal

rename the public studio explanation from `/productstudio` to `/studiogram` and turn it into a small, linked content guide. no studio engine, 3d controls, data model, or backend work will be built.

## pages

- `/studiogram`: overview, why the studio exists, the four-part journey, and clear links into each guide
- `/studiogram/hand`: one configurable hand, morphology, surface details, tattoos, and saved configurations
- `/studiogram/jewelry`: the real compiled artifact mesh, attachment points, stacking, and cross-creator pieces
- `/studiogram/scene`: posing, camera, lighting, environments, and reproducible scene state
- `/studiogram/capture`: the multi-shot capture flow, review, ordering, and png carousel export

## changes

- replace the existing long single page with an overview and a shared content-page layout
- add the four focused subpages using the uploaded specification as the source
- update app links, footer wording, page metadata, and sitemap entries to use `studiogram`
- redirect the old `/productstudio` address to `/studiogram` so existing links still work
- clearly label the experience as upcoming and explanatory, not a working studio
- keep all visible text lowercase, use only lucide icons, and avoid em dashes

## verification

- check the overview and every subpage at desktop and mobile widths
- confirm navigation, old-address redirect, metadata, and sitemap entries
- confirm the project still builds without errors
