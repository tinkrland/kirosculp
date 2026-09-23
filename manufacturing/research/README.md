# Manufacturing research

This folder stores evidence before it becomes approved manufacturing truth.

- `raw/` contains retrieved source material
- `candidates/` contains evidence-bound candidate assessments
- `topics/` contains cross-partner and regulatory research

## Source-code gap

Neither application has an evidence-review, approval, expiry, or promotion workflow. `sculptura.dev/src/pages/admin/AdminManufacturers.jsx` can edit manufacturer rows, but it does not connect those rows to the cited research in this folder.

Build a review workflow that promotes a dated research claim into a versioned approved capability. Retain the source URL, retrieval date, reviewer, scope, caveats, effective date, and later supersession. Raw research must never activate a material or route by itself.
