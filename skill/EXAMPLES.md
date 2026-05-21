# Local Semantic Memory Examples

## Example 1 — smoke validation after a script edit

User:
> The local memory index is acting weird after my chunking change. Validate it.

Use:
- syntax check
- `smoke` profile
- targeted retrieval sample

## Example 2 — remote embeddings quota exhausted

User:
> `memory_search` is dead again. Can we still do semantic recall locally?

Use:
- local semantic memory workflow as fallback
- `core` or `expanded` profile depending on recall needs

## Example 3 — retrieval quality audit

User:
> Is local memory good enough for operational recall yet?

Use:
- stats
- targeted query set
- compare expected memories against top results

## Example 4 — profile discipline

User:
> Reindex everything and see if it works.

Better handling:
- start with `smoke` or `core`
- avoid `full-history` unless narrower profiles are already clean

## Example 5 — chunk overflow bug

User:
> The local index skipped a giant file because the embed model hit a context limit.

Use:
- treat as a bug to fix
- improve chunking/autosplitting
- rerun narrow validation first
