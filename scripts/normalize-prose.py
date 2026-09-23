#!/usr/bin/env python3
"""apply the project's lowercase/no-emoji/no-em-dash prose rule to markdown.

syntax, code, urls, file names, and link destinations keep their original case.
use --check in ci to detect future prose that violates the rule.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROTECTED = re.compile(
    r"(`[^`\n]*`|\]\([^\n)]*\)|https?://[^\s<>]+|"
    r"(?:[A-Za-z0-9_.-]+/)+[A-Za-z0-9_.-]+(?:\.[A-Za-z0-9]+)?|"
    r"\b[A-Za-z0-9_.-]+\.(?:md|jsonc?|jsx?|tsx?|py|sql|svg|toml|xml|html|css)\b|"
    r"<[^>]+>)"
)
# the variation-selector sequences and pictographs below are not needed in product prose.
EMOJI = re.compile(r"[\U0001F000-\U0001FAFF\u2600-\u27BF]\ufe0f?|[\u200d\ufe0f]")


def normalize(line: str) -> str:
    fragments = PROTECTED.split(line)
    for i, part in enumerate(fragments):
        if PROTECTED.fullmatch(part):
            continue
        part = EMOJI.sub("", part)
        part = part.replace(" — ", ": ").replace("—", ", ")
        fragments[i] = part.lower()
    result = "".join(fragments)
    result = re.sub(r" +,", ",", result)
    if result.endswith("\n"):
        return result[:-1].rstrip(" \t") + "\n"
    return result.rstrip(" \t")


def rewrite(text: str) -> str:
    lines = []
    fenced = False
    for line in text.splitlines(keepends=True):
        if re.match(r"^\s*(```|~~~)", line):
            fenced = not fenced
            lines.append(line)
        elif fenced:
            lines.append(line)
        else:
            lines.append(normalize(line))
    return "".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    changed = []
    for file in sorted(ROOT.rglob("*.md")):
        if any(x in file.relative_to(ROOT).parts for x in ("node_modules", ".git")):
            continue
        old = file.read_text()
        new = rewrite(old)
        if old != new:
            changed.append(file.relative_to(ROOT).as_posix())
            if not args.check:
                file.write_text(new)
    print(("violations" if args.check else "normalized files") + ": " + str(len(changed)))
    if args.check and changed:
        print("\n".join(changed))
        raise SystemExit(1)


if __name__ == "__main__":
    main()
