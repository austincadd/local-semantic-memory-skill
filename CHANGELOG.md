# Changelog

All notable changes to this project will be documented in this file.

## [0.4.1] - 2026-05-21

### Changed
- rewrote the repo docs to be plugin-first instead of skill-first
- clarified plugin install, pack, and config flows
- cleaned the public README/examples into a coherent self-contained plugin story

## [0.4.0] - 2026-05-21

### Added
- `openclaw.plugin.json` plugin manifest
- `index.js` plugin entrypoint
- plugin-facing example install guide
- packaged plugin metadata in `package.json`

### Changed
- upgraded the repo from a stack-with-installers into a self-contained plugin package

## [0.3.0] - 2026-05-21

### Added
- `check-deps.sh` dependency/health script
- `bootstrap.sh` one-command setup path
- install-time workspace existence validation
- package scripts for validate/doctor/bootstrap flows

### Changed
- improved install ergonomics and dependency guidance for general-public use

## [0.2.0] - 2026-05-21

### Added
- Portable `tools/memory-local.js` runtime with configurable workspace path
- Bundled `tools/lib/hybrid-retrieval.js`
- Default `config/profiles.json`
- Full-stack installer for skill + tool + config deployment
- `package.json` with CLI entrypoint metadata

### Changed
- Upgraded the repo from skill-only packaging to a full installable local semantic memory stack

## [0.1.0] - 2026-05-20

### Added
- Initial standalone packaging for the `local-semantic-memory` skill
- Install helper script
- Validation helper script
- Public-facing README, examples, and contributing guide
