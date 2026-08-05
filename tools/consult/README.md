# Intent Consultation Tool

This tool manages structured mid-loop consultations with the user when intent is ambiguous, underspecified, or conflicts with the metamodel or examples.

## Usage

### 1. Open a Consultation
When the agent detects a need for clarification (see triggers below), open a consult:

```bash
node tools/consult/cli.mjs open \
  --session <id> \
  --trigger C_PARAM_UNKNOWN \
  --question "What integer amount should ShiftLeft move?" \
  --option "A: 1" \
  --option "B: all available" \
  --why "Tier 3 and example generation need a concrete amount."
```

This creates `sessions/<id>/intent/consult-NN.md` and sets session status to `awaiting_consult`.

### 2. Answer a Consultation
When the user provides a reply (usually via chat), record it:

```bash
node tools/consult/cli.mjs answer \
  --session <id> \
  --consult 1 \
  --reply "A: 1"
```

### 3. Resolve Intent
Once all necessary consultations are answered, merge them into the final intent:

```bash
node tools/consult/cli.mjs resolve --session <id>
```

This creates/updates `sessions/<id>/intent/resolved-intent.md` and sets session status back to `running`.

## Intent Gate Checklist

Run this checklist before the first `rule-generator write`:

- [ ] **Operation verb clear** (create/delete/move/reparent/set/…)?
- [ ] **Target EClass(es) named** or uniquely inferable?
- [ ] **References/attributes involved named** or uniquely inferable?
- [ ] **Multiplicity / parameters present** or safely defaultable?
- [ ] **NAC / “do not duplicate” requirement stated** or unnecessary?
- [ ] **Success criterion stated** (what should change in an example)?

Any **"no"** on the first four items requires opening a consult.

## Required Consultation Triggers

| Code | Condition |
| :--- | :--- |
| `C_AMBIGUOUS_OP` | NL describes ≥2 distinct edit operations without priority |
| `C_MISSING_SCOPE` | Target types/elements not identifiable in Ecore or seed |
| `C_PARAM_UNKNOWN` | Rule needs parameters (amounts, names) not present in NL |
| `C_CONFLICT_SEED` | Seed model cannot illustrate the described change and user did not allow synthesis |
| `C_REJECT_REOPEN` | Prior `decision.json` reject fault is underspecified (< 15 chars) |

## Policy
- **Pause Execution**: After opening a consult, stop generation until it is resolved.
- **Single Source of Truth**: Always prefer `resolved-intent.md` over `initial.md` for generation and evaluation if it exists.
- **No Silently Inventing Parameters**: Use `C_PARAM_UNKNOWN` if values are missing.
