# 04_CASE_STUDIES

Unified knowledge base for MOMoT2 case studies.

## 1. Case Study Overview
The following domains are integrated as standard test cases.

| Domain | Description | Metamodel |
| :--- | :--- | :--- |
| **Stack** | Simple stack operations (push, pop, shift). | `stack.ecore` |
| **Class Modularization** | Grouping classes into modules based on dependency. | `modularization.ecore` |
| **Class Diagram** | Structural refactoring of class hierarchies. | `classdiagram.ecore` |
| **EMF Refactor** | Generic EMF-based model refactorings. | `refactoring.ecore` |
| **CRA** | Class Responsibility Assignment (coupling/cohesion). | `architecture.ecore` |
| **Generic Modularization**| Multi-domain modularization patterns. | `generic.ecore` |

## 2. Domain Specifications

### 2.1 Stack (Basic Pattern Matching)
- **Goal**: Illustrate simple containment and sequence logic.
- **Key Types**: `Stack`, `Element`.
- **Primary Rules**: `shiftLeft`, `shiftRight`, `createStack`, `connectStacks`.
- **Verification**:
  ```bash
  node bin/validate.mjs --apply workspace/stack/stack.henshin --metamodel workspace/stack/stack.ecore --model workspace/stack/model_five_stacks.xmi --rule shiftLeft -Pamount=1
  ```

### 2.2 Class Modularization
- **Goal**: Group classes into modules based on dependencies to optimize coupling/cohesion.
- **Key Types**: `Module`, `Class`.
- **Primary Rules**: `createModule`, `assignClass`, `reassignClass`.
- **Verification**:
  ```bash
  node bin/validate.mjs --validate-semantic workspace/class_modularization/modularization_jsep.henshin --metamodel workspace/class_modularization/modularization_jsep.ecore
  ```

### 2.3 Class Diagram Restructuring
- **Goal**: Refactor class hierarchies (e.g., Pull Up Attribute, Extract Superclass).
- **Key Types**: `Class`, `Attribute`, `Generalization`.
- **Primary Rules**: `createRootClass`, `extractSuperClass`, `pullUpAttribute`.
- **Verification**:
  ```bash
  node bin/validate.mjs --validate-semantic workspace/class_restructuring/Refactoring.henshin --metamodel workspace/class_restructuring/refactoring.ecore
  ```

### 2.4 EMF Refactor (Ecore Self-Refactoring)
- **Goal**: Clean up Ecore metamodels (e.g., remove empty sub-classes).
- **Key Types**: `EClass`, `EPackage`.
- **Primary Rules**: `remove_empty_sub_eclass`.
- **Verification**:
  ```bash
  node bin/validate.mjs --validate-semantic workspace/emfrefactor/remove_empty_sub_eclass_all.henshin --metamodel workspace/emfrefactor/metamodel.ecore
  ```

### 2.5 Class Responsibility Assignment (CRA)
- **Goal**: Assign features to classes to maximize cohesion and minimize coupling.
- **Key Types**: `ClassModel`, `CRAClass` (renamed from `Class` to avoid JVM clashes), `Feature`.
- **Primary Rules**: `reassignFeature`, `createClassWithFeature`, `assignFeature`, `deleteEmptyClass`.
- **Verification**:
  ```bash
  node bin/validate.mjs --validate-semantic workspace/cra/architecture.henshin --metamodel workspace/cra/architecture.ecore
  ```

### 2.6 Generic Modularization
- **Goal**: Domain-agnostic modularization pattern.
- **Key Types**: `Module`, `Entity`.
- **Primary Rules**: `moveEntity`.
- **Verification**:
  ```bash
  node bin/validate.mjs --apply workspace/generic_modularization/modularization_rules.henshin --metamodel workspace/generic_modularization/Generic_Modularization_MM.ecore --model workspace/generic_modularization/HTML_module.xmi --rule moveEntity
  ```

