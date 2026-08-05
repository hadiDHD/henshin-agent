import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { updateManifest, readManifest } from './manifest.mjs';

function calculateSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

export async function writeExample(sessionId, role, sourceFile, ruleVersion, purpose, expected = null) {
  const validRoles = ['positive', 'edge', 'negative'];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role: ${role}. Must be one of ${validRoles.join(', ')}`);
  }

  const targetDir = path.join('sessions', sessionId, 'examples');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFilename = `generated-${role}.xmi`;
  const targetPath = path.join(targetDir, targetFilename);

  const version = parseInt(ruleVersion, 10);
  if (isNaN(version)) {
    throw new Error(`Invalid rule-version: "${ruleVersion}". Must be a valid integer.`);
  }

  fs.copyFileSync(sourceFile, targetPath);
  const sha256 = calculateSha256(targetPath);

  const manifest = readManifest(sessionId);
  if (!manifest) {
    throw new Error(`Manifest not found for session ${sessionId}. Run seed first.`);
  }

  // Default behavior for roles, overridden by explicit 'expected' if provided
  let tier3Expected = expected;
  if (!tier3Expected) {
    if (role === 'negative') {
      tier3Expected = 'not_applicable';
    } else if (role === 'positive') {
      tier3Expected = 'applied';
    } else {
      // For 'edge', don't hardcode it to 'applied'. Let it be null/unknown if not specified.
      tier3Expected = null;
    }
  }

  const entry = {
    role,
    path: targetPath.replace(/\\/g, '/'),
    purpose,
    ruleVersion: version,
    sha256,
    tier3Expected
  };

  updateManifest(sessionId, manifest.metamodel, entry);
  process.stderr.write(`Successfully registered ${role} example at ${targetPath}\n`);
  return entry;
}
