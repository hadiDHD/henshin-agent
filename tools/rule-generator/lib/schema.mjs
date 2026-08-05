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
 * Metadata schema for candidate-vN.meta.json
 */
export function createCandidateMeta(ruleName, sessionId, metamodel, notes = "", source = "llm", intentDigest = "") {
  return {
    version: 1, // Schema version
    ruleName,
    sessionId,
    metamodel,
    createdAt: new Date().toISOString(),
    source,
    notes,
    intentDigest
  };
}
