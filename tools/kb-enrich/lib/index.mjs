import fs from 'fs';
import path from 'path';

const LIBRARY_ROOT = 'library';
const WIKI_LEARNED_ROOT = 'wiki/learned';

export async function updateIndexes(entry, type) {
  if (type === 'accept') {
    await updateLibraryIndex(entry);
    await updateLearnedIndex(entry, 'accept');
  } else if (type === 'reject') {
    await updateLearnedIndex(entry, 'reject');
  }
}

async function updateLibraryIndex(entry) {
  const indexPath = path.join(LIBRARY_ROOT, 'README.md');
  let content = '';
  if (fs.existsSync(indexPath)) {
    content = fs.readFileSync(indexPath, 'utf8');
  } else {
    content = '# Reusable Rule Library\n\n| Domain | Rule | Accepted At | Session | Tags |\n| :--- | :--- | :--- | :--- | :--- |\n';
  }

  const row = `| ${entry.domain} | [${entry.ruleName}](./${entry.domain}/${entry.ruleName}/RULE.md) | ${entry.acceptedAt.split('T')[0]} | ${entry.sessionId} | ${entry.tags.join(', ')} |\n`;
  
  // Check if already exists, if so replace, else append
  const lines = content.split('\n');
  const existingIndex = lines.findIndex(l => l.includes(`| ${entry.domain} | [${entry.ruleName}]`));
  
  if (existingIndex !== -1) {
    lines[existingIndex] = row;
    content = lines.join('\n');
  } else {
    content += row;
  }

  fs.writeFileSync(indexPath, content);
}

async function updateLearnedIndex(entry, type) {
  const indexPath = path.join(WIKI_LEARNED_ROOT, '00_LEARNED_INDEX.md');
  let content = '';
  if (fs.existsSync(indexPath)) {
    content = fs.readFileSync(indexPath, 'utf8');
  } else {
    content = '# Learned Knowledge Index\n\n| Date | Type | Domain | Rule | Path | Tags |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n';
  }

  const date = (entry.acceptedAt || new Date().toISOString()).split('T')[0];
  const ruleName = entry.ruleName;
  const domain = entry.domain || '-';
  const tags = (entry.tags || []).join(', ') || '-';
  const entryPath = entry.learnedEntryPath ? `./${path.relative(WIKI_LEARNED_ROOT, entry.learnedEntryPath)}`.replace(/\\/g, '/') : '-';

  const row = `| ${date} | ${type} | ${domain} | ${ruleName} | [View](${entryPath}) | ${tags} |\n`;
  
  // Check if already exists (same date, type, domain, rule)
  const lines = content.split('\n');
  const existingIndex = lines.findIndex(l => l.includes(`| ${date} | ${type} | ${domain} | ${ruleName} |`));

  if (existingIndex !== -1) {
    lines[existingIndex] = row;
    content = lines.join('\n');
  } else {
    content += row;
  }

  fs.writeFileSync(indexPath, content);
}

export async function reindex() {
  // Re-initialize Library Index
  const libraryEntries = [];
  const domains = fs.readdirSync(LIBRARY_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const domain of domains) {
    const rules = fs.readdirSync(path.join(LIBRARY_ROOT, domain), { withFileTypes: true })
      .filter(r => r.isDirectory())
      .map(r => r.name);
    
    for (const rule of rules) {
      const metaPath = path.join(LIBRARY_ROOT, domain, rule, 'META.json');
      if (fs.existsSync(metaPath)) {
        libraryEntries.push(JSON.parse(fs.readFileSync(metaPath, 'utf8')));
      }
    }
  }

  let libContent = '# Reusable Rule Library\n\n| Domain | Rule | Accepted At | Session | Tags |\n| :--- | :--- | :--- | :--- | :--- |\n';
  libraryEntries.sort((a, b) => b.acceptedAt.localeCompare(a.acceptedAt)).forEach(entry => {
    libContent += `| ${entry.domain} | [${entry.ruleName}](./${entry.domain}/${entry.ruleName}/RULE.md) | ${entry.acceptedAt.split('T')[0]} | ${entry.sessionId} | ${entry.tags.join(', ')} |\n`;
  });
  fs.writeFileSync(path.join(LIBRARY_ROOT, 'README.md'), libContent);

  // Re-initialize Learned Index
  const learnedEntries = [];
  const entriesDir = path.join(WIKI_LEARNED_ROOT, 'entries');
  if (fs.existsSync(entriesDir)) {
    const files = fs.readdirSync(entriesDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(entriesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Simple parsing of markdown to get some metadata
      const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? dateMatch[1] : '-';
      const type = file.includes('-reject-') ? 'reject' : 'accept';
      
      const titleMatch = content.match(/^# LEARNED(?: REJECT)?: (.*?) \((.*?)\)/m) || content.match(/^# LEARNED(?: REJECT)?: (.*)/m);
      const ruleName = titleMatch ? titleMatch[1].trim() : file;
      const domain = titleMatch && titleMatch[2] ? titleMatch[2].trim() : (type === 'reject' ? '-' : 'unknown');

      const tagsMatch = content.match(/## Tags\n(.*?)\n/s);
      const tags = tagsMatch ? tagsMatch[1].trim() : '-';

      learnedEntries.push({ date, type, domain, ruleName, path: filePath, tags });
    }
  }

  let learnedContent = '# Learned Knowledge Index\n\n| Date | Type | Domain | Rule | Path | Tags |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n';
  learnedEntries.sort((a, b) => b.date.localeCompare(a.date)).forEach(e => {
    const entryPath = `./${path.relative(WIKI_LEARNED_ROOT, e.path)}`.replace(/\\/g, '/');
    learnedContent += `| ${e.date} | ${e.type} | ${e.domain} | ${e.ruleName} | [View](${entryPath}) | ${e.tags} |\n`;
  });
  fs.writeFileSync(path.join(WIKI_LEARNED_ROOT, '00_LEARNED_INDEX.md'), learnedContent);
}
