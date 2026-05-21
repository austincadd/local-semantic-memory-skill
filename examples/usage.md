# Usage examples

## Index a workspace

```bash
MEMORY_LOCAL_WORKSPACE=~/.openclaw/workspace \
MEMORY_LOCAL_PROFILE=core \
MEMORY_LOCAL_EMBED_MODEL=all-minilm \
node tools/memory-local.js index --full
```

## Inspect stats

```bash
MEMORY_LOCAL_WORKSPACE=~/.openclaw/workspace node tools/memory-local.js stats
```

## Run a targeted retrieval query

```bash
MEMORY_LOCAL_WORKSPACE=~/.openclaw/workspace \
MEMORY_LOCAL_PROFILE=core \
MEMORY_LOCAL_EMBED_MODEL=all-minilm \
node tools/memory-local.js search "Telegram invalid token and OpenClaw OAuth" --k 6 --json
```
