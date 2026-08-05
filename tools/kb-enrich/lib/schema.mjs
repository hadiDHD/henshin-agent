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
 * Metadata schema for library META.json
 */
export function createLibraryMeta({ ruleName, domain, sessionId, metamodelNsURI, metamodelPath, sourceRuleVersion, tags = [] }) {
  return {
    ruleName,
    domain,
    sessionId,
    acceptedAt: new Date().toISOString(),
    metamodelNsURI,
    metamodelPath,
    sourceRuleVersion,
    tags
  };
}
