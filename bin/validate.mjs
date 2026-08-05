import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB_DIR = join(__dirname, 'lib');
const SRC_DIR = join(__dirname, 'src');

const JARS = [
  {
    name: 'org.eclipse.emf.henshin.model_1.8.0.202302121604.jar',
    url: 'https://download.eclipse.org/modeling/emft/henshin/updates/release/plugins/org.eclipse.emf.henshin.model_1.8.0.202302121604.jar'
  },
  {
    name: 'org.eclipse.emf.henshin.interpreter_1.8.0.202302121604.jar',
    url: 'https://download.eclipse.org/modeling/emft/henshin/updates/release/plugins/org.eclipse.emf.henshin.interpreter_1.8.0.202302121604.jar'
  },
  {
    name: 'org.eclipse.emf.common_2.30.0.jar',
    url: 'https://repo1.maven.org/maven2/org/eclipse/emf/org.eclipse.emf.common/2.30.0/org.eclipse.emf.common-2.30.0.jar'
  },
  {
    name: 'org.eclipse.emf.ecore_2.36.0.jar',
    url: 'https://repo1.maven.org/maven2/org/eclipse/emf/org.eclipse.emf.ecore/2.36.0/org.eclipse.emf.ecore-2.36.0.jar'
  },
  {
    name: 'org.eclipse.emf.ecore.xmi_2.37.0.jar',
    url: 'https://repo1.maven.org/maven2/org/eclipse/emf/org.eclipse.emf.ecore.xmi/2.37.0/org.eclipse.emf.ecore.xmi-2.37.0.jar'
  },
  {
    name: 'nashorn-core-15.4.jar',
    url: 'https://repo1.maven.org/maven2/org/openjdk/nashorn/nashorn-core/15.4/nashorn-core-15.4.jar'
  },
  {
    name: 'asm-9.5.jar',
    url: 'https://repo1.maven.org/maven2/org/ow2/asm/asm/9.5/asm-9.5.jar'
  },
  {
    name: 'asm-commons-9.5.jar',
    url: 'https://repo1.maven.org/maven2/org/ow2/asm/asm-commons/9.5/asm-commons-9.5.jar'
  },
  {
    name: 'asm-tree-9.5.jar',
    url: 'https://repo1.maven.org/maven2/org/ow2/asm/asm-tree/9.5/asm-tree-9.5.jar'
  },
  {
    name: 'asm-util-9.5.jar',
    url: 'https://repo1.maven.org/maven2/org/ow2/asm/asm-util/9.5/asm-util-9.5.jar'
  }
];

async function setup() {
  if (!existsSync(LIB_DIR)) mkdirSync(LIB_DIR);

  for (const jar of JARS) {
    const jarPath = join(LIB_DIR, jar.name);
    if (!existsSync(jarPath)) {
      console.error(`Downloading ${jar.name}...`);
      const response = await fetch(jar.url);
      if (!response.ok) throw new Error(`Failed to download ${jar.name}: ${response.statusText}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      writeFileSync(jarPath, buffer);
    }
  }

  // Compile Java validator
  console.error('Compiling HenshinValidator.java...');
  const classpath = join(LIB_DIR, '*');
  const javac = spawn('javac', ['-cp', classpath, '-d', LIB_DIR, join(SRC_DIR, 'HenshinValidator.java')]);

  return new Promise((resolve, reject) => {
    javac.on('close', (code) => {
      if (code === 0) {
        console.error('Compilation successful.');
        resolve();
      } else {
        reject(new Error(`javac failed with code ${code}`));
      }
    });
  });
}

async function run(args) {
  const sep = process.platform === 'win32' ? ';' : ':';
  const classpath = join(LIB_DIR, '*') + sep + LIB_DIR;
  const java = spawn('java', ['-cp', classpath, 'HenshinValidator', ...args]);

  let stdout = '';
  let stderr = '';

  java.stdout.on('data', (data) => {
    const str = data.toString();
    stdout += str;
    process.stderr.write(str);
  });

  java.stderr.on('data', (data) => {
    const str = data.toString();
    stderr += str;
    process.stderr.write(str);
  });

  java.on('close', (code) => {
    if (code === 0) {
      // Robust JSON parsing: find valid JSON objects in stdout
      const artifacts = [];
      const results = {};
      
      let startIdx = 0;
      while ((startIdx = stdout.indexOf('{', startIdx)) !== -1) {
        let endIdx = stdout.lastIndexOf('}');
        let found = false;
        
        while (endIdx > startIdx) {
          const candidate = stdout.substring(startIdx, endIdx + 1);
          try {
            const obj = JSON.parse(candidate);
            Object.assign(results, obj);
            if (obj.result) {
              artifacts.push({ type: 'xmi_result', path: obj.result });
            }
            startIdx = endIdx + 1;
            found = true;
            break;
          } catch (e) {
            endIdx = stdout.lastIndexOf('}', endIdx - 1);
          }
        }
        if (!found) startIdx++;
      }

      // Tier 3 failure (applied: false) should return ok: false
      const ok = results.applied !== false;
      
      const envelope = {
        ok,
        tool: 'validator',
        artifacts,
        results,
        message: results.applied === false ? 'Rule not applied' : 'Validation successful'
      };
      console.log(JSON.stringify(envelope, null, 2));
    } else {
      const envelope = {
        ok: false,
        tool: 'validator',
        message: 'Validation failed',
        errors: [{ code: 'E_VALIDATOR', detail: stderr.trim() || 'Check stderr for details' }]
      };
      console.log(JSON.stringify(envelope, null, 2));
      process.exit(code);
    }
  });
}

const args = process.argv.slice(2);
if (args.includes('--setup')) {
  await setup();
} else {
  if (!existsSync(join(LIB_DIR, 'HenshinValidator.class'))) {
    await setup();
  }
  await run(args);
}
