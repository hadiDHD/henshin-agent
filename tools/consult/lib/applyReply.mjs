import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { createResultEnvelope } from './schema.mjs';

export async function applyReply(sessionId, { consultIndex, reply }) {
  const paddedIndex = String(consultIndex).padStart(2, '0');
  const consultPath = join('sessions', sessionId, 'intent', `consult-${paddedIndex}.md`);

  if (!existsSync(consultPath)) {
    throw new Error(`Consult file not found: ${consultPath}`);
  }

  let content = readFileSync(consultPath, 'utf8');
  
  // Update status to answered
  content = content.replace(/## Status\s+(open|answered)/, '## Status\nanswered');
  
  // Fill user reply
  const replyMarkerRegex = /## User Reply/;
  const match = content.match(replyMarkerRegex);
  if (!match) {
    throw new Error(`Could not find "## User Reply" section in ${consultPath}`);
  }

  const markerEnd = match.index + match[0].length;
  const baseContent = content.substring(0, markerEnd);
  const updatedContent = `${baseContent}\n${reply}\n`;

  writeFileSync(consultPath, updatedContent);

  return createResultEnvelope('consult-answer', sessionId, [consultPath], `Consult ${paddedIndex} answered.`);
}
