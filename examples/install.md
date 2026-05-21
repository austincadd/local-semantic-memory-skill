# Install examples

## Full stack install into an OpenClaw-style workspace

```bash
git clone https://github.com/<your-user>/local-semantic-memory-skill.git
cd local-semantic-memory-skill
./skill/scripts/install-stack.sh ~/.openclaw/workspace
```

## Skill-only install

```bash
./skill/scripts/install-skill.sh /path/to/workspace/skills
```

## Validate after install

```bash
cd ~/.openclaw/workspace
node tools/memory-local.js stats
```
