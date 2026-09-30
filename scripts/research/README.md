# reproduce the order-routing evidence collection

these scripts collect research evidence; they do not authorize routes or make
legal judgments. they run on an ordinary python host, not a sandbox-specific
service. configured keys are read only from environment variables.

## setup

```sh
python3 -m pip install -r scripts/research/requirements-routing.txt
```

provide `TAVILY_API_KEY` for search discovery and `FIRECRAWL_API_KEY` for page
reads/alexandria discovery through a private environment configuration. never
commit credentials. direct official-site reads do not require either key.

## replay

from the repository root, choose a fresh output directory:

```sh
python3 scripts/research/collect-routing-evidence.py \
  scripts/research/routing-source-manifest.json \
  research-output/new-routing-evidence --workers 4
```

the collector records retrieval dates, full texts and failures. it refuses to
overwrite existing source identifiers. replay produces a new observation, not a
replacement of the original source date or approval. firecrawl/alexandria calls
are spaced at least seven seconds apart; a lower provider limit still requires
adjusting collection. errors are preserved rather than silently retried.

some source paths may redirect, require dynamic rendering, expire or block direct
reads. inspect results before using them. an http 200 or scraped page is not
proof of useful content; empty/error pages and irrelevant allowances must not
be promoted into rules.

the public source index retains urls and full-text hashes rather than republishing
full source pages. working snapshots may contain copyrighted material or public
contact details. review and minimize them before any public publication.

## verify the committed research matrix

```sh
python3 scripts/research/check-routing-research.py
```

these checks cover countries, membership counts, evidence references and closed
approval/checkout fields. they do not validate legal interpretations, current
law, facility capability or a running order router.

see [the findings](../../manufacturing/research/topics/order-routing/README.md).
