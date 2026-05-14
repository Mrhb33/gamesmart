#!/usr/bin/env node
/**
 * enrich_questions.js — Adds optional fields to existing questions:
 *   id, type, difficultyScore, tags, skill, boss, hint, explanationLong, locale
 *
 * Backward compatible: existing fields (q, opts, a, expl, lvl) are never modified.
 *
 * Usage: node enrich_questions.js [questions.json] [--write]
 *   --write  Overwrite the file. Without it, prints to stdout.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const fileArg = args.find(a => !a.startsWith('--'));
const shouldWrite = args.includes('--write');
const file = fileArg || path.join(__dirname, 'questions.json');

const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const SKILL_MAP = {
  science:  ['recall', 'application', 'analysis', 'synthesis', 'evaluation'],
  history:  ['recall', 'chronology', 'cause-effect', 'analysis', 'evaluation'],
  geography: ['recall', 'location', 'analysis', 'comparison', 'evaluation'],
  math:     ['computation', 'application', 'problem-solving', 'proof', 'evaluation'],
  language: ['grammar', 'vocabulary', 'comprehension', 'rhetoric', 'evaluation'],
  nature:   ['recall', 'identification', 'analysis', 'synthesis', 'evaluation'],
  culture:  ['recall', 'interpretation', 'analysis', 'comparison', 'evaluation'],
};

// Keyword-to-tag mapping for smart tag assignment
const TAG_KEYWORDS = {
  science: {
    'physics':        ['force','gravity','motion','energy','speed','velocity','mass','weight','acceleration','momentum','friction','newton','pressure','wave','sound','light','magnet','electric','voltage','current','circuit','ohm','watt','joule','lens','refraction','reflection','thermometer','temperature'],
    'chemistry':      ['element','atom','molecule','compound','reaction','acid','base','pH','periodic','ion','bond','oxidation','hydrogen','oxygen','carbon','nitrogen','helium','iron','copper','zinc','sodium','chlorine','gas','liquid','solid','matter','H2O','formula'],
    'biology':        ['cell','DNA','gene','protein','enzyme','mitosis','meiosis','organism','species','evolution','mutation','chromosome','nucleus','membrane','tissue','blood','heart','brain','lung','kidney','muscle','bone','nerve','hormone','virus','bacteria','immune','antibody','vaccine'],
    'astronomy':      ['planet','star','sun','moon','galaxy','orbit','solar','space','comet','asteroid','nebula','constellation','telescope','mars','jupiter','saturn','venus','mercury','neptune','uranus','pluto','earth','milky','universe','black hole','supernova'],
    'ecology':        ['ecosystem','habitat','food chain','predator','prey','endangered','conservation','pollution','recycle','biome','rainforest','desert','coral','reef','biodiversity','deforestation','carbon','climate','global warming'],
    'earth-science':  ['earthquake','volcano','tectonic','mineral','rock','fossil','erosion','sediment','crust','mantle','core','geyser','tsunami','landslide','plate','continental','magma','lava'],
    'anatomy':        ['heart','brain','lung','liver','kidney','stomach','intestine','spine','rib','skull','joint','ligament','tendon','artery','vein','blood'],
    'botany':         ['plant','flower','leaf','root','stem','seed','photosynthesis','pollen','nectar','petal','tree','shrub','moss','fern','algae','fungi'],
  },
  history: {
    'ancient':        ['ancient','egypt','pharaoh','pyramid','mesopotamia','greece','roman','rome','sparta','athens','byzantine','persian','babylon','sumer'],
    'medieval':       ['medieval','knight','castle','crusade','feudal','viking','mongol','charlemagne','plague','black death','catholic','pope','monastery'],
    'modern':         ['world war','revolution','independence','colonial','empire','democracy','republic','treaty','congress','parliament','president','atomic','cold war','nazi','holocaust'],
    'exploration':    ['discover','voyage','expedition','sail','columbus','magellan','explorer','navigate','colony','trade route','spice','silk'],
    'civilization':   ['civilization','dynasty','kingdom','emperor','throne','reign','conquest','empire','golden age','renaissance','enlightenment'],
    'politics':       ['treaty','alliance','war','battle','victory','defeat','surrender','armistice','ceasefire','conquest','invasion'],
    'invention':      ['invent','discover','breakthrough','first','pioneer','patent','innovation'],
  },
  geography: {
    'countries':      ['country','nation','border','capital','population','flag','independence'],
    'capitals':       ['capital'],
    'rivers':         ['river','stream','delta','estuary','flood','dam','waterfall','nile','amazon','mississippi'],
    'mountains':      ['mountain','peak','summit','ridge','volcano','everest','alps','himalaya','andes'],
    'oceans':         ['ocean','sea','pacific','atlantic','indian','arctic','gulf','bay','strait'],
    'climate':        ['climate','weather','rainfall','temperature','tropical','arid','temperate','monsoon','drought','hurricane'],
    'continents':     ['continent','africa','asia','europe','america','australia','antarctica'],
    'natural-wonders':['canyon','waterfall','glacier','desert','rainforest','reef','island','archipelago'],
    'maps':           ['latitude','longitude','equator','hemisphere','meridian','coordinate','globe','atlas','projection'],
  },
  math: {
    'arithmetic':     ['add','subtract','multiply','divide','sum','product','difference','quotient','fraction','decimal','percentage','ratio'],
    'algebra':        ['equation','variable','solve','expression','polynomial','factor','coefficient','linear','quadratic','x=','inequality'],
    'geometry':       ['triangle','circle','square','rectangle','angle','perimeter','area','volume','polygon','diameter','radius','cube','sphere','cylinder','cone','pi'],
    'statistics':     ['average','mean','median','mode','probability','data','graph','chart','percent','frequency','standard deviation'],
    'measurement':    ['measure','length','width','height','meter','kilogram','liter','mile','kilometer','inch','foot','yard','weight','convert'],
    'number-theory':  ['prime','divisible','factor','multiple','integer','whole number','natural number','even','odd','greatest common','least common'],
    'patterns':       ['pattern','sequence','series','fibonacci','arithmetic sequence','geometric sequence'],
  },
  language: {
    'grammar':        ['verb','noun','adjective','adverb','pronoun','preposition','conjunction','tense','subject','object','clause','sentence','phrase'],
    'vocabulary':     ['word','meaning','synonym','antonym','definition','prefix','suffix','root'],
    'spelling':       ['spell','letter','alphabet','silent','double'],
    'etymology':      ['origin','latin','greek','root','borrowed','derived'],
    'punctuation':    ['comma','period','exclamation','question mark','semicolon','colon','apostrophe','quotation','hyphen','dash'],
    'literature':     ['poem','novel','story','author','character','plot','theme','metaphor','simile','narrative','fiction','genre'],
    'figurative-language': ['metaphor','simile','idiom','hyperbole','personification','alliteration','onomatopoeia'],
  },
  nature: {
    'animals':        ['animal','mammal','reptile','bird','fish','insect','predator','prey','nocturnal','hibernate','migrate','endangered'],
    'plants':         ['plant','tree','flower','leaf','root','seed','fruit','vegetable','shrub','vine','moss','fern','algae'],
    'ecosystems':     ['ecosystem','habitat','biome','food chain','food web','symbiosis','parasite','decomposer','producer','consumer'],
    'weather':        ['weather','rain','snow','storm','thunder','lightning','wind','cloud','tornado','hurricane','fog','humidity','barometer'],
    'marine':         ['ocean','coral','whale','dolphin','shark','jellyfish','sea','reef','tide','current'],
    'conservation':   ['endangered','extinct','conservation','recycle','pollution','deforestation','poaching','habitat loss'],
    'adaptation':     ['adapt','camouflage','mimicry','evolution','survival','mutation','natural selection'],
    'biodiversity':   ['species','diversity','variety','biodiversity','ecosystem','population'],
  },
  culture: {
    'art':            ['painting','sculpture','artist','museum','gallery','canvas','portrait','abstract','masterpiece','monet','picasso'],
    'music':          ['music','song','instrument','composer','symphony','orchestra','melody','rhythm','genre','band','opera','beethoven','mozart'],
    'literature':     ['book','novel','author','poet','poem','writer','literature','fiction','story','playwright','shakespeare'],
    'film':           ['movie','film','director','actor','actress','oscar','cinema','hollywood','animation','documentary'],
    'traditions':     ['tradition','festival','celebration','ceremony','ritual','custom','holiday','carnival','cultural'],
    'cuisine':        ['food','dish','cuisine','recipe','cook','ingredient','delicacy','spice','meal','dessert'],
    'architecture':   ['building','architecture','monument','temple','cathedral','mosque','palace','tower','bridge','skyscraper'],
    'sports':         ['sport','game','olympic','team','player','championship','tournament','athlete','stadium'],
  },
};

function smartTags(cat, question) {
  const text = `${question.q} ${question.opts.join(' ')} ${question.expl}`.toLowerCase();
  const catKeywords = TAG_KEYWORDS[cat];
  if (!catKeywords) return ['general'];

  const tagScores = {};
  for (const [tag, keywords] of Object.entries(catKeywords)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) score++;
    }
    if (score > 0) tagScores[tag] = score;
  }

  const sorted = Object.entries(tagScores).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    // Fallback: use generic tag to maintain diversity
    return ['general'];
  }
  return sorted.slice(0, Math.min(3, sorted.length)).map(([tag]) => tag);
}

function generateHint(q) {
  const expl = q.expl || '';
  if (!expl || expl.length < 3) return '';

  const correctAnswer = (q.opts && q.opts[q.a]) ? q.opts[q.a].toLowerCase() : '';
  const allOptions = (q.opts || []).map(o => o.toLowerCase());
  const questionText = (q.q || '').toLowerCase();

  // 1. Try partial explanation — censor the answer
  if (expl.length > 10) {
    let censored = expl;
    // Remove any option text from explanation, replace with "___"
    allOptions.forEach(opt => {
      if (opt.length > 2) {
        censored = censored.replace(new RegExp('\\b' + opt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi'), '___');
      }
    });
    if (censored !== expl) {
      return censored.trim() + (censored.endsWith('.') ? '' : '.');
    }
  }

  // 2. Build from question context
  // Extract key topic words (nouns/verbs) from the question that aren't options
  const stopWords = new Set(['what','who','where','when','how','which','why','is','are','was','were','the','a','an','of','in','on','at','to','for','with','by','from','do','does','did','this','that','it','its','known','called','named','made','used']);
  const qWords = questionText.split(/\s+/).filter(w => {
    const clean = w.replace(/[^a-z0-9]/g, '');
    return clean.length > 2 && !stopWords.has(clean) && !allOptions.includes(clean);
  });

  if (qWords.length > 0) {
    return `Think about: ${qWords.slice(0, 4).join(', ')}.`;
  }

  return 'Eliminate the options you know are wrong first.';
}

let globalId = 0;
const allQuestionTexts = new Map();

Object.entries(data).forEach(([cat, questions]) => {
  const skills = SKILL_MAP[cat] || SKILL_MAP.science;
  const levelCounters = {};

  questions.forEach((q, i) => {
    globalId++;
    const lvl = q.lvl || 1;
    levelCounters[lvl] = (levelCounters[lvl] || 0) + 1;

    if (!q.id) q.id = `${cat}_${String(lvl).padStart(1, '0')}_${String(levelCounters[lvl]).padStart(3, '0')}`;
    q.type = 'multiple-choice';
    if (!q.difficultyScore) q.difficultyScore = Math.min(100, Math.max(10, lvl * 20 - 10 + (i % 15)));
    if (!q.tags || !Array.isArray(q.tags) || q.tags.length === 0) q.tags = smartTags(cat, q);
    if (!q.skill) q.skill = skills[Math.min(lvl - 1, skills.length - 1)];
    if (!q.hint) { q.hint = generateHint(q); }
    if (!q.explanationLong) q.explanationLong = q.expl
      ? q.expl + (q.expl.endsWith('.') ? '' : '.') + ` This concept is part of ${cat} at the ${['introductory','intermediate','advanced','expert','mastery'][lvl-1]} level.`
      : 'No explanation available.';
    if (!q.locale || typeof q.locale !== 'object') delete q.locale;

    const key = q.q.trim().toLowerCase();
    if (!allQuestionTexts.has(key)) allQuestionTexts.set(key, []);
    allQuestionTexts.get(key).push(`${cat}[${i}]`);
  });

  // Mark boss questions: last in each level
  const byLevel = {};
  questions.forEach((q, i) => {
    if (!byLevel[q.lvl]) byLevel[q.lvl] = [];
    byLevel[q.lvl].push(i);
  });
  Object.entries(byLevel).forEach(([lvl, indices]) => {
    questions[indices[indices.length - 1]].boss = true;
  });
});

const output = JSON.stringify(data, null, 2);

if (shouldWrite) {
  fs.writeFileSync(file, output, 'utf8');
  console.log(`Enriched ${globalId} questions written to ${file}`);
} else {
  process.stdout.write(output);
}

const dupes = [...allQuestionTexts.entries()].filter(([, locs]) => locs.length > 1);
if (dupes.length > 0) {
  console.error(`\nWarning: ${dupes.length} cross-category duplicate(s) found:`);
  dupes.slice(0, 10).forEach(([text, locs]) => console.error(`  "${text.slice(0, 60)}..." -> ${locs.join(', ')}`));
}
