# Henshin Rule Creation Agent (Standalone)

This project is a standalone, agentic environment for creating and validating EMF model transformation rules using the Henshin language. It follows an iterative, human-in-the-loop methodology.

## Methodology

The workflow consists of:
1. **Input**: User provides an Ecore metamodel, an example XMI model, and a description of the desired change.
2. **Analysis**: The agent analyzes the metamodel and example model.
3. **Generation**: The agent proposes a Henshin rule candidate, consulting the Knowledge Base.
4. **Tiered Validation**:
    - **Tier 1 (Structural)**: Is the `.henshin` file valid XMI?
    - **Tier 2 (Semantic)**: Do the types in the rule match the Ecore metamodel?
    - **Tier 3 (Application)**: Does the rule successfully apply to the example model?
5. **Human Review**: The user inspects the validated candidate and accepts, rejects, or requests refinements.

## Directory Structure

- `knowledge-base/`: Henshin patterns, common mistakes, and debugging playbook.
- `docs/`: Detailed methodology, user guides, and troubleshooting references.
- `workspace/`: Put your `.ecore` and `.xmi` files here.
- `output/`: Generated `.henshin` rules.
- `bin/`: The Henshin validator tool (Node.js).
- `scripts/`: Helper scripts for the validation loop.

## Getting Started

1. **Setup**:
   ```bash
   cd bin
   npm install
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
   ```
