import { existsSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadSession, saveSession, createResultEnvelope } from './schema.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = join(__dirname, '..', 'templates', 'CONSULT_QUESTION.md.tpl');

export async function openConsult(sessionId, { trigger, question, options, whyMatters }) {
  const session = loadSession(sessionId);
  const intentDir = join('sessions', sessionId, 'intent');
  
  if (!existsSync(intentDir)) {
    mkdirSync(intentDir, { recursive: true });
  }

  // Ensure initial.md exists
  const initialPath = join(intentDir, 'initial.md');
  if (!existsSync(initialPath)) {
    if (session.inputs && session.inputs.nlDescriptionPath && existsSync(session.inputs.nlDescriptionPath)) {
      copyFileSync(session.inputs.nlDescriptionPath, initialPath);
    } else {
      // Create empty initial.md if not found
      writeFileSync(initialPath, '# Initial Intent\n\n(No description provided in inputs)');
    }
  }

  // Determine next consult index
  let index = 1;
  while (existsSync(join(intentDir, `consult-${String(index).padStart(2, '0')}.md`))) {
    index++;
  }
  const consultIndex = String(index).padStart(2, '0');
  const consultPath = join(intentDir, `consult-${consultIndex}.md`);

  // Prepare template
  let template = readFileSync(TEMPLATE_PATH, 'utf8');
  const formattedOptions = Array.isArray(options) 
    ? options.map(opt => opt.startsWith('- ') ? opt : `- ${opt}`).join('\n')
    : options;

  const content = template
    .replace('{{index}}', consultIndex)
    .replace('{{status}}', 'open')
    .replace('{{trigger}}', trigger)
    .replace('{{question}}', question)
    .replace('{{options}}', formattedOptions)
    .replace('{{whyMatters}}', whyMatters || 'Consistency with metamodel and requirements.');

  writeFileSync(consultPath, content);

  // Update session status
  session.status = 'awaiting_consult';
  saveSession(sessionId, session);

  return createResultEnvelope('consult-open', sessionId, [consultPath], `Consult ${consultIndex} opened.`);
}
