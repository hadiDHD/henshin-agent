import { copySeed } from './lib/copySeed.mjs';
import { writeExample } from './lib/writeExample.mjs';
import { validateInstance } from './lib/validateInstance.mjs';
import { readManifest } from './lib/manifest.mjs';

const TOOL_NAME = "example-generator";

function createResultEnvelope(tool, sessionId, artifacts = [], message = "", errors = []) {
  return {
    ok: errors.length === 0,
    tool,
    sessionId,
    artifacts,
    message,
    errors
  };
}

function printUsage() {
  console.log(`
Usage: node tools/example-generator/cli.mjs <command> [options]

Commands:
  seed      Copy user seed model into session
  write     Register a generated example
  check     Validate instance loads against metamodel
  manifest  Print the session manifest

Options for seed:
  --session <id>       Session ID
  --model <path>       Path to user seed .xmi

Options for write:
  --session <id>       Session ID
  --role <role>        Role: positive|edge|negative
  --file <path>        Path to generated .xmi
  --rule-version <n>   Version of the rule this example targets
  --purpose <text>     Brief description of the example
  --expected <value>   Optional Tier 3 expectation (applied|not_applicable)

Options for check:
  --session <id>       Session ID
  --role <role>        Role to check
  --metamodel <path>   Path to .ecore

Options for manifest:
  --session <id>       Session ID
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    printUsage();
    process.exit(1);
  }

  const options = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      options[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }

  try {
    if (command === 'seed') {
      const { session, model } = options;
      if (!session || !model) throw new Error("Missing --session or --model");
      
      const entry = await copySeed(session, model);
      console.log(JSON.stringify(createResultEnvelope(
        TOOL_NAME,
        session,
        [entry.path],
        `Seed model registered for session ${session}`
      ), null, 2));

    } else if (command === 'write') {
      const { session, role, file, 'rule-version': ruleVersion, purpose, expected } = options;
      if (!session || !role || !file || !ruleVersion || !purpose) {
        throw new Error("Missing required options for write. Required: --session, --role, --file, --rule-version, --purpose");
      }

      const entry = await writeExample(session, role, file, ruleVersion, purpose, expected);
      console.log(JSON.stringify(createResultEnvelope(
        TOOL_NAME,
        session,
        [entry.path],
        `Example ${role} (v${ruleVersion}) registered for session ${session}`
      ), null, 2));

    } else if (command === 'check') {
      const { session, role, metamodel } = options;
      if (!session || !role || !metamodel) {
        throw new Error("Missing required options for check. Required: --session, --role, --metamodel");
      }

      const result = await validateInstance(session, role, metamodel);
      if (result.valid) {
        console.log(JSON.stringify(createResultEnvelope(
          TOOL_NAME,
          session,
          [],
          `Instance ${role} validated successfully`
        ), null, 2));
      } else {
        throw new Error(`Instance validation failed: ${result.stderr || result.stdout}`);
      }

    } else if (command === 'manifest') {
      const { session } = options;
      if (!session) throw new Error("Missing --session");

      const manifest = readManifest(session);
      if (!manifest) throw new Error(`Manifest not found for session ${session}`);

      const envelope = createResultEnvelope(
        TOOL_NAME,
        session,
        [],
        `Manifest for session ${session}`
      );
      envelope.data = manifest;
      console.log(JSON.stringify(envelope, null, 2));

    } else {
      throw new Error(`Unknown command: ${command}`);
    }
  } catch (err) {
    console.error(JSON.stringify(createResultEnvelope(
      TOOL_NAME,
      options.session || "unknown",
      [],
      "",
      [{ code: "E_GENERIC", detail: err.message }]
    ), null, 2));
    process.exit(1);
  }
}

main();
