#!/usr/bin/env node
// ------------------------------------------------------------------------------------
//  gather-context.js          v1.0
//  ------------------------------------------------------------------
//  Robust project summary generator in **pure Node.js**
//  • Works inside or outside a Git repo
//  • Quick-mode (-q) = only changed files since merge-base with origin/main
//  • Size limit flag (-s N) to inline files up to N KiB (default 512)
//  • Skips node_modules, .git, dist, coverage, assets, binaries, and huge files
//  • Generates a timestamped markdown (aetherOUT.md by default)
// ------------------------------------------------------------------------------------
import { execSync } from 'node:child_process';
import { statSync, createWriteStream, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, dirname, extname } from 'node:path';
import globby from 'globby';
const { globbySync } = globby;
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// ---------------------- CLI flags ----------------------
const argv = process.argv.slice(2);
const QUICK = argv.includes('-q');
const sizeIdx = argv.findIndex((f) => f === '-s');
const MAX_INLINE = (sizeIdx !== -1 ? Number(argv[sizeIdx + 1]) : 512) * 1024; // bytes
const OUT = 'aetherOUT.md';

// ---------------------- helpers ------------------------
const cwd = process.cwd();
const isGit = (() => {
  try { execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' }); return true; }
  catch { return false; }
})();
const now = () => new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];

const excludeGlobs = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/ios/Pods/**',
  '**/android/.gradle/**',
  '**/*.lock',
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.gif',
  '**/*.pdf',
  '**/*.ttf',
  '**/*.otf',
];

// Determine language fence from extension
const langMap = {
  '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript',
  '.sh': 'bash', '.json': 'json', '.yml': 'yaml', '.yaml': 'yaml',
  '.sql': 'sql', '.graphql': 'graphql', '.gql': 'graphql', '.prisma': 'prisma',
  '.md': 'markdown', '.css': 'css', '.scss': 'scss',
};
const fenceFor = (f) => langMap[extname(f).toLowerCase()] ?? '';

const human = (bytes) => (bytes / 1024).toFixed(1) + ' KiB';

// ---------------------- collect file list --------------
let files = [];
if (isGit) {
  if (QUICK) {
    const base = execSync('git merge-base HEAD origin/main', { encoding: 'utf8' }).trim();
    files = execSync(`git diff --name-only ${base}..HEAD`, { encoding: 'utf8' })
      .split('\n').filter(Boolean);
  } else {
    files = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);
  }
  // add untracked
  files.push(
    ...execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' })
      .split('\n').filter(Boolean)
  );
} else {
  files = globbySync(['**/*'], { gitignore: true });
}
// apply excludes
files = files.filter((f) => !excludeGlobs.some((pattern) => globbySync.isMatch(f, pattern)));
files.sort();

// ---------------------- write markdown -----------------
const out = createWriteStream(OUT, 'utf8');
const write = (s = '') => out.write(s + '\n');

write(`# Aether Context Dump — ${now()}`);
write('');
write('<!-- TOC -->\n');

let currentDir = '';
for (const file of files) {
  const dir = dirname(file).split('/')[0] || '(root)';
  if (dir !== currentDir) {
    currentDir = dir;
    write(`\n# ${dir}\n`);
  }

  const size = statSync(file).size;
  write(`\n### ${file}`);
  write(`**Size:** ${human(size)}`);

  if (size > MAX_INLINE) {
    write(`*(omitted — ${human(size)} > limit ${human(MAX_INLINE)})*`);
    continue;
  }

  const buf = readFileSync(file);
  const mime = execSync(`file -b --mime-type ${file}`).toString().trim();
  if (mime.startsWith('application/') && !mime.includes('json')) {
    write('*(binary omitted)*');
    continue;
  }

  const fence = fenceFor(file);
  write(`\n\`\`\`${fence}`);
  write(buf.toString('utf8'));
  write('```');
}

// ------------- post-process: inject TOC ----------------
out.end(() => {
  const md = readFileSync(OUT, 'utf8');
  const toc = md.split('\n')
    .filter((l) => l.match(/^#+\s/))
    .map((l) => {
      const lvl = l.match(/^#+/)[0].length;
      const title = l.replace(/^#+\s*/, '');
      const anchor = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return `${'  '.repeat(lvl - 1)}- [${title}](#${anchor})`;
    }).join('\n');
  const final = md.replace('<!-- TOC -->', toc);
  writeFileSync(OUT, final);
  console.log(`✅  ${OUT} written (${files.length} files, inline ≤ ${human(MAX_INLINE)})`);
});
