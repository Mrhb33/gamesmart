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
  execSync(`node "${path.join(rootDir, 'validate_questions.js')}"`, { stdio: 'inherit' });
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

// 3b. Parse all src/*.js for $('...') and getElementById('...') references
const jsDir = path.join(rootDir, 'src');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
const jsRefRegex = /(?:\$\(|getElementById\()\s*['"]([^'"]+)['"]/g;
const jsRefs = []; // { file, id }
for (const jsFile of jsFiles) {
  const content = fs.readFileSync(path.join(jsDir, jsFile), 'utf8');
  let refMatch;
  jsRefRegex.lastIndex = 0;
  while ((refMatch = jsRefRegex.exec(content)) !== null) {
    jsRefs.push({ file: jsFile, id: refMatch[1] });
  }
}

// 3c. Report mismatches — critical IDs fail the build, others warn
const CRITICAL_IDS = new Set([
  'optionsList', 'timerFill', 'quizTimerText', 'quizXP', 'quizStreak', 'quizScore',
  'streakPill', 'explanationArea', 'nextQBtn', 'questionNumber', 'questionText',
  'qProgressBar', 'quizCatName', 'quizCatDot', 'quizTotal', 'quizBackBtn',
  'llFifty', 'llTime', 'llHint', 'quizStageSubtitle', 'bossWarning',
  'hubAvatar', 'hubName', 'hubLevel', 'hubXpBar', 'hubTotalXP', 'hudLevels',
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
]);

const missingIds = jsRefs.filter(ref => !htmlIds.has(ref.id));
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

// ---- Step 4: Report SW version ----
console.log('[4/5] Checking service worker...');
const swContent = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');
const versionMatch = swContent.match(/CACHE_VERSION\s*=\s*'(v\d+)'/);
if (versionMatch) {
  console.log(`       SW cache version: ${versionMatch[1]}`);
} else {
  console.warn('       WARNING: Could not find CACHE_VERSION in sw.js');
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
