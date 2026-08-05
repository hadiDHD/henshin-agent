import fs from 'fs';
import path from 'path';
import { createResultEnvelope } from '../../rule-generator/lib/schema.mjs';
import { renderMarkdown } from './renderMarkdown.mjs';

export async function buildPayload(sessionId, ruleVersion) {
  const sessionDir = path.join('sessions', sessionId);
  const sessionJsonPath = path.join(sessionDir, 'session.json');
  const ruleMetaPath = path.join(sessionDir, 'rules', `candidate-v${ruleVersion}.meta.json`);
  const ruleHenshinPath = path.join(sessionDir, 'rules', `candidate-v${ruleVersion}.henshin`);
  const manifestPath = path.join(sessionDir, 'examples', 'manifest.json');
  const validationDir = path.join(sessionDir, 'validation');
  const evalDir = path.join(sessionDir, 'evaluation');
  const beforeAfterDir = path.join(evalDir, 'before-after');

  if (!fs.existsSync(sessionJsonPath)) throw new Error(`Session not found: ${sessionId}`);
  if (!fs.existsSync(ruleMetaPath)) throw new Error(`Rule metadata not found for version ${ruleVersion}`);

  const session = JSON.parse(fs.readFileSync(sessionJsonPath, 'utf8'));
  const ruleMeta = JSON.parse(fs.readFileSync(ruleMetaPath, 'utf8'));
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { examples: [] };

  // Validation files
  const tier1Path = path.join(validationDir, `tier1-v${ruleVersion}.json`);
  const tier2Path = path.join(validationDir, `tier2-v${ruleVersion}.json`);
  const tier3Pattern = `tier3-v${ruleVersion}-*.json`;

  const tier1 = fs.existsSync(tier1Path) ? JSON.parse(fs.readFileSync(tier1Path, 'utf8')) : { ok: false, message: 'Missing' };
  const tier2 = fs.existsSync(tier2Path) ? JSON.parse(fs.readFileSync(tier2Path, 'utf8')) : { ok: false, message: 'Missing' };

  // Tier 3 results
  const tier3Results = [];
  const positiveExample = manifest.examples.find(e => e.role === 'positive');

  // We expect tier3 results for each example in manifest
  for (const example of manifest.examples) {
    const t3Path = path.join(validationDir, `tier3-v${ruleVersion}-${example.role}.json`);
    if (fs.existsSync(t3Path)) {
      const t3Result = JSON.parse(fs.readFileSync(t3Path, 'utf8'));
      tier3Results.push({
        role: example.role,
        model: example.path,
        applied: t3Result.ok && t3Result.artifacts?.some(a => a.type === 'xmi_result'),
        resultModel: t3Result.artifacts?.find(a => a.type === 'xmi_result')?.path,
        reportPath: t3Path,
        reason: t3Result.message
      });
    }
  }

  // Validation Gate (PC3.4)
  const positiveApplied = tier3Results.find(r => r.role === 'positive' && r.applied);
  if (!positiveApplied) {
    throw new Error('E_NOT_READY: Positive Tier 3 validation failed or missing. Cannot build evaluation payload.');
  }

  // Create eval directories
  if (!fs.existsSync(beforeAfterDir)) {
    fs.mkdirSync(beforeAfterDir, { recursive: true });
  }

  // Copy after-models (PC3.2)
  const examplesPresented = [];
  for (const res of tier3Results) {
    if (res.applied && res.resultModel) {
      const destPath = path.join(beforeAfterDir, `${res.role}-after.xmi`);
      fs.copyFileSync(res.resultModel, destPath);
      
      examplesPresented.push({
        role: res.role,
        before: res.model,
        after: destPath,
        purpose: manifest.examples.find(e => e.role === res.role)?.purpose || 'Transformation example'
      });
    }
  }

  const evaluation = {
    sessionId,
    createdAt: new Date().toISOString(),
    rule: {
      name: ruleMeta.ruleName,
      version: ruleVersion,
      path: ruleHenshinPath,
      metaPath: ruleMetaPath
    },
    metamodel: session.metamodel || ruleMeta.metamodel,
    intent: {
      initialPath: path.join(sessionDir, 'intent', 'initial.md'),
      resolvedPath: path.join(sessionDir, 'intent', 'resolved-intent.md')
    },
    validation: {
      tier1: { ok: tier1.ok, path: tier1Path },
      tier2: { ok: tier2.ok, path: tier2Path },
      tier3: tier3Results
    },
    examplesPresented,
    agentSummary: `Rule '${ruleMeta.ruleName}' (v${ruleVersion}) addresses the user intent. It has been validated against positive examples.`
  };

  const evalJsonPath = path.join(evalDir, 'evaluation.json');
  fs.writeFileSync(evalJsonPath, JSON.stringify(evaluation, null, 2));

  // Render Markdown (PC3.3)
  const evalMdPath = path.join(evalDir, 'EVALUATION.md');
  const markdown = renderMarkdown(evaluation);
  fs.writeFileSync(evalMdPath, markdown);

  // Update session status
  session.status = 'awaiting_evaluation';
  fs.writeFileSync(sessionJsonPath, JSON.stringify(session, null, 2));

  return createResultEnvelope('evaluation-build', sessionId, [
    { type: 'json', path: evalJsonPath },
    { type: 'markdown', path: evalMdPath }
  ], 'Evaluation payload built successfully.');
}
