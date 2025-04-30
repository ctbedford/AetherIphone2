#!/usr/bin/env node
/**
 * scripts/code-atlas.cjs
 *
 * Generates a comprehensive “code atlas” into the `logs/` directory:
 * • Definitions Table (file ↔ exports + type)
 * • Route Definitions (app/ routes)
 * • Database Schema Summary (from types/database.types.ts)
 * • Dependency Graph (Mermaid, local files)
 * • External Dependencies List
 * • TODO/FIXME List
 * • Excluded Files List
 * • Type Check Results (tsc) << NEW - Requires tsc/tsconfig
 * • Linting Results (eslint) << NEW - Requires eslint/config
 * • Buckets (grouped files with size, LOC, test file link, and FULL FILE CONTENT)
 *
 * WARNING: This version includes the FULL content of all non-excluded files
 * AND runs tsc/eslint, making it potentially slow and the output file very large.
 * Ensure typescript, eslint, and their configs are set up correctly.
 *
 * Usage via Yarn:
 * yarn add -D globby micromatch @babel/parser @babel/traverse typescript eslint
 * // add to package.json scripts: "code-atlas": "node scripts/code-atlas.cjs"
 * yarn code-atlas
 */

// Added execSync for running external commands
const { execSync } = require('child_process');
const { statSync, readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const { dirname, extname, relative, basename, join, sep } = require('path');
const globby = require('globby');
const micromatch = require('micromatch');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// ─── CLI & CONFIG ────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const QUICK = argv.includes('-q');
const timestamp = new Date().toISOString().replace(/[:T]/g,'-').split('.')[0];
const OUTPUT_DIR = 'logs';
const OUT = join(OUTPUT_DIR, `code-atlas_${timestamp}.md`);

const EXCLUDE = [ /* Previous exclusions remain the same */
  'node_modules/**', '**/.git/**', 'dist/**', 'build/**', 'coverage/**',
  '**/.expo/**', '**/.tamagui/**',
  '**/*.d.ts', '**/*.lock', '**/*.snap',
  '**/*.{png,jpg,jpeg,gif,ttf,otf,pdf,woff,woff2,ico,svg,eot}',
  '**/output/**', 'app-example/**', 'public/**',
  '*.log', 'patches/**', 'yarn.lock', 'package-lock.json',
  'babel.config.js', 'metro.config.js', 'postcss.config.js',
  'jest.config.*.js', 'jest.setup.js', 'jest.server.setup.js',
  '**/why.txt',
  'logs/**',
  'types/database.types.ts',
];
const CODE_EXT = new Set(['.ts','.tsx','.js','.jsx']); // Files to parse & lint
const TEST_SUFFIXES = ['.test', '.spec'];
const DB_TYPES_PATH = 'types/database.types.ts';
const APP_DIR_PREFIX = 'app' + sep;

// --- Helper functions (guessExportType, findTestFile, getBucketPath) ---
// (These helpers remain the same)
function guessExportType(name, node) { if (!node) return 'unknown'; if (node.declaration) { const d=node.declaration.type; if (d==='FunctionDeclaration') return 'function'; if (d==='ClassDeclaration') return 'class'; if (d==='VariableDeclaration') { if (/^use[A-Z]/.test(name)) return 'hook'; if (/^[A-Z]/.test(name)) return 'component'; return 'variable'; } if (d==='TSEnumDeclaration') return 'enum'; if (d==='TSInterfaceDeclaration') return 'interface'; if (d==='TSTypeAliasDeclaration') return 'type'; } if (node.type==='ExportDefaultDeclaration' && node.declaration) { const d=node.declaration.type; if (d==='FunctionDeclaration') return 'function'; if (d==='ClassDeclaration') return 'class'; if (d==='Identifier'||d==='CallExpression'){ if (/^use[A-Z]/.test(name)) return 'hook'; if (/^[A-Z]/.test(name)) return 'component'; }} if (/^use[A-Z]/.test(name)) return 'hook'; if (/^[A-Z]/.test(name)) return 'component'; return 'unknown'; }
function findTestFile(filePath) { const d=dirname(filePath); const e=extname(filePath); const b=basename(filePath,e); for (const s of TEST_SUFFIXES) { const p=join(d,`${b}${s}${e}`); if(existsSync(p)) return p; const sp=join(d,'__tests__',`${b}${s}${e}`); if(existsSync(sp)) return sp; } return null; }
function getBucketPath(filePath) { const p=dirname(filePath).split(sep); if(p.length===1&&p[0]==='.') return '.'; if(p.length<=2) return p.join(sep); return p.slice(0,2).join(sep); }

// ─── COLLECT FILES ───────────────────────────────────────────────────────────
let allFoundFiles = [];
const inGit = (() => { try { execSync('git rev-parse --is-inside-work-tree',{stdio:'ignore'}); return true; } catch { return false; } })();
// (File collection logic remains the same)
if (inGit) { if (QUICK) { const b = execSync('git merge-base HEAD origin/main',{encoding:'utf8'}).trim(); allFoundFiles = execSync(`git diff --name-only ${b}..HEAD`,{encoding:'utf8'}).split('\n').filter(Boolean); } else { allFoundFiles = execSync('git ls-files',{encoding:'utf8'}).split('\n').filter(Boolean); } if (!QUICK) { allFoundFiles.push(...execSync('git ls-files --others --exclude-standard',{encoding:'utf8'}).split('\n').filter(Boolean)); } } else { allFoundFiles = globby.sync(['**/*'], { gitignore: true }); }

const initialFileCount = allFoundFiles.length;
const excludedFiles = [];
const includedFiles = []; // Files for analysis and potential linting/type-checking

allFoundFiles.forEach(f => { if (EXCLUDE.some((pat) => micromatch.isMatch(f, pat))) { excludedFiles.push(f); } else { includedFiles.push(f); } });
includedFiles.sort(); excludedFiles.sort();
console.log(`Found ${initialFileCount} files. Including ${includedFiles.length}, Excluding ${excludedFiles.length}.`);


// ─── PARSE & ANALYZE (Only included files) ──────────────────────────────────
console.log(`Analyzing ${includedFiles.length} files...`);
const routes = [];
const codeFilesForLinting = []; // Collect code file paths for eslint
const atlas = includedFiles.map((file) => {
  const bucket = getBucketPath(file);
  const entry = { file, bucket, size: 0, loc: 0, exports: [], imports: { local: new Set(), external: new Set() }, todos: [], testFile: findTestFile(file), fullContent: null };
  try { entry.size = statSync(file).size; } catch {}
  let isRoute = file.startsWith(APP_DIR_PREFIX) && /\.(tsx|jsx)$/.test(file) && !basename(file).startsWith('_');
  let routeType = 'screen';
  const isCodeFile = CODE_EXT.has(extname(file)); // Check if it's a code file we care about parsing/linting
  let src = ''; try { src = readFileSync(file, 'utf8'); entry.loc = src.split('\n').length; entry.fullContent = src; } catch (e) { console.warn(`Warning: Could not read file ${file}: ${e.message}`); return entry; }

  if (!isCodeFile) return entry; // Skip AST parsing and linting for non-code files

  codeFilesForLinting.push(file); // Add to list for eslint

  const lines = src.split('\n'); lines.forEach((line, index) => { const m = line.match(/.*\/\/\s*(TODO|FIXME):?\s*(.*)/i); if (m) entry.todos.push({ line: index + 1, text: m[2].trim() }); });
  let ast; try { ast = parser.parse(src, { sourceType: 'module', plugins: ['typescript','jsx','decorators-legacy', 'classProperties', 'objectRestSpread'], errorRecovery: true, attachComment: true }); } catch (e) { console.warn(`Warning: Could not parse file ${file}: ${e.message}. Exports/Imports may be incomplete.`); return entry; } // Log parse error but continue
  try { let hLE=false, hSE=false; traverse(ast, { ImportDeclaration(p) { const s=p.node.source?.value; if(s){ if(s.startsWith('.'))entry.imports.local.add(s); else entry.imports.external.add(s);}}, ExportNamedDeclaration(p) { const{node}=p; if(node.declaration){ if(node.declaration.id){ const n=node.declaration.id.name; entry.exports.push({name:n, type:guessExportType(n,node)}); }else if(node.declaration.declarations){ node.declaration.declarations.forEach((d)=>{ if(d.id.type==='Identifier'){ const n=d.id.name; entry.exports.push({name:n, type:guessExportType(n,node.declaration)}); }}); }} (node.specifiers||[]).forEach((s)=>{ if(s.exported.type==='Identifier'){ const n=s.exported.name; entry.exports.push({name: n, type:'re-export'}); }}); }, ExportDefaultDeclaration(p) { entry.exports.push({name:'default', type:guessExportType('default',p.node)}); if(basename(file)==='_layout.tsx') hLE=true; }, JSXOpeningElement(p) { if(p.node.name.type==='JSXMemberExpression'&&p.node.name.object.type==='JSXIdentifier'){ const o=p.node.name.object.name; const pr=p.node.name.property.name; if((o==='Stack'||o==='Tabs')&&pr==='Screen') hSE=true; }} }); if(isRoute){ if(hLE) routeType='layout'; else if(hSE) routeType='layout (implicit)'; routes.push({path:file, type:routeType}); } } catch (e) { console.warn(`Warning: Error traversing AST for ${file}: ${e.message}`); }
  entry.exports.sort((a, b) => a.name.localeCompare(b.name)); return entry;
});

// --- Normalize import paths ---
// (Normalization logic remains the same)
const fileMap = new Map(includedFiles.map(f => [f, true])); const normalizedAtlas = atlas.map(entry => ({ ...entry, imports: { ...entry.imports, local: new Set([...entry.imports.local].map(imp => { try { const t=relative('.',join(dirname(entry.file),imp)); const exts=['','.ts','.tsx','.js','.jsx','/index.ts','/index.tsx','/index.js','/index.jsx']; let f=null; for(const e of exts){ const p=t+e; if(fileMap.has(p)){f=p;break;}} return f; } catch { return null; }}).filter(Boolean)) } }));

// --- Parse Database Types ---
// (DB Type parsing logic remains the same)
let dbSchema = { tables: {}, enums: {} }; try { const c=readFileSync(DB_TYPES_PATH,'utf8'); const tr = /([\w_]+):\s*{\s*Row:\s*({[\s\S]*?})/g; let tm; while((tm=tr.exec(c))!==null){ const tN=tm[1]; const rC=tm[2]; const cols=[]; const cr = /([\w_]+):\s*([\w\[\] \|\?&:;'"{}]+)/g; let cm; while((cm=cr.exec(rC))!==null){ cols.push({ name: cm[1], type: cm[2].trim() }); } dbSchema.tables[tN] = cols; } const eb = c.match(/Enums:\s*{([\s\S]*?)}/); if(eb){ const er = /([\w_]+):\s*([\s\S]*?)"/g; let em; while((em=er.exec(eb[1]))!==null){ const eN=em[1]; const vals=[...em[2].matchAll(/"([^"]+)"/g)].map(m=>m[1]); dbSchema.enums[eN]=vals; } } } catch (e) { console.warn(`Warning: Could not read or parse ${DB_TYPES_PATH}: ${e.message}`); }

// --- Run External Checks ---
console.log("Running type checks (tsc)...");
let tscOutput = '';
try {
    // Use --pretty false for potentially cleaner output, capture stderr too
    tscOutput = execSync('npx tsc --noEmit --pretty false', { encoding: 'utf8', stdio: 'pipe' });
    console.log("Type check completed successfully.");
} catch (e) {
    console.warn("Type check failed or returned errors.");
    // e.stdout and e.stderr contain the output even on error for execSync
    tscOutput = `Error running tsc: ${e.message}\n\nSTDOUT:\n${e.stdout}\n\nSTDERR:\n${e.stderr}`;
}

console.log("Running linter (eslint)...");
let eslintOutput = '';
if (codeFilesForLinting.length > 0) {
    try {
        // Pass specific files to eslint; escape spaces/special chars if necessary (simple case here)
        const filesArg = codeFilesForLinting.join(' ');
        eslintOutput = execSync(`npx eslint ${filesArg}`, { encoding: 'utf8', stdio: 'pipe' });
        console.log("Linting completed successfully.");
    } catch (e) {
        console.warn("Linting failed or returned errors.");
        eslintOutput = `Error running eslint: ${e.message}\n\nSTDOUT:\n${e.stdout}\n\nSTDERR:\n${e.stderr}`;
    }
} else {
     eslintOutput = "No code files found to lint.";
}


// ─── EMIT MARKDOWN ────────────────────────────────────────────────────────────
console.log(`Generating Markdown output to ${OUT}...`);
try { mkdirSync(OUTPUT_DIR, { recursive: true }); } catch (e) { console.error(`Error creating output directory ${OUTPUT_DIR}:`, e); process.exit(1); }

let md = `# Aether Code Atlas  \n_generated ${timestamp}_\n\n`;
md += '## Contents\n';
// Added sections to TOC
['Definitions Table', 'Route Definitions', 'Database Schema Summary', 'Dependency Graph', 'External Dependencies', 'TODOs / FIXMEs', 'Excluded Files', 'Type Check Results (tsc)', 'Linting Results (eslint)', 'Buckets'].forEach((t) => { md += `- [${t}](#${t.toLowerCase().replace(/\s+/g,'-')})\n`; });

// Definitions Table
md += '\n## Definitions Table\n| File | Export Name | Type |\n|---|---|---|\n';
normalizedAtlas.forEach(({ file, exports: ex }) => { if (ex.length > 0) ex.forEach(exp => { md += `| ${file} | \`${exp.name}\` | ${exp.type} |\n`; }); });

// Route Definitions
md += '\n## Route Definitions\n| Route File | Type |\n|---|---|\n'; routes.sort((a,b)=>a.path.localeCompare(b.path)).forEach(r => { md += `| ${r.path} | ${r.type} |\n`; }); if (routes.length === 0) md += '| *(No routes found)* | |\n';

// Database Schema Summary
md += '\n## Database Schema Summary\n'; md += `\n_Extracted from: ${DB_TYPES_PATH}_\n`; const tableNames = Object.keys(dbSchema.tables).sort(); const enumNames = Object.keys(dbSchema.enums).sort(); if (tableNames.length > 0) { md += '\n### Tables\n'; tableNames.forEach(tN => { md += `\n**\`${tN}\`**\n\n| Column | Type |\n|---|---|\n`; dbSchema.tables[tN].forEach(col => { md += `| \`${col.name}\` | \`${col.type.replace(/\|/g,'\\|')}\` |\n`; }); }); } else { md += '\n_No tables extracted._\n'; } if (enumNames.length > 0) { md += '\n### Enums\n'; enumNames.forEach(eN => { md += `\n**\`${eN}\`**: ${dbSchema.enums[eN].length > 0 ? `\`${dbSchema.enums[eN].join('` \\| `')}\`` : '*(No values extracted)*'}\n`; }); } else { md += '\n_No enums extracted._\n'; }

// Dependency Graph
md += '\n## Dependency Graph\n*Note: This graph shows dependencies between local files only.*\n```mermaid\ngraph TD;\n'; let dependencyCount = 0; normalizedAtlas.forEach(({ file, imports }) => { const idA = file.replace(/[^a-zA-Z0-9_]/g,'_'); imports.local.forEach((imp) => { const idB = imp.replace(/[^a-zA-Z0-9_]/g,'_'); md += `  ${idA}["${file}"] --> ${idB}["${imp}"];\n`; dependencyCount++; }); }); md += '```\n';

// External Dependencies
md += '\n## External Dependencies\n'; const externalDeps = new Set(); normalizedAtlas.forEach(({ imports }) => { imports.external.forEach(dep => externalDeps.add(dep)); }); if (externalDeps.size > 0) { [...externalDeps].sort().forEach(dep => md += `- \`${dep}\`\n`); } else { md += '_None detected._\n'; }

// TODOs / FIXMEs
md += '\n## TODOs / FIXMEs\n'; let todoCount = 0; normalizedAtlas.forEach(({ file, todos }) => { if (todos.length > 0) { md += `\n**${file}**\n`; todos.forEach(todo => { md += `- (L${todo.line}) ${todo.text}\n`; todoCount++; }); } }); if (todoCount === 0) { md += '_None found._\n'; }

// Excluded Files
md += '\n## Excluded Files\n'; if (excludedFiles.length > 0) { md += `\n_${excludedFiles.length} files were excluded based on the patterns in the script._\n\n`; excludedFiles.forEach(file => { md += `- ${file}\n`; }); } else { md += '_No files were excluded by the exclusion patterns._\n'; }

// Type Check Results << NEW SECTION >>
md += '\n## Type Check Results (tsc)\n';
md += '\n```log\n';
md += tscOutput.trim() || 'tsc produced no output.';
md += '\n```\n';

// Linting Results << NEW SECTION >>
md += '\n## Linting Results (eslint)\n';
md += '\n```log\n';
md += eslintOutput.trim() || 'eslint produced no output or was not run.';
md += '\n```\n';

// Buckets (With Full File Content)
md += '\n## Buckets\n';
const byBucket = normalizedAtlas.reduce((acc, cur) => { (acc[cur.bucket] ||= []).push(cur); return acc; }, {});
const sortedBuckets = Object.keys(byBucket).sort((a, b) => { if (a === '.') return -1; if (b === '.') return 1; return a.localeCompare(b); });

sortedBuckets.forEach((bucket) => { const arr = byBucket[bucket]; md += `\n### ${bucket}\n`;
    arr.forEach(({ file, exports: ex, size, loc, testFile, todos, fullContent }) => {
        const sizeKB = (size / 1024).toFixed(1);
        const testFileRelative = testFile ? relative(OUTPUT_DIR, testFile) : null;
        const testFileLink = testFileRelative ? ` [[Test](${testFileRelative})]` : '';
        const todoMarker = todos.length > 0 ? ` (${todos.length} TODOs)`: '';
        const exportSummary = ex.length > 0 ? ` Exports: ${ex.map(e => `\`${e.name}\``).join(', ')}` : ' *(No explicit exports)*';
        md += `\n- **${file}** (${sizeKB} KB, ${loc} lines)${testFileLink}${todoMarker}${exportSummary}\n`;

        if (fullContent !== null) {
            const ext = extname(file).substring(1) || 'text';
            md += `\n  \`\`\`${ext}\n`;
            md += `${fullContent}\n`;
            md += `  \`\`\`\n`;
        } else {
             md += `  *(Content not read or file is binary/excluded)*\n`;
        }
    });
});

writeFileSync(OUT, md);
console.log(`✅ ${OUT} generated (${includedFiles.length} files analyzed, ${excludedFiles.length} excluded, ${dependencyCount} local dependencies mapped, ${todoCount} TODOs found).`);
console.warn("️⚠️ WARNING: Output file includes full file content AND tsc/eslint results, and may be very large.");