# Reference: Common Errors and Debugging

This reference covers common failures encountered during the 3-Tier validation process.

## Tier 1 (Structure) Errors
| Error | Cause | Fix |
|---|---|---|
| `Premature end of file` | Invalid XML syntax. | Check for unclosed tags or missing headers. |
| `Attribute 'xmi:id' is required` | Every node in Henshin needs a unique ID. | Ensure the agent generates XMI IDs for all elements. |

## Tier 2 (Semantic) Errors
| Error | Cause | Fix |
|---|---|---|
| `Classifier 'X' not found` | The class name in `.henshin` doesn't match `.ecore`. | Verify case-sensitivity and spelling. |
| `Feature 'Y' not found` | An attribute or reference name is incorrect. | Check the Ecore for the exact feature name. |
| `Type mismatch` | Assigning a String to an Integer attribute. | Check EAttribute types in the metamodel. |

## Tier 3 (Apply) Errors
| Error | Cause | Fix |
|---|---|---|
| `Rule not applicable` | The matching pattern (LHS) didn't find a match in the XMI. | Simplify the LHS or check if the XMI contains the required structure. |
| `NAC prevents match` | A Negative Application Condition is too broad. | Refine the NAC to only block invalid states. |
| `Missing mapping` | A node exists in LHS but its RHS counterpart isn't mapped. | Ensure `<mappings origin="..." image="..."/>` exists. |
