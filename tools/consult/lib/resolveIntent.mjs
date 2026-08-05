import { existsSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadSession, saveSession, createResultEnvelope } from './schema.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = join(__dirname, '..', 'templates', 'RESOLVED_INTENT.md.tpl');

export async function resolveIntent(sessionId) {
  const session = loadSession(sessionId);
  const intentDir = join('sessions', sessionId, 'intent');
  const initialPath = join(intentDir, 'initial.md');
  const resolvedPath = join(intentDir, 'resolved-intent.md');

  if (!existsSync(initialPath)) {
    throw new Error(`Initial intent not found: ${initialPath}`);
  }

  const initialIntent = readFileSync(initialPath, 'utf8');
  
  // Find all consult files
  const consultFiles = readdirSync(intentDir)
    .filter(f => f.startsWith('consult-') && f.endsWith('.md'))
    .sort();

  const clarifications = [];
  for (const file of consultFiles) {
    const content = readFileSync(join(intentDir, file), 'utf8');
    if (/## Status\s+answered/.test(content)) {
      const questionMatch = content.match(/## Question\s+([\s\S]*?)(?=\n##|$)/);
      const replyMatch = content.match(/## User Reply\s+([\s\S]*?)(?=\n##|$)/);
      
      if (questionMatch && replyMatch) {
        clarifications.push(`### From ${file}\n**Q**: ${questionMatch[1].trim()}\n**A**: ${replyMatch[1].trim()}`);
      }
    }
  }

  let template = readFileSync(TEMPLATE_PATH, 'utf8');
  const resolvedContent = template
    .replace('{{initialIntent}}', () => initialIntent)
    .replace('{{clarifications}}', () => clarifications.length > 0 ? clarifications.join('\n\n') : 'No clarifications recorded.');

  writeFileSync(resolvedPath, resolvedContent);

  // Update session status back to running
  session.status = 'running';
  saveSession(sessionId, session);

  return createResultEnvelope('consult-resolve', sessionId, [resolvedPath], `Resolved intent written to ${resolvedPath}.`);
}
