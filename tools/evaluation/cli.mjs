import { buildPayload } from './lib/buildPayload.mjs';
import { recordDecision } from './lib/recordDecision.mjs';
import path from 'path';
import fs from 'fs';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const getArg = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 ? args[idx + 1] : null;
  };

  const sessionId = getArg('session');

  try {
    switch (command) {
      case 'build': {
        const ruleVersion = getArg('rule-version');
        if (!sessionId || !ruleVersion) {
          console.error('Usage: node tools/evaluation/cli.mjs build --session <id> --rule-version <n>');
          process.exit(1);
        }
        const result = await buildPayload(sessionId, parseInt(ruleVersion));
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case 'show': {
        if (!sessionId) {
          console.error('Usage: node tools/evaluation/cli.mjs show --session <id>');
          process.exit(1);
        }
        const evalDir = path.join('sessions', sessionId, 'evaluation');
        const evalJson = path.join(evalDir, 'evaluation.json');
        const evalMd = path.join(evalDir, 'EVALUATION.md');

        if (!fs.existsSync(evalJson)) {
          console.error(`Error: Evaluation payload not found at ${evalJson}. Run build first.`);
          process.exit(1);
        }

        console.log(`Evaluation JSON: ${path.resolve(evalJson)}`);
        console.log(`Evaluation MD:   ${path.resolve(evalMd)}`);
        break;
      }

      case 'decide': {
        const verdict = getArg('verdict');
        const fault = getArg('fault');
        const notes = getArg('notes');

        if (!sessionId || !verdict) {
          console.error('Usage: node tools/evaluation/cli.mjs decide --session <id> --verdict accept|reject [--fault <text>] [--notes <text>]');
          process.exit(1);
        }

        if (verdict === 'reject' && !fault) {
          console.error('Error: --fault is required when verdict is "reject" (E_FAULT_REQUIRED)');
          process.exit(1);
        }

        const result = await recordDecision(sessionId, { verdict, fault, notes });
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      default:
        console.error('Unknown command. Available commands: build, show, decide');
        process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
