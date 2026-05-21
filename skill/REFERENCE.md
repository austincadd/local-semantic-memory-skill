# Local Semantic Memory Reference

## Purpose

This skill packages operating guidance for a local semantic memory system that runs inside an OpenClaw-style workspace.

It is meant for environments where remote embedding-backed memory recall may be degraded, too slow, quota-limited, privacy-sensitive, or unavailable.

## What this skill assumes

By default, this skill assumes a workspace with these paths:

- `tools/memory-local.js` — main index/search entrypoint
- `.memory-local/profiles.json` — profile configuration
- `.memory-local/index.json` — generated index data
- `.memory-local/manifest.json` — index manifest

If your workspace uses different paths, update the skill before installing it.

## Profiles

### `smoke`
Use for quick validation after edits to indexing logic, chunking, filtering, or retrieval wiring.

### `core`
Use for day-to-day operational recall validation.

### `expanded`
Use before broader rollout when you need higher recall coverage.

### `full-history`
Use only after smaller profiles are stable. This is the most expensive path and should not be your first debug loop.

## Model guidance

Recommended default for this host pattern:

```bash
MEMORY_LOCAL_EMBED_MODEL=all-minilm
```

Why:
- faster local testing
- lower iteration cost
- good enough for operational validation loops

Tradeoff:
- tighter context limit than some larger models

## Failure interpretation

### Context-limit failures
Treat these as chunking defects, not normal skips.

### Missing obvious memories
Treat these as retrieval-quality failures until proven otherwise.

### Remote `memory_search` outages
This skill is the fallback path when remote embedding quota or provider health is degraded.

## Validation sequence

Run in this order:

1. syntax check
2. smoke profile
3. stats review
4. targeted retrieval checks
5. broader profile only if earlier checks pass

## Expansion policy

Do not treat `expanded` or `full-history` as trusted operational recall until:

- indexing finishes cleanly or with fully understood skips
- integrity checks pass
- targeted retrieval samples consistently surface expected memories near the top

## Portability note

This repo packages the skill itself, but it does not ship the memory engine implementation. Consumers still need the underlying workspace tooling (`tools/memory-local.js`, profile config, local model/runtime setup) unless they adapt the skill to their own implementation.
