#!/usr/bin/env node
/**
 * scripts/code-atlas.js
 *
 * Generates a “code atlas”:
 *  • Definitions table (file ↔ exports)
 *  • Dependency graph (Mermaid)
 *  • Buckets by top-level folder
 *
 * Flags:
 *   -q       quick-mode (only diff vs origin/main)
 *   -s <KiB> max inline file size (default 512 KiB)
 */

import { execSync } from 'node:child_process';
import { statSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative } from 'node:path';
import { globbySync } from 'globby';
import micromatch from 'micromatch';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

// ─── CLI FLAGS & CONFIG ──────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const QUICK = argv.includes('-q');
const sIdx = argv.indexOf('-s');
const MAX_INLINE = (sIdx >= 0 ? Number(argv[sIdx+1]) : 512) * 1024;
const timestamp = new Date().toISOString().replace(/[:T]/g,'-').split('.')[0];
const OUT = `code-atlas_${timestamp}.md`;

// Patterns and extensions
const EXCLUDE = [
  'node_modules/**','**/.git/**','dist/**','build/**','coverage/**',
  '**/*.d.ts','**/*.lock','**/*.snap',
  '**/*.png','**/*.jpg','**/*.jpeg','**/*.gif','**/*.pdf','**/*.ttf','**/*.otf',
];
const TS_EXT = new Set(['.ts','.tsx','.js','.jsx']);

// ─── COLLECT FILE LIST ───────────────────────────────────────────────────────
let files = [];
const inGit = (() => {
  try { execSync('git rev-parse --is-inside-work-tree',{stdio:'ignore'}); return true; }
  catch { return false; }
})();

if (inGit) {
  if (QUICK) {
    const base = execSync('git merge-base HEAD origin/main',{encoding:'utf8'}).trim();
    files = execSync(`git diff --name-only ${base}..HEAD`,{encoding:'utf8'})
      .split('\n').filter(Boolean);
  } else {
    files = execSync('git ls-files',{encoding:'utf8'}).split('\n').filter(Boolean);
  }
  // include untracked
  files.push(
    ...execSync('git ls-files --others --exclude-standard',{encoding:'utf8'})
      .split('\n').filter(Boolean)
  );
} else {
  files = globbySync(['**/*'],{gitignore:true});
}

// apply exclude globs
files = files
  .filter((f) => !EXCLUDE.some((pat) => micromatch.isMatch(f, pat)))
  .sort();

// ─── PARSE & ANALYZE ─────────────────────────────────────────────────────────
/**
 * atlas entries: { file, bucket, exports:Set<string>, imports:Set<string> }
 */
const atlas = files.map((file) => {
  const bucket = dirname(file).split('/')[0] || '(root)';
  const entry = { file, bucket, exports: new Set(), imports: new Set() };
  const size = statSync(file).size;

  // skip binaries/large or non-TS files
  if (size > MAX_INLINE || !TS_EXT.has(extname(file))) {
    return entry;
  }

  let src = '';
  try { src = readFileSync(file,'utf8'); }
  catch { return entry; }

  let ast;
  try {
    ast = parse(src, {
      sourceType: 'module',
      plugins: ['typescript','jsx','decorators-legacy'],
    });
  } catch {
    return entry;
  }

  traverse(ast, {
    ImportDeclaration({ node }) {
      entry.imports.add(node.source.value);
    },
    ExportNamedDeclaration({ node }) {
      if (node.declaration) {
        const d = node.declaration;
        if (d.id) entry.exports.add(d.id.name);
        else if (d.declarations) {
          d.declarations.forEach((v) => v.id && entry.exports.add(v.id.name));
        }
      }
      (node.specifiers||[]).forEach((s) => entry.exports.add(s.exported.name));
    },
    ExportDefaultDeclaration() {
      entry.exports.add('default');
    },
  });

  return entry;
});

// ─── EMIT MARKDOWN ───────────────────────────────────────────────────────────
let md = `# Aether Code Atlas  \n_generated ${timestamp}_\n\n`;
md += '## Contents\n';
['Definitions Table','Dependency Graph','Buckets']
  .forEach((t) => {
    const a = t.toLowerCase().replace(/\s+/g,'-');
    md += `- [${t}](#${a})\n`;
  });

// Definitions Table
md += '\n## Definitions Table\n| File | Exports |\n|---|---|\n';
atlas.forEach(({ file, exports: ex }) => {
  if (ex.size) md += `| ${file} | ${[...ex].join(', ')} |\n`;
});

// Dependency Graph (Mermaid)
md += '\n## Dependency Graph\n```mermaid\ngraph TD;\n';
atlas.forEach(({ file, imports }) => {
  const idA = file.replace(/[^a-zA-Z0-9]/g,'_');
  imports.forEach((imp) => {
    if (imp.startsWith('.')) {
      const tgt = relative('.', dirname(file) + '/' + imp).replace(/\.(tsx?|jsx?)$/,'');
      const idB = tgt.replace(/[^a-zA-Z0-9]/g,'_');
      md += `  ${idA}["${file}"] --> ${idB}["${tgt}"];\n`;
    }
  });
});
md += '```\n';

// Buckets view
md += '\n## Buckets\n';
const byBucket = atlas.reduce((acc, cur) => {
  (acc[cur.bucket] ||= []).push(cur);
  return acc;
}, {});
for (const [bucket, arr] of Object.entries(byBucket)) {
  md += `\n### ${bucket}\n`;
  arr.forEach(({ file, exports: ex }) => {
    md += `- **${file}**${ex.size ? ` exports: ${[...ex].join(', ')}` : ''}\n`;
  });
}

writeFileSync(OUT, md);
console.log(`✅  ${OUT} (scanned ${files.length} files, inline ≤ ${(MAX_INLINE/1024).toFixed(0)} KiB)`);
