function showToast(msg, dur = 3000) {
  let existing = document.querySelectorAll('.toast');
  if (existing.length > 3) existing[0].remove();
  let t = document.createElement('div'); t.className = 'toast';
  t.setAttribute('role', 'alert');
  t.innerHTML = `<i class="fas fa-info-circle"></i><span>${escHtml(msg)}</span>`;
  document.body.appendChild(t);
  let timer = setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, dur);
  // If element is removed early (e.g. by the limit above), clear the timer
  t._timer = timer;
}

// ==================== Local Analytics ====================
const ANALYTICS_KEY = 'cerebrum_analytics';
const ANALYTICS_CAP = 500;
function trackEvent(name, data) {
  try {
    let log = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    log.push({ ts: Date.now(), name, data: data || {} });
    if (log.length > ANALYTICS_CAP) log = log.slice(-ANALYTICS_CAP);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(log));
  } catch (e) { }
}
window.exportCerebrumAnalytics = function () {
  try { return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]'); }
  catch (e) { return []; }
};

// ==================== Cached DOM References ====================
const $ = id => document.getElementById(id);
let D = {};
function cacheDom() {
  D = {
    optionsList: $('optionsList'), timerFill: $('timerFill'), quizTimerText: $('quizTimerText'),
    quizXP: $('quizXP'), quizStreak: $('quizStreak'), quizScore: $('quizScore'), streakPill: $('streakPill'),
    explanationArea: $('explanationArea'), nextQBtn: $('nextQBtn'), questionNumber: $('questionNumber'),
    questionText: $('questionText'), qProgressBar: $('qProgressBar'), quizCatName: $('quizCatName'),
    quizCatDot: $('quizCatDot'), quizTotal: $('quizTotal'), quizBackBtn: $('quizBackBtn'),
    llFifty: $('llFifty'), llTime: $('llTime'), llHint: $('llHint'), quizStageSubtitle: $('quizStageSubtitle'), bossWarning: $('bossWarning'),
    hubAvatar: $('hubAvatar'), hubName: $('hubName'),
    hubLevel: $('hubLevel'), hubXpBar: $('hubXpBar'), hubTotalXP: $('hubTotalXP'), hudLevels: $('hudLevels'),
    hubAccuracy: $('hubAccuracy'), mainNav: $('mainNav'), categoryGrid: $('categoryGrid'),
    continueCard: $('continueCard'), rewardsCard: $('rewardsCard'),
    hubTitle: $('hubTitle'), hubSubtitle: $('hubSubtitle'),
    shopCoins: $('shopCoins'), shopGrid: $('shopGrid'), achievementsGrid: $('achievementsGrid'),
    achieveCount: $('achieveCount'), achieveBadge: $('achieveBadge'), profileBigAvatar: $('profileBigAvatar'),
    profileName: $('profileName'), profileLevel: $('profileLevel'), profileXpCurrent: $('profileXpCurrent'),
    profileXpNeeded: $('profileXpNeeded'), profileXpFill: $('profileXpFill'), profileStatsGrid: $('profileStatsGrid'),
    resultsTitle: $('resultsTitle'), resultsSubtitle: $('resultsSubtitle'), resultsIcon: $('resultsIcon'),
    scoreRingValue: $('scoreRingValue'), resXP: $('resXP'), resCoins: $('resCoins'), resCorrect: $('resCorrect'),
    resWrong: $('resWrong'), scoreCircle: $('scoreCircle'), resultsStars: $('resultsStars'),
    levelCompleteBanner: $('levelCompleteBanner'), bannerText: $('bannerText'),
    lsIcon: $('lsIcon'), lsTitle: $('lsTitle'), lsDesc: $('lsDesc'), levelList: $('levelList'),
    reviewList: $('reviewList'), confirmModal: $('confirmModal'), confirmTitle: $('confirmTitle'),
    confirmMsg: $('confirmMsg'), nameModal: $('nameModal'), editNameInput: $('editNameInput'),
    playerNameInput: $('playerNameInput'), startBtn: $('startBtn'), sQuiz: $('sQuiz'),
  };
}

// ==================== State ====================
function createDefaultState() {
  return {
    playerName: "Explorer", totalXP: 0, curLevelNum: 1, bestStreak: 0,
    totalCorrect: 0, totalAnswered: 0, totalQuizzes: 0, perfectQuizzes: 0, hardCorrect: 0, fastAnswer: 0,
    curCat: null, curLevel: 1,
    categoryData: {},
    tripleStars: 0, lvl5Cleared: 0, levelsCleared: 0, realmsMastered: 0,
    newAchievements: new Set(), unlockedAchievements: new Set(),
    pinnedAchievements: [], claimedAchRewards: new Set(),
    qs: [], qIndex: 0, quizScore: 0, quizStreak: 0, quizXP: 0,
    quizStartTime: 0, timerInterval: null, timeLeft: 0, questionAnswered: false, lastQuizAnswers: [],
    coins: 0, unlockedAvatars: ['A'], avatar: 'A', lastDaily: 0, lastDailyDate: '', dailyStreak: 0, isDaily: false, lifelinesUsed: { fifty: 0, time: 0, hint: 0 },
    onboardingDone: false, lastFailedQuiz: null, reviewOpened: false,
    dailyChestShown: '',
    answeredQuestionIds: {}, weakAreas: {},
    missionDate: '', missions: [],
    missionSessionStats: { questionsAnswered: 0, correctAnswers: 0, stagesStarted: 0, stagesCompleted: 0, dailyCompleted: false, noLifelineStages: 0, wrongReviewed: 0, starsEarned: 0, maxStreak: 0 },
    weeklyGoalDate: '', weeklyStagesCompleted: 0, weeklyGoalClaimed: false,
    lastPlayDate: '', comebackShown: '',
    relicShards: {}, unlockedRelics: new Set(), newRelics: new Set(),
    unlockedShopItems: ['avatar_A','frame_none','title_novice','theme_default'],
    equippedFrame: 'frame_none', equippedTitle: 'title_novice', equippedTheme: 'theme_default',
    pinnedShowcase: [], _shardQueue: [],
    skillProfile: { categories: {}, tags: {}, avgResponseTime: 0, totalResponseTime: 0, responseCount: 0 },
    stageMastery: {}, recentMistakes: []
  };
}

let S = createDefaultState();

let _autoAdvance = null;
function clearAllTimers() { if (S.timerInterval) { clearInterval(S.timerInterval); S.timerInterval = null; } if (_autoAdvance) { clearTimeout(_autoAdvance); _autoAdvance = null; } }

const SAVE_VERSION = 7;
const SAVE_KEY = 'cerebrum_save';

// Keys that should be persisted. Everything else is transient runtime state.
const PERSIST_KEYS = new Set([
  'playerName', 'totalXP', 'curLevelNum', 'bestStreak',
  'totalCorrect', 'totalAnswered', 'totalQuizzes', 'perfectQuizzes', 'hardCorrect', 'fastAnswer',
  'curCat', 'curLevel',
  'categoryData',
  'tripleStars', 'lvl5Cleared', 'levelsCleared', 'realmsMastered',
  'unlockedAchievements', 'claimedAchRewards', 'pinnedAchievements',
  'coins', 'unlockedAvatars', 'avatar', 'lastDaily', 'lastDailyDate', 'dailyStreak',
  'onboardingDone', 'lastFailedQuiz', 'reviewOpened',
  'dailyChestShown',
  'answeredQuestionIds', 'weakAreas',
  'missionDate', 'missions',
  'weeklyGoalDate', 'weeklyStagesCompleted', 'weeklyGoalClaimed',
  'lastPlayDate', 'comebackShown',
  'relicShards', 'unlockedRelics', 'newRelics',
  'unlockedShopItems',
  'equippedFrame', 'equippedTitle', 'equippedTheme',
  'pinnedShowcase',
  'skillProfile',
  'stageMastery', 'recentMistakes',
]);

function serializeState() {
  const out = { _v: SAVE_VERSION };
  PERSIST_KEYS.forEach(k => {
    if (S[k] !== undefined) out[k] = S[k];
  });
  return JSON.stringify(out, (k, v) => (v instanceof Set ? [...v] : v));
}

function hydrateState(raw) {
  // Parse if string
  let p = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!p || typeof p !== 'object') throw new Error('Invalid save data');

  // Validate: must have recognizable Cerebrum fields
  if (p.playerName === undefined && p.totalXP === undefined && p.categoryData === undefined) {
    throw new Error('Not a valid Cerebrum save');
  }

  // Strip version before merge
  let version = p._v || 0;
  delete p._v;

  // Strip transient keys
  const transient = new Set([
    'timerInterval', 'qs', 'qIndex', 'quizScore', 'quizStreak', 'quizXP',
    'quizStartTime', 'timeLeft', 'questionAnswered', 'lastQuizAnswers',
    'isDaily', '_shuffled', '_finishing', '_bossDefeated', 'missionSessionStats', '_shardQueue',
    'newAchievements', '_practiceSnapshot',
  ]);
  transient.forEach(k => delete p[k]);

  // Migrate
  p = migrateSave(p, version);

  // Merge into fresh state
  S = { ...createDefaultState(), ...p };
  applySaveDefaults();
}

function saveState() {
  if (S.answeredQuestionIds) {
    let cutoff = Date.now() - 7 * 24 * 3600000;
    Object.keys(S.answeredQuestionIds).forEach(id => { if (S.answeredQuestionIds[id] < cutoff) delete S.answeredQuestionIds[id]; });
  }
  if (typeof decaySkillProfile === 'function') decaySkillProfile();
  try {
    localStorage.setItem(SAVE_KEY, serializeState());
  } catch (e) {
    console.warn('Save failed:', e.message);
  }
}

// Apply safe defaults for any missing fields, grouped by version they were introduced.
function applySaveDefaults() {
  if (S.coins === undefined) S.coins = 0;
  if (!S.unlockedAvatars || !Array.isArray(S.unlockedAvatars)) S.unlockedAvatars = ['A'];
  if (!S.avatar) S.avatar = 'A';
  if (S.lastDaily === undefined) S.lastDaily = 0;
  if (S.dailyStreak === undefined) S.dailyStreak = 0;
  if (!S.lifelinesUsed) S.lifelinesUsed = { fifty: 0, time: 0, hint: 0 };
  if (S.isDaily === undefined) S.isDaily = false;
  if (S.onboardingDone === undefined) S.onboardingDone = false;
  if (S.lastFailedQuiz === undefined) S.lastFailedQuiz = null;
  if (S.reviewOpened === undefined) S.reviewOpened = false;
  if (!S.pinnedAchievements) S.pinnedAchievements = [];
  S.timerInterval = null;
  // Ensure category data structures
  if (typeof CATEGORY_META === 'object') {
    Object.keys(CATEGORY_META).forEach(c => {
      if (!S.categoryData[c]) S.categoryData[c] = { levelData: Array.from({ length: 5 }, () => ({ stars: 0, completed: false })) };
      if (!S.categoryData[c].levelData || S.categoryData[c].levelData.length < 5) {
        S.categoryData[c].levelData = Array.from({ length: 5 }, () => ({ stars: 0, completed: false }));
      }
    });
  }
  // Retention system
  if (!S.lastDailyDate && S.lastDaily) { let dd = new Date(S.lastDaily); if (!isNaN(dd.getTime())) S.lastDailyDate = dd.toISOString().slice(0,10); }
  if (!S.lastDailyDate) S.lastDailyDate = '';
  if (!S.dailyChestShown) S.dailyChestShown = '';
  if (!S.missionDate) S.missionDate = '';
  if (!Array.isArray(S.missions)) S.missions = [];
  if (!S.missionSessionStats) S.missionSessionStats = { questionsAnswered:0, correctAnswers:0, stagesStarted:0, stagesCompleted:0, dailyCompleted:false, noLifelineStages:0, wrongReviewed:0, starsEarned:0, maxStreak:0 };
  if (!S.weeklyGoalDate) S.weeklyGoalDate = '';
  if (S.weeklyStagesCompleted === undefined) S.weeklyStagesCompleted = 0;
  if (S.weeklyGoalClaimed === undefined) S.weeklyGoalClaimed = false;
  if (!S.lastPlayDate) S.lastPlayDate = '';
  if (!S.comebackShown) S.comebackShown = '';
  // Collection/reward system
  if (!S.relicShards || typeof S.relicShards !== 'object') S.relicShards = {};
  if (!S.unlockedRelics) S.unlockedRelics = new Set();
  else if (Array.isArray(S.unlockedRelics)) S.unlockedRelics = new Set(S.unlockedRelics);
  if (!S.newRelics) S.newRelics = new Set();
  else if (Array.isArray(S.newRelics)) S.newRelics = new Set(S.newRelics);
  if (!Array.isArray(S.unlockedShopItems)) {
    S.unlockedShopItems = ['avatar_A','frame_none','title_novice','theme_default'];
    if (Array.isArray(S.unlockedAvatars)) {
      S.unlockedAvatars.forEach(a => { let itemId = 'avatar_' + a; if (!S.unlockedShopItems.includes(itemId)) S.unlockedShopItems.push(itemId); });
    }
  }
  if (!S.equippedFrame) S.equippedFrame = 'frame_none';
  if (!S.equippedTitle) S.equippedTitle = 'title_novice';
  if (!S.equippedTheme) S.equippedTheme = 'theme_default';
  if (!Array.isArray(S.pinnedShowcase)) S.pinnedShowcase = [];
  if (!Array.isArray(S._shardQueue)) S._shardQueue = [];
  // Adaptive progression
  if (!S.skillProfile || typeof S.skillProfile !== 'object') S.skillProfile = { categories: {}, tags: {}, avgResponseTime: 0, totalResponseTime: 0, responseCount: 0 };
  if (!S.skillProfile.categories) S.skillProfile.categories = {};
  if (!S.skillProfile.tags) S.skillProfile.tags = {};
  if (S.skillProfile.avgResponseTime === undefined) S.skillProfile.avgResponseTime = 0;
  if (S.skillProfile.totalResponseTime === undefined) S.skillProfile.totalResponseTime = 0;
  if (S.skillProfile.responseCount === undefined) S.skillProfile.responseCount = 0;
  if (!S.stageMastery || typeof S.stageMastery !== 'object') S.stageMastery = {};
  if (!Array.isArray(S.recentMistakes)) S.recentMistakes = [];
  // Ensure Set types
  S.newAchievements = new Set(S.newAchievements || []);
  S.unlockedAchievements = new Set(S.unlockedAchievements || []);
  S.claimedAchRewards = new Set(S.claimedAchRewards || []);
}

function migrateSave(p, version) {
  // v6 → v7: Normalize daily dates from toDateString to ISO YYYY-MM-DD
  if (version < 7) {
    if (p.lastDaily && !p.lastDailyDate) {
      let dd = typeof p.lastDaily === 'number' ? new Date(p.lastDaily) : new Date(p.lastDaily);
      if (!isNaN(dd.getTime())) p.lastDailyDate = dd.toISOString().slice(0, 10);
      else p.lastDailyDate = '';
    }
    if (!p.lastDailyDate) p.lastDailyDate = '';
    // Ensure categoryData has 5 levels
    if (p.categoryData) {
      Object.keys(p.categoryData).forEach(c => {
        if (!p.categoryData[c].levelData || p.categoryData[c].levelData.length < 5) {
          p.categoryData[c].levelData = Array.from({ length: 5 }, () => ({ stars: 0, completed: false }));
        }
      });
    }
    // Ensure shop defaults
    if (!Array.isArray(p.unlockedShopItems)) {
      p.unlockedShopItems = ['avatar_A', 'frame_none', 'title_novice', 'theme_default'];
    }
    if (!p.equippedFrame) p.equippedFrame = 'frame_none';
    if (!p.equippedTitle) p.equippedTitle = 'title_novice';
    if (!p.equippedTheme) p.equippedTheme = 'theme_default';
  }
  return p;
}

function loadState() {
  try {
    let d = localStorage.getItem(SAVE_KEY);
    if (!d) return;
    hydrateState(d);
  } catch (e) {
    // Never auto-delete a broken save — keep defaults and warn.
    console.warn('Save parse error — keeping defaults:', e.message);
  }
}
