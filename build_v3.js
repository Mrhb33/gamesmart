#!/usr/bin/env node
/**
 * build_v3.js — Validates and versions the Cerebrum Quest PWA.
 *
 * Usage:
 *   node build_v3.js
 *
 * What it does:
 *   1. Validates questions.json via validate_questions.js
 *   2. Checks that all core assets exist (CSS, JS modules, data files)
 *   3. Reports the current SW cache version
 *   4. Prints a build summary
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;

// ---- Step 1: Validate questions ----
console.log('[1/4] Validating questions...');
try {
  execSync(`node "${path.join(rootDir, 'validate_questions.js')}"`, { stdio: 'inherit' });
  console.log('       Questions OK');
} catch (e) {
  console.error('\nBUILD ABORTED: Question validation failed. Fix questions before building.');
  process.exit(1);
}

// ---- Step 2: Check core assets exist ----
console.log('[2/4] Checking core assets...');
const coreAssets = [
  'main.html',
  'styles.css',
  'src/settings.js',
  'src/i18n.js',
  'src/state.js',
  'src/data.js',
  'src/audio.js',
  'src/ui.js',
  'src/game.js',
  'src/screens.js',
  'sw.js',
  'manifest.json',
  'questions.json',
  'levels_metadata.json',
];

let missing = [];
for (const asset of coreAssets) {
  if (!fs.existsSync(path.join(rootDir, asset))) {
    missing.push(asset);
  }
}
if (missing.length > 0) {
  console.error(`\nBUILD ABORTED: Missing core assets:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}
console.log(`       All ${coreAssets.length} core assets present`);

// ---- Step 3: Report SW version ----
console.log('[3/4] Checking service worker...');
const swContent = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');
const versionMatch = swContent.match(/CACHE_VERSION\s*=\s*'(v\d+)'/);
if (versionMatch) {
  console.log(`       SW cache version: ${versionMatch[1]}`);
} else {
  console.warn('       WARNING: Could not find CACHE_VERSION in sw.js');
}

// ---- Step 4: Summary ----
console.log('[4/4] Build summary:');
const htmlSize = fs.statSync(path.join(rootDir, 'main.html')).size;
const cssSize = fs.statSync(path.join(rootDir, 'styles.css')).size;
let jsTotal = 0;
for (const f of fs.readdirSync(path.join(rootDir, 'src'))) {
  if (f.endsWith('.js')) jsTotal += fs.statSync(path.join(rootDir, 'src', f)).size;
}
const qSize = fs.statSync(path.join(rootDir, 'questions.json')).size;
console.log(`       main.html:       ${(htmlSize / 1024).toFixed(1)} KB`);
console.log(`       styles.css:      ${(cssSize / 1024).toFixed(1)} KB`);
console.log(`       src/*.js total:  ${(jsTotal / 1024).toFixed(1)} KB`);
console.log(`       questions.json:  ${(qSize / 1024).toFixed(1)} KB`);
console.log(`       Build time:      ${new Date().toISOString()}`);
console.log('\nBuild complete.');
