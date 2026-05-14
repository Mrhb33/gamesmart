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
 *   3. Validates DOM IDs — scans main.html for id="..." and src/*.js for $('...') /
 *      getElementById('...'), reports any JS-referenced IDs missing from the HTML
 *   4. Reports the current SW cache version
 *   5. Prints a build summary
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;

// ---- Step 1: Validate questions ----
console.log('[1/5] Validating questions...');
try {
  execSync(`node "${path.join(rootDir, 'validate_questions.js')}"`, { stdio: 'inherit', timeout: 30000 });
  console.log('       Questions OK');
} catch (e) {
  console.error('\nBUILD ABORTED: Question validation failed. Fix questions before building.');
  process.exit(1);
}

// ---- Step 2: Check core assets exist ----
console.log('[2/5] Checking core assets...');
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

// ---- Step 3: DOM ID validation ----
console.log('[3/5] Validating DOM IDs...');

// 3a. Parse main.html for all id="..." attributes
const htmlContent = fs.readFileSync(path.join(rootDir, 'main.html'), 'utf8');
const htmlIdRegex = /\bid\s*=\s*"([^"]+)"/g;
const htmlIds = new Set();
let idMatch;
while ((idMatch = htmlIdRegex.exec(htmlContent)) !== null) {
  htmlIds.add(idMatch[1]);
}

// 3b. Parse all src/*.js for ID references via multiple patterns
const jsDir = path.join(rootDir, 'src');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
const jsRefs = []; // { file, id }

// Patterns: $('...'), getElementById('...'), querySelector('#...'), querySelectorAll('#...')
const jsRefPatterns = [
  /(?:\$\(|getElementById\()\s*['"]([^'"]+)['"]/g,
  /querySelectorAll?\(\s*['"]#([^'"]+)['"]/g,
];

for (const jsFile of jsFiles) {
  const content = fs.readFileSync(path.join(jsDir, jsFile), 'utf8');
  for (const regex of jsRefPatterns) {
    regex.lastIndex = 0;
    let refMatch;
    while ((refMatch = regex.exec(content)) !== null) {
      jsRefs.push({ file: jsFile, id: refMatch[1] });
    }
  }
}

// 3c. Whitelist for IDs created dynamically in JS (not in static HTML)
const DYNAMIC_IDS = new Set([
  'updateBanner', 'offlineBanner', 'offlineBadge', 'toast', 'dailyCountdown',
  'hintArea',
]);

// 3d. Report mismatches — critical IDs fail the build, others warn
const CRITICAL_IDS = new Set([
  'optionsList', 'timerFill', 'quizTimerText', 'quizXP', 'quizStreak', 'quizScore',
  'streakPill', 'explanationArea', 'nextQBtn', 'questionNumber', 'questionText',
  'qProgressBar', 'quizCatName', 'quizCatDot', 'quizTotal', 'quizBackBtn',
  'llFifty', 'llTime', 'llHint', 'quizStageSubtitle', 'bossWarning',
  'hubAvatar', 'hubName', 'hubLevel', 'hubXpBar', 'hubTotalXP', 'hudLevels',
  'hubCoins', 'hubAccuracy',
  'mainNav', 'categoryGrid', 'continueCard', 'rewardsCard',
  'shopCoins', 'shopGrid', 'achievementsGrid', 'achieveCount', 'achieveBadge',
  'profileBigAvatar', 'profileName', 'profileLevel', 'profileXpCurrent',
  'profileXpNeeded', 'profileXpFill', 'profileStatsGrid',
  'resultsTitle', 'resultsSubtitle', 'resultsIcon', 'scoreRingValue',
  'resXP', 'resCoins', 'resCorrect', 'resWrong', 'scoreCircle', 'resultsStars',
  'levelCompleteBanner', 'bannerText',
  'lsIcon', 'lsTitle', 'lsDesc', 'levelList',
  'reviewList', 'confirmModal', 'confirmTitle', 'confirmMsg',
  'nameModal', 'editNameInput', 'playerNameInput', 'startBtn',
  'missionPanel', 'weeklyGoalCard', 'dailyCard',
  'settingsModal', 'chestOverlay', 'relicModal',
  'shopTabs', 'collRealmFilter', 'loadingOverlay',
  'onboardingNext', 'onboardingSkip',
]);

const missingIds = jsRefs.filter(ref => !htmlIds.has(ref.id) && !DYNAMIC_IDS.has(ref.id));
const criticalMissing = missingIds.filter(ref => CRITICAL_IDS.has(ref.id));
const warningMissing = missingIds.filter(ref => !CRITICAL_IDS.has(ref.id));

console.log(`       DOM IDs in HTML:      ${htmlIds.size}`);
console.log(`       JS ID references:     ${jsRefs.length}`);

if (criticalMissing.length > 0) {
  console.error(`\nBUILD FAILED: ${criticalMissing.length} critical DOM ID(s) missing from main.html:`);
  for (const m of criticalMissing) {
    console.error(`         - "${m.id}" referenced in src/${m.file}`);
  }
  process.exit(1);
}

if (warningMissing.length > 0) {
  console.warn(`       WARNINGS: ${warningMissing.length} JS-referenced ID(s) not found in main.html:`);
  for (const m of warningMissing) {
    console.warn(`         - "${m.id}" referenced in src/${m.file}`);
  }
}

if (missingIds.length === 0) {
  console.log('       All JS-referenced IDs found in HTML');
} else if (criticalMissing.length === 0) {
  console.log(`       All critical IDs present (${warningMissing.length} non-critical warnings)`);
}

// ---- Step 4: Report SW version and auto-bump if assets changed ----
console.log('[4/5] Checking service worker versioning...');
const swPath = path.join(rootDir, 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');
const versionMatch = swContent.match(/CACHE_VERSION\s*=\s*'(v\d+)'/);
const dataVersionMatch = swContent.match(/DATA_VERSION\s*=\s*'([^']+)'/);

if (!versionMatch) {
  console.warn('       WARNING: Could not find CACHE_VERSION in sw.js');
} else {
  // Check if core assets changed since last build by computing a hash
  const crypto = require('crypto');
  const hashTargets = ['questions.json', 'levels_metadata.json'];
  let combined = '';
  for (const f of hashTargets) {
    const fp = path.join(rootDir, f);
    if (fs.existsSync(fp)) combined += fs.readFileSync(fp, 'utf8');
  }
  const contentHash = crypto.createHash('md5').update(combined).digest('hex').slice(0, 8);

  // Check if DATA_VERSION matches today — if content changed, bump it
  const today = new Date().toISOString().split('T')[0];
  let updated = false;

  // Get stored hash from previous build
  const hashFile = path.join(rootDir, '.build-hash');
  let prevHash = '';
  if (fs.existsSync(hashFile)) prevHash = fs.readFileSync(hashFile, 'utf8').trim();

  if (contentHash !== prevHash) {
    // Content changed — bump DATA_VERSION and CACHE_VERSION
    const oldVer = parseInt(versionMatch[1].replace('v', ''), 10);
    const newVer = 'v' + (oldVer + 1);
    swContent = swContent.replace(/CACHE_VERSION\s*=\s*'v\d+'/, `CACHE_VERSION = '${newVer}'`);
    swContent = swContent.replace(/DATA_VERSION\s*=\s*'[^']+'/, `DATA_VERSION = '${today}'`);
    swContent = swContent.replace(/\/\/ Data version: [^\n]+/, `// Data version: ${today} — bump when data files change for cache busting`);
    fs.writeFileSync(swPath, swContent);
    fs.writeFileSync(hashFile, contentHash);
    console.log(`       Data changed → bumped CACHE_VERSION to ${newVer}, DATA_VERSION to ${today}`);
    updated = true;
  }

  if (!updated) {
    console.log(`       SW cache version: ${versionMatch[1]} (data unchanged)`);
  }
}

// ---- Step 5: Summary ----
console.log('[5/5] Build summary:');
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
