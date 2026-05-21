#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

for f in \
  "$ROOT_DIR/skill/SKILL.md" \
  "$ROOT_DIR/skill/REFERENCE.md" \
  "$ROOT_DIR/skill/EXAMPLES.md" \
  "$ROOT_DIR/skill/scripts/install-skill.sh" \
  "$ROOT_DIR/skill/scripts/install-stack.sh" \
  "$ROOT_DIR/tools/memory-local.js" \
  "$ROOT_DIR/tools/lib/hybrid-retrieval.js" \
  "$ROOT_DIR/config/profiles.json" \
  "$ROOT_DIR/package.json"
do
  if [[ ! -f "$f" ]]; then
    echo "Missing required file: $f" >&2
    exit 1
  fi
done

node -c "$ROOT_DIR/tools/memory-local.js" >/dev/null
node -e "const p=require('$ROOT_DIR/config/profiles.json'); if(!p.profiles?.core) throw new Error('missing core profile')"

echo "local-semantic-memory-skill: full package validation passed"
