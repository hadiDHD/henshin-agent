import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { createCandidateMeta } from './schema.mjs';
import crypto from 'crypto';

export function writeCandidate(sessionDir, ruleName, henshinContent, options = {}) {
  const rulesDir = join(sessionDir, 'rules');
  if (!existsSync(rulesDir)) {
    mkdirSync(rulesDir, { recursive: true });
  }

  // Determine next version
  const files = readdirSync(rulesDir);
  const vRegex = /^candidate-v(\d+)\.henshin$/;
  let maxV = 0;
  for (const f of files) {
    const match = f.match(vRegex);
    if (match) {
      const v = parseInt(match[1]);
      if (v > maxV) maxV = v;
    }
  }
  const nextV = maxV + 1;
  const henshinFilename = `candidate-v${nextV}.henshin`;
  const metaFilename = `candidate-v${nextV}.meta.json`;
  const henshinPath = join(rulesDir, henshinFilename);
  const metaPath = join(rulesDir, metaFilename);

  // Write files
  writeFileSync(henshinPath, henshinContent);

  // Calculate intent digest if provided
  let intentDigest = "";
  if (options.intentPath && existsSync(options.intentPath)) {
    const intentContent = readFileSync(options.intentPath, 'utf8');
    intentDigest = crypto.createHash('sha256').update(intentContent).digest('hex');
  }

  // Read metamodel from session.json if available
  let metamodel = options.metamodel || "";
  if (!metamodel && existsSync(join(sessionDir, 'session.json'))) {
    const session = JSON.parse(readFileSync(join(sessionDir, 'session.json'), 'utf8'));
    metamodel = session.inputs?.metamodel || "";
  }

  const meta = createCandidateMeta(
    ruleName,
    basename(sessionDir),
    metamodel,
    options.notes || "",
    options.source || "llm",
    intentDigest
  );
  meta.candidateVersion = nextV; // Explicitly track version in meta

  writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  return {
    henshinPath,
    metaPath,
    version: nextV
  };
}
