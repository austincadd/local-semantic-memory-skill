# Plugin install example

## Install as a plugin tarball

```bash
openclaw plugins install /path/to/local-semantic-memory-plugin-0.4.0.tgz
```

## Install from a registry package

```bash
openclaw plugins install local-semantic-memory-plugin
```

## Restart and configure

After install, restart the gateway and configure:

```text
plugins.entries.local-semantic-memory.config
```

Suggested config fields:

- `workspaceRoot`
- `ollamaHost`
- `defaultEmbedModel`
- `profilesPath`

## Quick validation

```bash
openclaw plugins list
openclaw local-memory-status
```
