# Methodology: Agentic Henshin Rule Creation

This document describes the iterative, human-in-the-loop methodology for generating Model Transformation (MT) rules.

## Overview

The workflow treats MT rule construction as a supervised process rather than one-shot generation. By combining LLM intelligence with formal validation tools, we ensure that generated rules are not only syntactically correct but also semantically valid and practically applicable.

## The Three-Tiered Validation Loop

To ensure high quality, every candidate rule must pass three distinct validation tiers:

### Tier 1: Structural Well-formedness
- **Goal**: Ensure the `.henshin` file is a valid XML/XMI document and follows the Henshin schema.
- **Check**: Validates basic structure without requiring a metamodel.
- **Tool**: `node bin/validate.mjs --validate-structure`

### Tier 2: Semantic Correctness
- **Goal**: Ensure the rule aligns with the target Ecore metamodel.
- **Check**: Verifies that all Classes, Attributes, and References used in the rule exist in the `.ecore` file and that types match.
- **Tool**: `node bin/validate.mjs --validate-semantic --metamodel <file.ecore>`

### Tier 3: Application & Execution
- **Goal**: Ensure the rule can actually be applied to a real model instance.
- **Check**: Attempts to match and apply the rule to a provided `.xmi` example. This catches "logic" errors like overly restrictive NACs or missing mappings that structure/semantic checks might miss.
- **Tool**: `node bin/validate.mjs --apply --metamodel <file.ecore> --model <file.xmi> --rule <name>`

## Human-in-the-Loop (HITL)

The user is the final arbiter. After a rule passes all three tiers, it is presented to the user along with:
1. The generated `.henshin` code.
2. An explanation of the logic.
3. The result of the Tier 3 application (the transformed model).

The user then accepts the rule, rejects it, or provides feedback for further refinement.
