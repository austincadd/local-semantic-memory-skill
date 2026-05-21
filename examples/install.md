# Install examples

For plugin-style installation, also see [plugin-install.md](./plugin-install.md).

## One-command bootstrap

```bash
git clone https://github.com/<your-user>/local-semantic-memory-skill.git
cd local-semantic-memory-skill
./skill/scripts/bootstrap.sh /path/to/workspace
```

## Full stack install into a workspace

```bash
./skill/scripts/install-stack.sh /path/to/workspace
```

## Skill-only install

```bash
./skill/scripts/install-skill.sh /path/to/workspace/skills
```

## Validate after install

```bash
cd /path/to/workspace
node tools/memory-local.js stats
```
