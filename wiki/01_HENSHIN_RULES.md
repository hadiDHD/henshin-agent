# 01_HENSHIN_RULES

High-density reference for Henshin transformation units, parameters, and patterns.

## 1. Rule Structure
A `<units xsi:type="henshin:Rule">` defines a graph transformation via LHS/RHS patterns.

- **LHS (`<lhs>`)**: The **Match** pattern. If the pattern is not found, the rule fails.
- **RHS (`<rhs>`)**: The **Result** pattern. Defines the state after application.
- **Mappings**: Connect LHS nodes to RHS nodes.
  - **Preserve**: Node exists in both LHS and RHS + mapped.
  - **Create**: Node exists only in RHS.
  - **Delete**: Node exists only in LHS (no mapping).

### XMI Anatomy
```xml
<units xsi:type="henshin:Rule" name="exampleRule">
  <lhs name="Lhs">
    <nodes xmi:id="_l1" name="preserveMe" type="...#//ClassA"/>
    <nodes xmi:id="_l2" name="deleteMe" type="...#//ClassB"/>
  </lhs>
  <rhs name="Rhs">
    <nodes xmi:id="_r1" name="preserveMe" type="...#//ClassA"/>
    <nodes xmi:id="_r3" name="createMe" type="...#//ClassC"/>
  </rhs>
  <mappings origin="_l1" image="_r1"/>
</units>
```

## 2. Parameters
Parameters enable dynamic rules and MOMoT search integration.

| Kind | Purpose | MOMoT Behavior |
| :--- | :--- | :--- |
| **IN** | Input value required for matching/attributes. | Treated as a search variable. |
| **OUT** | Value produced by the rule execution. | Ignored by search. |
| **INOUT** | Value provided and potentially modified. | Treated as a search variable. |
| **VAR** | Internal variable for `SequentialUnit` data passing. | **Invisible** to search. |

### Contrastive Example: Data Passing
**Bad**: Using `IN` for internal sequence state (exposes internal logic to search).
**Good**: Using `VAR` to pass values between sub-units without polluting search space.
```xml
<parameters name="tempValue" kind="VAR"/>
```

## 3. Composite Units
Units for grouping rules into execution flows.

- **SequentialUnit**: Executes sub-units in strict order. Fails if any sub-unit fails.
- **LoopUnit**: Executes sub-unit repeatedly until it fails to match.
- **IteratedUnit**: Executes sub-unit N times (defined by `iterations` parameter).
- **ConditionalUnit**: `if-then-else` logic. `if` unit failure triggers `else`.
- **IndependentUnit**: Non-deterministic; executes one random applicable sub-unit.
- **PriorityUnit**: Executes the first applicable sub-unit in the list.

## 4. Application Conditions (NAC/PAC)
Conditions nested in `<lhs>` to refine matching.

- **NAC (Negative Application Condition)**: Pattern that **must NOT** exist.
- **PAC (Positive Application Condition)**: Pattern that **must** exist (but isn't modified).

### NAC XML Schema
```xml
<lhs name="Lhs">
  <nodes xmi:id="_item" type="...#//Item"/>
  <formula xsi:type="henshin:Not">
    <child xsi:type="henshin:NestedCondition">
      <conclusion name="Nac">
        <nodes xmi:id="_forbidden" type="...#//Item" outgoing="_edge"/>
        <nodes xmi:id="_target" type="...#//Item" incoming="_edge"/>
        <edges xmi:id="_edge" source="_forbidden" target="_target">
          <type href="...#//Item/link"/>
        </edges>
      </conclusion>
      <mappings origin="_item" image="_forbidden"/>
    </child>
  </formula>
</lhs>
```

## 5. Common Patterns

### 5.1 Create Node with Attribute
```xml
<rhs name="Rhs">
  <nodes name="newItem" type="...#//Item">
    <attributes value="itemName" feature="...#//Item/name"/>
  </nodes>
</rhs>
```

### 5.2 Delete Node (Safe with NAC)
Prevents deletion if the node has children.
```xml
<formula xsi:type="henshin:Not">
  <child xsi:type="henshin:NestedCondition">
    <conclusion>
      <nodes xmi:id="_p" outgoing="_e"><type href="...#//Item"/></nodes>
      <nodes xmi:id="_c" incoming="_e"><type href="...#//Item"/></nodes>
      <edges xmi:id="_e" source="_p" target="_c"><type href="...#//Item/children"/></edges>
    </conclusion>
    <mappings origin="_lhs_node" image="_p"/>
  </child>
</formula>
```

### 5.3 Move / Reparent Node
Delete old edge in LHS, create new edge in RHS. Preserve all nodes.
```xml
<!-- LHS -->
<nodes xmi:id="_s" outgoing="_e1"/><nodes xmi:id="_i" incoming="_e1"/><nodes xmi:id="_t"/>
<edges xmi:id="_e1" source="_s" target="_i"/>
<!-- RHS -->
<nodes xmi:id="_rs"/><nodes xmi:id="_ri" incoming="_e2"/><nodes xmi:id="_rt" outgoing="_e2"/>
<edges xmi:id="_e2" source="_rt" target="_ri"/>
```

### 5.4 Counter Increment
```xml
<attributes value="val + 1" feature="...#//Counter/value"/>
```
