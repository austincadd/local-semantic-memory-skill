# Usage examples

Before indexing for real, it is worth running:

```bash
./skill/scripts/check-deps.sh
```


## Index a workspace

```bash
MEMORY_LOCAL_WORKSPACE=/path/to/workspace \
MEMORY_LOCAL_PROFILE=core \
MEMORY_LOCAL_EMBED_MODEL=all-minilm \
node tools/memory-local.js index --full
```

## Inspect stats

```bash
MEMORY_LOCAL_WORKSPACE=/path/to/workspace node tools/memory-local.js stats
```

## Run a targeted retrieval query

```bash
MEMORY_LOCAL_WORKSPACE=/path/to/workspace \
MEMORY_LOCAL_PROFILE=core \
MEMORY_LOCAL_EMBED_MODEL=all-minilm \
node tools/memory-local.js search "failed token refresh and login errors" --k 6 --json
```

