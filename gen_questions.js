const fs = require('fs');
let html = fs.readFileSync('c:/smartgame/main.html', 'utf8');
let qStart = html.indexOf('const QUESTIONS = {');
let qEnd = html.indexOf('const CATEGORY_META = {');
let qStr = html.substring(qStart, qEnd).replace('const QUESTIONS =', 'var EXPORT_QS =');
eval(qStr);

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

fs.writeFileSync('c:/smartgame/questions.json', JSON.stringify(EXPORT_QS, null, 2));