#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

for f in \
  "$ROOT_DIR/skill/SKILL.md" \
  "$ROOT_DIR/skill/REFERENCE.md" \
  "$ROOT_DIR/skill/EXAMPLES.md" \
  "$ROOT_DIR/skill/scripts/install-skill.sh"
do
  if [[ ! -f "$f" ]]; then
    echo "Missing required file: $f" >&2
    exit 1
  fi
done

echo "local-semantic-memory-skill: package validation passed"
