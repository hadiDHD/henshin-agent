# 02_METAMODEL_BINDING

High-density guide for binding Henshin modules to Ecore metamodels.

## 1. Imports and nsURI
A Henshin module must import the Ecore metamodel to resolve types, attributes, and references.

### XML Binding
```xml
<henshin:Module xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:henshin="http://www.eclipse.org/emf/2011/Henshin" xmi:id="_module">
  <imports href="my_metamodel.ecore#/"/>
</henshin:Module>
```

## 2. Structural Pathing
Nodes, attributes, and edges reference the Ecore schema via `href` fragment paths.

- **Class**: `path/to/metamodel.ecore#//ClassName`
- **Attribute**: `path/to/metamodel.ecore#//ClassName/attributeName`
- **Reference**: `path/to/metamodel.ecore#//ClassName/referenceName`

### Example
```xml
<nodes xmi:id="_n1" name="entity" type="model/domain.ecore#//Entity">
  <attributes value="nameVar" feature="model/domain.ecore#//Entity/name"/>
</nodes>
```

## 3. Contrastive Patterns: Ecore References

### Bad Pattern: Dynamic/Global nsURI Mismatch
Referencing by global nsURI often fails in local CLI validation environments if the metamodel is not registered in the global EMF registry.
```xml
<type href="http://www.eclipse.org/emf/2002/Ecore#//EClass"/> 
<!-- Risk: nsURI mismatch with validator or missing registry entry -->
```

### Good Pattern: Relative File Reference
Explicitly point to the local file. This ensures the validator and transformer use the exact same metamodel definition.
```xml
<type href="platform:/resource/at.ac.tuwien.big.momot.examples.refactoring/model/refactoring.ecore#//Entity"/>
<!-- OR simpler relative path -->
<type href="../model/refactoring.ecore#//Entity"/>
```

## 4. Verification Checklist
1. **File Existence**: Ensure the `.ecore` file exists at the path relative to the `.henshin` file.
2. **Fragment Accuracy**: Verify that `#//ClassName` matches the `name` attribute of the `EClass` in the Ecore file.
3. **Registry Sync**: In MOMoT, ensure the metamodel is loaded into the `HenshinResourceSet` before rule application.
