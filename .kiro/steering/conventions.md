---
included: always
---

# writing and repo conventions

- all prose is lowercase, including headings. no emojis, no em dashes.
- preserve case in code, identifiers, schemas, urls, and external names.
- commit messages: short lowercase subject (about 50 chars, one idea),
  with supporting detail and verification notes in the body.
- every claim about the outside world (rules, numbers, capabilities) needs
  a logged source in offerings/research/sources.md with a boundary column
  saying what the source actually supports. no unsourced facts.
- nothing may live only in a sandbox. anything built or configured must be
  reproducible from this repo (scripts, config, seeds).
- do not invent product decisions. if a spec is ambiguous, stop and flag
  it rather than choosing silently.
- the audit docs and buildplan/ are the truth ledger; when reality and a
  doc disagree, fix the doc with evidence, never the other way.
