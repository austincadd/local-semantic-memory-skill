#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="${1:-}"
if [[ -z "$WORKSPACE_ROOT" ]]; then
  echo "Usage: $0 <workspace-root>" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

bash "$ROOT_DIR/skill/scripts/check-deps.sh"
bash "$ROOT_DIR/skill/scripts/install-stack.sh" "$WORKSPACE_ROOT"

echo
echo "Next steps:"
echo "  1. cd $WORKSPACE_ROOT"
echo "  2. MEMORY_LOCAL_WORKSPACE=$WORKSPACE_ROOT node tools/memory-local.js stats"
echo "  3. MEMORY_LOCAL_WORKSPACE=$WORKSPACE_ROOT MEMORY_LOCAL_PROFILE=smoke MEMORY_LOCAL_EMBED_MODEL=[1mall-minilm[0m node tools/memory-local.js index --full"
