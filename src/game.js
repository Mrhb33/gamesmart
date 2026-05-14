// ==================== Welcome ====================
function startGame() {
  if (!requireQuestions()) return;
  let n = D.playerNameInput.value.trim();
  if (n) S.playerName = n;
  let init = S.playerName.charAt(0).toUpperCase();
  D.hubAvatar.textContent = init; D.hubName.textContent = S.playerName;
  D.profileBigAvatar.textContent = init; D.profileName.textContent = S.playerName; updateAvatars();
  saveState(); sfxK();
  trackEvent('app_open');
  if (!S.onboardingDone) { showScreen('sOnboarding'); initOnboarding(); }
  else { showScreen('sHub'); }
}

// ==================== Onboarding ====================
let _onStep = 0;
function initOnboarding() {
  _onStep = 0;
  updateOnboardingStep();
  $('onboardingNext').onclick = () => {
    sfxK();
    _onStep++;
    if (_onStep >= 4) { finishOnboarding(); return; }
    updateOnboardingStep();
  };
  $('onboardingSkip').onclick = () => { sfxK(); finishOnboarding(); };
}
function updateOnboardingStep() {
  document.querySelectorAll('.onboarding-step').forEach((el, i) => el.classList.toggle('active', i === _onStep));
  document.querySelectorAll('.onboarding-dots .dot').forEach((el, i) => el.classList.toggle('active', i === _onStep));
  let btn = $('onboardingNext');
  if (_onStep === 3) { btn.innerHTML = t('onboard.letsGo') + " <i class='fas fa-rocket'></i>"; }
  else { btn.innerHTML = t('onboard.next') + " <i class='fas fa-arrow-right'></i>"; }
}
function finishOnboarding() {
  S.onboardingDone = true;
  // Give starting crowns to new players
  if (S.coins === 0) { S.coins = 30; }
  saveState();
  trackEvent('onboarding_complete');
  showScreen('sHub');
  // Scroll to recommended realm after a short delay
  setTimeout(() => {
    let rec = document.querySelector('.recommended-realm');
    if (rec) rec.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 400);
}


// ==================== Adaptive Skill Tracking ====================
function trackSkillAnswer(cat, tags, isCorrect, timeMs, level) {
  if (!S.skillProfile) S.skillProfile = { categories: {}, tags: {}, avgResponseTime: 0, totalResponseTime: 0, responseCount: 0 };
  let sp = S.skillProfile;
  // Category-level tracking
  if (cat && cat !== 'daily') {
    if (!sp.categories[cat]) sp.categories[cat] = { correct: 0, answered: 0, totalTime: 0 };
    sp.categories[cat].answered++;
    if (isCorrect) sp.categories[cat].correct++;
    sp.categories[cat].totalTime += timeMs || 0;
  }
  // Tag-level tracking
  if (tags && Array.isArray(tags)) {
    tags.forEach(tag => {
      if (!sp.tags[tag]) sp.tags[tag] = { correct: 0, answered: 0, totalTime: 0 };
      sp.tags[tag].answered++;
      if (isCorrect) sp.tags[tag].correct++;
      sp.tags[tag].totalTime += timeMs || 0;
    });
  }
  // Global response time
  sp.totalResponseTime += timeMs || 0;
  sp.responseCount++;
  sp.avgResponseTime = sp.responseCount > 0 ? Math.round(sp.totalResponseTime / sp.responseCount) : 0;
}

function decaySkillProfile() {
  if (!S.skillProfile) return;
  let today = getISODate();
  if (S.skillProfile._lastDecayDate === today) return;
  S.skillProfile._lastDecayDate = today;
  let sp = S.skillProfile;
  if (sp.tags) {
    Object.keys(sp.tags).forEach(tag => {
      let d = sp.tags[tag];
      if (d.answered > 20) {
        d.answered = Math.max(20, Math.round(d.answered * 0.95));
        d.correct = Math.max(Math.round(d.correct * 0.95), 0);
      }
    });
  }
}

function calcCategoryMastery(cat) {
  if (!S.categoryData[cat]) return 0;
  let ld = S.categoryData[cat].levelData;
  let totalStars = ld.reduce((s, l) => s + l.stars, 0);
  let completed = ld.filter(l => l.completed).length;
  let sp = S.skillProfile;
  let accuracyBonus = 0;
  if (sp && sp.categories[cat] && sp.categories[cat].answered >= 5) {
    accuracyBonus = Math.round((sp.categories[cat].correct / sp.categories[cat].answered) * 15);
  }
  return Math.min(100, Math.round((completed / 5) * 60 + (totalStars / 15) * 25 + accuracyBonus));
}

function isPlayerExcelling() {
  if (S.totalAnswered < 10) return false;
  let acc = S.totalCorrect / S.totalAnswered;
  return acc >= 0.8 && S.bestStreak >= 3;
}

function isPlayerStruggling() {
  if (S.totalAnswered < 5) return false;
  let acc = S.totalCorrect / S.totalAnswered;
  return acc < 0.5;
}

// ==================== Shuffle & Battle Helpers ====================
function shuffle(a) { let c = [...a]; for (let i = c.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1));[c[i], c[j]] = [c[j], c[i]]; } return c; }

function smartShuffle(pool) {
  if (pool.length <= 2) return shuffle(pool);
  let answered = S.answeredQuestionIds || {};
  let now = Date.now();
  let scored = pool.map(q => {
    let last = answered[q.id];
    let unseen = !last;
    let recency = last ? (now - last) / 3600000 : Infinity; // hours since last answer
    let weakBonus = 0;
    if (q.tags && q.tags.length > 0) {
      let weakAreas = S.weakAreas || {};
      q.tags.forEach(t => { if (weakAreas[t] && weakAreas[t].wrong > 0) weakBonus += weakAreas[t].wrong / (weakAreas[t].total || 1); });
    }
    let score = (unseen ? 1000 : recency) + weakBonus * 10 + Math.random();
    return { q, score };
  });
  scored.sort((a, b) => b.score - a.score);
  let ordered = scored.map(s => s.q);
  // Place boss question last (use boss field if available)
  let bossIdx = ordered.findIndex(q => q.boss === true);
  if (bossIdx === -1) bossIdx = ordered.length - 1; // fallback: last question
  if (bossIdx >= 0 && bossIdx < ordered.length - 1) {
    let boss = ordered.splice(bossIdx, 1)[0];
    ordered.push(boss);
  }
  return ordered;
}

function getBattlePhase(idx, total) {
  if (total <= 3) return [t('phase.warmup'), t('phase.challenge'), t('phase.boss')][Math.min(idx, 2)] || t('phase.battle');
  let r = idx / (total - 1);
  if (r <= 0.2) return t('phase.warmup'); if (r <= 0.4) return t('phase.confidence'); if (r <= 0.6) return t('phase.challenge');
  if (r <= 0.8) return t('phase.bossPrep');
  // Check if this is a bonus question (last before boss, but only if player is excelling)
  if (r < 1.0 && isPlayerExcelling()) return t('phase.bonusChallenge');
  if (r < 1.0) return t('phase.finalPush'); return t('phase.boss');
}
function isBossQuestion(idx, total) { return idx === total - 1; }

// ==================== Game Helpers ====================
function cleanTag(tag) { return tag.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function findCatForTag(tag) {
  // Prefer stored category context from weak area tracking
  if (S.weakAreas && S.weakAreas[tag] && S.weakAreas[tag].category) return S.weakAreas[tag].category;
  for (let cat of Object.keys(QUESTIONS)) {
    if ((QUESTIONS[cat] || []).some(q => (q.tags || []).includes(tag))) return cat;
  }
  return null;
}

function startWeakAreaPractice(cat, tag) {
  let pool = (QUESTIONS[cat] || []).filter(q => (q.tags || []).includes(tag));
  if (pool.length < 3) pool = (QUESTIONS[cat] || []).filter(q => q.lvl <= 2);
  if (pool.length === 0) { showToast(t('toast.noPracticeQuestions')); return; }

  // Snapshot tag accuracy before practice for improvement tracking
  let tagData = S.skillProfile && S.skillProfile.tags && S.skillProfile.tags[tag];
  S._practiceSnapshot = tag ? { tag, accuracy: tagData && tagData.answered >= 2 ? tagData.correct / tagData.answered : null } : null;

  S.curCat = cat; S.curLevel = 1; S.qIndex = 0; S.quizScore = 0; S.quizStreak = 0; S.quizMaxStreak = 0; S.quizXP = 0; S.lastQuizAnswers = [];
  S.isDaily = false; S.lifelinesUsed = { fifty: 0, time: 0, hint: 0 }; S._finishing = false;
  S.qs = smartShuffle(pool.slice(0, 10));
  let meta = CATEGORY_META[cat];
  D.quizCatName.textContent = `${catName(cat)} — ${t('weak.practiceTitle')}`;
  D.quizCatDot.style.background = meta.color;
  if (D.quizStageSubtitle) D.quizStageSubtitle.textContent = t('weak.focus', { tag });
  D.quizTotal.textContent = S.qs.length;
  trackEvent('weak_area_practice', { category: cat, tag });
  bumpSessionStat('stagesStarted', 1);
  updateStats(); showScreen('sQuiz'); loadQ();
}

// Calculate stage mastery score based on performance factors
function calcStageMasteryScore(pct, bossDefeated, lifelinesUsed, streak) {
  let score = 0;
  // Accuracy component (0-40 pts)
  score += Math.min(40, pct * 0.4);
  // Boss component (0-25 pts)
  if (bossDefeated) score += 25;
  // Lifeline penalty (0-20 pts)
  let llCount = (lifelinesUsed.fifty || 0) + (lifelinesUsed.time || 0);
  score += Math.max(0, 20 - llCount * 10);
  // Streak component (0-15 pts)
  score += Math.min(15, streak * 1.5);
  return Math.min(100, Math.round(score));
}
function getComboTier(streak) { let best = null; for (let t of COMBO_TIERS) { if (streak >= t.streak) best = t; } return best; }
function applyComboMultiplier(baseXP, streak) { let m = 1; for (let t of COMBO_TIERS) { if (streak >= t.streak) m = t.mult; } return Math.round(baseXP * m); }
function orderBattleQuestions(pool) {
  if (pool.length <= 2) return shuffle(pool);
  let s = shuffle(pool);
  let bi = Math.floor(Math.random() * s.length);
  let boss = s.splice(bi, 1)[0];
  s.push(boss);
  return s;
}
function showComboFeedback(streak) {
  let tier = getComboTier(streak); if (!tier || isReducedMotion()) return;
  let tierIdx = COMBO_TIERS.indexOf(tier);
  let el = document.createElement('div'); el.className = 'combo-fly';
  el.style.color = tier.color;
  el.innerHTML = `<i class="fas ${tier.icon}"></i> ${t('combo.' + tierIdx)}`;
  let target = D.streakPill;
  if (target) { let r = target.getBoundingClientRect(); el.style.left = r.left + 'px'; el.style.top = (r.top - 30) + 'px'; }
  document.body.appendChild(el); setTimeout(() => el.remove(), 900);
}

// ==================== Retention Helpers ====================
function getISODate(d) { let dt = d ? new Date(d) : new Date(); return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'); }
function getISOWeek(d) {
  let dt = new Date(d || Date.now()); dt.setHours(0,0,0,0);
  dt.setDate(dt.getDate() + 3 - (dt.getDay() + 6) % 7);
  let w1 = new Date(dt.getFullYear(), 0, 4);
  return dt.getFullYear() + '-W' + (1 + Math.round((dt - w1) / 604800000));
}
function daysBetween(d1, d2) { return Math.floor((new Date(d2) - new Date(d1)) / 86400000); }
function bumpSessionStat(key, amount) { if (!S.missionSessionStats) return; S.missionSessionStats[key] = (S.missionSessionStats[key] || 0) + (amount || 1); }
function setSessionStat(key, value) { if (!S.missionSessionStats) return; S.missionSessionStats[key] = value; }
function getDailyMilestone(streak) { for (let i = DAILY_STREAK_MILESTONES.length - 1; i >= 0; i--) { if (streak >= DAILY_STREAK_MILESTONES[i].days) return DAILY_STREAK_MILESTONES[i]; } return null; }


// ==================== Start Level / Quiz ====================
function startLevel(cat, lvl) {
  clearAllTimers();
  S.curCat = cat; S.curLevel = lvl; S.qIndex = 0; S.quizScore = 0; S.quizStreak = 0; S.quizMaxStreak = 0; S.quizXP = 0; S.lastQuizAnswers = []; S.isDaily = false;
  S.lifelinesUsed = { fifty: 0, time: 0, hint: 0 }; S._finishing = false;

  let pool = cat === 'daily' ? [] : (QUESTIONS[cat] || []).filter(q => q.lvl === lvl);
  if (cat !== 'daily') {
    if (pool.length === 0) { showToast(t('toast.noChallenges')); showScreen('sLevelSelect'); return; }
    S.qs = smartShuffle(pool);

    // Bonus challenge for excelling players: add a harder bonus question at the end
    if (isPlayerExcelling() && lvl < 5) {
      let bonusPool = (QUESTIONS[cat] || []).filter(q => q.lvl === lvl + 1 && !S.qs.some(s => s.id === q.id));
      if (bonusPool.length > 0) {
        let bonus = bonusPool[Math.floor(Math.random() * bonusPool.length)];
        let bossIdx = S.qs.findIndex(q => q.boss === true);
        if (bossIdx === -1) bossIdx = Math.max(0, S.qs.length - 1);
        S.qs.splice(bossIdx, 0, bonus); // insert before boss
      }
    }
  }

  trackEvent('level_started', { category: cat, level: lvl });
  bumpSessionStat('stagesStarted', 1);
  let meta = CATEGORY_META[cat];
  let lMeta = LEVELS_METADATA[cat] && LEVELS_METADATA[cat][lvl - 1] ? LEVELS_METADATA[cat][lvl - 1] : null;

  if (meta && lMeta) {
    D.quizCatName.textContent = `${catName(cat)} — ${lMeta.title}: ${lMeta.subtitle}`;
  } else {
    D.quizCatName.textContent = meta ? `${catName(cat)} — ${t('quiz.trial')} ${lvl}` : `${cat === 'daily' ? t('quiz.dailyTrial') : catName(cat)} — ${t('quiz.trial')} ${lvl}`;
  }
  D.quizCatDot.style.background = meta ? meta.color : 'var(--accent)';
  if (D.quizStageSubtitle) D.quizStageSubtitle.textContent = lMeta ? `${lMeta.title}: ${lMeta.subtitle}` : `${t('misc.stage')} ${lvl}`;
  D.quizTotal.textContent = S.qs.length;
  updateStats(); showScreen('sQuiz'); loadQ();
}

function loadQ() {
  if (!S.qs || !S.qs.length || S.qIndex >= S.qs.length) { finishLvl(); return; }
  S.questionAnswered = false;
  D.explanationArea.innerHTML = '';
  D.nextQBtn.classList.remove('visible');
  let q = S.qs[S.qIndex]; if (!q) { finishLvl(); return; }
  let phaseName = getBattlePhase(S.qIndex, S.qs.length);
  D.questionNumber.textContent = t('quiz.battleOf', { phase: phaseName, cur: S.qIndex + 1, total: S.qs.length });
  // Use boss field from question data, fallback to position-based
  let isBossQ = q.boss === true || isBossQuestion(S.qIndex, S.qs.length);
  if (D.bossWarning) { D.bossWarning.style.display = isBossQ ? 'block' : 'none'; if (isBossQ) D.bossWarning.innerHTML = '<i class="fas fa-skull-crossbones"></i> ' + t('quiz.bossQuestion'); }
  if (isBossQ) sfxBossStart();
  D.questionText.classList.toggle('boss-question', isBossQ);
  D.questionText.textContent = getQText(q, 'q');
  D.qProgressBar.style.width = `${(S.qIndex / S.qs.length) * 100}%`;
  // Hide hint area until used
  let hintArea = document.getElementById('hintArea');
  if (hintArea) hintArea.style.display = 'none';
  let list = D.optionsList; list.innerHTML = '';
  let opts = getQText(q, 'opts').map((text, origIdx) => ({ text, origIdx }));
  opts = shuffle(opts);
  S._shuffled = opts;
  let letters = ['A', 'B', 'C', 'D'];
  opts.forEach((o, displayIdx) => {
    let btn = document.createElement('button'); btn.className = 'option-btn';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.setAttribute('aria-label', `Option ${letters[displayIdx]}: ${o.text}`);
    btn.innerHTML = `<span class="option-letter">${letters[displayIdx]}</span><span>${escHtml(o.text)}</span>`;
    btn.onclick = () => pickA(displayIdx, o.origIdx);
    list.appendChild(btn);
  });

  startT(); S.quizStartTime = Date.now(); updateLL();
}

function startT() {
  clearAllTimers();
  let dur = (TIMER_DUR[S.curLevel] || 20) * 1000;
  if (isBossQuestion(S.qIndex, S.qs.length)) dur = Math.max(Math.round(dur * 0.75), 8000);

  // Adaptive difficulty: adjust timer based on player skill profile
  if (S.skillProfile && S.curCat && S.skillProfile.categories[S.curCat]) {
    let catData = S.skillProfile.categories[S.curCat];
    if (catData.answered >= 5) {
      let catAcc = catData.correct / catData.answered;
      // Struggling: add up to 25% more time (capped, never unfair for others)
      if (catAcc < 0.5) dur = Math.round(dur * 1.25);
      else if (catAcc < 0.65) dur = Math.round(dur * 1.12);
      // Excelling: slightly less time for challenge (never below minimum)
      else if (catAcc > 0.9 && S.bestStreak >= 5) dur = Math.max(Math.round(dur * 0.9), 8000);
    }
  }
  // Warmup adjustment: first 2 questions get a small buffer for struggling players
  if (isPlayerStruggling() && S.qIndex <= 1) dur = Math.round(dur * 1.1);

  S.timeLeft = dur;
  let f = D.timerFill; f.style.transform = 'scaleX(1)'; f.className = 'timer-fill';
  // Boss questions get red-tinted timer
  let curQ = S.qs && S.qs[S.qIndex];
  let isBossQ = curQ ? (curQ.boss === true) : isBossQuestion(S.qIndex, S.qs.length);
  if (isBossQ) f.classList.add('boss-timer');

  let lastFrameTime = performance.now();
  D.quizTimerText.dataset.secs = Math.ceil(S.timeLeft / 1000);

  function updateTimerBar(timestamp) {
    if (!S.timerInterval) return; // If cancelled
    
    let dt = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    S.timeLeft = Math.max(0, S.timeLeft - dt);
    
    let scale = Math.min(1, Math.max(0, S.timeLeft / dur));
    
    f.style.transform = `scaleX(${scale})`;
    f.className = scale < 0.25 ? 'timer-fill danger' : scale < 0.5 ? 'timer-fill warning' : 'timer-fill';
    if (isBossQ) f.classList.add('boss-timer');
    
    let secs = Math.ceil(S.timeLeft / 1000);
    if(D.quizTimerText.dataset.secs != secs) {
      D.quizTimerText.textContent = t('misc.seconds', {n: secs});
      D.quizTimerText.dataset.secs = secs;
    }
    
    if (S.timeLeft > 0) {
      S.timerInterval = requestAnimationFrame(updateTimerBar);
    } else {
      S.timerInterval = null;
      timeOut();
    }
  }
  S.timerInterval = requestAnimationFrame(updateTimerBar);
}

function timeOut() {
  if (S.questionAnswered) return;
  S.questionAnswered = true;
  let btns = D.optionsList.querySelectorAll('.option-btn');
  btns.forEach(b => b.classList.add('disabled'));
  _answerRevealTimer = setTimeout(() => {
    trackEvent('question_timeout', { category: S.curCat, level: S.curLevel });
    sfxT();
    let q = S.qs[S.qIndex]; S.quizStreak = 0; S.totalAnswered++;
    bumpSessionStat('questionsAnswered', 1);
    let correctDisplayIdx = S._shuffled.findIndex(o => o.origIdx === q.a);
    S.lastQuizAnswers.push({ q: getQText(q, 'q'), shuffled: S._shuffled.map(o => o.text), correctDisplayIdx, selectedDisplayIdx: -1, isCor: false, expl: getQText(q, 'expl'),
      qId: q.id || null, tags: q.tags || [], hint: getQText(q, 'hint') || '', explanationLong: getQText(q, 'explanationLong') || getQText(q, 'expl'),
      correctOpt: getQText(q, 'opts')[q.a], selectedOpt: null, category: S.curCat, level: S.curLevel, responseTime: null });

    // Track answered questions for smart selection
    if (q.id) {
      if (!S.answeredQuestionIds) S.answeredQuestionIds = {};
      S.answeredQuestionIds[q.id] = Date.now();
    }
    // Track weak areas
    if (q.tags && q.tags.length > 0) {
      if (!S.weakAreas) S.weakAreas = {};
      q.tags.forEach(tag => {
        if (!S.weakAreas[tag]) S.weakAreas[tag] = { total: 0, wrong: 0, category: S.curCat };
        S.weakAreas[tag].total++;
        S.weakAreas[tag].wrong++;
      });
    }
    // Track recent mistakes for weak areas screen
    if (!S.recentMistakes) S.recentMistakes = [];
    S.recentMistakes.push({ qId: q.id, tags: q.tags || [], category: S.curCat, level: S.curLevel, ts: Date.now() });
    if (S.recentMistakes.length > 50) S.recentMistakes = S.recentMistakes.slice(-50);
    // Track into adaptive skill profile (timed out = used full timer)
    let fullDur = (TIMER_DUR[S.curLevel] || 20) * 1000;
    trackSkillAnswer(S.curCat, q.tags, false, fullDur, S.curLevel);
    btns.forEach((b, i) => { if (i === correctDisplayIdx) b.classList.add('correct'); });
    let isBossQ = isBossQuestion(S.qIndex, S.qs.length);
    updateStats(); showExpl(q, false, isBossQ ? t('quiz.bossTimesUp') : t('quiz.timesUp')); showNextBtn();
  }, 200);
}

function pickA(dIdx, oIdx) {
  if (S.questionAnswered) return;
  S.questionAnswered = true;
  clearAllTimers();
  let q = S.qs[S.qIndex], isCor = oIdx === q.a, t = (Date.now() - S.quizStartTime) / 1000;

  // Phase 1: Show selected state immediately
  let btns = D.optionsList.querySelectorAll('.option-btn');
  btns[dIdx].classList.add('selected');
  btns[dIdx].setAttribute('aria-checked', 'true');
  btns.forEach(b => b.classList.add('disabled'));

  // Phase 2: Delayed reveal (350ms)
  _answerRevealTimer = setTimeout(() => {
    S.totalAnswered++;
    bumpSessionStat('questionsAnswered', 1);
    const flashEl = document.getElementById('screenFlash');
    if (flashEl) {
      flashEl.className = 'screen-flash';
      void flashEl.offsetWidth;
      flashEl.className = isCor ? 'screen-flash flash-correct' : 'screen-flash flash-wrong';
    }

    if (isCor) {
      vibe('success');
      sfxC(); S.quizScore++; S.quizStreak++; S.totalCorrect++; S.bestStreak = Math.max(S.bestStreak, S.quizStreak);
      if (!S.quizMaxStreak) S.quizMaxStreak = 0;
      S.quizMaxStreak = Math.max(S.quizMaxStreak, S.quizStreak);
      bumpSessionStat('correctAnswers', 1);
      setSessionStat('maxStreak', Math.max(S.missionSessionStats.maxStreak || 0, S.quizStreak));
      trackEvent('question_answered', { correct: true, category: S.curCat, level: S.curLevel, streak: S.quizStreak, time: Math.round(t * 10) / 10 });
      if (S.curLevel >= 4) S.hardCorrect++;
      let xp = applyComboMultiplier(XP_MAP[S.curLevel], S.quizStreak);
      if (isBossQuestion(S.qIndex, S.qs.length)) xp = Math.round(xp * 1.5);
      if (t < 3) { xp = Math.round(xp * 1.25); S.fastAnswer++; }
      S.quizXP += xp; S.totalXP += xp; flyXP(xp);
      showComboFeedback(S.quizStreak);
    } else {
      vibe('error'); sfxW(); S.quizStreak = 0;
      trackEvent('question_answered', { correct: false, category: S.curCat, level: S.curLevel, time: Math.round(t * 10) / 10 });
      D.optionsList.classList.add('shake-anim');
      setTimeout(() => D.optionsList.classList.remove('shake-anim'), 300);
    }

    let correctDisplayIdx = S._shuffled.findIndex(o => o.origIdx === q.a);
    S.lastQuizAnswers.push({ q: getQText(q, 'q'), shuffled: S._shuffled.map(o => o.text), correctDisplayIdx, selectedDisplayIdx: dIdx, isCor, expl: getQText(q, 'expl'),
      qId: q.id || null, tags: q.tags || [], hint: getQText(q, 'hint') || '', explanationLong: getQText(q, 'explanationLong') || getQText(q, 'expl'),
      correctOpt: getQText(q, 'opts')[q.a], selectedOpt: getQText(q, 'opts')[oIdx], category: S.curCat, level: S.curLevel, responseTime: t });

    // Track answered questions for smart selection
    if (q.id) {
      if (!S.answeredQuestionIds) S.answeredQuestionIds = {};
      S.answeredQuestionIds[q.id] = Date.now();
    }

    // Track weak areas by tag
    if (q.tags && q.tags.length > 0) {
      if (!S.weakAreas) S.weakAreas = {};
      q.tags.forEach(tag => {
        if (!S.weakAreas[tag]) S.weakAreas[tag] = { total: 0, wrong: 0, category: S.curCat };
        S.weakAreas[tag].total++;
        if (!isCor) S.weakAreas[tag].wrong++;
      });
    }

    // Track recent mistakes for weak areas screen
    if (!isCor) {
      if (!S.recentMistakes) S.recentMistakes = [];
      S.recentMistakes.push({ qId: q.id, tags: q.tags || [], category: S.curCat, level: S.curLevel, ts: Date.now() });
      if (S.recentMistakes.length > 50) S.recentMistakes = S.recentMistakes.slice(-50);
    }

    // Track into adaptive skill profile
    trackSkillAnswer(S.curCat, q.tags, isCor, t * 1000, S.curLevel);

    btns.forEach((b, i) => {
      b.classList.add('disabled');
      if (i === correctDisplayIdx) b.classList.add('correct');
      if (i === dIdx && !isCor) b.classList.add('incorrect');
    });

    updateStats(); showExpl(q, isCor); checkAch(); showNextBtn();
  }, 350);
}

function showNextBtn() {
  D.nextQBtn.classList.add('visible');
  _autoAdvance = setTimeout(() => { S.qIndex++; loadQ(); }, 2000);
}

function updateStats() {
  if (D.quizXP) D.quizXP.textContent = S.quizXP;
  if (D.quizStreak) D.quizStreak.textContent = S.quizStreak;
  if (D.quizScore) D.quizScore.textContent = S.quizScore;
  if (D.streakPill) {
    D.streakPill.classList.toggle('hot', S.quizStreak >= 2);
    D.streakPill.classList.toggle('great', S.quizStreak >= 5);
    D.streakPill.classList.toggle('mega', S.quizStreak >= 10);
  }
}

function showExpl(q, isC, cLab) {
  let box = document.createElement('div'); box.className = 'explanation-box';
  box.setAttribute('role', 'alert');
  box.setAttribute('aria-live', 'assertive');
  let label = document.createElement('div'); label.className = 'label';
  let isBossQ = (q.boss === true) || (S.qs && isBossQuestion(S.qIndex, S.qs.length));
  let bossPrefix = isBossQ ? t('phase.boss').toUpperCase() + ' ' : '';
  let resultText = bossPrefix + (cLab || (isC ? t('quiz.correct') : t('quiz.wrong')));
  label.innerHTML = `<i class="fas ${isC ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${resultText}`;
  label.setAttribute('aria-label', resultText);
  // Announce to screen readers
  let liveEl = document.getElementById('quizAriaLive');
  if (liveEl) liveEl.textContent = resultText;
  // Use explanationLong for wrong answers to teach more, expl for correct
  let explText = (!isC && getQText(q, 'explanationLong')) ? getQText(q, 'explanationLong') : getQText(q, 'expl');
  let text = document.createElement('div'); text.className = 'text'; text.textContent = explText;
  box.appendChild(label); box.appendChild(text);
  // Tags available in review screen, hidden during gameplay for clarity
  if (isBossQ && !isC) {
    let tip = document.createElement('div'); tip.className = 'boss-tip';
    tip.textContent = t('quiz.bossTip');
    box.appendChild(tip);
  }
  D.explanationArea.appendChild(box);
}

function flyXP(amt) {
  if (isReducedMotion()) return;
  let el = document.createElement('div'); el.className = 'xp-fly'; el.textContent = '+' + amt + ' ' + t('misc.xp');
  let target = D.quizXP;
  if (target) { let r = target.getBoundingClientRect(); el.style.left = r.left + 'px'; el.style.top = (r.top - 10) + 'px'; }
  document.body.appendChild(el); setTimeout(() => el.remove(), 700);
}

// Next button & Quiz Quit — wired in DOMContentLoaded below

// ==================== Quiz Quit ====================

// ==================== Daily Trial & Lifelines ====================
function startDaily() {
  if (!requireQuestions()) return;
  sfxK();
  let today = getISODate();
  if (S.lastDailyDate === today) { showToast(t('toast.dailyDone')); return; }
  S.isDaily = true; S.curCat = 'daily'; S.curLevel = 5; S.qIndex = 0; S.quizScore = 0; S.quizStreak = 0; S.quizMaxStreak = 0; S.quizXP = 0; S.lastQuizAnswers = [];
  S.lifelinesUsed = { fifty: 0, time: 0, hint: 0 };
  clearAllTimers(); S._finishing = false;

  let allHard = [];
  Object.values(QUESTIONS).forEach(arr => { if (Array.isArray(arr)) allHard.push(...arr.filter(q => q.lvl >= 4)); });
  if (allHard.length < 1) { showToast(t('toast.noHardQuestions')); S.isDaily = false; return; }
  S.qs = smartShuffle(shuffle(allHard).slice(0, 10));

  D.quizCatName.textContent = t('hub.dailyTrial');
  D.quizCatDot.style.background = 'var(--accent)';
  D.quizTotal.textContent = S.qs.length;
  S.lifelinesUsed = { fifty: 0, time: 0, hint: 0 }; updateLL();
  trackEvent('daily_started');
  updateStats(); showScreen('sQuiz'); loadQ();
}

function updateLL() {
  let llF = D.llFifty, llT = D.llTime, llH = D.llHint;
  if (!llF || !llT) return;
  let llCost = S.totalQuizzes < 3 ? 0 : 20;
  let canAfford = S.coins >= llCost;
  llF.disabled = !canAfford || S.lifelinesUsed.fifty;
  llT.disabled = !canAfford || S.lifelinesUsed.time;
  llF.classList.toggle('used', !!S.lifelinesUsed.fifty);
  llT.classList.toggle('used', !!S.lifelinesUsed.time);
  // Show cost label on buttons
  if (llCost === 0) {
    llF.innerHTML = '<i class="fas fa-percent"></i> 50/50 <span style="font-size:10px;opacity:0.7">' + t('quiz.free') + '</span>';
    llT.innerHTML = '<i class="fas fa-snowflake"></i> ' + t('quiz.freeze') + ' <span style="font-size:10px;opacity:0.7">' + t('quiz.free') + '</span>';
  } else {
    llF.innerHTML = '<i class="fas fa-percent"></i> 50/50 <span style="font-size:10px;opacity:0.7">' + llCost + '</span>';
    llT.innerHTML = '<i class="fas fa-snowflake"></i> ' + t('quiz.freeze') + ' <span style="font-size:10px;opacity:0.7">' + llCost + '</span>';
  }
  // Update aria-labels with state
  llF.setAttribute('aria-label', S.lifelinesUsed.fifty ? '50/50 used' : '50/50 lifeline, costs ' + llCost + ' crowns');
  llT.setAttribute('aria-label', S.lifelinesUsed.time ? 'Freeze time used' : 'Freeze time lifeline, costs ' + llCost + ' crowns');
  llF.onclick = () => { if (!S.lifelinesUsed.fifty && !S.questionAnswered) { if (S.coins >= llCost) { S.coins -= llCost; S.lifelinesUsed.fifty = 1; saveState(); sfxK(); updateLL(); doFifty(); showToast(t('toast.fiftyFifty')); } else { showToast(t('toast.notEnoughCrowns')); } } };
  llT.onclick = () => { if (!S.lifelinesUsed.time && !S.questionAnswered) { if (S.coins >= llCost) { S.coins -= llCost; S.lifelinesUsed.time = 1; saveState(); sfxK(); updateLL(); S.timeLeft += 10000; showToast(t('toast.freezeTime')); if (D.timerFill) { D.timerFill.style.background = 'var(--accent2)'; setTimeout(() => { if (D.timerFill) D.timerFill.style.background = ''; }, 500); } } else { showToast(t('toast.notEnoughCrowns')); } } };
  // Hint lifeline — free, one per quiz
  if (llH) {
    let q = S.qs && S.qs[S.qIndex];
    let hasHint = q && getQText(q, 'hint');
    llH.disabled = S.lifelinesUsed.hint || !hasHint || S.questionAnswered;
    llH.classList.toggle('used', !!S.lifelinesUsed.hint);
    llH.onclick = () => { if (!S.lifelinesUsed.hint && hasHint && !S.questionAnswered) { S.lifelinesUsed.hint = 1; sfxK(); updateLL(); showHint(q); } };
    llH.setAttribute('aria-label', S.lifelinesUsed.hint ? 'Hint used' : (hasHint ? 'Hint lifeline, free' : 'No hint available'));
  }
}

function showHint(q) {
  let existing = document.getElementById('hintArea');
  if (existing) existing.remove();
  let hintBox = document.createElement('div'); hintBox.id = 'hintArea';
  hintBox.style.cssText = 'padding:12px 16px;margin:0 0 12px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:12px;color:var(--accent);font-size:14px;line-height:1.5;';
  hintBox.innerHTML = `<i class="fas fa-lightbulb" style="margin-inline-start:6px;"></i> <strong>${t('quiz.hintLabel')}</strong> ${escHtml(getQText(q, 'hint'))}`;
  let optList = D.optionsList;
  if (optList && optList.parentNode) optList.parentNode.insertBefore(hintBox, optList);
}

function doFifty() {
  if (!S._shuffled || !S.qs[S.qIndex]) return;
  let q = S.qs[S.qIndex];
  let wrongDisplayIdxs = S._shuffled.map((o, i) => o.origIdx !== q.a ? i : -1).filter(i => i >= 0);
  wrongDisplayIdxs = shuffle(wrongDisplayIdxs).slice(0, Math.min(2, wrongDisplayIdxs.length));
  let btns = D.optionsList.querySelectorAll('.option-btn');
  wrongDisplayIdxs.forEach(i => { if (btns[i]) { btns[i].classList.add('eliminated'); btns[i].setAttribute('aria-disabled', 'true'); } });
}

function tryShare() {
  sfxK();
  let catLabel = S.curCat === 'daily' ? t('quiz.dailyTrial') : (catName(S.curCat) + ' ' + t('misc.trial') + ' ' + S.curLevel);
  let txt = `${t('share.title')} - ${catLabel}\n${t('share.score')}: ${S.quizScore}/${S.qs.length}\n${t('share.streak')}: ${S.bestStreak}`;
  try {
    if (navigator.share) navigator.share({ title: t('share.title'), text: txt }).catch(() => { });
    else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => showToast(t('toast.copied'))).catch(() => showToast(t('toast.copyFailed')));
    else showToast(t('toast.shareNotSupported'));
  } catch (e) { showToast(t('toast.shareNotSupported')); }
}

// ==================== Pure Logic (testable) ====================
function calcStars(pct, bossDefeated, isBossStage) {
  let bossOk = bossDefeated || !isBossStage;
  if (pct === 100 && bossOk) return 3;
  if (pct >= 80 && bossOk) return 2;
  if (pct >= 60) return 1;
  return 0;
}

function calcRewards(stars, bestStreak, isDaily, passed, dailyAlreadyDone) {
  let baseCoins = stars * 10;
  let streakBonus = 0;
  if (bestStreak >= 5) streakBonus = 10;
  if (bestStreak >= 10) streakBonus = 25;
  let coins = baseCoins + streakBonus;
  if (isDaily && passed) coins = dailyAlreadyDone ? 0 : 100;
  return coins;
}

// ==================== Keyboard Handler ====================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getISODate, getISOWeek, daysBetween, shuffle, smartShuffle, calcStageMasteryScore, calcCategoryMastery, getComboTier, isBossQuestion, getBattlePhase, calcStars, calcRewards };
}
