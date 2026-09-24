#!/usr/bin/env python3
"""validate-jsonl.py — parse every .jsonl in research/ and report broken lines.

exits 1 if any file has unparseable lines, 0 if all clean.
"""
import json
import sys
import glob
import os

RESEARCH_DIR = os.path.join(os.path.dirname(__file__), "..", "research")

def validate_jsonl(filepath):
    name = os.path.relpath(filepath)
    with open(filepath) as f:
        lines = f.read().split("\n")

    errors = []
    count = 0
    for i, line in enumerate(lines):
        if not line.strip():
            continue
        count += 1
        try:
            json.loads(line)
        except json.JSONDecodeError as e:
            errors.append((i + 1, str(e), line[:120]))

    if errors:
        print(f"FAIL {name}: {len(errors)} broken / {count} total")
        for ln, err, preview in errors:
            print(f"  line {ln}: {err}")
            print(f"    {preview}...")
    else:
        print(f"OK   {name}: {count} records")
    return len(errors) == 0

def main():
    pattern = os.path.join(RESEARCH_DIR, "**", "*.jsonl")
    files = sorted(glob.glob(pattern, recursive=True))
    if not files:
        print("no .jsonl files found")
        return 1

    all_ok = True
    for f in files:
        if not validate_jsonl(f):
            all_ok = False

    if all_ok:
        print("\nall jsonl files valid")
        return 0
    else:
        print("\nvalidation failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())