# manufacturing reference data

`manufacturer-capabilities.json` is normalized research evidence for candidate manufacturing partners. it is not a live partner registry and does not activate routing.

## relationship to the source applications

- `sculptura/src/lib/sculpteoMaterials.js` contains client-side Sculpteo material constants
- `sculptura/src/components/canvas/PrintPanel.jsx` contains a direct browser-to-Sculpteo handoff
- `sculptura.dev/src/pages/admin/AdminManufacturers.jsx` edits a much smaller operational manufacturer record
- `sculptura.dev/supabase/migrations/20260511214818_436a49d3-d410-4bab-a5ac-e13598c8ac4c.sql` creates `manufacturers` and `platform_settings`

these are three different things and must be reconciled: researched capability evidence, approved operational capability versions, and live adapter/credential state. routing may use only approved operational capabilities with a healthy adapter or explicitly approved manual path.
