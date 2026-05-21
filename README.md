# local-semantic-memory-skill

A reusable OpenClaw/AgentSkill-style package for operating a **local semantic memory** workflow in workspaces that support on-device or self-hosted embedding-backed recall.

This repo packages the **skill** and installation helpers, not the full memory engine itself. It is intended for teams or solo operators who already have a local indexing/search implementation and want a documented, reusable skill that teaches an agent how to validate, debug, and trust it.

## What this solves

When remote embedding-backed recall is quota-limited, offline, expensive, or privacy-sensitive, agents need a fallback path that is:

- local-first
- disciplined about validation
- explicit about profile scope
- honest about retrieval quality
- installable by someone outside the original workspace

That is what this repo provides.

## What’s included

- `skill/SKILL.md` — concise skill entrypoint
- `skill/REFERENCE.md` — deeper operating guidance
- `skill/EXAMPLES.md` — concrete usage patterns
- `skill/scripts/install-skill.sh` — copies the skill into a target skills directory
- `skill/scripts/validate-skill.sh` — validates required packaged files
- `examples/` — installation and usage examples

## Repository layout

```text
local-semantic-memory-skill/
├── README.md
├── LICENSE
├── CHANGELOG.md
├── CONTRIBUTING.md
├── .gitignore
├── skill/
│   ├── SKILL.md
│   ├── REFERENCE.md
│   ├── EXAMPLES.md
│   └── scripts/
│       ├── install-skill.sh
│       └── validate-skill.sh
├── examples/
│   ├── install.md
│   └── usage.md
└── .github/
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── pull_request_template.md
```

## Requirements

This skill assumes the target workspace already has a local memory implementation, typically including:

- `tools/memory-local.js`
- `.memory-local/profiles.json`
- a local embedding runtime/model path such as Ollama

If your workspace uses different paths or tools, adapt `skill/SKILL.md` and `skill/REFERENCE.md` before installing.

## Install

### Option 1 — use the helper script

```bash
./skill/scripts/install-skill.sh ~/.openclaw/workspace/skills
```

That creates:

```text
~/.openclaw/workspace/skills/local-semantic-memory/
```

with the packaged skill files.

### Option 2 — manual install

Copy these files into a new skill directory named `local-semantic-memory`:

- `skill/SKILL.md`
- `skill/REFERENCE.md`
- `skill/EXAMPLES.md`

Scripts are optional but recommended.

## Validate the packaged skill

```bash
./skill/scripts/validate-skill.sh
```

## Usage

Typical workflow:

1. validate the memory entrypoint syntax
2. run the narrowest indexing profile
3. inspect stats
4. run targeted retrieval checks
5. expand scope only after narrower validation passes

See:
- [`skill/SKILL.md`](./skill/SKILL.md)
- [`skill/REFERENCE.md`](./skill/REFERENCE.md)
- [`skill/EXAMPLES.md`](./skill/EXAMPLES.md)

## Versioning

Semantic Versioning:

- `PATCH` — docs or packaging fixes
- `MINOR` — new operating guidance, examples, install helpers
- `MAJOR` — breaking assumptions about paths, tooling, or skill behavior

## Limitations

This repo does **not** bundle:

- the underlying local memory engine
- embedding model binaries
- workspace-specific index data
- environment-specific profile config

It ships the skill layer, not the entire stack.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
