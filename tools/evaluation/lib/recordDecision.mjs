import fs from 'fs';
import path from 'path';
import { createResultEnvelope } from '../../rule-generator/lib/schema.mjs';
import { acceptSession } from '../../kb-enrich/lib/accept.mjs';
import { rejectLearn } from '../../kb-enrich/lib/rejectLearn.mjs';

export async function recordDecision(sessionId, { verdict, fault, notes }) {
  const sessionDir = path.join('sessions', sessionId);
  const sessionJsonPath = path.join(sessionDir, 'session.json');
  const evalDir = path.join(sessionDir, 'evaluation');
  const evalJsonPath = path.join(evalDir, 'evaluation.json');
  const decisionJsonPath = path.join(evalDir, 'decision.json');

  if (!fs.existsSync(sessionJsonPath)) throw new Error(`Session not found: ${sessionId}`);
  if (!fs.existsSync(evalJsonPath)) throw new Error(`Evaluation payload not found. Run build first.`);

  const session = JSON.parse(fs.readFileSync(sessionJsonPath, 'utf8'));

  const decision = {
    sessionId,
    decidedAt: new Date().toISOString(),
    verdict,
    faultDescription: fault || null,
    notes: notes || null,
    evaluationPath: evalJsonPath
  };

  fs.writeFileSync(decisionJsonPath, JSON.stringify(decision, null, 2));

  // Update session status (PC3.5, PC3.6)
  if (verdict === 'accept') {
    session.status = 'accepted';
  } else {
    session.status = 'rejected';
  }
  
  fs.writeFileSync(sessionJsonPath, JSON.stringify(session, null, 2));

  let message = verdict === 'accept' 
    ? 'Decision recorded: ACCEPTED.'
    : 'Decision recorded: REJECTED.';

  const artifacts = [{ type: 'json', path: decisionJsonPath }];

  // KB Enrichment (Phase 5)
  try {
    if (verdict === 'accept') {
      const kbResult = await acceptSession(sessionId);
      message += ' KB Enrichment successful.';
      artifacts.push(...kbResult.artifacts);
    } else if (verdict === 'reject' && fault) {
      const kbResult = await rejectLearn(sessionId);
      if (kbResult.artifacts.length > 0) {
        message += ' Anti-pattern learned.';
        artifacts.push(...kbResult.artifacts);
      }
    }
  } catch (kbError) {
    message += ` Warning: KB enrichment failed: ${kbError.message}`;
  }

  return createResultEnvelope('evaluation-decision', sessionId, artifacts, message);
}
