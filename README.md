# local-semantic-memory-skill

A portable **local semantic memory stack** for OpenClaw-style workspaces.

This repo now packages both:

1. the **skill layer** that teaches an agent how to operate local semantic recall
2. the **runtime layer** needed to index and search markdown memory locally

That makes it installable outside the original workspace instead of being tied to one machine’s hardcoded paths.

## What’s included

- `skill/` — installable OpenClaw/AgentSkill-style files
- `tools/memory-local.js` — local index/search engine entrypoint
- `tools/lib/hybrid-retrieval.js` — BM25 + vector hybrid retrieval helper
- `config/profiles.json` — default indexing profiles
- install scripts for skill-only or full stack installation

## Features

- local markdown indexing with profile-based scope control
- Ollama embedding integration
- hybrid retrieval with BM25 + vector fusion
- automatic chunk splitting retry for context-overflow embedding failures
- reusable skill packaging for agent environments
- workspace installer for skill + tool + config layout

## Repository layout

```text
local-semantic-memory-skill/
├── README.md
├── LICENSE
├── CHANGELOG.md
├── CONTRIBUTING.md
├── package.json
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
│       ├── install-skill.sh
│       ├── install-stack.sh
│       └── validate-skill.sh
├── examples/
│   ├── install.md
│   └── usage.md
└── .github/
    ├── ISSUE_TEMPLATE/
    └── pull_request_template.md
```

## Requirements

- Node.js 18+
- a target workspace containing markdown memory files
- a running Ollama instance for embeddings
- an installed embedding model such as `all-minilm` or `nomic-embed-text`

## Install options

### Option 1 — install full stack into a workspace

```bash
./skill/scripts/install-stack.sh /path/to/workspace
```

That installs:

- `skills/local-semantic-memory/`
- `tools/memory-local.js`
- `tools/lib/hybrid-retrieval.js`
- `.memory-local/profiles.json`

### Option 2 — install only the skill layer

```bash
./skill/scripts/install-skill.sh /path/to/workspace/skills
```

## Validate the package

```bash
./skill/scripts/validate-skill.sh
```

## Included helper scripts

- `check-deps.sh` — verifies Node, curl, Ollama reachability, and embedding-model presence
- `install-skill.sh` — installs only the skill layer
- `install-stack.sh` — installs skill + runtime + config into a workspace
- `bootstrap.sh` — dependency check + full-stack install in one command

## CLI usage

From the repo root or a workspace where the tool is installed:

```bash
node tools/memory-local.js index --full
node tools/memory-local.js stats
node tools/memory-local.js search "failed OAuth token refresh" --k 6 --json
```

You can also point it at another workspace:

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

This repo still assumes your memory data lives in a markdown-oriented workspace shape. It is portable across machines, but not magically universal across every knowledge-store architecture.

## Versioning

Semantic Versioning:

- `PATCH` — packaging/docs fixes
- `MINOR` — new workflow, installer, or retrieval behavior improvements
- `MAJOR` — breaking path, config, or engine behavior changes

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT


MIT
