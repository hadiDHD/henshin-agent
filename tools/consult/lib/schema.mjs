/**
 * Shared result envelope for all tools as defined in 00_ARCHITECTURE_CONTRACT.md
 */
export function createResultEnvelope(tool, sessionId, artifacts = [], message = "", errors = []) {
  return {
    ok: errors.length === 0,
    tool,
    sessionId,
    artifacts,
    message,
    errors
  };
}

/**
 * Utility to load session.json
 */
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

export function loadSession(sessionId) {
  const sessionPath = join('sessions', sessionId, 'session.json');
  if (!existsSync(sessionPath)) {
    throw new Error(`Session ${sessionId} not found at ${sessionPath}`);
  }
  return JSON.parse(readFileSync(sessionPath, 'utf8'));
}

export function saveSession(sessionId, session) {
  const sessionPath = join('sessions', sessionId, 'session.json');
  writeFileSync(sessionPath, JSON.stringify(session, null, 2));
}
