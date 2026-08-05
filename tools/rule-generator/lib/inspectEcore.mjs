import { readFileSync } from 'fs';

export function inspectEcore(ecorePath) {
  try {
    const content = readFileSync(ecorePath, 'utf8');
    
    // Extract EClasses
    const classes = [];
    const classRegex = /<eClassifiers\s+xsi:type="ecore:EClass"\s+name="([^"]+)"([^>]*)/g;
    let classMatch;
    
    while ((classMatch = classRegex.exec(content)) !== null) {
      const className = classMatch[1];
      const classBody = classMatch[2];
      
      const attributes = [];
      const references = [];
      
      // Find attributes and references inside this class or until the next EClassifier
      // This is a bit tricky with regex if they are nested. 
      // Ecore usually has <eStructuralFeatures xsi:type="ecore:EAttribute" name="..." />
      // We'll search in the vicinity of the class definition or just the whole file and try to map them.
      // Better: find the class closure.
    }

    // Alternative: parse all features and keep track of which class they belong to if possible.
    // For a "vocab" tool, even a flat list of all classes, attributes, and references is helpful.
    
    const allClasses = [...content.matchAll(/<eClassifiers\s+xsi:type="ecore:EClass"\s+name="([^"]+)"/g)].map(m => m[1]);
    const allAttributes = [...content.matchAll(/<eStructuralFeatures\s+xsi:type="ecore:EAttribute"\s+name="([^"]+)"/g)].map(m => m[1]);
    const allReferences = [...content.matchAll(/<eStructuralFeatures\s+xsi:type="ecore:EReference"\s+name="([^"]+)"/g)].map(m => m[1]);

    return {
      classes: [...new Set(allClasses)],
      attributes: [...new Set(allAttributes)],
      references: [...new Set(allReferences)]
    };
  } catch (error) {
    throw new Error(`Failed to inspect Ecore: ${error.message}`);
  }
}
