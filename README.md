# Henshin Rule Creation Agent (Standalone)

This project is a standalone, agentic environment for creating and validating EMF model transformation (MT) rules using the Henshin language. It implements an iterative, human-supervised, human-in-the-loop methodology for reliable model transformations.

---

## Architecture & Methodology

Our methodology treats model transformation (MT) rule construction as an iterative, human-supervised process. 

### System Architecture Diagram

```
                              +---------------------------------------+
                              |                 USER                  |
                              +---------------------------------------+
                                |  1. Provides          ^           |
                                | (Ecore, XMI, NL)      |           | 2. Triggers
                                v                       |           v
+------------------------+  +-----------------------------------------------+
|                        |  | AGENTIC AI SETUP                              |
| - Ecore metamodel      |  |                                               |
| - Example Model (XMI)  |  | +-------------------------------------------+ |
| - NL-Description of MT |  | | Knowledge Base (Patterns & Playbook)      | |
|                        |  | +-------------------------------------------+ |
+------------------------+  |                      |                        |
             |              |                      v                        |
             |              | +-------------------------------------------+ |
             +------------->| |   LLM-based MT Rule Creation Agent        | |
                            | +-------------------------------------------+ |
                            |      /               |               \        |
                            |     v                v                v       |
                            | +-----------+  +-----------+  +-------------+ |
                            | |   Rule    |  |  Example  |  |    Rule     | |
                            | | Generator |  | Generator |  |  Validator  | |
                            | +-----------+  +-----------+  +-------------+ |
                            +-----------------------------------------------+
                                                   |
                                                   | 3. Candidate Rules + Examples
                                                   v
                              +---------------------------------------+
                              |            USER EVALUATION            |
                              +---------------------------------------+
                                                   |
                                         +---------+---------+
                                         |                   |
                                         v [Accepted]        v [Not Accepted / Rejects]
                                    +---------+         +----------------------------+
                                    | Library |         | Fault Descriptions & Loops |
                                    +---------+         +----------------------------+
```

### Core Components

1. **User (Human-in-the-Loop)**:
   - **Provides**: An Ecore metamodel (`.ecore`), an example XMI model (`.xmi`), and a natural-language description of the target change.
   - **Triggers**: Initiates the agentic creation process.
   - **Evaluates**: Evaluates proposed candidate rules and generated test cases, accepting them into the transformation library or rejecting them with fault descriptions.

2. **Agentic AI Setup**:
   - **LLM-based MT Rule Creation Agent**: Orchestrates the entire process, analyzing models and synthesizing candidates.
   - **Knowledge Base (Patterns & Playbook)**: Located in the `wiki/` directory, containing high-density guides, common error resolutions, and patterns (such as Negative Application Conditions, loop constructs, and parameter passing).
   - **Rule Generator**: Generates the underlying Henshin rule candidate XML file structure.
   - **Example Generator**: Generates or refines tailored test input models (XMI) to surface edge cases and bring fault-detection forward into the rule authoring phase rather than execution time.
   - **Rule Validator (Syntax, Semantics, Context)**: Provides robust Three-Tier Validation on the candidates.

### Three-Tier Validation Loop

The Rule Validator performs automated checks before any rule is proposed:
- **Tier 1 (Structural)**: Checks XML/XMI well-formedness and basic Henshin module schema structure (`--validate-structure`).
- **Tier 2 (Semantic)**: Verifies that type, attribute, and reference names match the target `.ecore` metamodel (`--validate-semantic`).
- **Tier 3 (Application)**: Executes the rule on a tailored example input model (XMI) using the Henshin interpreter to verify correct match/application and prevent too restrictive patterns (`--apply`).

---

## Directory Structure

- `wiki/`: Unified, high-density, agent-optimized knowledge base containing patterns, metamodel bindings, the validation playbook, and case studies (Karpathy LLM Wiki Pattern).
- `workspace/`: Location for user-provided metamodels (`.ecore`) and example models (`.xmi`).
- `output/`: Location for successfully validated, candidate `.henshin` rules.
- `bin/`: The Node-wrapped Java Henshin Validator tool (`validate.mjs` and `HenshinValidator.java`).
- `scripts/`: Helper scripts for validation automation.

---

## Getting Started

1. **Setup**:
   ```bash
   cd bin
   npm install
   npm run setup
   ```

2. **Workflow**:
   - Place your metamodel in `workspace/my-domain.ecore`.
   - Place your example model in `workspace/example.xmi`.
   - Describe the transformation to the agent.
   - The agent will generate rules in `output/`.

3. **Validation**:
   The agent will automatically run the validation scripts. You can also run them manually:
   ```bash
   # Example: Validate structure
   node bin/validate.mjs --validate-structure output/my-rule.henshin
   
   # Example: Validate semantic
   node bin/validate.mjs --validate-semantic output/my-rule.henshin --metamodel workspace/my-domain.ecore
   
   # Example: Apply rule
   node bin/validate.mjs --apply output/my-rule.henshin --metamodel workspace/my-domain.ecore --model workspace/example.xmi --rule MyRule
   ```
