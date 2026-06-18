# Henshin Knowledge Base (KB)

This directory contains the authoritative reference for Henshin rule patterns and best practices.

## Contents

### Core Concepts
- [Anatomy of a Rule](01-rule-anatomy.md)
- [Parameters](02-parameters.md)
- [Nested Conditions (NAC/PAC)](04-conditions-nac-pac.md)
- [Metamodel Binding](05-metamodel-binding.md)

### Design Patterns
- [Common Patterns](07-common-patterns.md): Includes Create, Delete, Shift, and Reparent.

### Quality & Debugging
- [Testing Strategy](08-testing-strategy.md)
- [Debugging Runbook](09-debugging-runbook.md): The primary guide for fixing failed rules.

## Using the KB as an Agent
Always consult the `07-common-patterns.md` before drafting a new rule to see if a template already exists for the user's requested transformation. If validation fails, immediately refer to `09-debugging-runbook.md`.
