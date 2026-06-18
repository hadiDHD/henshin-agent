# 00_INDEX

Rapid-access index for the Henshin Agent Wiki.

## 1. Table of Contents
| File | Focus |
| :--- | :--- |
| [01_HENSHIN_RULES.md](./01_HENSHIN_RULES.md) | Transformation units (Rules, Sequential, Loop), parameters (IN, VAR), and XML patterns. |
| [02_METAMODEL_BINDING.md](./02_METAMODEL_BINDING.md) | Ecore integration, nsURI matching, and structural pathing (`href`). |
| [03_VALIDATION_PLAYBOOK.md](./03_VALIDATION_PLAYBOOK.md) | Three-Tier Validation, Error Matrix, and debugging workflows. |
| [04_CASE_STUDIES.md](./04_CASE_STUDIES.md) | MOMoT2 domain specifications, Ecore schemas, and verification commands. |

## 2. Core Keyword Mapping

| Keyword | Location | Description |
| :--- | :--- | :--- |
| **NAC** | [01_HENSHIN_RULES.md#4](./01_HENSHIN_RULES.md#4) | Negative Application Condition XML structure and logic. |
| **SequentialUnit** | [01_HENSHIN_RULES.md#3](./01_HENSHIN_RULES.md#3) | Chaining rules and passing data via VAR. |
| **VAR Parameter** | [01_HENSHIN_RULES.md#2](./01_HENSHIN_RULES.md#2) | Internal variables for state passing (not exposed to search). |
| **nsURI** | [02_METAMODEL_BINDING.md#1](./02_METAMODEL_BINDING.md#1) | Metamodel namespace URI declaration and binding. |
| **mappings** | [01_HENSHIN_RULES.md#1](./01_HENSHIN_RULES.md#1) | LHS to RHS node preservation logic. |
| **Tier 3** | [03_VALIDATION_PLAYBOOK.md#1](./03_VALIDATION_PLAYBOOK.md#1) | Real-world application testing on example XMI models. |
| **Classifier Not Found** | [03_VALIDATION_PLAYBOOK.md#2](./03_VALIDATION_PLAYBOOK.md#2) | Troubleshooting Tier 2 semantic errors. |

## 3. Quick Reference: Common Commands
- **Structure Check**: `node bin/validate.mjs --validate-structure <file>.henshin`
- **Semantic Check**: `node bin/validate.mjs --validate-semantic <file>.henshin --metamodel <meta>.ecore`
- **Apply Rule**: `node bin/validate.mjs --apply <file>.henshin --metamodel <meta>.ecore --model <ex>.xmi --rule <RuleName>`
