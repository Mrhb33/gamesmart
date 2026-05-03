#!/usr/bin/env node
/**
 * gen_questions.js — Generates questions.json from the old inline format.
 * Reads question data from main.html's embedded QUESTIONS object,
 * transforms it, and writes to questions.json.
 *
 * Usage: node gen_questions.js [--input main.html] [--output questions.json]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function getArg(flag, def) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return path.resolve(args[idx + 1]);
  return def;
}

const inputFile  = getArg('--input',  path.join(__dirname, 'main.html'));
const outputFile = getArg('--output', path.join(__dirname, 'questions.json'));

if (!fs.existsSync(inputFile)) {
  console.error(`Input file not found: ${inputFile}`);
  process.exit(1);
}

let html = fs.readFileSync(inputFile, 'utf8');
let qStart = html.indexOf('const QUESTIONS = {');
let qEnd = html.indexOf('const CATEGORY_META = {');
if (qStart === -1 || qEnd === -1) {
  console.error('Could not find QUESTIONS or CATEGORY_META markers in input file.');
  process.exit(1);
}
let qStr = html.substring(qStart, qEnd).replace('const QUESTIONS =', 'var EXPORT_QS =');

// Evaluate in isolated scope
let EXPORT_QS;
try {
  eval(qStr);
} catch (e) {
  console.error('Failed to parse QUESTIONS from input:', e.message);
  process.exit(1);
}

const newQs = {
  language: { q: "What is a 'hapax legomenon'?", opts: ["A word that appears only once in a text or corpus", "A grammatical error", "A type of ancient poetry", "A lost language"], a: 0, expl: "It's a word that occurs only once within a context, either in the written record of an entire language, in the works of an author, or in a single text.", lvl: 5 },
  nature: { q: "Which animal has the fastest punch in the animal kingdom?", opts: ["Mantis shrimp", "Kangaroo", "Pistol shrimp", "Boxer crab"], a: 0, expl: "The mantis shrimp can strike at 80 km/h (50 mph) underwater, generating a cavitation bubble that reaches temperatures nearly as hot as the surface of the sun.", lvl: 5 },
  history: { q: "In what year did the Battle of Thermopylae take place?", opts: ["480 BC", "300 BC", "490 BC", "431 BC"], a: 0, expl: "Fought in 480 BC, this battle saw King Leonidas and 300 Spartans (along with other Greeks) delay the massive Persian army of Xerxes I.", lvl: 5 },
  geography: { q: "What is the primary cause of Earth's seasons?", opts: ["Axial tilt", "Distance from the Sun", "Ocean currents", "Solar flares"], a: 0, expl: "Earth's 23.5-degree axial tilt means different hemispheres receive more direct sunlight at different times of the year. Distance from the sun has little effect.", lvl: 5 }
};

Object.keys(EXPORT_QS).forEach(cat => {
  let arr = EXPORT_QS[cat];
  const weight = { 'easy': 1, 'medium': 2, 'hard': 3 };
  arr.sort((a, b) => weight[a.difficulty] - weight[b.difficulty]);
  let newArr = [];
  for (let i = 0; i < 15; i++) {
    let q = arr[i];
    let lvl = Math.floor(i / 3) + 1;
    newArr.push({
      q: q.q,
      opts: q.options,
      a: q.answer,
      expl: q.explanation,
      lvl: lvl
    });
  }
  if (newQs[cat]) newArr[14] = newQs[cat];
  EXPORT_QS[cat] = newArr;
});

fs.writeFileSync(outputFile, JSON.stringify(EXPORT_QS, null, 2), 'utf8');
console.log(`Generated: ${outputFile}`);
