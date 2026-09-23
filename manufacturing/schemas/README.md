# Manufacturing schemas

Schemas define the shape of normalized manufacturing evidence and approved capability data.

## Current state

`manufacturer-capabilities.schema.json` validates the researched capability records in this foundation. No corresponding schema validation was found in the application source, and the `sculptura.dev` manufacturer table does not represent the full evidence model.

## Required work

Separate schemas for researched claims, approved capability versions, adapter configuration, quotes, production orders, partner status events, and quality outcomes. Add producer and consumer contract tests before any source application may rely on these records.
