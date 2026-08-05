import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { createResultEnvelope } from './lib/schema.mjs';
import { writeCandidate } from './lib/writeCandidate.mjs';
import { inspectEcore } from './lib/inspectEcore.mjs';

const TOOL_NAME = "rule-generator";

function printUsage() {
  console.log(`
Usage: node tools/rule-generator/cli.mjs <command> [options]

Commands:
  init   Initialize a session
  write  Register a new candidate rule
  vocab  Inspect metamodel vocabulary

Options for init:
  --session <id>       Session ID
  --metamodel <path>   Path to .ecore
  --seed-model <path>  Path to seed .xmi
  --intent <path>      Path to intent .md

Options for write:
  --session <id>       Session ID
  --rule-name <name>   Name of the rule
  --file <path>        Path to .henshin file (or use stdin)

Options for vocab:
  --metamodel <path>   Path to .ecore
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
    if (command === 'init') {
      const sessionId = options.session;
      if (!sessionId) {
        throw { code: "E_SESSION_MISSING", message: "Missing --session" };
      }

      const sessionDir = join('sessions', sessionId);
      if (!existsSync(sessionDir)) {
        mkdirSync(sessionDir, { recursive: true });
      }

      const dirs = ['rules', 'examples', 'intent', 'validation', 'evaluation', 'logs'];
      for (const d of dirs) {
        const dPath = join(sessionDir, d);
        if (!existsSync(dPath)) mkdirSync(dPath);
      }

      const sessionData = {
        sessionId,
        status: "running",
        createdAt: new Date().toISOString(),
        inputs: {
          metamodel: options.metamodel || "",
          seedModel: options['seed-model'] || "",
          nlDescriptionPath: options.intent || ""
        }
      };

      if (sessionData.inputs.seedModel && !existsSync(sessionData.inputs.seedModel)) {
        throw { code: "E_INVALID_XMI", message: `Seed model ${sessionData.inputs.seedModel} not found` };
      }

      writeFileSync(join(sessionDir, 'session.json'), JSON.stringify(sessionData, null, 2));

      console.log(JSON.stringify(createResultEnvelope(
        TOOL_NAME,
        sessionId,
        [join(sessionDir, 'session.json')],
        `Session ${sessionId} initialized`
      ), null, 2));

    } else if (command === 'write') {
      const sessionId = options.session;
      const ruleName = options['rule-name'];
      if (!sessionId) {
        throw { code: "E_SESSION_MISSING", message: "Missing --session" };
      }
      if (!ruleName) {
        throw { code: "E_RULE_NAME_MISSING", message: "Missing --rule-name" };
      }

      const sessionDir = join('sessions', sessionId);
      if (!existsSync(sessionDir)) {
        throw { code: "E_SESSION_MISSING", message: `Session ${sessionId} not found` };
      }

      let henshinContent = "";
      if (options.file) {
        if (!existsSync(options.file)) {
          throw { code: "E_INVALID_XMI", message: `Input file ${options.file} not found` };
        }
        henshinContent = readFileSync(options.file, 'utf8');
      } else {
        // Read from stdin if no file provided
        henshinContent = await new Promise((resolve) => {
          let data = "";
          process.stdin.on('data', chunk => data += chunk);
          process.stdin.on('end', () => resolve(data));
        });
      }

      if (!henshinContent) {
        throw { code: "E_INVALID_XMI", message: "No rule content provided" };
      }

      const result = writeCandidate(sessionDir, ruleName, henshinContent, {
        intentPath: options.intent, // Optional override
        metamodel: options.metamodel, // Optional override
      });

      console.log(JSON.stringify(createResultEnvelope(
        TOOL_NAME,
        sessionId,
        [result.henshinPath, result.metaPath],
        `Candidate ${ruleName} (v${result.version}) registered`
      ), null, 2));

    } else if (command === 'vocab') {
      const metamodel = options.metamodel;
      if (!metamodel) throw new Error("Missing --metamodel");

      const vocab = inspectEcore(metamodel);
      const envelope = createResultEnvelope(
        TOOL_NAME,
        "none",
        [],
        `Extracted vocabulary from ${metamodel}`,
        []
      );
      envelope.data = vocab; // Add vocab data to envelope
      console.log(JSON.stringify(envelope, null, 2));

    } else {
      throw new Error(`Unknown command: ${command}`);
    }
  } catch (err) {
    const errorCode = err.code || "E_GENERIC";
    console.error(JSON.stringify(createResultEnvelope(
      TOOL_NAME,
      options.session || "unknown",
      [],
      "",
      [{ code: errorCode, detail: err.message || err }]
    ), null, 2));
    process.exit(1);
  }
}

main();
