# Rule Generator Tool

The **Rule Generator** is a **first-class agent tool**, serving as a peer component to the **Example Generator** and the **Validator** in the agentic workflow schema. It is responsible for initializing sessions, inspecting metamodels, and managing Henshin rule candidates with strict versioning and metadata tracking.

## Usage

### 1. Initialize a Session (`init`)
Call `init` at the start of a new transformation task. This prepares the directory structure and session metadata.

```bash
node tools/rule-generator/cli.mjs init \
  --session <session-id> \
  --metamodel workspace/<d>/<m>.ecore \
  --seed-model workspace/<d>/<x>.xmi \
  --intent sessions/<id>/intent/initial.md
```

### 2. Inspect Metamodel Vocabulary (`vocab`)
Call `vocab` to understand the types and features available in the metamodel before authoring a rule.

```bash
node tools/rule-generator/cli.mjs vocab --metamodel workspace/<d>/<m>.ecore
```

### 3. Register a Candidate Rule (`write`)
Call `write` to save a new candidate version of a Henshin rule. The tool handles versioning (`v1`, `v2`, etc.) and metadata sidecars.

```bash
node tools/rule-generator/cli.mjs write \
  --session <session-id> \
  --rule-name <RuleName> \
  --file <path-to-temp-henshin>
```

## Mandatory Reading
Before authoring rules, the agent MUST read:
- `wiki/01_HENSHIN_RULES.md`
- `wiki/02_METAMODEL_BINDING.md`

## Next Steps
After a successful `write`:
1. Run Tier 1 Validation (Structure).
2. Run Tier 2 Validation (Semantic).
3. Proceed to Example Generation and Tier 3 Validation.
