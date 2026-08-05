import { openConsult } from './lib/openConsult.mjs';
import { applyReply } from './lib/applyReply.mjs';
import { resolveIntent } from './lib/resolveIntent.mjs';

function printUsage() {
  console.log(`
Usage: node tools/consult/cli.mjs <command> [options]

Commands:
  open     Open a new consultation
  answer   Answer an open consultation
  resolve  Resolve all answered consultations into resolved-intent.md

Options for open:
  --session <id>       Session ID
  --trigger <type>     Trigger code (e.g., C_PARAM_UNKNOWN)
  --question <text>    The question for the user
  --option <text>      An option (can be repeated)
  --why <text>         Why this consultation is needed

Options for answer:
  --session <id>       Session ID
  --consult <index>    Index of the consultation (e.g., 1)
  --reply <text>       The user's reply

Options for resolve:
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

  const options = {
    option: []
  };
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = (args[i + 1] && !args[i + 1].startsWith('--')) ? args[i + 1] : true;
      if (key === 'option') {
        if (value !== true) options.option.push(value);
      } else {
        options[key] = value;
      }
      if (value !== true) i++;
    }
  }

  try {
    let result;
    switch (command) {
      case 'open':
        if (!options.session || !options.trigger || !options.question) {
          console.error('Error: --session, --trigger, and --question are required for open.');
          process.exit(1);
        }
        result = await openConsult(options.session, {
          trigger: options.trigger,
          question: options.question,
          options: options.option,
          whyMatters: options.why
        });
        break;

      case 'answer':
        if (!options.session || !options.consult || !options.reply) {
          console.error('Error: --session, --consult, and --reply are required for answer.');
          process.exit(1);
        }
        result = await applyReply(options.session, {
          consultIndex: options.consult,
          reply: options.reply
        });
        break;

      case 'resolve':
        if (!options.session) {
          console.error('Error: --session is required for resolve.');
          process.exit(1);
        }
        result = await resolveIntent(options.session);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
