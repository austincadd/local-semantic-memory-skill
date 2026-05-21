#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="${1:-}"
if [[ -z "$WORKSPACE_ROOT" ]]; then
  echo "Usage: $0 <workspace-root>" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SKILL_TARGET="$WORKSPACE_ROOT/skills/local-semantic-memory"
TOOLS_TARGET="$WORKSPACE_ROOT/tools"
CONFIG_TARGET="$WORKSPACE_ROOT/.memory-local"

if [[ ! -d "$WORKSPACE_ROOT" ]]; then
  echo "Workspace root does not exist: $WORKSPACE_ROOT" >&2
  exit 1
fi

mkdir -p "$SKILL_TARGET" "$TOOLS_TARGET/lib" "$CONFIG_TARGET"
cp "$ROOT_DIR/skill/SKILL.md" "$SKILL_TARGET/SKILL.md"
cp "$ROOT_DIR/skill/REFERENCE.md" "$SKILL_TARGET/REFERENCE.md"
cp "$ROOT_DIR/skill/EXAMPLES.md" "$SKILL_TARGET/EXAMPLES.md"
cp "$ROOT_DIR/tools/memory-local.js" "$TOOLS_TARGET/memory-local.js"
cp "$ROOT_DIR/tools/lib/hybrid-retrieval.js" "$TOOLS_TARGET/lib/hybrid-retrieval.js"
cp "$ROOT_DIR/config/profiles.json" "$CONFIG_TARGET/profiles.json"
chmod +x "$TOOLS_TARGET/memory-local.js"

echo "Installed local semantic memory stack into: $WORKSPACE_ROOT"
echo "- skill: $SKILL_TARGET"
echo "- tool:  $TOOLS_TARGET/memory-local.js"
echo "- cfg:   $CONFIG_TARGET/profiles.json"
