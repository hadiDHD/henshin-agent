# Agent Tools

This directory contains first-class tools used by the Henshin Transformation Agent.

## Core Tools

| Tool | Purpose | CLI Entry |
| :--- | :--- | :--- |
| **Rule Generator** | Manages session initialization and candidate rule versioning. | `node tools/rule-generator/cli.mjs` |
| **Example Generator** | Generates tailored test XMIs for Tier 3 validation. | `node tools/example-generator/cli.mjs` |
| **Validator** | Provides Three-Tier Validation (Structural, Semantic, Applicability). | `node bin/validate.mjs` |
| **Consult** | Manages mid-loop consultations for intent clarification. | `node tools/consult/cli.mjs` |
| **Evaluation** | Packages candidates and examples for user evaluation. | `node tools/evaluation/cli.mjs` |
| **KB Enrich** | Persists accepted rules and learned patterns into library/wiki. | `node tools/kb-enrich/cli.mjs` |

All tools follow the system architecture contract defined in `AGENTS.md`.
