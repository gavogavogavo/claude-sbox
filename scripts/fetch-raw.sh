#!/usr/bin/env bash
# Fetches the raw source material needed to rebuild the reference files.
# End users don't need this — only maintainers regenerating the skill against
# a newer s&box engine release.
#
# What it does:
#   1. Clones (or updates) Facepunch/sbox-docs into raw/sbox-docs
#   2. Reminds you where raw/api-schema.json comes from
#
# Usage (from repo root):
#   ./scripts/fetch-raw.sh

set -euo pipefail

# Resolve repo root relative to this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

mkdir -p raw

if [ ! -d raw/sbox-docs ]; then
    echo "Cloning Facepunch/sbox-docs into raw/sbox-docs..."
    git clone --depth 1 https://github.com/Facepunch/sbox-docs raw/sbox-docs
else
    echo "raw/sbox-docs exists — pulling latest..."
    git -C raw/sbox-docs pull --ff-only
fi

echo ""
if [ ! -f raw/api-schema.json ]; then
    cat <<'EOF'
raw/api-schema.json is missing.

This file is the engine's full exported type schema (~9 MB JSON). It is not
distributed publicly — it is generated from a running s&box install by the
engine's documentation tooling. Options:

  1. Ask the current skill maintainer to share their copy.
  2. Generate it yourself from s&box (see docs/DESIGN.md for context).

Without this file, scripts/build_extended.js cannot regenerate
references/api-schema-extended.md.
EOF
else
    echo "raw/api-schema.json present ($(wc -c < raw/api-schema.json) bytes)"
fi

echo ""
echo "Next: run 'node scripts/build_extended.js' to rebuild references/api-schema-extended.md"
