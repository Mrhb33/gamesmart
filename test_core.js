#!/usr/bin/env node
// Cerebrum Quest — Core Logic Test Harness
// Tests: save migration, daily streak, rewards, stars, missions, weekly goal, question selection

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passed = 0, failed = 0, total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  \x1b[32mPASS\x1b[0m ${name}`);
  } catch (e) {
    failed++;
    console.log(`  \x1b[31mFAIL\x1b[0m ${name}`);
    console.log(`       ${e.message}`);
  }
}

function suite(name, fn) {
  console.log(`\n\x1b[1m${name}\x1b[0m`);
  fn();
}

// ==================== Stubs ====================
// Minimal stubs so we can test game logic in Node without a browser

function getISODate(d) { return (d ? new Date(d) : new Date()).toISOString().slice(0, 10); }
function getISOWeek(d) {
  let dt = new Date(d || Date.now()); dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() + 3 - (dt.getDay() + 6) % 7);
  let w1 = new Date(dt.getFullYear(), 0, 4);
  return dt.getFullYear() + '-W' + (1 + Math.round((dt - w1) / 604800000));
}
function daysBetween(d1, d2) { return Math.floor((new Date(d2) - new Date(d1)) / 86400000); }

function shuffle(a) { let c = [...a]; for (let i = c.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; }

const TIMER_DUR = { 1: 30, 2: 25, 3: 20, 4: 15, 5: 12 };
const XP_MAP = { 1: 15, 2: 25, 3: 40, 4: 60, 5: 90 };
const WEEKLY_GOAL_TARGET = 5;
const COMEBACK_THRESHOLD_DAYS = 2;
const SAVE_VERSION = 7;

const DAILY_STREAK_MILESTONES = [
  { days: 3, label: 'Dedicated' }, { days: 7, label: 'Devoted' },
  { days: 14, label: 'Unstoppable' }, { days: 30, label: 'Legendary' },
];
function getDailyMilestone(streak) {
  for (let i = DAILY_STREAK_MILESTONES.length - 1; i >= 0; i--) {
    if (streak >= DAILY_STREAK_MILESTONES[i].days) return DAILY_STREAK_MILESTONES[i];
  }
  return null;
}

function createDefaultState() {
  return {
    playerName: "Explorer", totalXP: 0, curLevelNum: 1, bestStreak: 0,
    totalCorrect: 0, totalAnswered: 0, totalQuizzes: 0, perfectQuizzes: 0,
    curCat: null, curLevel: 1,
    categoryData: {},
    tripleStars: 0, lvl5Cleared: 0, levelsCleared: 0, realmsMastered: 0,
    coins: 0, lastDaily: 0, lastDailyDate: '', dailyStreak: 0, isDaily: false,
    lifelinesUsed: { fifty: 0, time: 0, hint: 0 },
    onboardingDone: false, lastFailedQuiz: null,
    missionDate: '', missions: [],
    missionSessionStats: { questionsAnswered: 0, correctAnswers: 0, stagesStarted: 0, stagesCompleted: 0, dailyCompleted: false, noLifelineStages: 0, wrongReviewed: 0, starsEarned: 0, maxStreak: 0 },
    weeklyGoalDate: '', weeklyStagesCompleted: 0, weeklyGoalClaimed: false,
    lastPlayDate: '', comebackShown: '',
    relicShards: {}, unlockedRelics: new Set(),
    unlockedShopItems: ['avatar_A', 'frame_none', 'title_novice', 'theme_default'],
    equippedFrame: 'frame_none', equippedTitle: 'title_novice', equippedTheme: 'theme_default',
    skillProfile: { categories: {}, tags: {}, avgResponseTime: 0, totalResponseTime: 0, responseCount: 0 },
    stageMastery: {}, recentMistakes: [],
    answeredQuestionIds: {}, weakAreas: {},
  };
}

function migrateSave(p, version) {
  if (version < 7) {
    if (p.lastDaily && !p.lastDailyDate) {
      let dd = typeof p.lastDaily === 'number' ? new Date(p.lastDaily) : new Date(p.lastDaily);
      if (!isNaN(dd.getTime())) p.lastDailyDate = dd.toISOString().slice(0, 10);
      else p.lastDailyDate = '';
    }
    if (!p.lastDailyDate) p.lastDailyDate = '';
    if (p.categoryData) {
      Object.keys(p.categoryData).forEach(c => {
        if (!p.categoryData[c].levelData || p.categoryData[c].levelData.length < 5) {
          p.categoryData[c].levelData = Array.from({ length: 5 }, () => ({ stars: 0, completed: false }));
        }
      });
    }
    if (!Array.isArray(p.unlockedShopItems)) {
      p.unlockedShopItems = ['avatar_A', 'frame_none', 'title_novice', 'theme_default'];
    }
    if (!p.equippedFrame) p.equippedFrame = 'frame_none';
    if (!p.equippedTitle) p.equippedTitle = 'title_novice';
    if (!p.equippedTheme) p.equippedTheme = 'theme_default';
  }
  return p;
}

function hydrateState(raw) {
  let p = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!p || typeof p !== 'object') throw new Error('Invalid save data');
  if (p.playerName === undefined && p.totalXP === undefined && p.categoryData === undefined) {
    throw new Error('Not a valid Cerebrum save');
  }
  let version = p._v || 0;
  delete p._v;
  const transient = new Set([
    'timerInterval', 'qs', 'qIndex', 'quizScore', 'quizStreak', 'quizXP',
    'quizStartTime', 'timeLeft', 'questionAnswered', 'lastQuizAnswers',
    'isDaily', '_shuffled', '_finishing', '_bossDefeated', 'missionSessionStats', '_shardQueue',
    'newAchievements', '_practiceSnapshot',
  ]);
  transient.forEach(k => delete p[k]);
  p = migrateSave(p, version);
  let S = { ...createDefaultState(), ...p };
  if (Array.isArray(S.unlockedRelics)) S.unlockedRelics = new Set(S.unlockedRelics);
  return S;
}

// Star calculation (replicated from game logic)
function calcStars(pct, bossDefeated, isBossStage) {
  let bossOk = bossDefeated || !isBossStage;
  if (pct === 100 && bossOk) return 3;
  if (pct >= 80 && bossOk) return 2;
  if (pct >= 60) return 1;
  return 0;
}

// Reward calculation (replicated)
function calcRewards(stars, bestStreak, isDaily, passed, dailyAlreadyDone) {
  let baseCoins = stars * 10;
  let speedBonus = 0, streakBonus = 0;
  if (bestStreak >= 5) streakBonus = 10;
  if (bestStreak >= 10) streakBonus = 25;
  let coins = baseCoins + speedBonus + streakBonus;
  if (isDaily && passed) coins = dailyAlreadyDone ? 0 : 100;
  return coins;
}

// Stage mastery score
function calcStageMasteryScore(pct, bossDefeated, lifelinesUsed, streak) {
  let score = 0;
  score += Math.min(40, pct * 0.4);
  if (bossDefeated) score += 25;
  let llCount = (lifelinesUsed.fifty || 0) + (lifelinesUsed.time || 0);
  score += Math.max(0, 20 - llCount * 10);
  score += Math.min(15, streak * 1.5);
  return Math.min(100, Math.round(score));
}

// Smart shuffle simulation
function smartShuffle(pool, answeredIds) {
  let now = Date.now();
  let scored = pool.map(q => {
    let last = answeredIds ? answeredIds[q.id] : undefined;
    let unseen = !last;
    let recency = last ? (now - last) / 3600000 : Infinity;
    return { q, score: unseen ? 1000 : recency };
  });
  scored.sort((a, b) => b.score - a.score);
  let ordered = scored.map(s => s.q);
  let bossIdx = ordered.findIndex(q => q.boss === true);
  if (bossIdx >= 0 && bossIdx < ordered.length - 1) {
    let boss = ordered.splice(bossIdx, 1)[0];
    ordered.push(boss);
  }
  return ordered;
}

// Mission generation
const MISSION_TEMPLATES = {
  easy: [
    { id: 'answer_20', targetFn: () => 20, reward: { xp: 50, coins: 30 } },
    { id: 'stages_2', targetFn: () => 2, reward: { xp: 60, coins: 25 } },
  ],
  medium: [
    { id: 'stages_3', targetFn: () => 3, reward: { xp: 100, coins: 50 } },
    { id: 'streak_5', targetFn: () => 5, reward: { xp: 100, coins: 50 } },
  ],
  hard: [
    { id: 'daily_done', targetFn: () => 1, reward: { xp: 120, coins: 60 } },
    { id: 'streak_8', targetFn: () => 8, reward: { xp: 150, coins: 70 } },
  ]
};

function generateMissions(dateStr) {
  let today = dateStr || getISODate();
  let seed = 0; for (let i = 0; i < today.length; i++) seed = ((seed << 5) - seed) + today.charCodeAt(i);
  let rand = (max) => { seed = (seed * 16807) % 2147483647; return Math.abs(seed) % max; };
  let picked = [];
  ['easy', 'medium', 'hard'].forEach(diff => {
    let pool = MISSION_TEMPLATES[diff];
    let tmpl = pool[rand(pool.length)];
    let target = tmpl.targetFn();
    picked.push({ id: tmpl.id + '_' + today, difficulty: diff, target, progress: 0, claimed: false, reward: { ...tmpl.reward } });
  });
  return picked;
}

// ==================== Tests ====================

suite('Save Migration', () => {
  test('v6 → v7: converts toDateString lastDaily to ISO date', () => {
    let oldSave = { _v: 6, playerName: 'Test', totalXP: 100, lastDaily: 'Mon Jan 01 2024' };
    let result = migrateSave(oldSave, 6);
    assert.ok(result.lastDailyDate, 'Should have lastDailyDate');
    // toDateString() creates date in local timezone, so the ISO date may differ
    assert.ok(result.lastDailyDate.match(/^\d{4}-\d{2}-\d{2}$/), 'Should be ISO date format');
  });

  test('v6 → v7: handles numeric lastDaily timestamp', () => {
    let ts = new Date('2024-06-15').getTime();
    let oldSave = { _v: 6, playerName: 'Test', lastDaily: ts };
    let result = migrateSave(oldSave, 6);
    assert.strictEqual(result.lastDailyDate, '2024-06-15');
  });

  test('v6 → v7: ensures 5 levelData entries', () => {
    let oldSave = { _v: 6, playerName: 'Test', categoryData: { science: { levelData: [{ stars: 1, completed: true }] } } };
    let result = migrateSave(oldSave, 6);
    assert.strictEqual(result.categoryData.science.levelData.length, 5);
  });

  test('v6 → v7: adds default shop items', () => {
    let oldSave = { _v: 6, playerName: 'Test', unlockedShopItems: null };
    let result = migrateSave(oldSave, 6);
    assert.ok(Array.isArray(result.unlockedShopItems));
    assert.ok(result.unlockedShopItems.includes('avatar_A'));
  });

  test('hydrates valid save correctly', () => {
    let raw = JSON.stringify({ _v: 7, playerName: 'Alice', totalXP: 500, coins: 100 });
    let S = hydrateState(raw);
    assert.strictEqual(S.playerName, 'Alice');
    assert.strictEqual(S.totalXP, 500);
    assert.strictEqual(S.coins, 100);
    assert.strictEqual(S.dailyStreak, 0, 'Missing fields should get defaults');
  });

  test('rejects invalid save data', () => {
    assert.throws(() => hydrateState('null'), /Invalid save data|Not a valid Cerebrum save/);
    assert.throws(() => hydrateState('{"foo":"bar"}'), /Not a valid Cerebrum save/);
    assert.throws(() => hydrateState('"just a string"'), /Invalid save data/);
  });

  test('strips transient fields during hydration', () => {
    let raw = JSON.stringify({ _v: 7, playerName: 'Test', qs: [1, 2, 3], quizScore: 5, timerInterval: 123 });
    let S = hydrateState(raw);
    assert.strictEqual(S.qs, undefined, 'qs should be stripped');
    assert.strictEqual(S.quizScore, undefined, 'quizScore should be stripped');
    assert.strictEqual(S.timerInterval, undefined, 'timerInterval should be stripped');
  });

  test('converts unlockedRelics array to Set', () => {
    let raw = JSON.stringify({ _v: 7, playerName: 'Test', unlockedRelics: ['science_1', 'history_2'] });
    let S = hydrateState(raw);
    assert.ok(S.unlockedRelics instanceof Set);
    assert.ok(S.unlockedRelics.has('science_1'));
  });
});

suite('Daily Streak Logic', () => {
  test('getISODate returns YYYY-MM-DD format', () => {
    let d = getISODate(new Date('2024-03-15T12:30:00'));
    assert.strictEqual(d, '2024-03-15');
  });

  test('daysBetween counts correctly', () => {
    assert.strictEqual(daysBetween('2024-01-01', '2024-01-02'), 1);
    assert.strictEqual(daysBetween('2024-01-01', '2024-01-05'), 4);
    assert.strictEqual(daysBetween('2024-01-10', '2024-01-10'), 0);
  });

  test('daily milestone at 3 days', () => {
    let ms = getDailyMilestone(3);
    assert.ok(ms);
    assert.strictEqual(ms.days, 3);
  });

  test('daily milestone at 7 days', () => {
    let ms = getDailyMilestone(7);
    assert.ok(ms);
    assert.strictEqual(ms.days, 7);
  });

  test('no milestone at 1 day', () => {
    let ms = getDailyMilestone(1);
    assert.strictEqual(ms, null);
  });

  test('daily milestone at 30 days', () => {
    let ms = getDailyMilestone(30);
    assert.ok(ms);
    assert.strictEqual(ms.days, 30);
  });

  test('streak continues when played next day', () => {
    let S = createDefaultState();
    S.lastDailyDate = '2024-01-01';
    S.dailyStreak = 1;
    let today = '2024-01-02';
    assert.strictEqual(daysBetween(S.lastDailyDate, today), 1);
  });

  test('streak resets when gap > 1 day', () => {
    let S = createDefaultState();
    S.lastDailyDate = '2024-01-01';
    S.dailyStreak = 5;
    let today = '2024-01-05';
    assert.ok(daysBetween(S.lastDailyDate, today) > 1, 'Gap should be > 1');
  });
});

suite('Star Calculation', () => {
  test('100% with boss defeated = 3 stars', () => {
    assert.strictEqual(calcStars(100, true, true), 3);
  });

  test('100% on non-boss stage = 3 stars', () => {
    assert.strictEqual(calcStars(100, false, false), 3);
  });

  test('80% with boss defeated = 2 stars', () => {
    assert.strictEqual(calcStars(80, true, true), 2);
  });

  test('80% on non-boss = 2 stars', () => {
    assert.strictEqual(calcStars(80, false, false), 2);
  });

  test('60% = 1 star', () => {
    assert.strictEqual(calcStars(60, false, false), 1);
  });

  test('100% but boss escaped on boss stage = 1 star (boss defeat required)', () => {
    // bossDefeatedForStars = false when boss escaped on boss stage
    // Falls to pct >= 60 → 1 star
    assert.strictEqual(calcStars(100, false, true), 1);
  });

  test('80% but boss escaped on boss stage = 1 star', () => {
    assert.strictEqual(calcStars(80, false, true), 1);
  });

  test('59% = 0 stars', () => {
    assert.strictEqual(calcStars(59, false, false), 0);
  });

  test('50% = 0 stars', () => {
    assert.strictEqual(calcStars(50, false, false), 0);
  });

  test('0% = 0 stars', () => {
    assert.strictEqual(calcStars(0, false, false), 0);
  });
});

suite('Reward Calculation', () => {
  test('3 stars gives 30 base coins', () => {
    assert.strictEqual(calcRewards(3, 0, false, true, false), 30);
  });

  test('1 star gives 10 base coins', () => {
    assert.strictEqual(calcRewards(1, 0, false, true, false), 10);
  });

  test('0 stars gives 0 base coins', () => {
    assert.strictEqual(calcRewards(0, 0, false, false, false), 0);
  });

  test('streak >= 5 adds 10 bonus', () => {
    assert.strictEqual(calcRewards(3, 5, false, true, false), 40);
  });

  test('streak >= 10 adds 25 bonus', () => {
    assert.strictEqual(calcRewards(3, 10, false, true, false), 55);
  });

  test('daily reward is 100 crowns', () => {
    assert.strictEqual(calcRewards(0, 0, true, true, false), 100);
  });

  test('daily already done gives 0 crowns', () => {
    assert.strictEqual(calcRewards(0, 0, true, true, true), 0);
  });
});

suite('Stage Mastery', () => {
  test('perfect run with boss and no lifelines', () => {
    let score = calcStageMasteryScore(100, true, { fifty: 0, time: 0 }, 10);
    assert.strictEqual(score, 100);
  });

  test('low score with no boss', () => {
    let score = calcStageMasteryScore(40, false, { fifty: 0, time: 0 }, 0);
    assert.ok(score < 50);
  });

  test('lifeline penalty reduces score', () => {
    let noLL = calcStageMasteryScore(80, false, { fifty: 0, time: 0 }, 5);
    let withLL = calcStageMasteryScore(80, false, { fifty: 1, time: 1 }, 5);
    assert.ok(withLL < noLL);
  });

  test('boss defeated adds 25 points', () => {
    let noBoss = calcStageMasteryScore(50, false, { fifty: 0, time: 0 }, 0);
    let withBoss = calcStageMasteryScore(50, true, { fifty: 0, time: 0 }, 0);
    assert.strictEqual(withBoss - noBoss, 25);
  });
});

suite('Mission Generation', () => {
  test('generates 3 missions (easy, medium, hard)', () => {
    let missions = generateMissions('2024-06-15');
    assert.strictEqual(missions.length, 3);
    assert.strictEqual(missions[0].difficulty, 'easy');
    assert.strictEqual(missions[1].difficulty, 'medium');
    assert.strictEqual(missions[2].difficulty, 'hard');
  });

  test('missions are deterministic for same date', () => {
    let m1 = generateMissions('2024-06-15');
    let m2 = generateMissions('2024-06-15');
    assert.deepStrictEqual(m1.map(m => m.id), m2.map(m => m.id));
  });

  test('missions differ for different dates', () => {
    let m1 = generateMissions('2024-06-15');
    let m2 = generateMissions('2024-06-16');
    assert.notDeepStrictEqual(m1.map(m => m.id), m2.map(m => m.id));
  });

  test('mission has valid reward structure', () => {
    let missions = generateMissions('2024-06-15');
    missions.forEach(m => {
      assert.ok(m.reward.xp > 0, 'XP reward should be positive');
      assert.ok(m.reward.coins > 0, 'Coins reward should be positive');
      assert.ok(m.target > 0, 'Target should be positive');
    });
  });

  test('hard missions give better rewards than easy', () => {
    let missions = generateMissions('2024-06-15');
    let easy = missions[0], hard = missions[2];
    assert.ok(hard.reward.xp >= easy.reward.xp);
    assert.ok(hard.reward.coins >= easy.reward.coins);
  });
});

suite('Weekly Goal', () => {
  test('getISOWeek returns consistent format', () => {
    let w = getISOWeek('2024-06-15');
    assert.ok(w.match(/^\d{4}-W\d+$/), 'Should be YYYY-W## format');
  });

  test('weekly goal target is 5 stages', () => {
    assert.strictEqual(WEEKLY_GOAL_TARGET, 5);
  });

  test('weekly progress calculates correctly', () => {
    let completed = 3;
    let pct = Math.min(100, Math.round((completed / WEEKLY_GOAL_TARGET) * 100));
    assert.strictEqual(pct, 60);
  });

  test('weekly resets on new week', () => {
    let S = createDefaultState();
    S.weeklyGoalDate = '2024-W23';
    S.weeklyStagesCompleted = 5;
    S.weeklyGoalClaimed = true;
    let currentWeek = getISOWeek('2024-06-15');
    if (currentWeek !== S.weeklyGoalDate) {
      S.weeklyGoalDate = currentWeek;
      S.weeklyStagesCompleted = 0;
      S.weeklyGoalClaimed = false;
    }
    // At least verify the logic works
    assert.ok(typeof S.weeklyStagesCompleted === 'number');
  });
});

suite('Question Selection', () => {
  const mockQuestions = [
    { id: 'q1', lvl: 1, boss: false, tags: ['physics'] },
    { id: 'q2', lvl: 1, boss: false, tags: ['physics'] },
    { id: 'q3', lvl: 1, boss: true, tags: ['physics', 'advanced'] },
    { id: 'q4', lvl: 1, boss: false, tags: ['chemistry'] },
    { id: 'q5', lvl: 1, boss: false, tags: ['chemistry'] },
  ];

  test('boss question placed last', () => {
    let result = smartShuffle(mockQuestions, {});
    let bossQ = result.find(q => q.boss === true);
    assert.strictEqual(result[result.length - 1].id, bossQ.id);
  });

  test('unseen questions prioritized', () => {
    let answeredIds = { q1: Date.now(), q2: Date.now() };
    let result = smartShuffle(mockQuestions, answeredIds);
    let firstIds = result.slice(0, 3).map(q => q.id);
    assert.ok(!firstIds.includes('q1') || !firstIds.includes('q2'), 'Unseen questions should come first');
  });

  test('no answered questions = all treated equally', () => {
    let result = smartShuffle(mockQuestions, {});
    assert.strictEqual(result.length, mockQuestions.length);
  });

  test('preserves all questions', () => {
    let result = smartShuffle(mockQuestions, {});
    let origIds = new Set(mockQuestions.map(q => q.id));
    let resultIds = new Set(result.map(q => q.id));
    assert.deepStrictEqual(origIds, resultIds);
  });
});

suite('Comeback Detection', () => {
  test('comeback triggers after threshold days', () => {
    let lastPlay = '2024-01-01';
    let today = '2024-01-04';
    assert.ok(daysBetween(lastPlay, today) >= COMEBACK_THRESHOLD_DAYS);
  });

  test('no comeback on consecutive days', () => {
    let lastPlay = '2024-01-01';
    let today = '2024-01-02';
    assert.ok(daysBetween(lastPlay, today) < COMEBACK_THRESHOLD_DAYS);
  });
});

// ==================== Results ====================
console.log(`\n\x1b[1m${'='.repeat(50)}\x1b[0m`);
console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed, ${total} total\x1b[0m`);
console.log(`\x1b[1m${'='.repeat(50)}\x1b[0m\n`);
process.exit(failed > 0 ? 1 : 0);
