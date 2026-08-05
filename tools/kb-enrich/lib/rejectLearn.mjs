import fs from 'fs';
import path from 'path';
import { createResultEnvelope } from './schema.mjs';
import { updateIndexes } from './index.mjs';

const WIKI_LEARNED_ROOT = 'wiki/learned';

export async function rejectLearn(sessionId) {
  const sessionDir = path.join('sessions', sessionId);
  const evalDir = path.join(sessionDir, 'evaluation');
  const decisionPath = path.join(evalDir, 'decision.json');
  const evalPath = path.join(evalDir, 'evaluation.json');

  if (!fs.existsSync(decisionPath)) throw new Error(`Decision not found for session ${sessionId}`);
  const decision = JSON.parse(fs.readFileSync(decisionPath, 'utf8'));
  
  if (decision.verdict !== 'reject') {
    return createResultEnvelope('kb-enrich-reject-learn', sessionId, [], 'No rejection to learn from.');
  }

  if (!decision.faultDescription) {
    return createResultEnvelope('kb-enrich-reject-learn', sessionId, [], 'No fault description provided; skipping KB enrichment.');
  }

  const evaluation = fs.existsSync(evalPath) ? JSON.parse(fs.readFileSync(evalPath, 'utf8')) : null;
  const ruleName = evaluation ? evaluation.rule.name : 'unknown';
  const domain = evaluation && evaluation.metamodel ? path.basename(evaluation.metamodel, '.ecore') : 'unknown';
  
  const date = new Date().toISOString().split('T')[0];
  const slug = decision.faultDescription.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  const learnedEntryFilename = `${date}-reject-${ruleName}-${slug}.md`;
  const learnedEntryPath = path.join(WIKI_LEARNED_ROOT, 'entries', learnedEntryFilename);

  if (!fs.existsSync(path.dirname(learnedEntryPath))) {
    fs.mkdirSync(path.dirname(learnedEntryPath), { recursive: true });
  }

  const learnedEntryContent = `# LEARNED REJECT: ${ruleName} (${domain})

## Tags
reject, ${slug}

## Fault (user)
${decision.faultDescription}

## Context
- Session: ${sessionId}
- Domain: ${domain}
- Date: ${date}

## Avoid
- ${decision.faultDescription}

## Notes
${decision.notes || 'No additional notes provided.'}
`;

  fs.writeFileSync(learnedEntryPath, learnedEntryContent);

  const indexEntry = {
    ruleName,
    domain,
    acceptedAt: date,
    sessionId,
    tags: ['reject', slug],
    learnedEntryPath
  };
  await updateIndexes(indexEntry, 'reject');

  return createResultEnvelope('kb-enrich-reject-learn', sessionId, [
    { type: 'markdown', path: learnedEntryPath }
  ], `Rejection from session ${sessionId} successfully learned and KB enriched.`);
}
