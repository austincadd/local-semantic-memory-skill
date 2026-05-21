---
name: local-semantic-memory
description: Build, validate, debug, and operate a local semantic memory index for OpenClaw-style workspaces. Use when working on local memory indexing, profile-based recall, Ollama embedding setup/tuning, retrieval validation, chunking/context-limit failures, or fallback semantic recall when remote embeddings are unavailable.
---

# Local Semantic Memory

Use this skill when semantic recall should run locally instead of depending on remote embedding APIs.

## Quick start

1. Confirm the local entrypoint exists.
2. Run a syntax check.
3. Start with the narrowest profile that can validate the change.
4. Validate retrieval quality before trusting broader rollout.

## Workflow

1. Use `smoke` for fast correctness checks.
2. Use `core` for day-to-day operational recall.
3. Use `expanded` before broader rollout.
4. Use `full-history` only after narrower profiles are clean.
5. Prefer `MEMORY_LOCAL_EMBED_MODEL=all-minilm` for fast local testing unless you specifically need another model.
6. Treat context-window overflows as chunking bugs to fix, not acceptable skips.

## Required checks

### Syntax
```bash
node -c tools/memory-local.js
```

### Smoke index
```bash
MEMORY_LOCAL_PROFILE=smoke MEMORY_LOCAL_EMBED_MODEL=all-minilm node tools/memory-local.js index --full
```

### Stats
```bash
MEMORY_LOCAL_EMBED_MODEL=all-minilm node tools/memory-local.js stats
```

### Retrieval sample
```bash
MEMORY_LOCAL_PROFILE=core MEMORY_LOCAL_EMBED_MODEL=all-minilm node tools/memory-local.js search "Telegram invalid token and OpenClaw OAuth" --k 6 --json
```

## Fix immediately

- indexing outside declared profile scope
- syntax/runtime breaks in `tools/memory-local.js`
- chunk skips caused by context overflow when autosplitting could recover them
- obvious retrieval misses on targeted queries

## Files

- See [REFERENCE.md](./REFERENCE.md)
- See [EXAMPLES.md](./EXAMPLES.md)
- Optional helpers live in `scripts/`
