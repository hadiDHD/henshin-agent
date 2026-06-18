# Guide: Setting Up a New Transformation Task

Follow these steps to start a new Henshin rule creation project within this standalone environment.

## 1. Prepare Your Workspace
Place your EMF artifacts in the `workspace/` directory:
- `my-domain.ecore`: The metamodel defining your types.
- `example-instance.xmi`: A representative model instance that the rule should transform.

## 2. Define the Goal
Provide the agent with a clear description of the transformation. For example:
> "Create a rule called 'MoveElement' that moves a 'Node' from one 'Container' to another, provided the target container has less than 5 existing nodes."

## 3. The Agent's Internal Loop
Once you provide the description, the agent will:
1. **Analyze** the `workspace/` files.
2. **Consult** the `knowledge-base/` for the "Shift Element" pattern.
3. **Draft** the rule in `output/MoveElement.henshin`.
4. **Execute** `scripts/validate-all.sh`.
5. **Fix** any errors (e.g., if the attribute name in the Ecore was `count` instead of `size`).

## 4. Reviewing the Output
Check the `output/` folder. You will find:
- The validated `.henshin` file.
- (Optional) `out_result.xmi`: The model resulting from the Tier 3 application test.

## 5. Troubleshooting
If the agent is stuck:
- Check `docs/reference/common-errors.md` for manual troubleshooting tips.
- Ensure the `nsURI` in your `.ecore` matches what the agent is using in the `.henshin` imports.
