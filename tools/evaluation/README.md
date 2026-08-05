# Evaluation Tool

This tool manages the structured evaluation package for Henshin rules and transformation examples. It bundles candidate rules, validation evidence, and example models into a machine-readable `evaluation.json` and a human-readable `EVALUATION.md`.

## Commands

### `build`
Aggregates session data into an evaluation payload. 
**Note**: If `sessions/<id>/intent/resolved-intent.md` exists, it is used as the primary intent source for the payload; otherwise `initial.md` (or the input NL description) is used.

```bash
node tools/evaluation/cli.mjs build --session <id> --rule-version <n>
```

### `show`
Prints paths to the generated evaluation artifacts.
```bash
node tools/evaluation/cli.mjs show --session <id>
```

### `decide`
Records a human verdict (accept/reject) and updates the session status.
```bash
node tools/evaluation/cli.mjs decide --session <id> --verdict accept|reject [--fault <text>] [--notes <text>]
```

## Schema Compliance
This tool ensures that the evaluation payload satisfies the "Candidate Rules + Examples" schema label as defined in `AGENTS.md`.
