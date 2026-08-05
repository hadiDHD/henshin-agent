import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { readManifest } from './manifest.mjs';

export async function validateInstance(sessionId, role, metamodelPath) {
  const manifest = readManifest(sessionId);
  if (!manifest) {
    throw new Error(`Manifest not found for session ${sessionId}`);
  }

  const example = manifest.examples.find(e => e.role === role);
  if (!example) {
    throw new Error(`Example with role ${role} not found in manifest`);
  }

  const modelPath = example.path;
  const dummyHenshin = path.join('tools', 'example-generator', 'fixtures', 'dummy.henshin');

  process.stderr.write(`Checking if model ${modelPath} loads with metamodel ${metamodelPath}...\n`);

  return new Promise((resolve, reject) => {
    const args = [
      'bin/validate.mjs',
      '--apply', dummyHenshin,
      '--metamodel', metamodelPath,
      '--model', modelPath,
      '--rule', 'DummyRule'
    ];

    const child = spawn('node', args);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
    });

    child.stderr.on('data', (data) => {
      stderr += data;
    });

    child.on('error', (err) => {
      process.stderr.write(`Failed to start validation process: ${err.message}\n`);
      resolve({ valid: false, stdout, stderr: err.message });
    });

    child.on('close', (code) => {
      if (code === 0) {
        // Even if it didn't apply (which is expected if the model is empty or whatever),
        // the fact that it exited with 0 means it loaded.
        // Actually, if it's a dummy rule with empty LHS, it should always apply if the model is not empty.
        process.stderr.write('Model loaded successfully.\n');
        resolve({ valid: true, stdout });
      } else {
        process.stderr.write('Model failed to load.\n');
        resolve({ valid: false, stdout, stderr });
      }
    });
  });
}
