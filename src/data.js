const AVATARS = [
  { id: 'A', icon: 'fa-user', cost: 0 }, { id: 'B', icon: 'fa-robot', cost: 100 }, { id: 'C', icon: 'fa-dragon', cost: 250 }, { id: 'D', icon: 'fa-ghost', cost: 500 }
];

let _shopCat = 'avatar';
function switchShopCat(cat) {
  _shopCat = cat;
  if(window.sfxK) sfxK();
  if(window.vibe) vibe(15);
  document.querySelectorAll('#shopTabs .coll-tab').forEach(b => b.classList.toggle('active', b.dataset.shopcat === cat));
  renderShop();
}
function renderShop() {
  if (D.shopCoins) D.shopCoins.textContent = S.coins;
  if (!D.shopGrid) return;
  D.shopGrid.innerHTML = '';
  let items = SHOP_ITEMS.filter(i => i.cat === _shopCat);
  if (S.coins < 50 && !items.some(i => S.unlockedShopItems.includes(i.id) && i.cost > 0)) {
    let tip = document.createElement('div');
    tip.style.cssText = 'grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--muted);';
    tip.innerHTML = '<i class="fas fa-coins" style="font-size:32px;display:block;margin-bottom:12px;color:#eab308;"></i>' + t('shop.earnCrowns');
    D.shopGrid.appendChild(tip);
  }
  items.forEach(item => {
    let isOwned = S.unlockedShopItems.includes(item.id);
    let isEquipped = false;
    if (item.cat === 'avatar' && item.subId) isEquipped = S.avatar === item.subId;
    else if (item.cat === 'frame') isEquipped = S.equippedFrame === item.id;
    else if (item.cat === 'title') isEquipped = S.equippedTitle === item.id;
    else if (item.cat === 'theme') isEquipped = S.equippedTheme === item.id;

    let card = document.createElement('div'); card.className = 'category-card shop-card';
    let iconDiv = document.createElement('div'); iconDiv.className = 'cat-icon';
    iconDiv.innerHTML = `<i class="fas ${item.icon}"></i>`;
    let nameDiv = document.createElement('div'); nameDiv.className = 'cat-name';
    nameDiv.textContent = shopName(item.id);
    let btnWrap = document.createElement('div'); btnWrap.style.marginTop = '12px';

    let btn = document.createElement('button');
    if (isOwned) {
      if (isEquipped) {
        btn.className = 'btn btn-gold btn-sm disabled'; btn.disabled = true;
        btn.textContent = t('shop.equipped');
      } else {
        btn.className = 'btn btn-ghost btn-sm';
        btn.textContent = t('shop.equip');
        btn.addEventListener('click', () => equipShopItem(item.id, item.cat, item.subId));
      }
    } else {
      btn.className = 'btn btn-gold btn-sm';
      btn.innerHTML = `<i class="fas fa-coins"></i> ${item.cost}`;
      btn.addEventListener('click', () => buyShopItem(item.id, item.cost));
    }
    btnWrap.appendChild(btn);
    card.appendChild(iconDiv); card.appendChild(nameDiv); card.appendChild(btnWrap);
    D.shopGrid.appendChild(card);
  });
}
function buyShopItem(id, cost) {
  if (S.coins >= cost) {
    S.coins -= cost;
    if (!S.unlockedShopItems.includes(id)) S.unlockedShopItems.push(id);
    // Also update legacy avatar tracking
    let item = SHOP_ITEMS.find(i => i.id === id);
    if (item && item.cat === 'avatar' && item.subId && !S.unlockedAvatars.includes(item.subId)) S.unlockedAvatars.push(item.subId);
    saveState(); renderShop(); sfxC();
    trackEvent('shop_bought', { id, cost });
  } else { vibe(200); sfxW(); showToast(t('toast.notEnoughCrowns')); }
}
function equipShopItem(id, cat, subId) {
  if (cat === 'avatar' && subId) { S.avatar = subId; updateAvatars(); }
  else if (cat === 'frame') S.equippedFrame = id;
  else if (cat === 'title') S.equippedTitle = id;
  else if (cat === 'theme') { S.equippedTheme = id; applyTheme(id); }
  saveState(); renderShop(); sfxK();
}
function updateAvatars() {
  let avatarId = S.avatar || 'A';
  let a = AVATARS.find(x => x.id === avatarId);
  let hubA = D.hubAvatar, profA = D.profileBigAvatar;
  if (a) {
    let i = '<i class="fas ' + a.icon + '" style="font-size:inherit;color:inherit;"></i>';
    if (hubA) hubA.innerHTML = i; if (profA) profA.innerHTML = i;
  } else {
    let init = (S.playerName || 'E').charAt(0).toUpperCase();
    if (hubA) hubA.textContent = init; if (profA) profA.textContent = init;
  }
}


let QUESTIONS = {};
let LEVELS_METADATA = {};
let _qReady = false;
async function loadQuestions() {
  try {
    const [rQ, rM] = await Promise.all([
      fetch("./questions.json"),
      fetch("./levels_metadata.json")
    ]);
    if (!rQ.ok) throw new Error("HTTP " + rQ.status);
    if (!rM.ok) throw new Error("HTTP " + rM.status);

    let dataQ = await rQ.json();
    let dataM = await rM.json();

    if (!dataQ || typeof dataQ !== 'object' || Array.isArray(dataQ)) throw new Error("Invalid question format");
    QUESTIONS = dataQ;
    LEVELS_METADATA = dataM;
    _qReady = true;

    // Detect stale cached data
    let servedFromCache = rQ.headers.get('X-Served-From-Cache') === 'true';
    if (servedFromCache && !navigator.onLine) {
      console.info('[Cerebrum] Serving cached question data (offline)');
      trackEvent('stale_data_served', { online: false });
    }

    return true;
  } catch (e) {
    console.error("Failed to load questions:", e);
    showToast(t('toast.questionsFailed'));
    let el = D.categoryGrid;
    if (el) el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);grid-column:1/-1;"><i class="fas fa-exclamation-triangle" style="font-size:32px;display:block;margin-bottom:12px;color:var(--accent);"></i>' + t('misc.couldNotLoad') + '</div>';
    return false;
  }
}

function requireQuestions() {
  if (!_qReady) { showToast(t('toast.questionsLoading')); return false; }
  return true;
}

const CATEGORY_META = {
  science: { name: "Science", icon: "fa-flask", desc: "Physics, chemistry, biology & the universe", color: "var(--science)" },
  history: { name: "History", icon: "fa-landmark", desc: "Civilizations, wars & humanity", color: "var(--history)" },
  geography: { name: "Geography", icon: "fa-earth-americas", desc: "Countries, oceans & the world", color: "var(--geography)" },
  math: { name: "Mathematics", icon: "fa-square-root-variable", desc: "Numbers, patterns & logic", color: "var(--math)" },
  language: { name: "Language", icon: "fa-language", desc: "Words, grammar & communication", color: "var(--language)" },
  nature: { name: "Nature", icon: "fa-leaf", desc: "Animals, ecosystems & living world", color: "var(--nature)" },
  culture: { name: "Culture", icon: "fa-masks-theater", desc: "Art, traditions & human creativity", color: "var(--culture)" }
};

const LVL_NAMES = ["Apprentice", "Explorer", "Journeyman", "Adept", "Master"];
const PLAYER_RANKS = [
  { minLvl: 1, name: "Novice" },
  { minLvl: 5, name: "Scholar" },
  { minLvl: 10, name: "Sage" },
  { minLvl: 15, name: "Polymath" },
  { minLvl: 20, name: "Mastermind" },
  { minLvl: 25, name: "Luminary" },
  { minLvl: 30, name: "Legend" }
];
const XP_MAP = { 1: 15, 2: 25, 3: 40, 4: 60, 5: 90 };
const TIMER_DUR = { 1: 30, 2: 25, 3: 20, 4: 15, 5: 12 };
const COMBO_TIERS = [
  { streak: 3, label: 'Combo', mult: 1.15, color: 'var(--accent3)', icon: 'fa-fire' },
  { streak: 5, label: 'Great Combo', mult: 1.4, color: 'var(--accent)', icon: 'fa-fire-flame-curved' },
  { streak: 7, label: 'Super Combo', mult: 1.75, color: '#f97316', icon: 'fa-fire-flame-curved' },
  { streak: 10, label: 'Mega Combo', mult: 2.0, color: '#ef4444', icon: 'fa-meteor' },
];

const DAILY_STREAK_MILESTONES = [
  { days:3, label:'Dedicated', icon:'fa-fire', color:'#f59e0b' },
  { days:7, label:'Devoted', icon:'fa-fire-flame-curved', color:'#f97316' },
  { days:14, label:'Unstoppable', icon:'fa-meteor', color:'#ef4444' },
  { days:30, label:'Legendary', icon:'fa-crown', color:'#a855f7' },
];
const MISSION_TEMPLATES = {
  easy: [
    { id:'answer_20', i18nKey:'mission.answer_20.desc', icon:'fa-circle-question', targetFn:()=>20, reward:{xp:50,coins:30} },
    { id:'stages_2', i18nKey:'mission.stages_2.desc', icon:'fa-flag-checkered', targetFn:()=>2, reward:{xp:60,coins:25} },
    { id:'correct_15', i18nKey:'mission.correct_15.desc', icon:'fa-check', targetFn:()=>15, reward:{xp:50,coins:30} },
  ],
  medium: [
    { id:'stages_3', i18nKey:'mission.stages_3.desc', icon:'fa-flag-checkered', targetFn:()=>3, reward:{xp:100,coins:50} },
    { id:'science_1', i18nKey:'mission.science_1.desc', icon:'fa-flask', targetFn:()=>1, reward:{xp:80,coins:40} },
    { id:'streak_5', i18nKey:'mission.streak_5.desc', icon:'fa-fire', targetFn:()=>5, reward:{xp:100,coins:50} },
    { id:'no_ll_1', i18nKey:'mission.no_ll_1.desc', icon:'fa-hand-sparkles', targetFn:()=>1, reward:{xp:90,coins:45} },
  ],
  hard: [
    { id:'daily_done', i18nKey:'mission.daily_done.desc', icon:'fa-calendar-check', targetFn:()=>1, reward:{xp:120,coins:60} },
    { id:'streak_8', i18nKey:'mission.streak_8.desc', icon:'fa-fire-flame-curved', targetFn:()=>8, reward:{xp:150,coins:70} },
    { id:'wrong_review', i18nKey:'mission.wrong_review.desc', icon:'fa-book-open', targetFn:()=>3, reward:{xp:100,coins:50} },
    { id:'stages_5', i18nKey:'mission.stages_5.desc', icon:'fa-trophy', targetFn:()=>5, reward:{xp:200,coins:100} },
  ]
};
const WEEKLY_GOAL_TARGET = 5;
const WEEKLY_REWARD = { coins: 200, xp: 300 };
const COMEBACK_THRESHOLD_DAYS = 2;

Object.keys(CATEGORY_META).forEach(c => {
  S.categoryData[c] = { levelData: Array.from({ length: 5 }, () => ({ stars: 0, completed: false })) };
});

// Load saved state AFTER constants are defined
loadState();

const ACHIEVEMENTS = [
  // Bronze → Common
  { id: "first_step", name: "First Step", desc: "Complete your first trial", icon: "fa-shoe-prints", tier: "Bronze", rarity: "Common", reward: { coins: 50 }, check: s => s.levelsCleared >= 1 },
  { id: "curious_mind", name: "Curious Mind", desc: "Explore 3 different realms", icon: "fa-magnifying-glass", tier: "Bronze", rarity: "Common", reward: { coins: 50 }, check: s => Object.values(s.categoryData).filter(c => c.levelData[0].completed || c.levelData[0].stars > 0).length >= 3 },
  { id: "scholar", name: "Scholar", desc: "Earn 500 total XP", icon: "fa-graduation-cap", tier: "Bronze", rarity: "Common", reward: { coins: 50 }, check: s => s.totalXP >= 500 },
  { id: "veteran", name: "Veteran", desc: "Clear 10 trials", icon: "fa-medal", tier: "Bronze", rarity: "Common", reward: { coins: 50 }, check: s => s.levelsCleared >= 10 },
  { id: "encyclopedia", name: "Encyclopedia", desc: "Answer 100 questions total", icon: "fa-book", tier: "Bronze", rarity: "Common", reward: { coins: 50 }, check: s => s.totalAnswered >= 100 },
  // Silver → Rare
  { id: "streak_5", name: "On Fire", desc: "Get a 5-answer streak", icon: "fa-fire", tier: "Silver", rarity: "Rare", reward: { coins: 100 }, check: s => s.bestStreak >= 5 },
  { id: "speed_demon", name: "Speed Demon", desc: "Answer in under 3 seconds", icon: "fa-bolt", tier: "Silver", rarity: "Rare", reward: { coins: 100 }, check: s => s.fastAnswer >= 1 },
  { id: "level5", name: "The Summit", desc: "Complete any Boss Trial (Stage 5)", icon: "fa-mountain", tier: "Silver", rarity: "Rare", reward: { coins: 100 }, check: s => s.lvl5Cleared >= 1 },
  { id: "polymath", name: "Polymath", desc: "Explore all 7 realms", icon: "fa-brain", tier: "Silver", rarity: "Rare", reward: { coins: 100 }, check: s => Object.values(s.categoryData).filter(c => c.levelData[0].completed || c.levelData[0].stars > 0).length >= 7 },
  { id: "survivor", name: "Survivor", desc: "Answer a Stage 4+ question correctly", icon: "fa-shield-halved", tier: "Silver", rarity: "Rare", reward: { coins: 100 }, check: s => s.hardCorrect >= 1 },
  { id: "pure_skill", name: "Pure Skill", desc: "Clear a trial without using lifelines", icon: "fa-hand-sparkles", tier: "Silver", rarity: "Rare", reward: { coins: 100 }, check: s => s.levelsCleared >= 1 && s._justClearedNoLifelines },
  // Gold → Epic
  { id: "perfect", name: "Perfectionist", desc: "Score 3 sigils on any trial", icon: "fa-crown", tier: "Gold", rarity: "Epic", reward: { coins: 250 }, check: s => s.tripleStars >= 1 },
  { id: "streak_10", name: "Unstoppable", desc: "Get a 10-answer streak", icon: "fa-meteor", tier: "Gold", rarity: "Epic", reward: { coins: 250 }, check: s => s.bestStreak >= 10 },
  { id: "mastery", name: "Realm Master", desc: "Complete all 5 trials in one realm", icon: "fa-gem", tier: "Gold", rarity: "Epic", reward: { coins: 250 }, check: s => s.realmsMastered >= 1 },
  { id: "mastermind", name: "Mastermind", desc: "Earn 2000 total XP", icon: "fa-chess-knight", tier: "Gold", rarity: "Epic", reward: { coins: 250 }, check: s => s.totalXP >= 2000 },
  { id: "daily_habit", name: "Daily Devotion", desc: "Get a 3-day daily streak", icon: "fa-calendar-check", tier: "Gold", rarity: "Epic", reward: { coins: 250 }, check: s => s.dailyStreak >= 3 },
  // Platinum / Legendary → Legendary / Mythic
  { id: "all_realms", name: "Grand Master", desc: "Complete all 35 trials", icon: "fa-globe", tier: "Legendary", rarity: "Mythic", reward: { coins: 1000 }, check: s => s.levelsCleared >= 35 },
  { id: "perfect_realm", name: "Flawless Realm", desc: "Score 3 sigils on all 5 trials in a realm", icon: "fa-star", tier: "Platinum", rarity: "Legendary", reward: { coins: 500 }, check: s => Object.values(s.categoryData).some(c => c.levelData.filter(l => l.stars === 3).length === 5) },
  // Secret → Mythic
  { id: "comeback", name: "The Comeback", desc: "???", hiddenDesc: "Fail a trial, study the answers, then immediately pass it.", icon: "fa-rotate-left", tier: "Secret", rarity: "Mythic", hidden: true, reward: { coins: 300 }, check: s => s._justDidComeback },
  { id: "secret_perfect", name: "Hidden Genius", desc: "???", hiddenDesc: "Get a Perfect Run (100%) on any Boss Trial.", icon: "fa-user-secret", tier: "Secret", rarity: "Mythic", hidden: true, reward: { coins: 500 }, check: s => s._justPerfectedLevel5 }
];

const RARITY_STYLES = {
  Common:    { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.3)', glow: '' },
  Rare:      { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', glow: '0 0 12px rgba(59,130,246,0.2)' },
  Epic:      { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)', glow: '0 0 16px rgba(168,85,247,0.25)' },
  Legendary: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.40)', glow: '0 0 20px rgba(245,158,11,0.3)' },
  Mythic:    { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.45)', glow: '0 0 24px rgba(239,68,68,0.35)' }
};

const RELIC_ITEMS = [
  // Science
  { id:'science_1', realm:'science', name:'Atom Core', icon:'fa-atom', rarity:'Common', desc:'Harness the fundamental building blocks of matter.', shardsNeeded:3, unlockRule:{type:'clear_stage',minStage:1} },
  { id:'science_2', realm:'science', name:'Quantum Lens', icon:'fa-microscope', rarity:'Rare', desc:'See beyond the visible spectrum into quantum realms.', shardsNeeded:5, unlockRule:{type:'stars',minStars:6} },
  { id:'science_3', realm:'science', name:'Star Compass', icon:'fa-compass', rarity:'Legendary', desc:'Navigate by starlight through infinite knowledge.', shardsNeeded:8, unlockRule:{type:'master_realm'} },
  // History
  { id:'history_1', realm:'history', name:'Ancient Seal', icon:'fa-stamp', rarity:'Common', desc:'An unbroken seal from a forgotten dynasty.', shardsNeeded:3, unlockRule:{type:'clear_stage',minStage:1} },
  { id:'history_2', realm:'history', name:'Empire Crown', icon:'fa-crown', rarity:'Rare', desc:'Symbol of sovereignty across ages.', shardsNeeded:5, unlockRule:{type:'stars',minStars:6} },
  { id:'history_3', realm:'history', name:'Time Scroll', icon:'fa-scroll', rarity:'Legendary', desc:'Unrolls to reveal the entire timeline of civilization.', shardsNeeded:8, unlockRule:{type:'master_realm'} },
  // Geography
  { id:'geography_1', realm:'geography', name:'World Compass', icon:'fa-compass', rarity:'Common', desc:'Points toward undiscovered horizons.', shardsNeeded:3, unlockRule:{type:'clear_stage',minStage:1} },
  { id:'geography_2', realm:'geography', name:'Ocean Pearl', icon:'fa-water', rarity:'Rare', desc:'Harvested from the deepest abyss.', shardsNeeded:5, unlockRule:{type:'stars',minStars:6} },
  { id:'geography_3', realm:'geography', name:'Mountain Crest', icon:'fa-mountain-sun', rarity:'Legendary', desc:'Forged at the summit of the world.', shardsNeeded:8, unlockRule:{type:'master_realm'} },
  // Math
  { id:'math_1', realm:'math', name:'Golden Ratio', icon:'fa-infinity', rarity:'Common', desc:'The perfect proportion found everywhere in nature.', shardsNeeded:3, unlockRule:{type:'clear_stage',minStage:1} },
  { id:'math_2', realm:'math', name:'Infinity Stone', icon:'fa-gem', rarity:'Rare', desc:'Contains boundless computational energy.', shardsNeeded:5, unlockRule:{type:'stars',minStars:6} },
  { id:'math_3', realm:'math', name:'Logic Cube', icon:'fa-cube', rarity:'Legendary', desc:'Every side reveals a new dimension of reasoning.', shardsNeeded:8, unlockRule:{type:'master_realm'} },
  // Language
  { id:'language_1', realm:'language', name:'Word Quill', icon:'fa-pen-nib', rarity:'Common', desc:'Writes in every tongue simultaneously.', shardsNeeded:3, unlockRule:{type:'clear_stage',minStage:1} },
  { id:'language_2', realm:'language', name:'Syntax Key', icon:'fa-key', rarity:'Rare', desc:'Unlocks the hidden structure of communication.', shardsNeeded:5, unlockRule:{type:'stars',minStars:6} },
  { id:'language_3', realm:'language', name:'Polyglot Mask', icon:'fa-masks-theater', rarity:'Legendary', desc:'Grants fluency in all languages past and present.', shardsNeeded:8, unlockRule:{type:'master_realm'} },
  // Nature
  { id:'nature_1', realm:'nature', name:'Leaf Sigil', icon:'fa-leaf', rarity:'Common', desc:'Pulses with the rhythm of the forest.', shardsNeeded:3, unlockRule:{type:'clear_stage',minStage:1} },
  { id:'nature_2', realm:'nature', name:'Coral Heart', icon:'fa-heart', rarity:'Rare', desc:'Beats with the currents of the deep ocean.', shardsNeeded:5, unlockRule:{type:'stars',minStars:6} },
  { id:'nature_3', realm:'nature', name:'Wild Crown', icon:'fa-tree', rarity:'Legendary', desc:'Woven from the oldest roots of the ancient grove.', shardsNeeded:8, unlockRule:{type:'master_realm'} },
  // Culture
  { id:'culture_1', realm:'culture', name:'Festival Mask', icon:'fa-masks-theater', rarity:'Common', desc:'Celebrates the creative spirit of humanity.', shardsNeeded:3, unlockRule:{type:'clear_stage',minStage:1} },
  { id:'culture_2', realm:'culture', name:'Art Flame', icon:'fa-fire', rarity:'Rare', desc:'Burns with the passion of a thousand artisans.', shardsNeeded:5, unlockRule:{type:'stars',minStars:6} },
  { id:'culture_3', realm:'culture', name:'Heritage Globe', icon:'fa-globe', rarity:'Legendary', desc:'Encapsulates all traditions of the world.', shardsNeeded:8, unlockRule:{type:'master_realm'} }
];

const SHOP_ITEMS = [
  // Avatars
  { id:'avatar_A', cat:'avatar', subId:'A', icon:'fa-user', name:'Default Seeker', cost:0 },
  { id:'avatar_B', cat:'avatar', subId:'B', icon:'fa-robot', name:'Mech Sage', cost:100 },
  { id:'avatar_C', cat:'avatar', subId:'C', icon:'fa-dragon', name:'Dragon Scholar', cost:250 },
  { id:'avatar_D', cat:'avatar', subId:'D', icon:'fa-ghost', name:'Phantom Adept', cost:500 },
  // Frames
  { id:'frame_none', cat:'frame', icon:'fa-circle', name:'No Frame', cost:0 },
  { id:'frame_bronze', cat:'frame', icon:'fa-ring', name:'Bronze Ring', cost:75 },
  { id:'frame_silver', cat:'frame', icon:'fa-ring', name:'Silver Ring', cost:150 },
  { id:'frame_gold', cat:'frame', icon:'fa-ring', name:'Gold Ring', cost:300 },
  { id:'frame_prism', cat:'frame', icon:'fa-circle-notch', name:'Prism Frame', cost:500 },
  // Titles
  { id:'title_novice', cat:'title', icon:'fa-seedling', name:'Novice', cost:0 },
  { id:'title_scholar', cat:'title', icon:'fa-book-open', name:'Scholar', cost:100 },
  { id:'title_sage', cat:'title', icon:'fa-hat-wizard', name:'Sage', cost:200 },
  { id:'title_polymath', cat:'title', icon:'fa-brain', name:'Polymath', cost:350 },
  { id:'title_luminary', cat:'title', icon:'fa-sun', name:'Luminary', cost:500 },
  { id:'title_legend', cat:'title', icon:'fa-crown', name:'Legend', cost:750 },
  // Themes
  { id:'theme_default', cat:'theme', icon:'fa-palette', name:'Default Dark', cost:0 },
  { id:'theme_ember', cat:'theme', icon:'fa-fire', name:'Ember Glow', cost:200 },
  { id:'theme_ocean', cat:'theme', icon:'fa-water', name:'Ocean Depths', cost:200 },
  { id:'theme_cosmic', cat:'theme', icon:'fa-meteor', name:'Cosmic Void', cost:400 }
];

const THEME_VARS = {
  theme_default: {},
  theme_ember: {
    '--bg-deep': '#0f0705', '--bg': '#1a0c08', '--bg-surface': '#241410', '--bg-elevated': '#2e1c16',
    '--accent': '#f97316', '--accent-hover': '#fb923c', '--accent-glow': 'rgba(249,115,22,0.25)',
    '--accent2': '#ef4444', '--accent3': '#fbbf24',
    '--card': 'rgba(36,20,16,0.85)', '--card-hover': 'rgba(46,28,22,0.9)', '--card-border': 'rgba(249,115,22,0.08)',
    '--border': 'rgba(249,115,22,0.12)', '--glass': 'rgba(249,115,22,0.04)', '--glass-border': 'rgba(249,115,22,0.08)'
  },
  theme_ocean: {
    '--bg-deep': '#040a14', '--bg': '#081420', '--bg-surface': '#0e1e30', '--bg-elevated': '#14283c',
    '--accent': '#06b6d4', '--accent-hover': '#22d3ee', '--accent-glow': 'rgba(6,182,212,0.25)',
    '--accent2': '#3b82f6', '--accent3': '#8b5cf6',
    '--card': 'rgba(14,30,48,0.85)', '--card-hover': 'rgba(20,40,60,0.9)', '--card-border': 'rgba(6,182,212,0.08)',
    '--border': 'rgba(6,182,212,0.12)', '--glass': 'rgba(6,182,212,0.04)', '--glass-border': 'rgba(6,182,212,0.08)'
  },
  theme_cosmic: {
    '--bg-deep': '#08040f', '--bg': '#10081a', '--bg-surface': '#181028', '--bg-elevated': '#201836',
    '--accent': '#a855f7', '--accent-hover': '#c084fc', '--accent-glow': 'rgba(168,85,247,0.25)',
    '--accent2': '#ec4899', '--accent3': '#6366f1',
    '--card': 'rgba(24,16,40,0.85)', '--card-hover': 'rgba(32,24,54,0.9)', '--card-border': 'rgba(168,85,247,0.08)',
    '--border': 'rgba(168,85,247,0.12)', '--glass': 'rgba(168,85,247,0.04)', '--glass-border': 'rgba(168,85,247,0.08)'
  }
};

function applyTheme(themeId) {
  let root = document.documentElement;
  // Reset all theme variables to defaults first
  let defaults = THEME_VARS.theme_default;
  Object.keys(THEME_VARS).forEach(tid => {
    let vars = THEME_VARS[tid];
    Object.keys(vars).forEach(k => root.style.removeProperty(k));
  });
  // Apply chosen theme
  let vars = THEME_VARS[themeId] || {};
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}
