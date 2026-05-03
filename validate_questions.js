#!/usr/bin/env node
/**
 * validate_questions.js — Validates the Cerebrum Quest question set.
 *
 * Checks:
 *   1. Every question has required fields: q, opts, a, expl, lvl
 *   2. opts has exactly 4 non-empty answers
 *   3. a is an integer 0–3 and points to the correct answer
 *   4. No category/level has all correct answers in the same position
 *   5. Answer positions are reasonably balanced across A/B/C/D
 *   6. No duplicated questions in the same category
 *   7. Questions are mobile-friendly (not too long, not empty)
 *
 * Usage:  node validate_questions.js [questions.json]
 * Exit code 1 if unhealthy, 0 if OK.
 */

const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, 'questions.json');

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

  const seen = new Set();

  arr.forEach((q, i) => {
    const label = `${cat}[${i}]`;

    // 1. Required fields
    for (const field of ['q', 'opts', 'a', 'expl', 'lvl']) {
      if (q[field] === undefined || q[field] === null) {
        errors.push(`${label}: missing field "${field}"`);
      }
    }

    // 7. Question text checks
    if (typeof q.q === 'string') {
      if (q.q.trim().length === 0) {
        errors.push(`${label}: empty question text`);
      } else if (q.q.length > 200) {
        warnings.push(`${label}: question text is ${q.q.length} chars (over 200, may be hard to read on mobile)`);
      }
    }

    // 2. opts: exactly 4 non-empty
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
    }

    // 3. a is integer 0–3
    if (typeof q.a !== 'number' || !Number.isInteger(q.a) || q.a < 0 || q.a > 3) {
      errors.push(`${label}: answer index "a" is ${q.a}, expected 0–3`);
    }

    // 1. lvl check
    if (typeof q.lvl !== 'number' || !Number.isInteger(q.lvl) || q.lvl < 1 || q.lvl > 5) {
      errors.push(`${label}: level "lvl" is ${q.lvl}, expected 1–5`);
    }

    // 6. Duplicate detection
    const qText = (typeof q.q === 'string') ? q.q.trim().toLowerCase() : '';
    if (seen.has(qText)) {
      errors.push(`${label}: duplicate question "${q.q.slice(0, 60)}..."`);
    }
    seen.add(qText);
  });

  // 4. Check per-category answer position diversity
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

  // 5. Balance check — warn if one position has >60% of answers
  const total = arr.length;
  for (const [pos, count] of Object.entries(posCounts)) {
    if (count > total * 0.6) {
      warnings.push(`${cat}: position ${pos} has ${count}/${total} answers (${Math.round(count / total * 100)}%) — unbalanced`);
    }
  }

  // Also check per-level
  const levels = {};
  arr.forEach(q => {
    if (!levels[q.lvl]) levels[q.lvl] = [];
    levels[q.lvl].push(q.a);
  });
  Object.entries(levels).forEach(([lvl, answers]) => {
    const unique = new Set(answers);
    if (answers.length >= 3 && unique.size === 1) {
      errors.push(`${cat} level ${lvl}: all ${answers.length} answers at position ${answers[0]}`);
    }
  });
});

// Summary
console.log(`\n=== Question Set Validation ===`);
console.log(`File: ${file}`);
console.log(`Categories: ${categories.length}`);
let totalQ = 0;
categories.forEach(c => {
  totalQ += data[c].length;
  console.log(`  ${c}: ${data[c].length} questions`);
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

if (warnings.length > 0) {
  console.log(`\n--- Warnings (${warnings.length}) ---`);
  warnings.forEach(w => console.log(`  WARN: ${w}`));
}

if (errors.length > 0) {
  console.log(`\n--- Errors (${errors.length}) ---`);
  errors.forEach(e => console.log(`  FAIL: ${e}`));
  console.log(`\nRESULT: UNHEALTHY — ${errors.length} error(s) found. Fix before building.`);
  process.exit(1);
} else {
  console.log(`\nRESULT: HEALTHY — all checks passed.`);
  process.exit(0);
}
