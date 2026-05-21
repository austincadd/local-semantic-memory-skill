# local-semantic-memory-plugin

A self-contained **local semantic memory plugin** for OpenClaw-style agent environments.

This package is designed to ship as a real plugin, not just a repo with helper scripts. It bundles:

- plugin manifest + entrypoint
- local semantic memory runtime
- default profile configuration
- bundled skill files
- install/bootstrap helpers

## What this package provides

### Plugin layer
- `openclaw.plugin.json` for discovery and config validation
- `index.js` plugin entrypoint
- plugin config surface under `plugins.entries.local-semantic-memory.config`

### Runtime layer
- `tools/memory-local.js` for local indexing/search
- `tools/lib/hybrid-retrieval.js` for BM25 + vector fusion
- `config/profiles.json` for default profile behavior

### Skill layer
- bundled `skill/` files so the plugin can ship operational guidance with the runtime

## Why this is cleaner now

Instead of asking people to manually copy scripts and docs into a workspace, this package can now be:

- packed as a plugin tarball
- installed with plugin tooling
- configured through plugin config
- shipped as one self-contained unit

## Repository layout

```text
local-semantic-memory-skill/
├── README.md
├── LICENSE
├── CHANGELOG.md
├── CONTRIBUTING.md
├── package.json
├── openclaw.plugin.json
├── index.js
├── .gitignore
├── config/
│   └── profiles.json
├── tools/
│   ├── memory-local.js
│   └── lib/
│       └── hybrid-retrieval.js
├── skill/
│   ├── SKILL.md
│   ├── REFERENCE.md
│   ├── EXAMPLES.md
│   └── scripts/
│       ├── bootstrap.sh
│       ├── check-deps.sh
│       ├── install-skill.sh
│       ├── install-stack.sh
│       └── validate-skill.sh
└── examples/
    ├── install.md
    ├── plugin-install.md
    └── usage.md
```

## Requirements

- Node.js 18+
- a markdown-oriented workspace to index
- a running Ollama instance for embeddings
- an installed embedding model such as `all-minilm` or `nomic-embed-text`
- `curl` for dependency checks

## Recommended install path

### Install as a plugin package

Pack locally or publish it, then install it through plugin tooling:

```bash
openclaw plugins install /path/to/local-semantic-memory-plugin-0.4.0.tgz
```

Or once published to a registry:

```bash
openclaw plugins install local-semantic-memory-plugin
```

Then restart the gateway and configure:

```text
plugins.entries.local-semantic-memory.config
```

See [`examples/plugin-install.md`](./examples/plugin-install.md).

## Alternate install paths

### Bootstrap into a workspace

```bash
./skill/scripts/bootstrap.sh /path/to/workspace
```

### Install full stack into a workspace

```bash
./skill/scripts/install-stack.sh /path/to/workspace
```

### Install only the bundled skill files

```bash
./skill/scripts/install-skill.sh /path/to/workspace/skills
```

## Validation

```bash
./skill/scripts/validate-skill.sh
npm run pack-check
```

## Plugin surfaces

This package currently exposes:

- plugin manifest: `openclaw.plugin.json`
- plugin entrypoint: `index.js`
- gateway method: `localSemanticMemory.status`
- CLI command: `local-memory-status`
- bundled skill files via the plugin manifest
- standalone runtime CLI: `local-semantic-memory`

## Included helper scripts

- `check-deps.sh` — verifies Node, curl, Ollama reachability, and embedding-model presence
- `bootstrap.sh` — dependency check + full-stack install in one command
- `install-stack.sh` — installs skill + runtime + config into a workspace
- `install-skill.sh` — installs only the bundled skill layer
- `validate-skill.sh` — validates manifest, package files, runtime syntax, and config presence

## Runtime usage

From the repo root or a workspace where the tool is installed:

```bash
node tools/memory-local.js index --full
node tools/memory-local.js stats
node tools/memory-local.js search "failed OAuth token refresh" --k 6 --json
```

Or point at another workspace:

```bash
MEMORY_LOCAL_WORKSPACE=/path/to/workspace node tools/memory-local.js stats
```

## Environment variables

- `MEMORY_LOCAL_WORKSPACE` — workspace root to index/search
- `MEMORY_LOCAL_PROFILE` — `smoke`, `core`, `expanded`, or `full-history`
- `MEMORY_LOCAL_EMBED_MODEL` — embedding model name
- `MEMORY_LOCAL_PROFILES` — optional custom profiles JSON path
- `OLLAMA_HOST` — Ollama base URL

## Limitations

This is now a self-contained plugin package, but it still assumes:

- markdown-oriented memory files
- an Ollama-based embedding runtime
- a host environment compatible with the packaged runtime and plugin model

## Versioning

Semantic Versioning:

- `PATCH` — packaging/docs fixes
- `MINOR` — new plugin/runtime/install behavior that is backward compatible
- `MAJOR` — breaking manifest, config, or runtime behavior changes

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
