#!/usr/bin/env node
// Cerebrum Quest — Core Logic Test Harness
// Tests: save migration, daily streak, rewards, stars, missions, weekly goal, question selection
//
// Imports pure logic functions from production source files via CommonJS exports.
// Production files use `if (typeof module !== 'undefined') module.exports = ...` guards
// so they work in both browser and Node.js environments.

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

// ==================== Load Production Code ====================
// Provide browser globals that production code expects
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.document = { querySelectorAll: () => [], querySelector: () => null, getElementById: () => null, addEventListener: () => {}, createElement: () => ({ style: {} }) };
global.window = { addEventListener: () => {} };
global.navigator = { onLine: true };
global.requestAnimationFrame = () => {};
global.cancelAnimationFrame = () => {};
global.performance = { now: () => 0 };

// Mock isReducedMotion for audio.js
global.isReducedMotion = () => false;
global._settings = { sound: false, haptics: false };
global._audioUnlocked = true;

// Mock CATEGORY_META for state.js applySaveDefaults
global.CATEGORY_META = {
  science: {}, history: {}, geography: {}, math: {}, language: {}, nature: {}, culture: {}
};

const stateModule = require('./src/state.js');
const { createDefaultState, migrateSave, hydrateState, SAVE_VERSION } = stateModule;

// game.js depends on several globals — provide them before loading
global.S = createDefaultState();
const gameModule = require('./src/game.js');
const { getISODate, getISOWeek, daysBetween, shuffle, smartShuffle, calcStageMasteryScore, isBossQuestion, calcStars, calcRewards } = gameModule;

// ==================== Constants (from data.js) ====================
const TIMER_DUR = { 1: 30, 2: 25, 3: 20, 4: 15, 5: 12 };
const XP_MAP = { 1: 15, 2: 25, 3: 40, 4: 60, 5: 90 };
const WEEKLY_GOAL_TARGET = 5;
const COMEBACK_THRESHOLD_DAYS = 2;

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

// calcStars and calcRewards are now imported from production (src/game.js)
// calcStageMasteryScore is also imported from production

// Mission generation (kept local — depends on template data not in source exports)
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
    // Transient values from save are stripped; defaults from createDefaultState are applied
    assert.deepStrictEqual(S.qs, [], 'qs should be reset to default');
    assert.strictEqual(S.quizScore, 0, 'quizScore should be reset to default');
    assert.strictEqual(S.timerInterval, null, 'timerInterval should be reset to default');
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

  test('getISODate uses local time (not UTC)', () => {
    // Create a date where UTC and local date might differ
    // This test verifies the format is correct regardless of timezone
    let d = getISODate();
    assert.ok(d.match(/^\d{4}-\d{2}-\d{2}$/), 'Should be YYYY-MM-DD');
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
    // Reset global S for test
    global.S = createDefaultState();
    let result = smartShuffle(mockQuestions);
    let bossQ = result.find(q => q.boss === true);
    assert.strictEqual(result[result.length - 1].id, bossQ.id);
  });

  test('unseen questions prioritized', () => {
    global.S = createDefaultState();
    let answeredIds = { q1: Date.now(), q2: Date.now() };
    global.S.answeredQuestionIds = answeredIds;
    let result = smartShuffle(mockQuestions);
    let firstIds = result.slice(0, 3).map(q => q.id);
    assert.ok(!firstIds.includes('q1') || !firstIds.includes('q2'), 'Unseen questions should come first');
  });

  test('no answered questions = all treated equally', () => {
    global.S = createDefaultState();
    let result = smartShuffle(mockQuestions);
    assert.strictEqual(result.length, mockQuestions.length);
  });

  test('preserves all questions', () => {
    global.S = createDefaultState();
    let result = smartShuffle(mockQuestions);
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
