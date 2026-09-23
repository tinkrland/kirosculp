#!/usr/bin/env python3
"""rebuild the per-file source ledger without copying source code or secrets.

reads every non-generated file from both source snapshots. records content hashes
for ordinary files and redacted metadata for environment/credential files.
the status is a triage decision, not a claim that a ui represents a complete system.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCES = ROOT.parent / "repo-audit"
SKIP = {".git", "node_modules", "dist", ".next", "coverage"}
PRIVATE = re.compile(r"(^|/)(\.env(?:\..*)?|.*\.(?:pem|key|p12))$", re.I)
TEXT_SUFFIXES = {".js", ".jsx", ".ts", ".tsx", ".json", ".jsonc", ".md", ".sql", ".css", ".html", ".svg", ".xml", ".txt", ".toml", ".development", ""}
SENSITIVE_MIGRATIONS = {"20260429121931", "20260502200217", "20260512235827"}


def signals(s: str) -> str:
    found = []
    tests = [
        (r"(?:localStorage|sessionStorage)", "browser storage"),
        (r"(?:supabase|\.from\(|createClient\()", "supabase access"),
        (r"(?:base44|Base44)", "legacy base44 access"),
        (r"(?:fetch\(|\.invoke\()", "api call"),
        (r"(?:create table|create policy|alter policy)", "database migration"),
        (r"(?:<form|<input|type=.?submit)", "form/ui"),
        (r"(?:window\.location|navigate\(|useNavigate)", "route/navigation"),
        (r"(?:STLExporter|stlExport|openscad|OpenSCAD|three|Three)", "geometry/rendering"),
        (r"(?:payment|payout|earnings|checkout|refund|commission)", "commerce-related code"),
        (r"(?:function |export (?:default|const|function)|const \w+ = \(|def \w+\()", "functions/exports"),
    ]
    for pat, description in tests:
        if re.search(pat, s, re.I):
            found.append(description)
    return ", ".join(found[:5]) or "source/configuration inspected"


def classify(app: str, rel: str, text: str | None) -> tuple[str, str, str]:
    name = Path(rel).name
    lower = rel.lower()
    if PRIVATE.search(rel):
        return "restricted", "deployment credentials", "keep private; do not publish contents or hashes"
    if text is None:
        return "exists", "binary/static asset", "retain or review whether still referenced"
    if lower.endswith((".md", ".txt")):
        return "reference", "legacy source documentation", "verify against implementation; do not treat as deployed behavior"
    if name in {"package-lock.json", "bun.lockb"}:
        return "exists", "dependency lock", "pin and verify dependency/build compatibility"
    if lower in {"src/main.jsx", "src/main.tsx"}:
        return "exists", "application bootstrap", "retain, then verify provider wiring and startup"
    if lower == "src/app.jsx":
        return "partial", "route composition", "verify auth gates and each routed domain against the target split"
    if lower.endswith("/protectedroute.jsx") or lower.endswith("/authcontext.jsx"):
        return "partial", "client authentication/session helper", "verify server-enforced role and cross-tenant access"
    if lower.startswith("src/components/layout/") or lower.startswith("src/components/viewer/"):
        return "exists", "shared layout or model viewer", "retain only after checking release/provenance and accessibility"
    if lower.startswith("src/components/ui/") or lower.startswith("src/hooks/"):
        return "exists", "shared interface helper", "retain after accessibility and dependency review"
    if lower.startswith("supabase/migrations/"):
        if any(name.startswith(x) for x in SENSITIVE_MIGRATIONS):
            return "rebuild", "database schema and row policies", "repair broad policies, retain history and add restrictive cumulative migrations"
        return "partial", "database schema or policy change", "verify cumulative policy, role, and private-data access against current database"
    if lower.startswith("supabase/functions/"):
        if any(x in lower for x in ("place-order", "publish-artifact")):
            return "rebuild", "server order or publishing function", "replace trust gaps with release-bound quote/payment or server validation gates"
        return "partial", "server function", "review auth, ownership, field allowlist, and failure handling"
    if app == "sculptura":
        if lower.startswith("base44/entities/"):
            return "move", "legacy commerce entity", "map fields to studio project or move commerce to the platform backend"
        if lower in {"src/components/canvas/printpanel.jsx"}:
            return "rebuild", "studio print control", "remove direct factory/order path; keep manufacturing behind released platform orders"
        if lower.startswith(("src/pages/market/", "src/components/market/", "src/components/cart/", "src/components/artifacts/", "src/components/dashboard/", "src/components/creator/", "src/components/explore/", "src/components/home/")) or lower in {"src/pages/checkout.jsx", "src/pages/publishartifact.jsx", "src/pages/artifactdetail.jsx", "src/pages/shopprofile.jsx", "src/pages/creatorprofile.jsx", "src/pages/adminreview.jsx", "src/pages/explore.jsx", "src/pages/dashboard.jsx", "src/lib/cartstore.js", "src/lib/pricing.js", "src/lib/demodata.js"}:
            return "move", "offering/marketplace code inside studio", "move useful behavior to platform, then remove studio commerce dependency"
        if lower.startswith("src/api/"):
            return "partial", "studio API facade", "separate studio auth/data from legacy marketplace dependencies"
        if lower == "src/pages/canvasdesigner.jsx":
            return "partial", "legacy browser design surface", "merge useful controls into canonical studio and server build"
        if lower.startswith(("src/components/canvas/", "src/pages/studio/", "src/lib/jewelry", "src/lib/multipiece", "src/lib/stl", "src/lib/svg", "src/lib/studiostore")):
            return "partial", "studio editing or geometry", "retain intent/controls; converge preview and exports on server-validated paracraft"
    if app == "sculptura.dev":
        if lower == "src/components/admin/adminlayout.jsx":
            return "rebuild", "admin authentication", "remove plaintext client password; enforce named admin role on server"
        if "commission" in lower and lower.endswith((".jsx", ".tsx")):
            return "rebuild", "commission surface", "keep muted until authenticated request, terms, payment protection and disputes work"
        if lower in {"src/pages/checkout.jsx", "src/components/artifacts/ordermodal.jsx"}:
            return "rebuild", "checkout/order control", "add release-bound trusted quote, mock payment state, idempotency and reconciliation"
        if lower in {"src/pages/publishartifact.jsx"}:
            return "rebuild", "platform publishing", "require a server-validated immutable studio design release"
        if lower.startswith("src/pages/admin/") or lower.startswith("src/components/admin/"):
            return "shell", "admin operations interface", "connect protected domain APIs and real partner/route controls"
        if lower.startswith("src/components/viewer/") or lower == "src/pages/productstudio.jsx":
            return "move", "studio behavior in offering app", "keep creator geometry generation in studio; consume releases only in platform"
        if lower.startswith(("src/components/artifacts/", "src/components/cart/")):
            return "partial", "listing/cart ui", "use release-backed listings and trusted checkout totals"
        if lower.startswith("src/components/market/") or lower.startswith("src/pages/market/"):
            if any(x in lower for x in ("settingspayout", "financesection", "analyticssection", "insightssection")):
                return "shell", "creator money/analytics ui", "back with operational ledger and reported events"
            return "partial", "creator storefront/account ui", "verify persistence/auth and separate preview state from published offers"
        if lower.startswith(("src/components/follow/", "src/components/shop/", "src/pages/")):
            if any(x in lower for x in ("demoapp", "demobuyer", "roadmap", "faq", "compare", "about")):
                return "shell", "static or demo page", "retain only where consistent with actual capabilities"
            return "partial", "buyer/listing/storefront ui", "tie to release-backed listings and authenticated or guest access as appropriate"
        if lower.startswith("src/lib/") and any(x in lower for x in ("pricing", "currency", "cartstore")):
            return "partial", "client-side shopping helper", "keep as preview; make server quote and totals authoritative"
        if lower.startswith(("src/integrations/supabase/", "src/lib/")):
            return "partial", "application integration/helper", "verify permissions and align with operational backend contracts"
    if lower.endswith((".jsx", ".tsx")):
        return "shell", "shared visual component", "keep only after domain data and behavior are checked"
    return "exists", "build/configuration/source asset", "retain with dependency and security review"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", type=Path, default=DEFAULT_SOURCES)
    ap.add_argument("--output", type=Path, default=ROOT / "audit" / "source-files.tsv")
    args = ap.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    rows: list[dict[str, str]] = []
    for app in ("sculptura", "sculptura.dev"):
        base = args.sources / app
        if not base.exists():
            raise SystemExit(f"source missing: {base}")
        for p in sorted(base.rglob("*")):
            if not p.is_file() or any(component in SKIP for component in p.relative_to(base).parts):
                continue
            rel = p.relative_to(base).as_posix()
            raw = p.read_bytes()  # each file, not an inventory listing or filename-only scan
            private = bool(PRIVATE.search(rel))
            try:
                text = raw.decode("utf-8") if p.suffix in TEXT_SUFFIXES and not private else None
            except UnicodeDecodeError:
                text = None
            status, role, next_step = classify(app, rel, text)
            rows.append({
                "repository": app,
                "file": rel,
                "bytes": str(len(raw)),
                "sha256": "[private]" if private else hashlib.sha256(raw).hexdigest(),
                "status": status,
                "role": role,
                "evidence": "private file contents withheld" if private else (signals(text) if text is not None else "binary bytes inspected"),
                "next_step": next_step,
            })
    columns = ["repository", "file", "bytes", "sha256", "status", "role", "evidence", "next_step"]
    with args.output.open("w", newline="") as out:
        writer = csv.DictWriter(out, fieldnames=columns, delimiter="\t", lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    print("files processed:", len(rows), "per repository:", dict(Counter(x["repository"] for x in rows)))
    print("statuses:", dict(Counter(x["status"] for x in rows)))
    print("output:", args.output)


if __name__ == "__main__":
    main()
