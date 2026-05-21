# Contributing

Thanks for improving `local-semantic-memory-skill`.

## Contribution goals

Keep the repo:

- portable
- explicit about assumptions
- honest about validation requirements
- useful outside the original workspace
- small enough to install without guesswork

## Good contributions

- clearer install guidance
- better retrieval-validation examples
- stronger portability notes
- deterministic helper scripts
- tighter failure-handling guidance

## Avoid

- baking workspace-private paths into the public package without documenting them
- pretending the skill bundles the full memory engine when it does not
- bloating `SKILL.md` with reference-only material
- adding host-specific secrets or indexes

## Validation

```bash
./skill/scripts/validate-skill.sh
```
