#!/usr/bin/env node
/**
 * validate_questions.js — Validates the Cerebrum Quest question set.
 *
 * Checks:
 *   1. Required fields: q, opts, a, expl, lvl
 *   2. opts has exactly 4 non-empty strings
 *   3. a is integer 0-3
 *   4. Unique question IDs (if id field exists)
 *   5. No cross-category duplicate questions
 *   6. Four unique options per question
 *   7. No suspicious "all of the above" / "none of the above"
 *   8. Explanation minimum length (15 chars)
 *   9. Boss question exists per level per category
 *  10. At least TARGET questions per level (default 10)
 *  11. Answer distribution balance per category AND per level
 *  12. Mobile text length warnings (q < 200, opts < 100)
 *  13. Tags present for every question (if tags field used)
 *  14. Locale placeholder structure (if locale field used)
 *  15. Per-level answer position diversity (>= 2 positions)
 *  16. No in-category duplicate questions
 *  17. Bilingual coverage warning (Arabic translations)
 *
 * Usage:  node validate_questions.js [questions.json] [--target N] [--strict]
 *   --target N   Minimum questions per level (default 10)
 *   --strict     Treat warnings as errors
 * Exit code 1 if unhealthy, 0 if OK.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const fileArg = args.find(a => !a.startsWith('--'));
const targetArg = args.find(a => a.startsWith('--target'));
const TARGET_QUESTIONS = targetArg ? parseInt(targetArg.split('=')[1] || targetArg.split(' ')[1], 10) : 10;
const STRICT = args.includes('--strict');
const AUDIT = args.includes('--audit');
const file = fileArg || path.join(__dirname, 'questions.json');

const SUSPICIOUS_PHRASES = [
  'all of the above',
  'none of the above',
  'both a and b',
  'both b and c',
  'both c and d',
  'both a and c',
  'all of these',
  'none of these',
];

const MIN_EXPLANATION_LENGTH = 15;
const EXPECTED_LEVELS = 5;
const EXPECTED_CATEGORIES = 7;

if (!fs.existsSync(file)) {
  console.error(`FAIL: File not found: ${file}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`FAIL: Invalid JSON in ${file}: ${e.message}`);
  process.exit(1);
}

const errors = [];
const warnings = [];

if (typeof data !== 'object' || Array.isArray(data)) {
  console.error('FAIL: Top-level value must be an object of category arrays.');
  process.exit(1);
}

const categories = Object.keys(data);

// Check expected number of categories
if (categories.length < EXPECTED_CATEGORIES) {
  errors.push(`Expected at least ${EXPECTED_CATEGORIES} categories, found ${categories.length}`);
}

// Global duplicate tracking (cross-category)
const globalQuestionTexts = new Map();

// Global ID tracking
const globalIds = new Map();

categories.forEach(cat => {
  const arr = data[cat];
  if (!Array.isArray(arr)) {
    errors.push(`${cat}: value is not an array`);
    return;
  }
  if (arr.length === 0) {
    errors.push(`${cat}: empty question array`);
    return;
  }

  // Check exactly 5 levels
  const levelsFound = new Set(arr.map(q => q.lvl));
  for (let l = 1; l <= EXPECTED_LEVELS; l++) {
    if (!levelsFound.has(l)) {
      errors.push(`${cat}: missing level ${l}`);
    }
  }
  for (const l of levelsFound) {
    if (l < 1 || l > EXPECTED_LEVELS) {
      errors.push(`${cat}: unexpected level ${l}`);
    }
  }

  // Question count per level
  const levelCounts = {};
  arr.forEach(q => {
    if (typeof q.lvl === 'number') {
      levelCounts[q.lvl] = (levelCounts[q.lvl] || 0) + 1;
    }
  });
  for (let l = 1; l <= EXPECTED_LEVELS; l++) {
    const count = levelCounts[l] || 0;
    if (count < TARGET_QUESTIONS) {
      errors.push(`${cat} level ${l}: has ${count} questions, expected at least ${TARGET_QUESTIONS}`);
    }
  }

  // Per-level tracking for boss and answer diversity
  const levelQuestions = {};
  const levelAnswers = {};

  const seenInCategory = new Set();

  arr.forEach((q, i) => {
    const label = `${cat}[${i}]`;

    // 1. Required fields
    for (const field of ['q', 'opts', 'a', 'expl', 'lvl']) {
      if (q[field] === undefined || q[field] === null) {
        errors.push(`${label}: missing field "${field}"`);
      }
    }

    // 4. Unique IDs
    if (q.id !== undefined) {
      if (typeof q.id !== 'string' || q.id.trim().length === 0) {
        errors.push(`${label}: id is empty or not a string`);
      } else if (globalIds.has(q.id)) {
        errors.push(`${label}: duplicate id "${q.id}" (also at ${globalIds.get(q.id)})`);
      } else {
        globalIds.set(q.id, label);
      }
    }

    // Question text checks
    if (typeof q.q === 'string') {
      if (q.q.trim().length === 0) {
        errors.push(`${label}: empty question text`);
      } else if (q.q.length > 200) {
        warnings.push(`${label}: question text is ${q.q.length} chars (over 200, may be hard to read on mobile)`);
      }
    }

    // Options: exactly 4 non-empty
    if (Array.isArray(q.opts)) {
      if (q.opts.length !== 4) {
        errors.push(`${label}: opts has ${q.opts.length} items, expected 4`);
      }
      q.opts.forEach((opt, oi) => {
        if (typeof opt !== 'string' || opt.trim().length === 0) {
          errors.push(`${label}: opts[${oi}] is empty or not a string`);
        } else if (opt.length > 100) {
          warnings.push(`${label}: opts[${oi}] is ${opt.length} chars (over 100, may be hard to read on mobile)`);
        }
      });

      // 6. No duplicate options within a question
      const optTexts = q.opts.map(o => (typeof o === 'string' ? o.trim().toLowerCase() : ''));
      for (let a = 0; a < optTexts.length; a++) {
        for (let b = a + 1; b < optTexts.length; b++) {
          if (optTexts[a] && optTexts[a] === optTexts[b]) {
            errors.push(`${label}: duplicate options "${q.opts[a]}" at positions ${a} and ${b}`);
          }
        }
      }
    }

    // Answer index
    if (typeof q.a !== 'number' || !Number.isInteger(q.a) || q.a < 0 || q.a > 3) {
      errors.push(`${label}: answer index "a" is ${q.a}, expected 0-3`);
    }

    // Level check
    if (typeof q.lvl !== 'number' || !Number.isInteger(q.lvl) || q.lvl < 1 || q.lvl > EXPECTED_LEVELS) {
      errors.push(`${label}: level "lvl" is ${q.lvl}, expected 1-${EXPECTED_LEVELS}`);
    }

    // 8. Explanation quality
    if (q.expl !== undefined && q.expl !== null) {
      if (typeof q.expl !== 'string' || q.expl.trim().length === 0) {
        errors.push(`${label}: explanation is empty`);
      } else if (q.expl.trim().length < MIN_EXPLANATION_LENGTH) {
        errors.push(`${label}: explanation too short (${q.expl.trim().length} chars, minimum ${MIN_EXPLANATION_LENGTH}): "${q.expl}"`);
      } else if (q.expl.length > 300) {
        warnings.push(`${label}: explanation is ${q.expl.length} chars (over 300, may be too long)`);
      }
    }

    // 7. Suspicious phrases
    if (typeof q.q === 'string') {
      const qLower = q.q.toLowerCase();
      SUSPICIOUS_PHRASES.forEach(phrase => {
        if (qLower.includes(phrase)) {
          warnings.push(`${label}: question contains suspicious phrase "${phrase}"`);
        }
      });
    }
    if (Array.isArray(q.opts)) {
      q.opts.forEach((opt, oi) => {
        if (typeof opt === 'string') {
          const oLower = opt.toLowerCase();
          SUSPICIOUS_PHRASES.forEach(phrase => {
            if (oLower.includes(phrase)) {
              errors.push(`${label}: opts[${oi}] contains suspicious phrase "${phrase}" — avoid lazy options`);
            }
          });
        }
      });
    }

    // 13. Tags check
    if (q.tags !== undefined) {
      if (!Array.isArray(q.tags) || q.tags.length === 0) {
        errors.push(`${label}: tags field exists but is empty or not an array`);
      }
    }
    if (q.tags === undefined) {
      warnings.push(`${label}: missing tags field`);
    }

    // Hint check
    if (q.hint === undefined || (typeof q.hint === 'string' && q.hint.trim().length === 0)) {
      warnings.push(`${label}: missing or empty hint`);
    }

    // 14. Locale check
    if (q.locale !== undefined) {
      if (typeof q.locale !== 'object' || q.locale === null || Array.isArray(q.locale)) {
        errors.push(`${label}: locale must be an object with en/ar keys`);
      } else {
        if (!('en' in q.locale) || !('ar' in q.locale)) {
          warnings.push(`${label}: locale missing 'en' or 'ar' key`);
        }
        // Arabic locale content validation
        if ('ar' in q.locale && q.locale.ar !== null && q.locale.ar !== undefined) {
          const ar = q.locale.ar;
          if (typeof ar !== 'object' || Array.isArray(ar)) {
            errors.push(`${label}: locale.ar must be an object`);
          } else {
            if ('q' in ar) {
              if (typeof ar.q !== 'string') {
                errors.push(`${label}: locale.ar.q must be a string`);
              }
            }
            if ('opts' in ar) {
              if (!Array.isArray(ar.opts) || ar.opts.length !== 4) {
                errors.push(`${label}: locale.ar.opts must have exactly 4 items`);
              } else {
                ar.opts.forEach((opt, oi) => {
                  if (typeof opt !== 'string' || opt.trim().length === 0) {
                    errors.push(`${label}: locale.ar.opts[${oi}] must be a non-empty string`);
                  }
                });
              }
            }
            if ('expl' in ar) {
              if (typeof ar.expl !== 'string') {
                errors.push(`${label}: locale.ar.expl must be a string`);
              } else if (ar.expl.trim().length < MIN_EXPLANATION_LENGTH) {
                errors.push(`${label}: locale.ar.expl too short (${ar.expl.trim().length} chars, minimum ${MIN_EXPLANATION_LENGTH})`);
              }
            }
            if ('hint' in ar) {
              if (typeof ar.hint !== 'string') {
                errors.push(`${label}: locale.ar.hint must be a string`);
              }
            }
            // Warn if locale.ar exists but missing key fields
            if (!('q' in ar) || !('opts' in ar) || !('expl' in ar)) {
              const missing = ['q', 'opts', 'expl'].filter(k => !(k in ar));
              warnings.push(`${label}: locale.ar exists but missing ${missing.join(', ')}`);
            }
          }
        }
      }
    }

    // In-category duplicate
    const qText = (typeof q.q === 'string') ? q.q.trim().toLowerCase() : '';
    if (qText) {
      if (seenInCategory.has(qText)) {
        errors.push(`${label}: duplicate question in ${cat}: "${q.q.slice(0, 60)}..."`);
      }
      seenInCategory.add(qText);
    }

    // Cross-category duplicate
    if (qText) {
      if (!globalQuestionTexts.has(qText)) globalQuestionTexts.set(qText, []);
      globalQuestionTexts.get(qText).push(label);
    }

    // Per-level tracking
    const lvl = q.lvl;
    if (!levelQuestions[lvl]) levelQuestions[lvl] = [];
    if (!levelAnswers[lvl]) levelAnswers[lvl] = [];
    levelQuestions[lvl].push(q);
    if (typeof q.a === 'number' && q.a >= 0 && q.a <= 3) {
      levelAnswers[lvl].push(q.a);
    }
  });

  // 9. Boss question per level
  Object.entries(levelQuestions).forEach(([lvl, qs]) => {
    const bossQuestions = qs.filter(q => q.boss === true);
    if (bossQuestions.length === 0) {
      warnings.push(`${cat} level ${lvl}: no boss question marked (expected 1)`);
    } else if (bossQuestions.length > 1) {
      warnings.push(`${cat} level ${lvl}: ${bossQuestions.length} boss questions (expected 1)`);
    }
  });

  // Per-category answer position diversity
  const posCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
  arr.forEach(q => {
    if (typeof q.a === 'number' && Number.isInteger(q.a) && q.a >= 0 && q.a <= 3) {
      posCounts[q.a]++;
    }
  });
  const usedPositions = Object.values(posCounts).filter(c => c > 0).length;
  if (usedPositions < 3) {
    errors.push(`${cat}: correct answers only use ${usedPositions} of 4 positions (${JSON.stringify(posCounts)}) — too predictable`);
  }

  // Balance check: warn if one position has > 40% of answers (stricter than before)
  const total = arr.length;
  for (const [pos, count] of Object.entries(posCounts)) {
    if (count > total * 0.4) {
      warnings.push(`${cat}: position ${['A','B','C','D'][pos]} has ${count}/${total} answers (${Math.round(count / total * 100)}%) — unbalanced`);
    }
  }

  // 15. Per-level answer position diversity
  Object.entries(levelAnswers).forEach(([lvl, answers]) => {
    const unique = new Set(answers.filter(a => typeof a === 'number' && a >= 0 && a <= 3));
    if (answers.length >= 3 && unique.size < 2) {
      errors.push(`${cat} level ${lvl}: only ${unique.size} answer position(s) used — need at least 2`);
    }
    if (answers.length >= 5 && unique.size < 3) {
      warnings.push(`${cat} level ${lvl}: only ${unique.size} answer positions used across ${answers.length} questions — consider using 3+`);
    }

    // Per-level balance: no single position > 50%
    const lvlTotal = answers.length;
    const lvlPosCounts = {};
    answers.forEach(a => { lvlPosCounts[a] = (lvlPosCounts[a] || 0) + 1; });
    for (const [pos, count] of Object.entries(lvlPosCounts)) {
      if (count > lvlTotal * 0.5) {
        warnings.push(`${cat} level ${lvl}: position ${['A','B','C','D'][pos]} has ${count}/${lvlTotal} (${Math.round(count / lvlTotal * 100)}%) — unbalanced at level`);
      }
    }
  });
});

// 17. Bilingual coverage warning
categories.forEach(cat => {
  const arr = data[cat];
  const total = arr.length;
  let hasArabic = 0;
  arr.forEach(q => {
    if (q.locale && q.locale.ar !== null && q.locale.ar !== undefined) {
      hasArabic++;
    }
  });
  const missing = total - hasArabic;
  if (missing > 0) {
    warnings.push(`${cat}: ${missing}/${total} questions missing Arabic translations`);
  }
});

// 5. Cross-category duplicates
const crossDupes = [...globalQuestionTexts.entries()].filter(([, locs]) => locs.length > 1);
if (crossDupes.length > 0) {
  crossDupes.forEach(([text, locs]) => {
    errors.push(`Cross-category duplicate: "${text.slice(0, 60)}..." in ${locs.join(', ')}`);
  });
}

// ==================== Audit Report ====================
if (AUDIT) {
  console.log(`\n=== Data Audit Report ===`);

  // Collect all questions with metadata
  let allQs = [];
  categories.forEach(cat => {
    data[cat].forEach((q, i) => {
      allQs.push({ cat, i, q, label: `${cat}[${i}]` });
    });
  });

  // Longest questions
  const byQLen = [...allQs].sort((a, b) => (b.q.q?.length || 0) - (a.q.q?.length || 0));
  console.log('\n--- Top 5 Longest Questions ---');
  byQLen.slice(0, 5).forEach(({ label, q }) => {
    console.log(`  ${label}: ${q.q?.length || 0} chars — "${(q.q || '').slice(0, 80)}..."`);
  });

  // Longest options
  let longestOpts = [];
  allQs.forEach(({ label, q }) => {
    if (Array.isArray(q.opts)) {
      q.opts.forEach((opt, oi) => {
        if (typeof opt === 'string' && opt.length > 60) {
          longestOpts.push({ label: `${label} opts[${oi}]`, len: opt.length, text: opt });
        }
      });
    }
  });
  if (longestOpts.length > 0) {
    console.log(`\n--- Long Options (>60 chars): ${longestOpts.length} found ---`);
    longestOpts.sort((a, b) => b.len - a.len).slice(0, 5).forEach(o => {
      console.log(`  ${o.label}: ${o.len} chars — "${o.text.slice(0, 70)}..."`);
    });
  }

  // Missing explanations
  let missingExpl = allQs.filter(({ q }) => !q.expl || q.expl.trim().length < MIN_EXPLANATION_LENGTH);
  if (missingExpl.length > 0) {
    console.log(`\n--- Missing/Short Explanations: ${missingExpl.length} ---`);
    missingExpl.slice(0, 5).forEach(({ label, q }) => {
      console.log(`  ${label}: "${(q.expl || '').slice(0, 50)}"`);
    });
  }

  // Weak metadata
  let noHint = allQs.filter(({ q }) => !q.hint || q.hint.trim().length === 0);
  let noTags = allQs.filter(({ q }) => !q.tags || !Array.isArray(q.tags) || q.tags.length === 0);
  let noBoss = 0;
  categories.forEach(cat => {
    for (let l = 1; l <= EXPECTED_LEVELS; l++) {
      if (!data[cat].some(q => q.lvl === l && q.boss)) noBoss++;
    }
  });
  console.log(`\n--- Metadata Coverage ---`);
  console.log(`  Missing hints: ${noHint.length}/${allQs.length}`);
  console.log(`  Missing tags: ${noTags.length}/${allQs.length}`);
  console.log(`  Missing boss markers: ${noBoss}/${EXPECTED_LEVELS * EXPECTED_CATEGORIES} level-category combos`);

  // Near-duplicates (questions sharing first 40 chars)
  const prefixMap = {};
  allQs.forEach(({ label, q }) => {
    const prefix = (q.q || '').trim().toLowerCase().slice(0, 40);
    if (!prefixMap[prefix]) prefixMap[prefix] = [];
    prefixMap[prefix].push(label);
  });
  const nearDupes = Object.entries(prefixMap).filter(([, locs]) => locs.length > 1);
  if (nearDupes.length > 0) {
    console.log(`\n--- Near-Duplicate Questions (same first 40 chars): ${nearDupes.length} ---`);
    nearDupes.slice(0, 5).forEach(([prefix, locs]) => {
      console.log(`  "${prefix}..." → ${locs.join(', ')}`);
    });
  }
}

// ==================== Summary ====================
console.log(`\n=== Question Set Validation ===`);
console.log(`File: ${file}`);
console.log(`Target questions per level: ${TARGET_QUESTIONS}`);
console.log(`Categories: ${categories.length}`);

let totalQ = 0;
categories.forEach(c => {
  const lvlCounts = {};
  data[c].forEach(q => { lvlCounts[q.lvl] = (lvlCounts[q.lvl] || 0) + 1; });
  totalQ += data[c].length;
  const lvlSummary = Array.from({length: EXPECTED_LEVELS}, (_, i) => `L${i+1}:${lvlCounts[i+1] || 0}`).join(' ');

  // Boss per level
  const bossByLvl = {};
  data[c].forEach(q => { if (q.boss) { bossByLvl[q.lvl] = (bossByLvl[q.lvl] || 0) + 1; } });
  const bossSummary = Array.from({length: EXPECTED_LEVELS}, (_, i) => `L${i+1}:${bossByLvl[i+1] || 0}B`).join(' ');

  console.log(`  ${c}: ${data[c].length} questions [${lvlSummary}] bosses [${bossSummary}]`);
});
console.log(`Total questions: ${totalQ}`);

// Global answer distribution
const globalDist = { 0: 0, 1: 0, 2: 0, 3: 0 };
categories.forEach(cat => {
  data[cat].forEach(q => {
    if (typeof q.a === 'number' && q.a >= 0 && q.a <= 3) globalDist[q.a]++;
  });
});
console.log(`Answer distribution: A=${globalDist[0]} B=${globalDist[1]} C=${globalDist[2]} D=${globalDist[3]}`);
const totalAnswers = Object.values(globalDist).reduce((a, b) => a + b, 0);
if (totalAnswers > 0) {
  console.log(`Answer percentages: A=${Math.round(globalDist[0]/totalAnswers*100)}% B=${Math.round(globalDist[1]/totalAnswers*100)}% C=${Math.round(globalDist[2]/totalAnswers*100)}% D=${Math.round(globalDist[3]/totalAnswers*100)}%`);
}

if (warnings.length > 0) {
  console.log(`\n--- Warnings (${warnings.length}) ---`);
  warnings.forEach(w => console.log(`  WARN: ${w}`));
}

if (errors.length > 0) {
  console.log(`\n--- Errors (${errors.length}) ---`);
  errors.forEach(e => console.log(`  FAIL: ${e}`));
  console.log(`\nRESULT: UNHEALTHY — ${errors.length} error(s) found. Fix before building.`);
  process.exit(1);
} else if (STRICT && warnings.length > 0) {
  console.log(`\nRESULT: UNHEALTHY (strict mode) — ${warnings.length} warning(s) treated as errors.`);
  process.exit(1);
} else {
  console.log(`\nRESULT: HEALTHY — all checks passed.${warnings.length > 0 ? ` (${warnings.length} warning(s))` : ''}`);
  process.exit(0);
}
