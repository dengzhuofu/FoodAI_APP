const fs = require('fs');
const path = require('path');

function walk(dirPath, onFile) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, onFile);
      continue;
    }
    if (entry.isFile()) onFile(fullPath);
  }
}

function shouldPatch(filePath) {
  const normalized = filePath.split(path.sep).join('/');
  if (!normalized.includes('/node_modules/')) return false;
  if (!normalized.includes('/zustand/')) return false;
  if (!normalized.includes('/esm/')) return false;
  return normalized.endsWith('.mjs') || normalized.endsWith('.js');
}

function patchContent(original) {
  let content = original;

  content = content.replaceAll(
    '(import.meta.env ? import.meta.env.MODE : void 0)',
    'process.env.NODE_ENV'
  );
  content = content.replaceAll(
    '(import.meta.env && import.meta.env.MODE)',
    'process.env.NODE_ENV'
  );

  content = content.replaceAll('import.meta.env.MODE', 'process.env.NODE_ENV');
  content = content.replaceAll('import.meta.env', '({ MODE: process.env.NODE_ENV })');

  if (content.includes('import.meta')) {
    content = content.replaceAll('import.meta', '({})');
  }

  return content;
}

function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const nodeModulesPath = path.join(projectRoot, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    return;
  }

  let patchedCount = 0;
  walk(nodeModulesPath, (filePath) => {
    if (!shouldPatch(filePath)) return;
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.includes('import.meta')) return;
    const next = patchContent(raw);
    if (next !== raw) {
      fs.writeFileSync(filePath, next, 'utf8');
      patchedCount += 1;
    }
  });

  if (patchedCount > 0) {
    console.log(`[fix-import-meta] Patched ${patchedCount} file(s) in node_modules`);
  }
}

main();
