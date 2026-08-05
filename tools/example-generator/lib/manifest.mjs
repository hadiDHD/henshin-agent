import fs from 'fs';
import path from 'path';

export function getManifestPath(sessionId) {
  return path.join('sessions', sessionId, 'examples', 'manifest.json');
}

export function readManifest(sessionId) {
  const p = getManifestPath(sessionId);
  if (!fs.existsSync(p)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function writeManifest(sessionId, manifest) {
  const p = getManifestPath(sessionId);
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(p, JSON.stringify(manifest, null, 2));
}

export function updateManifest(sessionId, metamodelPath, exampleEntry) {
  let manifest = readManifest(sessionId);
  if (!manifest) {
    manifest = {
      sessionId,
      metamodel: metamodelPath,
      examples: []
    };
  }

  // Overwrite existing entry with same role
  const existingIdx = manifest.examples.findIndex(e => e.role === exampleEntry.role);
  if (existingIdx >= 0) {
    manifest.examples[existingIdx] = exampleEntry;
  } else {
    manifest.examples.push(exampleEntry);
  }

  writeManifest(sessionId, manifest);
}
