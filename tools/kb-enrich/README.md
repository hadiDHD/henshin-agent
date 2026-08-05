# KB Enrich Tool

This tool handles the "Schema arrow: Accepted Rules → Knowledge Base" gap. It persists learned knowledge and reusable rules into `library/` and `wiki/learned/`.

## Commands

### `accept --session <id>`
Processes an accepted session:
1. Copies the accepted rule to `library/<domain>/<RuleName>/`.
2. Generates `RULE.md` and `META.json`.
3. Copies positive examples.
4. Writes a learned entry to `wiki/learned/entries/`.
5. Updates indexes.

### `reject-learn --session <id>`
Processes a rejected session with a fault description:
1. Writes an anti-pattern entry to `wiki/learned/entries/`.
2. Updates the learned index.

### `reindex`
Full reindexing of `library/` and `wiki/learned/` from the filesystem.

## Layouts

### Library
`library/<domain>/<RuleName>/`
- `RULE.md`: Summary of intent, params, NAC, examples.
- `<RuleName>.henshin`: Rule file.
- `META.json`: Metadata.
- `examples/`: Positive before/after models.

### Wiki Learned
`wiki/learned/`
- `00_LEARNED_INDEX.md`: Index of all learned entries.
- `entries/`: Markdown files for each learned rule or anti-pattern.
