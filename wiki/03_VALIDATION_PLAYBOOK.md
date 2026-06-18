# 03_VALIDATION_PLAYBOOK

High-density guide for the Three-Tier Validation Loop and error resolution.

## 1. The Three-Tier Validation Loop
Always validate rules in this order before deployment.

| Tier | Focus | Command |
| :--- | :--- | :--- |
| **1: Structure** | XML well-formedness, Henshin XMI schema. | `node bin/validate.mjs --validate-structure <rule>.henshin` |
| **2: Semantic** | Ecore type/attribute/reference resolution. | `node bin/validate.mjs --validate-semantic <rule>.henshin --metamodel <model>.ecore` |
| **3: Application** | Pattern matching (LHS/NAC) on real data. | `node bin/validate.mjs --apply <rule>.henshin --metamodel <meta>.ecore --model <ex>.xmi --rule <Name>` |

## 2. Error Matrix: Tier 1 & 2 (Syntax & Schema)

| Error String | Root Cause | Resolution |
| :--- | :--- | :--- |
| `XML Parsing Exception` | Broken tags or invalid characters. | Check XML headers and closing tags. |
| `Attribute 'xmi:id' required` | Missing unique identifiers for elements. | Ensure all `<nodes>`, `<edges>`, `<units>` have `xmi:id`. |
| `Classifier 'X' not found` | `type` href points to non-existent EClass. | Verify case-sensitivity and `#//ClassName` fragment. |
| `Feature 'Y' not found` | Attribute/Reference name mismatch. | Verify feature name in `.ecore`. |
| `UnresolvableProxyException` | Wrong path to `.ecore` file. | Check relative path in `<imports href="...">`. |

## 3. Error Matrix: Tier 3 (Application)

| Error String | Root Cause | Resolution |
| :--- | :--- | :--- |
| `Rule returned empty match` | LHS pattern or NAC guard too restrictive. | 1. Simplify LHS. 2. Verify model contains pattern. 3. Temporarily remove NAC. |
| `Missing mapping` | LHS node deleted accidentally. | Ensure `<mappings>` exists for preserved nodes. |
| `Parameter mismatch` | `IN` parameter not provided or wrong type. | Verify parameter name and type in rule vs. call. |
| `Constraint violation` | Rule violates multiplicity or uniqueness. | Check Ecore constraints (e.g., `upperBound="1"`). |
| `The 'no null' constraint is violated` | 1. Classloader lookup clash on reserved name. <br>2. Unresolved bidirectional XMI ID references. | 1. If EClass name is `"Class"`, rename it to `"CRAClass"` in both `.ecore` and `.henshin`. <br>2. Ensure both ends of bidirectional references are defined in XMI (e.g. `Edge/target` and `Node/incoming` must list each other's ID). |

## 4. Platform-Specific Advanced Pitfalls

### 4.1 The JVM Classloader Name Clash
- **Symptom**: Creating a dynamic node in standalone JVM runtimes throws `java.lang.IllegalArgumentException: The 'no null' constraint is violated`.
- **Root Cause**: If an EClass is named exactly `"Class"` (or matches other core JVM classes), EMF's `EFactory.create(EClass)` attempts to resolve the classloader representing `java.lang.Class` rather than instantiating a dynamic `EObjectImpl`, resulting in `null`.
- **Resolution**: Rename the EClass in both `.ecore` and `.henshin` to a non-clashing name (e.g., `CRAClass` or `Clazz`).

### 4.2 Bidirectional XMI ID References Requirement
- **Symptom**: An edge target/source resolves to `null` during rule loading, causing the rule application to fail or throw null constraints, even though the referenced node and edge exist in the file.
- **Root Cause**: Henshin's loader expects bidirectional opposite references (`Edge/target` <-> `Node/incoming` and `Edge/source` <-> `Node/outgoing`) to be declared explicitly on **both** ends inside the XML file. If only the edge declares `target`, but the node does not list it in its `incoming` attribute, the reference is discarded as `null` after XMI loading.
- **Resolution**: Always specify IDs on both sides:
  - Add `outgoing="edgeId"` to the source node.
  - Add `incoming="edgeId"` to the target node.
  - If a node has multiple incoming/outgoing edges, use space-separated IDs (e.g., `incoming="edge1 edge2"`).

## 5. Debugging Runbook (NAC/PAC)
If a rule fails to apply (Tier 3) but the pattern exists:
1. **Isolate the NAC**: Move the NAC formula to a separate rule. If that rule matches, the NAC pattern *is* present in the model and correctly blocking application.
2. **Check Mappings**: Ensure `origin` in the NAC mapping points to the correct LHS node.
3. **Verify Attributes**: If the NAC uses attribute values, ensure they match exactly (case-sensitive strings, exact integers).
