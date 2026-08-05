#!/usr/bin/env node

import { existsSync } from 'fs';
import { acceptSession } from './lib/accept.mjs';
import { rejectLearn } from './lib/rejectLearn.mjs';
import { reindex } from './lib/index.mjs';

const TOOL_NAME = "kb-enrich";

function printUsage() {
  console.log(`
Usage: node tools/kb-enrich/cli.mjs <command> [options]

Commands:
  accept        Process an accepted session and enrich KB
  reject-learn  Process a rejected session and learn from fault
  reindex       Reindex library and wiki entries

Options:
  --session <id>  Session ID (required for accept and reject-learn)
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
    if (command === 'accept') {
      const sessionId = options.session;
      if (!sessionId) throw new Error("Missing --session");
      const result = await acceptSession(sessionId);
      console.log(JSON.stringify(result, null, 2));

    } else if (command === 'reject-learn') {
      const sessionId = options.session;
      if (!sessionId) throw new Error("Missing --session");
      const result = await rejectLearn(sessionId);
      console.log(JSON.stringify(result, null, 2));

    } else if (command === 'reindex') {
      await reindex();
      console.log(JSON.stringify({
        ok: true,
        tool: 'kb-enrich-reindex',
        message: 'Indexes successfully rebuilt.'
      }, null, 2));

    } else {
      throw new Error(`Unknown command: ${command}`);
    }
  } catch (err) {
    console.error(JSON.stringify({
      ok: false,
      tool: `${TOOL_NAME}-${command || 'unknown'}`,
      errors: [err.message || err]
    }, null, 2));
    process.exit(1);
  }
}

main();
