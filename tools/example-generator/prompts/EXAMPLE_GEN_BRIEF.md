# Example Generation Brief for Henshin Agent

You are tasked with generating or refining XMI instance models tailored to a specific Henshin rule candidate. This is a critical step in Tier 3 validation.

## Roles of Examples

1.  **Positive (`positive`)**: The **smallest** valid instance where the rule **should** match and apply.
2.  **Negative (`negative`)**: An instance that specifically violates the rule's conditions (e.g., LHS requirements or NAC) so the rule **must not** apply.
3.  **Edge (`edge`)**: Boundary cases (e.g., empty collections, specific attribute values) that test the rule's robustness.

## Requirements for XMI Generation

1.  **Schema Alignment**: Every `xsi:type` and URI must resolve against the provided `.ecore` metamodel.
2.  **Minimalism**: Prefer small, readable models over large complex ones. A positive example should contain exactly what is needed for one match.
3.  **Namespaces**: Ensure correct XMI namespaces are used.
4.  **Relationships**: Ensure all required references and containment relationships are satisfied according to the Ecore.

## Workflow

1.  **Analyze**: Read the `.ecore` metamodel and the candidate `.henshin` rule (LHS/NAC).
2.  **Plan**: Describe the model structure needed to satisfy the rule.
3.  **Generate**: Write the XMI content to a temporary file.
4.  **Register**: Use `node tools/example-generator/cli.mjs write` to register the example.
5.  **Validate**: Use `node tools/example-generator/cli.mjs check` to ensure the XMI is well-formed.
6.  **Apply**: Run Tier 3 validation (`bin/validate.mjs --apply`) to verify the expected behavior.

## Example XMI Snippet (Positive for Stack domain)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<stack:Stack xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:stack="http://www.example.org/stack" name="Stack1">
  <elements name="Element1"/>
</stack:Stack>
```

## Common Pitfalls

- **Missing Namespaces**: Always include the namespace defined in the Ecore's `nsURI`.
- **Invalid Types**: Check that the `xsi:type` matches the EClass name exactly.
- **Reference Errors**: Ensure cross-references use the correct XMI format (e.g., `//@elements.0`).
