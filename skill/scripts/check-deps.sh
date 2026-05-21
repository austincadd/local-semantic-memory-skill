#!/usr/bin/env bash
set -euo pipefail

EMBED_MODEL="${MEMORY_LOCAL_EMBED_MODEL:-all-minilm}"
OLLAMA_URL="${OLLAMA_HOST:-http://127.0.0.1:11434}"

fail=0

if ! command -v node >/dev/null 2>&1; then
  echo "[FAIL] node not found (requires Node.js 18+)" >&2
  fail=1
else
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
  if [[ "$NODE_MAJOR" -lt 18 ]]; then
    echo "[FAIL] Node.js $(node -v) found, but Node.js 18+ is required" >&2
    fail=1
  else
    echo "[ OK ] node $(node -v)"
  fi
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "[FAIL] curl not found" >&2
  fail=1
else
  echo "[ OK ] curl available"
fi

if ! curl -fsS "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
  echo "[FAIL] Ollama is not reachable at $OLLAMA_URL" >&2
  fail=1
else
  echo "[ OK ] Ollama reachable at $OLLAMA_URL"
  if curl -fsS "$OLLAMA_URL/api/tags" | grep -q "\"name\":\"$EMBED_MODEL"; then
    echo "[ OK ] embedding model present: $EMBED_MODEL"
  else
    echo "[WARN] embedding model not detected in Ollama tags: $EMBED_MODEL" >&2
    echo "       install it with: ollama pull $EMBED_MODEL" >&2
  fi
fi

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi

echo "Dependency check passed"
