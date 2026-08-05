import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { updateManifest } from './manifest.mjs';

function calculateSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

export async function copySeed(sessionId, sourceModelPath) {
  const targetDir = path.join('sessions', sessionId, 'examples');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetPath = path.join(targetDir, 'user-seed.xmi');
  fs.copyFileSync(sourceModelPath, targetPath);

  const sha256 = calculateSha256(targetPath);

  // We need the metamodel path from the session.json
  const sessionPath = path.join('sessions', sessionId, 'session.json');
  if (!fs.existsSync(sessionPath)) {
    throw new Error(`Session ${sessionId} not found at ${sessionPath}`);
  }
  const session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
  const metamodelPath = session.inputs.metamodel;

  const entry = {
    role: 'seed',
    path: targetPath.replace(/\\/g, '/'),
    purpose: 'user provided',
    ruleVersion: null,
    sha256: sha256
  };

  updateManifest(sessionId, metamodelPath, entry);
  process.stderr.write(`Successfully seeded ${sourceModelPath} to ${targetPath}\n`);
  return entry;
}
