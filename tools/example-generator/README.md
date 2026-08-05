# Example Generator

The Example Generator is a tool designed to produce and manage XMI instance models tailored to Henshin rule candidates. This addresses the "test input models are tailored by the LLM" methodology from the original paper.

## Features

- **Seed Management**: Copy and register user-provided seed models.
- **Example Registration**: Track positive, negative, and edge-case models.
- **Manifest Tracking**: Maintain a per-session `examples/manifest.json` for validation history.
- **Instance Validation**: Verify that generated models load correctly against the metamodel.

## CLI Usage

### 1. Seed a session with a user model
```bash
node tools/example-generator/cli.mjs seed --session <id> --model <path/to/model.xmi>
```

### 2. Register a generated positive example
```bash
node tools/example-generator/cli.mjs write \
  --session <id> \
  --role positive \
  --file /tmp/generated.xmi \
  --rule-version 1 \
  --purpose "minimal match for the new rule"
```

### 3. Check instance validity
```bash
node tools/example-generator/cli.mjs check \
  --session <id> \
  --role positive \
  --metamodel <path/to/metamodel.ecore>
```

### 4. View manifest
```bash
node tools/example-generator/cli.mjs manifest --session <id>
```

## Implementation Details

The `check` command currently wraps `bin/validate.mjs` using a dummy Henshin rule to verify that the EMF loader can successfully parse the XMI against the provided Ecore. Failure to load will result in a non-zero exit code.

## File Structure

- `cli.mjs`: Main entry point.
- `lib/`:
  - `manifest.mjs`: Manifest IO and state management.
  - `copySeed.mjs`: Logic for copying user seed models.
  - `writeExample.mjs`: Logic for registering new examples.
  - `validateInstance.mjs`: Wrapper for EMF model validation.
- `prompts/`: Contains `EXAMPLE_GEN_BRIEF.md` for AI agent guidance.
- `fixtures/`: Contains `dummy.henshin` used for validation.
