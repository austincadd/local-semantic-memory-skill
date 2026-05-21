#!/usr/bin/env bash
set -euo pipefail

TARGET_ROOT="${1:-}"
if [[ -z "$TARGET_ROOT" ]]; then
  echo "Usage: $0 <skills-directory>" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
TARGET_DIR="$TARGET_ROOT/local-semantic-memory"

mkdir -p "$TARGET_DIR"
cp "$ROOT_DIR/skill/SKILL.md" "$TARGET_DIR/SKILL.md"
cp "$ROOT_DIR/skill/REFERENCE.md" "$TARGET_DIR/REFERENCE.md"
cp "$ROOT_DIR/skill/EXAMPLES.md" "$TARGET_DIR/EXAMPLES.md"

echo "Installed local-semantic-memory skill to: $TARGET_DIR"
