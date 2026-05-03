const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'questions_expanded.json');
const outPath = path.join(__dirname, 'questions.json');

let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Fisher-Yates shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Calculate proxy for difficulty
function calcDiff(q) {
  const optsLen = q.opts.reduce((sum, opt) => sum + opt.length, 0) / q.opts.length;
  return q.q.length + optsLen + (q.expl ? q.expl.length : 0);
}

const outData = {};

Object.keys(data).forEach(cat => {
  const qList = data[cat];
  const levels = {};
  
  // Group by level
  qList.forEach(q => {
    if (!levels[q.lvl]) levels[q.lvl] = [];
    
    // Fix 'a' index: we know 'a' is 0 in expanded data, so the correct answer is opts[0].
    const correctText = q.opts[0];
    
    // Shuffle options
    let newOpts = [...q.opts];
    shuffleArray(newOpts);
    
    // Update a
    const newA = newOpts.indexOf(correctText);
    
    levels[q.lvl].push({
      ...q,
      opts: newOpts,
      a: newA,
      _diff: calcDiff(q)
    });
  });
  
  outData[cat] = [];
  
  Object.keys(levels).forEach(lvl => {
    let lQs = levels[lvl];
    // Sort by difficulty proxy
    lQs.sort((a, b) => a._diff - b._diff);
    
    // If not exactly 10 questions, just push them as is or roughly mapped.
    if (lQs.length === 10) {
      const reordered = [
        lQs[0], // 0: Warm-up
        lQs[2], // 1: Confidence
        lQs[5], // 2: Challenge
        lQs[7], // 3: Peak
        lQs[1], // 4: Recovery
        lQs[3], // 5: Confidence
        lQs[6], // 6: Challenge
        lQs[8], // 7: Peak
        lQs[4], // 8: Recovery
        lQs[9]  // 9: Boss
      ];
      reordered.forEach(q => delete q._diff);
      outData[cat].push(...reordered);
    } else {
      lQs.forEach(q => delete q._diff);
      outData[cat].push(...lQs);
    }
  });
});

fs.writeFileSync(outPath, JSON.stringify(outData, null, 2), 'utf8');
console.log('Successfully generated questions.json with shuffled options and oscillating difficulty curve.');
