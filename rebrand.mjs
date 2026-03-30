import { promises as fs } from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', '.pg', 'data', '.svelte-kit', 'build', '.paperclip', '.pglite', '.claude'
]);

const isTextFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const textExts = ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.md', '.txt', '.env', '.example', '.html', '.css', '.scss', '.yaml', '.yml', '.sh', '.bash', '.patch', '.jsonc'];
  if (!ext || textExts.includes(ext)) return true;
  return false;
};

async function walk(dir) {
  let results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    results.push({ path: fullPath, isDir: entry.isDirectory(), name: entry.name });
    if (entry.isDirectory()) {
      results = results.concat(await walk(fullPath));
    }
  }
  return results;
}

async function renameContents() {
  const entries = await walk(ROOT_DIR);
  
  // 1. Rename Contents
  for (const entry of entries) {
    if (!entry.isDir && isTextFile(entry.name)) {
      if (entry.path === process.argv[1]) continue;
      try {
        let content = await fs.readFile(entry.path, 'utf8');
        const original = content;

        // Save external modules from renaming
        content = content.replace(/hermes-paperclip-adapter/g, 'HERMES_PAPERCLIP_ADAPTER_TEMP');

        // Specific phrases
        content = content.replace(/paperclip-cli/g, 'siriusly-cli');
        content = content.replace(/npx paperclip/g, 'npx siriusly');
        content = content.replace(/paperclip agent start/g, 'siriusly agent start');
        content = content.replace(/paperclip login/g, 'siriusly login');
        content = content.replace(/paperclipai/g, 'sirius-eco-system');
        
        // Casing
        content = content.replace(/PaperclipAI/g, 'SiriusEcoSystem');
        content = content.replace(/Paperclip/g, 'SiriusEcoSystem');
        content = content.replace(/PAPERCLIP_/g, 'SIRIUSLY_');
        content = content.replace(/PAPERCLIP/g, 'SIRIUSLY');

        // CamelCase handling
        content = content.replace(/paperclip(?=[A-Z])/g, 'siriusEcoSystem');
        content = content.replace(/(?<=[a-z])paperclip/g, 'SiriusEcoSystem');

        const isCode = entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.jsx');
        
        if (isCode) {
            // Handle kebab-case strings in code
            content = content.replace(/paperclip(?=-)/g, 'sirius-eco-system');
            content = content.replace(/(?<=-)paperclip/g, 'sirius-eco-system');
            
            // Remaining are standalone identifiers or inside normal strings
            content = content.replace(/paperclip/g, 'siriusEcoSystem');
        } else {
            // Non-code files (package.json, docs, etc) default to kebab case
            content = content.replace(/paperclip/g, 'sirius-eco-system');
        }

        content = content.replace(/📎/g, '👑');

        // Restore external modules
        content = content.replace(/HERMES_PAPERCLIP_ADAPTER_TEMP/g, 'hermes-paperclip-adapter');

        if (content !== original) {
          await fs.writeFile(entry.path, content, 'utf8');
        }
      } catch (err) {
        // ignore errors
      }
    }
  }

  // 2. Rename Files and Directories
  entries.sort((a, b) => b.path.length - a.path.length);

  for (const entry of entries) {
    if (entry.name.toLowerCase().includes('paperclip')) {
      const newName = entry.name.replace(/paperclip/gi, (match) => {
        if (match === 'paperclip') return 'sirius-eco-system';
        if (match === 'Paperclip') return 'Sirius-Eco-System';
        return 'sirius-eco-system';
      });

      const newPath = path.join(path.dirname(entry.path), newName);
      try {
        await fs.rename(entry.path, newPath);
      } catch (err) { }
    }
  }
}

renameContents().then(() => console.log('Smarter Rebrand complete.')).catch(console.error);
