import fs from 'fs';
import path from 'path';
import { createResultEnvelope, createLibraryMeta } from './schema.mjs';
import { updateIndexes } from './index.mjs';

const LIBRARY_ROOT = 'library';
const WIKI_LEARNED_ROOT = 'wiki/learned';

export async function acceptSession(sessionId) {
  const sessionDir = path.join('sessions', sessionId);
  const evalDir = path.join(sessionDir, 'evaluation');
  const decisionPath = path.join(evalDir, 'decision.json');
  const evalPath = path.join(evalDir, 'evaluation.json');

  if (!fs.existsSync(decisionPath)) throw new Error(`Decision not found for session ${sessionId}`);
  const decision = JSON.parse(fs.readFileSync(decisionPath, 'utf8'));
  if (decision.verdict !== 'accept') throw new Error(`Session ${sessionId} was not accepted`);

  const evaluation = JSON.parse(fs.readFileSync(evalPath, 'utf8'));
  const ruleMeta = JSON.parse(fs.readFileSync(evaluation.rule.metaPath, 'utf8'));
  const domain = evaluation.metamodel ? path.basename(evaluation.metamodel, '.ecore') : 'unknown';
  const ruleName = evaluation.rule.name;
  
  const libraryRuleDir = path.join(LIBRARY_ROOT, domain, ruleName);
  const libraryExamplesDir = path.join(libraryRuleDir, 'examples');

  if (!fs.existsSync(libraryExamplesDir)) {
    fs.mkdirSync(libraryExamplesDir, { recursive: true });
  }

  // 1. Copy rule (.henshin)
  const henshinDest = path.join(libraryRuleDir, `${ruleName}.henshin`);
  fs.copyFileSync(evaluation.rule.path, henshinDest);

  // 2. Copy positive examples
  const positiveEx = evaluation.examplesPresented.find(e => e.role === 'positive');
  if (positiveEx) {
    fs.copyFileSync(positiveEx.before, path.join(libraryExamplesDir, 'positive-before.xmi'));
    fs.copyFileSync(positiveEx.after, path.join(libraryExamplesDir, 'positive-after.xmi'));
  }

  // 3. Create META.json
  const metamodelNsURI = extractNsURI(evaluation.metamodel);
  const libraryMeta = createLibraryMeta({
    ruleName,
    domain,
    sessionId,
    metamodelNsURI,
    metamodelPath: evaluation.metamodel,
    sourceRuleVersion: evaluation.rule.version,
    tags: decision.notes ? decision.notes.split(',').map(t => t.trim()) : [domain, ruleName]
  });
  fs.writeFileSync(path.join(libraryRuleDir, 'META.json'), JSON.stringify(libraryMeta, null, 2));

  // 4. Generate RULE.md
  const ruleMdContent = generateRuleMarkdown(evaluation, decision, libraryMeta);
  fs.writeFileSync(path.join(libraryRuleDir, 'RULE.md'), ruleMdContent);

  // 5. Write learned entry
  const date = new Date().toISOString().split('T')[0];
  const learnedEntryFilename = `${date}-${domain}-${ruleName}.md`;
  const learnedEntryPath = path.join(WIKI_LEARNED_ROOT, 'entries', learnedEntryFilename);
  
  if (!fs.existsSync(path.dirname(learnedEntryPath))) {
    fs.mkdirSync(path.dirname(learnedEntryPath), { recursive: true });
  }

  const learnedEntryContent = generateLearnedEntry(evaluation, decision, libraryMeta, libraryRuleDir);
  fs.writeFileSync(learnedEntryPath, learnedEntryContent);

  // 6. Update indexes
  const indexEntry = {
    ...libraryMeta,
    learnedEntryPath
  };
  await updateIndexes(indexEntry, 'accept');

  return createResultEnvelope('kb-enrich-accept', sessionId, [
    { type: 'directory', path: libraryRuleDir },
    { type: 'markdown', path: learnedEntryPath }
  ], `Session ${sessionId} successfully accepted and KB enriched.`);
}

function extractNsURI(ecorePath) {
  if (!ecorePath || !fs.existsSync(ecorePath)) return '';
  try {
    const content = fs.readFileSync(ecorePath, 'utf8');
    const match = content.match(/nsURI="([^"]+)"/);
    return match ? match[1] : '';
  } catch (e) {
    return '';
  }
}

function generateRuleMarkdown(evaluation, decision, meta) {
  const resolvedIntent = fs.existsSync(evaluation.intent.resolvedPath) 
    ? fs.readFileSync(evaluation.intent.resolvedPath, 'utf8') 
    : 'N/A';

  return `# RULE: ${meta.ruleName} (${meta.domain})

## Intent
${resolvedIntent}

## Summary
- **Domain**: ${meta.domain}
- **Session**: ${meta.sessionId}
- **Tags**: ${meta.tags.join(', ')}

## Pattern Details
*(Extracted from .henshin)*
${extractPatternSummary(evaluation.rule.path)}

## Examples
- [Before](./examples/positive-before.xmi)
- [After](./examples/positive-after.xmi)

## Validation
- Tier 1: ${evaluation.validation.tier1.ok ? 'PASS' : 'FAIL'}
- Tier 2: ${evaluation.validation.tier2.ok ? 'PASS' : 'FAIL'}
- Tier 3: ${evaluation.validation.tier3.find(r => r.role === 'positive')?.applied ? 'PASS' : 'FAIL'}
`;
}

function generateLearnedEntry(evaluation, decision, meta, libraryPath) {
  const resolvedIntent = fs.existsSync(evaluation.intent.resolvedPath) 
    ? fs.readFileSync(evaluation.intent.resolvedPath, 'utf8') 
    : 'N/A';

  return `# LEARNED: ${meta.ruleName} (${meta.domain})

## Tags
${meta.tags.join(', ')}

## Intent (resolved)
${resolvedIntent}

## Pattern Summary
${extractPatternSummary(evaluation.rule.path)}

## Proven Examples
- Positive before/after paths in ${libraryPath}/examples/

## Validation
- Tier1/2/3: pass on positive

## Binding Notes
- Metamodel: ${meta.metamodelPath}

## Do Not Regress
- ${decision.notes || 'No specific regression notes provided.'}
`;
}

function extractPatternSummary(henshinPath) {
  const content = fs.readFileSync(henshinPath, 'utf8');
  // Very basic extraction logic
  const params = [...content.matchAll(/<parameters.*?name="(.*?)"/g)].map(m => m[1]);
  const nodes = [...content.matchAll(/<nodes.*?name="(.*?)"/g)].map(m => m[1]);
  const edges = [...content.matchAll(/<edges.*?/g)].length;
  
  return `- Parameters: ${params.join(', ') || 'None'}
- Nodes involved: ${nodes.join(', ') || 'N/A'}
- Edges involved: ${edges}
`;
}
