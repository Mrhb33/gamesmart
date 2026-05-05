function updateHub() {
  let li = calcLevel(); S.curLevelNum = li.lvl;
  if (D.hubLevel) D.hubLevel.textContent = getRank(li.lvl);
  if (D.hubXpBar) D.hubXpBar.style.width = li.pct + '%';
  if (D.hubTotalXP) D.hubTotalXP.textContent = S.totalXP;
  if (D.hudLevels) D.hudLevels.textContent = `${S.levelsCleared}/35`;
  let hc = $('hubCoins'); if (hc) hc.textContent = S.coins || 0;

  // Grandmaster state
  let allMastered = S.realmsMastered >= 7;
  if (D.hubTitle) {
    D.hubTitle.textContent = allMastered ? t('hub.grandmasterAchieved') : t('hub.chooseRealm');
    D.hubTitle.className = 'hub-title' + (allMastered ? ' grandmaster-title' : '');
  }
  if (D.hubSubtitle) {
    D.hubSubtitle.textContent = allMastered ? t('hub.grandmasterSub') : t('hub.subtitle');
  }

  // Daily card enhancement
  let dc = $('dailyCard');
  if (dc) {
    let today = getISODate();
    let dailyDone = S.lastDailyDate === today;
    dc.className = 'daily-card' + (dailyDone ? ' completed-daily' : '');
    dc.onclick = dailyDone ? null : startDaily;
    let streakHtml = S.dailyStreak > 0 ? `<span class="daily-streak-badge"><i class="fas fa-fire"></i> ${t('hub.dayStreak', {n: S.dailyStreak})}</span>` : '';
    let ms = getDailyMilestone(S.dailyStreak);
    let msIdx = DAILY_STREAK_MILESTONES.indexOf(ms);
    let msLabel = ms ? (msIdx >= 0 ? t('streak.' + msIdx) : ms.label) : '';
    let milestoneHtml = ms ? `<span class="daily-milestone-badge" style="background:rgba(168,85,247,0.15);color:${ms.color}"><i class="fas ${ms.icon}"></i> ${msLabel}</span>` : '';
    dc.innerHTML = `<h3><i class="fas fa-fire-flame-curved" style="color:var(--accent)"></i> ${t('hub.dailyTrial')} ${streakHtml}${milestoneHtml}</h3>
      <p>${dailyDone ? '<i class="fas fa-check-circle" style="color:var(--accent2)"></i> ' + t('hub.dailyDone') : t('misc.10hardQuestions') + ' · <span class="daily-reward-tag"><i class="fas fa-coins"></i> 100 ' + t('hub.crowns') + '</span>'}</p>`;
  }

  // Comeback detection
  let comebackCard = $('comebackCard');
  if (comebackCard) {
    let todayISO = getISODate();
    if (S.lastPlayDate && S.comebackShown !== todayISO) {
      let daysAway = daysBetween(S.lastPlayDate, todayISO);
      if (daysAway >= COMEBACK_THRESHOLD_DAYS) {
        renderComebackCard(daysAway);
        S.comebackShown = todayISO;
        trackEvent('comeback_shown', { daysAway });
      } else { comebackCard.innerHTML = ''; }
    } else { comebackCard.innerHTML = ''; }
    S.lastPlayDate = todayISO;
  }

  renderMissions();
  renderWeeklyGoal();

  // Continue Journey card
  let cc = D.continueCard;
  if (cc) {
    let next = findNextStage();
    cc.innerHTML = '';
    if (next) {
      let m = CATEGORY_META[next.cat];
      let stageMeta = getLevelMeta(next.cat, next.level - 1);
      let stageName = stageMeta ? stageMeta.title : (t('misc.stage') + ' ' + next.level);
      let stageSub = stageMeta ? stageMeta.subtitle : '';
      let isBoss = next.level === 5;
      let CAT_RGBA = { science: '6,182,212', history: '245,158,11', geography: '16,185,129', math: '239,68,68', language: '168,85,247', nature: '34,197,94', culture: '236,72,153' };
      let iconBg = CAT_RGBA[next.cat] || '91,141,239';
      let el = document.createElement('div'); el.className = 'continue-card';
      el.innerHTML = `
        <div class="continue-icon" style="background:rgba(${iconBg},0.15);color:${m.color}"><i class="fas ${m.icon}"></i></div>
        <div class="continue-info">
          <div class="ci-label">${t('hub.continueJourney')}</div>
          <div class="ci-realm">${catName(next.cat)} ${isBoss ? '· ' + t('hub.bossGate') : ''}</div>
          <div class="ci-stage">${stageName}${stageSub ? ': ' + stageSub : ''}</div>
        </div>
        <button class="continue-cta"><i class="fas fa-play"></i> ${t('hub.continue')}</button>`;
      el.addEventListener('click', () => { sfxK(); startLevel(next.cat, next.level); });
      cc.appendChild(el);
    } else {
      let el = document.createElement('div'); el.className = 'continue-card grandmaster';
      el.innerHTML = `
        <div class="continue-icon"><i class="fas fa-crown"></i></div>
        <div class="continue-info">
          <div class="ci-label">${t('hub.grandmaster')}</div>
          <div class="ci-realm">${t('hub.allRealmsConquered')}</div>
          <div class="ci-stage">${t('hub.viewCodex')}</div>
        </div>
        <button class="continue-cta" style="background:linear-gradient(135deg,var(--accent),#d97706)"><i class="fas fa-scroll"></i> ${t('hub.codex')}</button>`;
      el.addEventListener('click', () => { sfxK(); switchTab('profile'); });
      cc.appendChild(el);
    }
  }

  // Adaptive Recommendations
  let arc = $('adaptiveRecs');
  if (arc) {
    let recs = getAdaptiveRecommendations();
    arc.innerHTML = '';
    if (recs.length > 0) {
      let grid = document.createElement('div'); grid.className = 'adaptive-recs-grid';
      recs.forEach((r, i) => {
        let bgStyle = '';
        if (r.type === 'boss') bgStyle = 'background:linear-gradient(135deg,rgba(239,68,68,0.1),rgba(239,68,68,0.05));border-color:rgba(239,68,68,0.3);';
        else if (r.type === 'weak') bgStyle = 'background:linear-gradient(135deg,rgba(249,115,22,0.1),rgba(249,115,22,0.05));border-color:rgba(249,115,22,0.3);';
        else if (r.type === 'improve') bgStyle = 'background:linear-gradient(135deg,rgba(234,179,8,0.1),rgba(234,179,8,0.05));border-color:rgba(234,179,8,0.3);';
        else if (r.type === 'review') bgStyle = 'background:linear-gradient(135deg,rgba(91,141,239,0.1),rgba(91,141,239,0.05));border-color:rgba(91,141,239,0.3);';
        else bgStyle = 'background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.05));border-color:rgba(16,185,129,0.3);';
        let el = document.createElement('div'); el.className = 'adaptive-rec-card'; el.style.cssText = bgStyle;
        el.innerHTML = `
          <div class="rec-icon" style="color:${r.color}"><i class="fas ${r.icon}"></i></div>
          <div class="rec-info"><div class="rec-label">${r.label}</div><div class="rec-desc">${escHtml(r.desc)}</div></div>
          <button class="rec-cta" style="color:${r.color}"><i class="fas fa-play"></i></button>`;
        el.addEventListener('click', () => { if (r.action) { sfxK(); r.action(); } });
        grid.appendChild(el);
      });
      arc.appendChild(grid);
    }
  }

  // Realm cards with stage paths
  let grid = D.categoryGrid; if (!grid) return; grid.innerHTML = '';
  let CAT_RGBA = { science: '6,182,212', history: '245,158,11', geography: '16,185,129', math: '239,68,68', language: '168,85,247', nature: '34,197,94', culture: '236,72,153' };
  let isNewPlayer = S.levelsCleared === 0;
  let recommendedCat = isNewPlayer ? 'science' : null;
  let nextStage = findNextStage();
  if (!recommendedCat && nextStage) recommendedCat = nextStage.cat;

  Object.keys(CATEGORY_META).forEach(cat => {
    let m = CATEGORY_META[cat], ld = S.categoryData[cat].levelData;
    let done = ld.filter(l => l.completed).length, stars = ld.reduce((a, b) => a + b.stars, 0);
    let realmMeta = LEVELS_METADATA[cat] && LEVELS_METADATA[cat][0] ? LEVELS_METADATA[cat][0] : null;
    let rgba = CAT_RGBA[cat] || '255,255,255';
    let isRecommended = cat === recommendedCat && done < 5;

    // Build stage path
    let stagePathHtml = '<div class="stage-path">';
    for (let i = 0; i < 5; i++) {
      let st = ld[i], isBoss = i === 4;
      let avail = i === 0 || ld[i - 1].completed;
      let nodeClass = st.completed ? 'done' : avail ? 'next' : 'locked';
      let nodeIcon = st.completed ? 'fa-check' : avail ? (isBoss ? 'fa-skull' : 'fa-play') : 'fa-lock';
      let nodeStyle = '';
      if (st.completed) nodeStyle = `background:rgba(${rgba},0.9);border-color:transparent;color:#fff;`;
      else if (avail) nodeStyle = `border-color:rgba(${rgba},0.7);color:rgba(${rgba},0.8);`;
      if (i > 0) {
        let lineDone = ld[i - 1].completed ? 'done' : '';
        let lineStyle = ld[i - 1].completed ? `background:rgba(${rgba},0.7);opacity:0.7;` : '';
        stagePathHtml += `<div class="stage-line ${lineDone}" style="${lineStyle}"></div>`;
      }
      stagePathHtml += `<div class="stage-node ${nodeClass} ${isBoss ? 'boss' : ''}" style="${nodeStyle}"><i class="fas ${nodeIcon}"></i></div>`;
    }
    stagePathHtml += '</div>';

    let masteryHtml = done === 5 ? '<div class="realm-mastery-badge"><i class="fas fa-crown"></i> ' + t('hub.mastered') + '</div>' : '';
    let recommendedHtml = isRecommended ? '<div class="realm-recommended-badge"><i class="fas fa-arrow-right"></i> ' + t('hub.recommended') + '</div>' : '';
    let realmSubtitle = realmMeta ? realmMeta.subtitle : catDesc(cat);

    let card = document.createElement('div'); card.className = 'category-card' + (isRecommended ? ' recommended-realm' : ''); card.setAttribute('data-cat', cat);
    card.innerHTML = `${masteryHtml}${recommendedHtml}
  <div class="cat-icon"><i class="fas ${m.icon}"></i></div>
  <div class="cat-name">${catName(cat)}</div>
  <div class="cat-desc" style="font-style:italic;margin-bottom:10px;opacity:0.8;">${realmSubtitle}</div>
  ${stagePathHtml}
  <div class="cat-meta">
    <span class="cat-progress">${done}/5</span>
    <div style="width:70px;height:4px;background:var(--glass);border-radius:2px;overflow:hidden;"><div style="height:100%;width:${(done / 5) * 100}%;background:${m.color};border-radius:2px;transition:width .5s var(--ease-out-expo);"></div></div>
  </div>`;
    card.onclick = () => { sfxK(); trackEvent('topic_selected', { category: cat }); openLevelSelect(cat); };
    grid.appendChild(card);
  });

  // Recent Rewards card
  let rc = D.rewardsCard;
  if (rc) {
    let lastAch = null;
    for (let i = ACHIEVEMENTS.length - 1; i >= 0; i--) {
      if (S.unlockedAchievements.has(ACHIEVEMENTS[i].id)) { lastAch = ACHIEVEMENTS[i]; break; }
    }
    rc.innerHTML = '';
    if (lastAch) {
      let tierRGBA = { Bronze: '205,127,50', Silver: '192,192,192', Gold: '245,158,11', Legendary: '168,85,247', Secret: '16,185,129' };
      let tierHex = { Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#f59e0b', Legendary: '#a855f7', Secret: '#10b981' };
      let tr = tierRGBA[lastAch.tier] || '245,158,11';
      let th = tierHex[lastAch.tier] || '#f59e0b';
      let el = document.createElement('div'); el.className = 'rewards-card';
      el.innerHTML = `
        <div class="rewards-icon" style="background:rgba(${tr},0.12);color:${th}"><i class="fas ${lastAch.icon}"></i></div>
        <div class="rewards-info">
          <div class="ri-label">${t('hub.latestRelic')}</div>
          <div class="ri-name">${escHtml(achieveName(lastAch.id))}</div>
        </div>
        <span class="rewards-tier ${lastAch.tier}">${t('tier.' + lastAch.tier.toLowerCase())}</span>`;
      rc.appendChild(el);
    }
  }
}

// ==================== Continue Journey ====================
function findNextStage() {
  let candidates = [];
  for (let cat of Object.keys(CATEGORY_META)) {
    let ld = S.categoryData[cat].levelData;
    let done = ld.filter(l => l.completed).length;
    if (done === 5) continue;
    for (let i = 0; i < 5; i++) {
      let avail = i === 0 || ld[i - 1].completed;
      if (avail && !ld[i].completed) {
        candidates.push({ cat, level: i + 1, done, stageMeta: LEVELS_METADATA[cat] && LEVELS_METADATA[cat][i] ? LEVELS_METADATA[cat][i] : null });
        break;
      }
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => {
    if (a.done === 4 && b.done !== 4) return -1;
    if (b.done === 4 && a.done !== 4) return 1;
    return b.done - a.done;
  });
  return candidates[0];
}

// ==================== Level Select ====================
function openLevelSelect(cat) {
  S.curCat = cat;
  let m = CATEGORY_META[cat] || { name: cat, icon: 'fa-question', desc: '', color: 'var(--accent)' };
  let ld = S.categoryData[cat] ? S.categoryData[cat].levelData : Array.from({ length: 5 }, () => ({ stars: 0, completed: false }));
  D.lsIcon.innerHTML = `<i class="fas ${m.icon}"></i>`;
  const CAT_RGBA = { science: '6,182,212', history: '245,158,11', geography: '16,185,129', math: '239,68,68', language: '168,85,247', nature: '34,197,94', culture: '236,72,153' };
  D.lsIcon.style.background = `rgba(${CAT_RGBA[cat] || '255,255,255'},0.15)`;
  D.lsIcon.style.color = m.color;
  D.lsTitle.textContent = catName(cat);
  D.lsDesc.textContent = catDesc(cat);

  let list = D.levelList; list.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    let st = ld[i], avail = i === 0 || ld[i - 1].completed;
    let pool = (QUESTIONS[cat] || []).filter(q => q.lvl === (i + 1));
    let cls = st.completed ? 'completed' : avail ? 'available' : 'locked';
    let icon = st.completed ? 'fa-check-circle' : avail ? 'fa-play-circle' : 'fa-lock';
    let starsHtml = Array(3).fill(0).map((_, j) => `<i class="fas fa-star ${j < st.stars ? 'lit' : ''}"></i>`).join('');

    let lMeta = getLevelMeta(cat, i) || { title: lvlName(i), subtitle: "" };
    let isBoss = typeof lMeta.bossIndex !== 'undefined';
    let bossBadge = isBoss ? '<span class="boss-badge"><i class="fas fa-skull"></i> ' + t('ls.boss') + '</span>' : '';
    let themeText = lMeta.theme ? ` · <span style="font-size:11px; opacity:0.7">${lMeta.theme}</span>` : '';
    let diffLabel = i < 2 ? t('ls.warmup') : i === 4 ? t('ls.bossBattle') : t('ls.challenge');
    let diffColor = i < 2 ? 'var(--accent2)' : i === 4 ? 'var(--danger)' : 'var(--accent)';

    // Reward preview
    let xpPerQ = XP_MAP[i + 1] || 15;
    let qCount = pool.length || 10;
    let maxXP = Math.round(xpPerQ * qCount * 2.0);
    let minXP = Math.round(xpPerQ * qCount * 0.6);
    let maxCrowns = (i + 1) * 3 * 10 + 25;
    let rewardHtml = avail && !st.completed ? `<span style="font-size:11px;opacity:0.6"><i class="fas fa-bolt" style="color:var(--accent)"></i> ${minXP}-${maxXP} XP · <i class="fas fa-coins" style="color:#eab308"></i> 0-${maxCrowns}</span>` : '';

    let el = document.createElement('div'); el.className = `level-card ${cls}`;
    el.style.animationDelay = `${i * 0.05}s`;
    el.innerHTML = `
  <div class="lc-left"><div class="lc-num">${i + 1}</div>
  <div class="lc-info"><h3>${lMeta.title}${lMeta.subtitle ? ': ' + lMeta.subtitle : ''}${bossBadge}</h3><p>${pool.length} ${t('ls.qs')} · <span style="color:${diffColor}; font-weight:600;">${diffLabel}</span>${themeText}</p>${rewardHtml}</div></div>
  <div class="lc-right"><div class="lc-stars">${starsHtml}</div><div class="lc-status"><i class="fas ${icon}"></i></div></div>`;
    if (avail) el.onclick = () => { sfxK(); startLevel(cat, i + 1); };
    list.appendChild(el);
  }
  showScreen('sLevelSelect');
}



function getAdaptiveRecommendations() {
  let recs = [];
  let sp = S.skillProfile;

  // 1. Recommended Next - find the most logical next stage
  let next = findNextStage();
  if (next) {
    recs.push({
      type: 'next', label: t('rec.recommendedNext'),
      desc: t('rec.nextDesc', { realm: catName(next.cat), trial: next.level }),
      icon: CATEGORY_META[next.cat].icon, color: CATEGORY_META[next.cat].color,
      action: () => startLevel(next.cat, next.level)
    });
  }

  // 2. Practice Weak Area - find weakest tag/category
  if (sp && sp.tags) {
    let weakest = null, weakScore = Infinity;
    Object.entries(sp.tags).forEach(([tag, data]) => {
      if (data.answered >= 3) {
        let acc = data.correct / data.answered;
        if (acc < weakScore) { weakScore = acc; weakest = { tag, ...data }; }
      }
    });
    if (weakest && weakScore < 0.7) {
      // Find a category for this tag
      let weakCat = findCatForTag(weakest.tag);
      if (weakCat) {
        let catMeta = CATEGORY_META[weakCat];
        let reason = weakScore < 0.4 ? t('rec.reasonLowAcc') : t('rec.reasonRepeated');
        recs.push({
          type: 'weak', label: t('rec.practiceWeakArea'),
          desc: `${reason} ${cleanTag(weakest.tag)} (${Math.round(weakScore * 100)}%)`,
          icon: 'fa-crosshairs', color: '#f97316',
          action: () => startWeakAreaPractice(weakCat, weakest.tag)
        });
      }
    }
  }

  // 3. Ready for Boss - completed 4 stages in a realm but haven't done boss
  for (let cat of Object.keys(CATEGORY_META)) {
    let ld = S.categoryData[cat].levelData;
    if (ld[3].completed && !ld[4].completed) {
      let catMeta = CATEGORY_META[cat];
      recs.push({
        type: 'boss', label: t('rec.readyForBoss'),
        desc: t('rec.bossBattleAwaits', { realm: catName(cat) }),
        icon: 'fa-skull', color: '#ef4444',
        action: () => startLevel(cat, 5)
      });
      break;
    }
  }

  // 4. Review Mistakes
  if (S.recentMistakes && S.recentMistakes.length >= 3) {
    recs.push({
      type: 'review', label: t('rec.reviewMistakes'),
      desc: t('rec.areasToRevisit', { n: S.recentMistakes.length }),
      icon: 'fa-book-open', color: 'var(--accent)',
      action: () => showScreen('sWeakAreas')
    });
  }

  // 5. Improve a 1-star or 2-star stage
  for (let cat of Object.keys(CATEGORY_META)) {
    let ld = S.categoryData[cat].levelData;
    for (let i = 0; i < 5; i++) {
      if (ld[i].completed && ld[i].stars < 3) {
        let catMeta = CATEGORY_META[cat];
        let lMeta = LEVELS_METADATA[cat] && LEVELS_METADATA[cat][i] ? LEVELS_METADATA[cat][i] : null;
        recs.push({
          type: 'improve', label: t('rec.improveScore'),
          desc: t('rec.improveDesc', { realm: catName(cat), trial: i + 1, stars: ld[i].stars }),
          icon: 'fa-arrow-up', color: '#eab308',
          action: () => startLevel(cat, i + 1)
        });
        break;
      }
    }
    if (recs.some(r => r.type === 'improve')) break;
  }

  return recs.slice(0, 4);
}



// ==================== Quiz Quit ====================

// ==================== Retention Systems ====================
function generateMissions() {
  let today = getISODate();
  let seed = 0; for (let i = 0; i < today.length; i++) seed = ((seed << 5) - seed) + today.charCodeAt(i);
  let rand = (max) => { seed = (seed * 16807) % 2147483647; return Math.abs(seed) % max; };
  let picked = [];
  ['easy', 'medium', 'hard'].forEach(diff => {
    let pool = MISSION_TEMPLATES[diff];
    let tmpl = pool[rand(pool.length)];
    let target = tmpl.targetFn();
    picked.push({ id: tmpl.id + '_' + today, i18nKey: tmpl.i18nKey, desc: t(tmpl.i18nKey, {n: target}), icon: tmpl.icon, difficulty: diff, target, progress: 0, claimed: false, reward: { ...tmpl.reward } });
  });
  return picked;
}
function ensureMissions() {
  let today = getISODate();
  if (S.missionDate !== today) {
    S.missionDate = today;
    S.missions = generateMissions();
    S.missionSessionStats = { questionsAnswered:0, correctAnswers:0, stagesStarted:0, stagesCompleted:0, dailyCompleted:false, noLifelineStages:0, wrongReviewed:0, starsEarned:0, maxStreak:0 };
    saveState(); trackEvent('missions_generated', { date: today });
  }
}
function checkMissionCatProgress(missionBaseId, value) {
  let m = S.missions.find(x => x.id.startsWith(missionBaseId));
  if (m && !m.claimed) m.progress = Math.min(m.target, (m.progress || 0) + value);
}
function checkSessionMissions() {
  let st = S.missionSessionStats; if (!st) return;
  S.missions.forEach(m => {
    if (m.claimed) return;
    let baseId = m.id.split('_')[0];
    switch (baseId) {
      case 'answer': case 'answer20': case 'answer30': m.progress = Math.min(m.target, st.questionsAnswered); break;
      case 'correct': case 'correct15': m.progress = Math.min(m.target, st.correctAnswers); break;
      case 'stages': case 'stages2': case 'stages3': case 'stages5': m.progress = Math.min(m.target, st.stagesCompleted); break;
      case 'streak': case 'streak5': case 'streak8': m.progress = Math.min(m.target, st.maxStreak); break;
      case 'no': case 'noll': case 'noLL': m.progress = Math.min(m.target, st.noLifelineStages); break;
      case 'daily': case 'dailyDone': m.progress = st.dailyCompleted ? 1 : 0; break;
      case 'wrong': case 'wrongReview': m.progress = Math.min(m.target, st.wrongReviewed); break;
      case 'science': case 'science1': break;
    }
  });
  saveState();
}
function claimMission(missionId) {
  let m = S.missions.find(x => x.id === missionId);
  if (!m || m.claimed || m.progress < m.target) return;
  m.claimed = true; S.coins += m.reward.coins; S.totalXP += m.reward.xp;
  saveState(); sfxReward(); flyXP(m.reward.xp);
  showToast(t('toast.missionComplete', { xp: m.reward.xp, coins: m.reward.coins }));
  trackEvent('mission_claimed', { id: missionId }); renderMissions();
}
function renderMissions() {
  ensureMissions();
  let panel = $('missionPanel'); if (!panel) return;
  checkSessionMissions();
  panel.innerHTML = '';
  let wrapper = document.createElement('div'); wrapper.className = 'mission-panel';
  let titleDiv = document.createElement('div'); titleDiv.className = 'mission-panel-title';
  titleDiv.innerHTML = '<i class="fas fa-scroll" style="color:var(--accent)"></i> ' + t('missions.title');
  wrapper.appendChild(titleDiv);

  S.missions.forEach(m => {
    let pct = Math.min(100, Math.round((m.progress / m.target) * 100));
    let complete = m.progress >= m.target;
    let item = document.createElement('div'); item.className = 'mission-item';
    item.innerHTML = `
      <div class="mission-icon ${m.difficulty}"><i class="fas ${m.icon}"></i></div>
      <div class="mission-info">
        <div class="mission-desc">${escHtml(t(m.i18nKey, {n: m.target}))}</div>
        <div class="mission-progress-text">${m.progress} / ${m.target}</div>
        <div class="mission-progress-bar"><div class="mission-progress-fill ${m.difficulty}" style="width:${pct}%"></div></div>
        <div class="mission-reward-preview"><i class="fas fa-bolt"></i> ${m.reward.xp} ${t('misc.xp')} &middot; <i class="fas fa-coins"></i> ${m.reward.coins}</div>
      </div>`;
    let btn = document.createElement('button');
    btn.className = m.claimed ? 'mission-claim-btn claimed' : 'mission-claim-btn';
    if (m.claimed || !complete) {
      btn.disabled = true;
      btn.innerHTML = m.claimed ? '<i class="fas fa-check"></i> ' + t('missions.claimed') : `${pct}%`;
    } else {
      btn.textContent = t('missions.claim');
      btn.addEventListener('click', () => claimMission(m.id));
    }
    item.appendChild(btn);
    wrapper.appendChild(item);
  });
  panel.appendChild(wrapper);
}

function ensureWeeklyGoal() {
  let week = getISOWeek();
  if (S.weeklyGoalDate !== week) { S.weeklyGoalDate = week; S.weeklyStagesCompleted = 0; S.weeklyGoalClaimed = false; saveState(); }
}
function renderWeeklyGoal() {
  ensureWeeklyGoal();
  let card = $('weeklyGoalCard'); if (!card) return;
  let pct = Math.min(100, Math.round((S.weeklyStagesCompleted / WEEKLY_GOAL_TARGET) * 100));
  let complete = S.weeklyStagesCompleted >= WEEKLY_GOAL_TARGET;
  let canClaim = complete && !S.weeklyGoalClaimed;
  let html = `<div class="weekly-goal-card">
    <div class="weekly-goal-header">
      <div class="weekly-goal-title"><i class="fas fa-calendar-week" style="color:var(--accent3)"></i> ${t('weekly.title')}</div>
      <div class="weekly-goal-reward"><i class="fas fa-coins"></i> ${WEEKLY_REWARD.coins} &middot; <i class="fas fa-bolt"></i> ${WEEKLY_REWARD.xp} ${t('misc.xp')}</div>
    </div>
    <div class="weekly-bar-outer"><div class="weekly-bar-fill" style="width:${pct}%"></div></div>
    <div class="weekly-goal-status"><span>${t('weekly.status', { done: S.weeklyStagesCompleted, total: WEEKLY_GOAL_TARGET })}</span><span>${pct}%</span></div>
    ${canClaim ? '<button class="weekly-claim-btn visible" onclick="claimWeeklyGoal()"><i class="fas fa-gift"></i> ' + t('weekly.claimReward') + '</button>' : ''}
    ${S.weeklyGoalClaimed ? '<div style="font-size:12px;color:var(--accent2);margin-top:8px;font-weight:600"><i class="fas fa-check-circle"></i> ' + t('weekly.claimed') + '</div>' : ''}
  </div>`;
  card.innerHTML = html;
}
function claimWeeklyGoal() {
  if (S.weeklyGoalClaimed || S.weeklyStagesCompleted < WEEKLY_GOAL_TARGET) return;
  S.weeklyGoalClaimed = true; S.coins += WEEKLY_REWARD.coins; S.totalXP += WEEKLY_REWARD.xp;
  saveState(); sfxReward(); confetti(); vibeCelebrate();
  showToast(t('toast.weeklyComplete', { xp: WEEKLY_REWARD.xp, coins: WEEKLY_REWARD.coins }));
  trackEvent('weekly_goal_claimed'); renderWeeklyGoal();
}

function showDailyChest(streak) {
  let today = getISODate();
  if (S.dailyChestShown === today) return;
  S.dailyChestShown = today; saveState();
  let ms = getDailyMilestone(streak);
  let overlay = $('chestOverlay'); if (!overlay) return;
  $('chestReward').innerHTML = '<i class="fas fa-coins"></i> 100 ' + t('misc.crowns');
  let streakText = streak > 0 ? t('hub.dayStreak', {n: streak}) : '';
  if (ms) {
    let msIdx = DAILY_STREAK_MILESTONES.indexOf(ms);
    let msLabel = msIdx >= 0 ? t('streak.' + msIdx) : ms.label;
    $('chestStreakInfo').innerHTML = `<span style="color:${ms.color}"><i class="fas ${ms.icon}"></i> ${msLabel}</span> ${streakText}`;
    $('chestIcon').innerHTML = `<i class="fas ${ms.icon}" style="color:${ms.color}"></i>`;
  } else {
    $('chestStreakInfo').textContent = streakText;
    $('chestIcon').innerHTML = '<i class="fas fa-gift"></i>';
  }
  overlay.classList.add('show'); confetti(); vibeCelebrate();
  trackEvent('daily_chest_shown', { streak });
}
function closeChest() { let o = $('chestOverlay'); if (o) o.classList.remove('show'); sfxK(); }

function renderComebackCard(daysAway) {
  let card = $('comebackCard'); if (!card) return;
  let action = findNextStage();
  let actionText = action ? t('comeback.continueWith', { realm: catName(action.cat) }) : t('comeback.exploreRealms');
  let name = S.playerName !== 'Explorer' ? ', ' + escHtml(S.playerName) : '';

  card.innerHTML = '';
  let el = document.createElement('div'); el.className = 'comeback-card';
  el.innerHTML = `
    <div class="comeback-icon"><i class="fas fa-hand-peace"></i></div>
    <div class="comeback-info">
      <div class="comeback-title">${t('comeback.welcomeBack')}${name}!</div>
      <div class="comeback-sub">${daysAway === 1 ? t('comeback.greatToSee.1', { days: daysAway }) : t('comeback.greatToSee.many', { days: daysAway })}</div>
      <div class="comeback-action">${actionText} <i class="fas fa-arrow-right" style="font-size:10px"></i></div>
    </div>`;
  el.addEventListener('click', () => {
    sfxK();
    if (action) startLevel(action.cat, action.level);
    else switchTab('hub');
  });
  card.appendChild(el);
}

// ==================== Shard & Relic Logic ====================
function grantShard(relicId, amount) {
  if (!S.relicShards[relicId]) S.relicShards[relicId] = 0;
  S.relicShards[relicId] += amount;
  let relic = RELIC_ITEMS.find(r => r.id === relicId);
  if (relic && S.relicShards[relicId] >= relic.shardsNeeded && !S.unlockedRelics.has(relicId)) {
    S.unlockedRelics.add(relicId);
    S.newRelics.add(relicId);
    S.relicShards[relicId] = relic.shardsNeeded;
    return true;
  }
  return false;
}

function checkRealmRelicUnlocks(cat) {
  if (!cat || cat === 'daily') return;
  let realmRelics = RELIC_ITEMS.filter(r => r.realm === cat);
  let ld = S.categoryData[cat] ? S.categoryData[cat].levelData : [];
  realmRelics.forEach(relic => {
    let rule = relic.unlockRule;
    if (S.unlockedRelics.has(relic.id)) return;
    if (rule.type === 'clear_stage') {
      let cleared = ld.filter(l => l.completed).length;
      if (cleared >= rule.minStage && (S.relicShards[relic.id] || 0) < relic.shardsNeeded) {
        grantShard(relic.id, 1);
        S._shardQueue.push(relic.id);
      }
    } else if (rule.type === 'stars') {
      let totalStars = ld.reduce((s, l) => s + l.stars, 0);
      if (totalStars >= rule.minStars && (S.relicShards[relic.id] || 0) < relic.shardsNeeded) {
        grantShard(relic.id, 1);
        S._shardQueue.push(relic.id);
      }
    } else if (rule.type === 'master_realm') {
      if (ld.filter(l => l.completed).length === 5) {
        S.unlockedRelics.add(relic.id);
        S.newRelics.add(relic.id);
        S.relicShards[relic.id] = relic.shardsNeeded;
        S._shardQueue.push(relic.id);
      }
    }
  });
}

function showShardPopups() {
  if (!S._shardQueue || S._shardQueue.length === 0) return;
  S._shardQueue.forEach((relicId, i) => {
    let relic = RELIC_ITEMS.find(r => r.id === relicId);
    if (!relic) return;
    let fullyUnlocked = S.unlockedRelics.has(relicId);
    let rs = RARITY_STYLES[relic.rarity] || RARITY_STYLES.Common;
    setTimeout(() => {
      let t = document.createElement('div');
      t.className = 'trophy-modal';
      t.style.borderColor = rs.border;
      t.innerHTML = `
        <div class="trophy-icon" style="color:${rs.color}"><i class="fas ${relic.icon}"></i></div>
        <div class="trophy-info">
          <div class="trophy-label" style="color:${rs.color}">${t('rarity.' + relic.rarity.toLowerCase())} ${t('achieve.shard')}${fullyUnlocked ? ' — ' + t('achieve.relicAssembled') : ''}</div>
          <div class="trophy-name">${escHtml(relicName(relic.id))}</div>
          <div class="trophy-reward">${S.relicShards[relicId]}/${relic.shardsNeeded} ${t('achieve.shards')}</div>
        </div>`;
      document.body.appendChild(t);
      setTimeout(() => t.classList.add('show'), 10);
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3500);
      sfxTrophy();
    }, i * 4000 + 2000);
  });
  S._shardQueue = [];
  saveState();
}

// ==================== Finish Level ====================
function finishLvl() {
  if (S._finishing) return;
  S._finishing = true;
  try {
  clearAllTimers();
  _particleReduced = false;
  S.totalQuizzes++;
  let tot = S.qs ? S.qs.length : 0, cor = S.quizScore;
  if (tot === 0) tot = 1;
  let pct = Math.round((cor / tot) * 100);
  if (cor === tot) S.perfectQuizzes++;
  S._bossDefeated = S.lastQuizAnswers.length > 0 && S.lastQuizAnswers[S.lastQuizAnswers.length - 1].isCor;

  let isDaily = S.curCat === 'daily';
  let ld = (!isDaily && S.categoryData[S.curCat]) ? S.categoryData[S.curCat].levelData[S.curLevel - 1] : { stars: 0, completed: false };
  let passed = pct >= 60;
  // Pre-fetch level metadata for star logic
  let lMeta = (!isDaily && LEVELS_METADATA[S.curCat] && LEVELS_METADATA[S.curCat][S.curLevel - 1]) ? LEVELS_METADATA[S.curCat][S.curLevel - 1] : null;
  // Improved star logic: boss defeated required for 3 stars on boss stages
  let isBossStage = !isDaily && lMeta && typeof lMeta.bossIndex !== 'undefined';
  let bossDefeatedForStars = S._bossDefeated || !isBossStage;
  let st;
  if (pct === 100 && bossDefeatedForStars) st = 3;
  else if (pct >= 80 && bossDefeatedForStars) st = 2;
  else if (pct >= 60) st = 1;
  else st = 0;

  // Calculate and store stage mastery
  if (!isDaily && S.curCat) {
    let key = S.curCat + '_' + S.curLevel;
    let masteryScore = calcStageMasteryScore(pct, S._bossDefeated, S.lifelinesUsed, S.quizStreak);
    if (!S.stageMastery[key] || (S.stageMastery[key].score || 0) < masteryScore) {
      S.stageMastery[key] = { score: masteryScore, pct, bossDefeated: S._bossDefeated };
    }
  }

  // Reward calculation
  let baseCoins = st * 10;
  let speedBonus = 0, streakBonus = 0;
  // Speed bonus: based on XP bonuses already earned (fast answers tracked via XP multiplier)
  let fastCount = S.lastQuizAnswers.filter(a => a.isCor).length;
  if (cor >= tot * 0.8 && fastCount > 0) speedBonus = Math.round(baseCoins * 0.25);
  if (S.bestStreak >= 5) streakBonus = 10;
  if (S.bestStreak >= 10) streakBonus = 25;
  let coinsEarned = baseCoins + speedBonus + streakBonus;
  if (isDaily && passed) coinsEarned = (S.lastDailyDate === getISODate()) ? 0 : 100;
  S.coins += coinsEarned;

  if (isDaily) {
    S.lastDaily = Date.now(); S.lastDailyDate = getISODate(); S.dailyStreak++; S.isDaily = false;
    setSessionStat('dailyCompleted', true);
    trackEvent('daily_completed', { score: cor, total: tot, pct: pct });
    if (passed) showDailyChest(S.dailyStreak);
    if (passed) {
      let incompleteRelics = RELIC_ITEMS.filter(r => !S.unlockedRelics.has(r.id));
      if (incompleteRelics.length > 0) {
        let randomRelic = incompleteRelics[Math.floor(Math.random() * incompleteRelics.length)];
        grantShard(randomRelic.id, 1);
        S._shardQueue.push(randomRelic.id);
      }
    }
  } else {
    trackEvent(passed ? 'level_passed' : 'level_failed', { category: S.curCat, level: S.curLevel, score: cor, total: tot, pct: pct, stars: st });
  }
  saveState();
  checkSessionMissions();

  if (!isDaily) {
    if (passed && !ld.completed) {
      ld.completed = true; S.levelsCleared++; if (S.curLevel === 5) S.lvl5Cleared++;
      // First trial bonus: extra crowns for new players
      if (S.levelsCleared === 1) { S.coins += 50; coinsEarned += 50; trackEvent('first_trial_bonus'); }
    }
    if (st > ld.stars) { if (st === 3) S.tripleStars++; ld.stars = st; }
    if (S.categoryData[S.curCat] && S.categoryData[S.curCat].levelData.filter(l => l.completed).length === 5) {
      S.realmsMastered = Object.values(S.categoryData).filter(c => c.levelData.filter(l => l.completed).length === 5).length;
    }
    // Shard rewards
    if (passed) {
      checkRealmRelicUnlocks(S.curCat);
      if (st === 3) {
        let realmRelics = RELIC_ITEMS.filter(r => r.realm === S.curCat && !S.unlockedRelics.has(r.id));
        let target = realmRelics.find(r => (S.relicShards[r.id] || 0) < r.shardsNeeded);
        if (target) { grantShard(target.id, 1); S._shardQueue.push(target.id); }
      }
      // Boss defeated bonus: extra shard + crowns
      if (S._bossDefeated && isBossStage) {
        let bossRelics = RELIC_ITEMS.filter(r => r.realm === S.curCat && !S.unlockedRelics.has(r.id));
        let bossTarget = bossRelics.find(r => (S.relicShards[r.id] || 0) < r.shardsNeeded);
        if (bossTarget) { grantShard(bossTarget.id, 1); S._shardQueue.push(bossTarget.id); }
        coinsEarned += 25; // Boss bonus crowns
      }
    }
    if (passed) {
      bumpSessionStat('stagesCompleted', 1);
      bumpSessionStat('starsEarned', st);
      S.weeklyStagesCompleted = (S.weeklyStagesCompleted || 0) + 1;
      if (S.curCat === 'science') checkMissionCatProgress('science_1', 1);
      if (S.lifelinesUsed.fifty === 0 && S.lifelinesUsed.time === 0) bumpSessionStat('noLifelineStages', 1);
    }
  }

  // Results display
  let isBoss = lMeta && typeof lMeta.bossIndex !== 'undefined';

  if (passed) {
    D.resultsIcon.classList.add('celebrating');
    if (pct === 100) {
      D.resultsTitle.textContent = t('result.perfectRun');
      D.resultsSubtitle.textContent = isBoss ? t('result.perfectBossSub') : t('result.perfectSub');
      D.resultsIcon.innerHTML = '<i class="fas fa-crown" style="color: var(--accent);"></i>';
      sfxTrophy();
    } else {
      D.resultsTitle.textContent = isBoss ? t('result.bossDefeated') : t('result.trialCleared');
      D.resultsSubtitle.textContent = isDaily ? t('result.dailyComplete') : (isBoss ? t('result.bossSub') : t('result.trialSub'));
      D.resultsIcon.innerHTML = '<i class="fas fa-trophy"></i>';
      if (isBoss) sfxBossDefeated(); else sfxReward();
    }
  } else {
    D.resultsIcon.classList.remove('celebrating');
    if (pct >= 40 || (tot - cor === 1)) {
      D.resultsTitle.textContent = t('result.soClose');
      D.resultsSubtitle.textContent = (tot - cor === 1) ? t('result.oneAway') : t('result.onTheEdge');
    } else {
      D.resultsTitle.textContent = t('result.almostThere');
      D.resultsSubtitle.textContent = t('result.almostThereSub');
    }
    D.resultsIcon.innerHTML = '<i class="fas fa-book-open"></i>';
  }
  D.scoreRingValue.textContent = pct + '%';
  D.resXP.textContent = S.quizXP; D.resCoins.textContent = coinsEarned; D.resCorrect.textContent = cor; D.resWrong.textContent = tot - cor;

  // Best streak & boss status
  let bsEl = $('resBestStreak'); if (bsEl) bsEl.textContent = S.bestStreak || S.quizStreak;
  let bossBox = $('resBossBox');
  if (bossBox) {
    let isBossStage = !isDaily && lMeta && typeof lMeta.bossIndex !== 'undefined';
    if (isBossStage) {
      bossBox.style.display = 'block';
      let bd = S._bossDefeated;
      bossBox.className = `result-detail-box ${bd ? 'boss-defeated' : 'boss-failed'}`;
      let bVal = $('resBossStatus');
      if (bVal) bVal.innerHTML = bd ? '<i class="fas fa-check-circle"></i> ' + t('result.defeated') : '<i class="fas fa-skull"></i> ' + t('result.escaped');
    } else { bossBox.style.display = 'none'; }
  }

  // Reward summary — only bonuses/extras (XP and crowns shown in stat boxes above)
  let summaryEl = $('rewardSummary');
  if (summaryEl) {
    let tags = [];
    if (streakBonus > 0) tags.push(`<span class="reward-tag" style="color:#f97316"><i class="fas fa-fire"></i> +${streakBonus} ${t('result.streakBonus')}</span>`);
    if (speedBonus > 0) tags.push(`<span class="reward-tag" style="color:var(--accent3)"><i class="fas fa-bolt-lightning"></i> +${speedBonus} ${t('result.speed')}</span>`);
    if (pct === 100) tags.push(`<span class="reward-tag" style="color:#ec4899"><i class="fas fa-gem"></i> ${t('result.perfectClear')}</span>`);
    if (!isDaily && lMeta && typeof lMeta.bossIndex !== 'undefined') {
      let bd = S._bossDefeated;
      tags.push(`<span class="reward-tag" style="color:${bd ? 'var(--accent2)' : 'var(--danger)'}"><i class="fas ${bd ? 'fa-crown' : 'fa-skull'}"></i> ${t('result.boss')} ${bd ? t('result.defeated') : t('result.escaped')}</span>`);
    }
    let tier = getComboTier(S.bestStreak);
    if (tier) { let tierIdx = COMBO_TIERS.indexOf(tier); tags.push(`<span class="reward-tag" style="color:${tier.color}"><i class="fas ${tier.icon}"></i> ${t('combo.' + tierIdx)}</span>`); }
    if (tags.length > 0) {
      summaryEl.innerHTML = tags.join('');
      summaryEl.style.display = 'flex';
    } else {
      summaryEl.style.display = 'none';
    }
  }

  let circ = D.scoreCircle;
  let circumference = 2 * Math.PI * 68;
  circ.style.stroke = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : pct >= 40 ? '#f97316' : '#ef4444';
  circ.style.transition = 'none'; circ.style.strokeDashoffset = circumference;
  setTimeout(() => { circ.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.2,1,.3,1)'; circ.style.strokeDashoffset = circumference - (pct / 100) * circumference; }, 200);

  let sEls = D.resultsStars.querySelectorAll('.fas');
  sEls.forEach(e => e.className = 'fas fa-star');
  sEls.forEach((e, i) => { if (i < st) setTimeout(() => e.classList.add('lit'), 400 + i * 200); });

  // Banner
  let ban = D.levelCompleteBanner;
  if (passed) {
    ban.classList.add('show'); confetti();
    D.bannerText.textContent = isDaily ? t('result.dailyCompleteBanner') : (t('result.trialComplete', { lvl: S.curLevel }) + (S.curLevel < 5 ? ' — ' + t('result.trialUnlocked', { lvl: S.curLevel + 1 }) : ''));
    let ft = $('failureTips'); if (ft) ft.style.display = 'none';
  } else { ban.classList.remove('show'); }

  // Primary action logic
  let primaryBtn = $('primaryActionBtn');
  let retryBtn = $('retryBtn');
  let catComplete = !isDaily && S.curLevel === 5 && passed;

  if (passed && !isDaily && S.curLevel < 5) {
    primaryBtn.innerHTML = t('result.nextTrial') + ' <i class="fas fa-arrow-right"></i>';
    primaryBtn.className = 'btn btn-gold';
    primaryBtn.onclick = () => { sfxK(); startLevel(S.curCat, S.curLevel + 1); };
    retryBtn.style.display = 'none';
  } else if (catComplete) {
    primaryBtn.innerHTML = '<i class="fas fa-compass"></i> ' + t('result.chooseRealm');
    primaryBtn.className = 'btn btn-gold';
    primaryBtn.onclick = () => { sfxK(); showScreen('sHub'); };
    retryBtn.style.display = 'none';
  } else if (isDaily && passed) {
    primaryBtn.innerHTML = '<i class="fas fa-compass"></i> ' + t('result.backToRealms');
    primaryBtn.className = 'btn btn-gold';
    primaryBtn.onclick = () => { sfxK(); showScreen('sHub'); };
    retryBtn.style.display = 'none';
  } else {
    primaryBtn.innerHTML = '<i class="fas fa-rotate-right"></i> ' + t('result.retryStage');
    primaryBtn.className = 'btn btn-gold';
    primaryBtn.onclick = () => { sfxK(); if (S.curCat === 'daily') { startDaily(); } else { startLevel(S.curCat, S.curLevel); } };
    // Show Review Mistakes button on failure
    retryBtn.innerHTML = '<i class="fas fa-eye"></i> ' + t('result.reviewMistakes');
    retryBtn.className = 'btn btn-ghost';
    retryBtn.style.display = 'inline-flex';
    retryBtn.onclick = () => { sfxK(); openReview(); };

    // Show failure tips with personalized advice
    let ft = $('failureTips');
    if (ft && !isDaily) {
      let wrongAnswers = S.lastQuizAnswers.filter(a => !a.isCor);
      let failedTags = {};
      wrongAnswers.forEach(a => { (a.tags || []).forEach(t => { failedTags[t] = (failedTags[t] || 0) + 1; }); });
      let sortedTags = Object.entries(failedTags).sort((a, b) => b[1] - a[1]);
      let tips = [];

      if (sortedTags.length > 0) {
        tips.push({ icon: 'fa-crosshairs', text: t('result.focusOn', { topics: sortedTags.slice(0, 3).map(([t]) => t).join(', ') }) });
      }
      if (pct >= 50) tips.push({ icon: 'fa-arrow-up', text: t('result.almostPassing', { pct: 60 - pct }) });
      else tips.push({ icon: 'fa-book-open', text: t('result.reviewExplanations') });
      if (S._bossDefeated === false && isBossStage) tips.push({ icon: 'fa-skull', text: t('result.bossEscapedTip') });
      let encouragement = pct >= 50
        ? t('result.encouragement50')
        : t('result.encouragementLow');

      ft.style.display = 'block';
      ft.innerHTML = `<div class="failure-tips">
        <div class="failure-tips-title"><i class="fas fa-lightbulb"></i> ${t('result.practiceTips')}</div>
        ${tips.map(t => `<div class="failure-tip-item"><i class="fas ${t.icon}"></i> ${t.text}</div>`).join('')}
        <div class="failure-encouragement"><i class="fas fa-heart"></i> ${encouragement}</div>
      </div>`;
    }
  }

  S._justClearedNoLifelines = passed && S.lifelinesUsed && S.lifelinesUsed.fifty === 0 && S.lifelinesUsed.time === 0;
  S._justDidComeback = passed && S.lastFailedQuiz === (S.curCat + S.curLevel) && S.reviewOpened;
  S._justPerfectedLevel5 = passed && pct === 100 && S.curLevel === 5;

  // Check adaptive practice improvement
  if (S._practiceSnapshot && S._practiceSnapshot.accuracy !== null) {
    let tag = S._practiceSnapshot.tag;
    let newData = S.skillProfile && S.skillProfile.tags && S.skillProfile.tags[tag];
    if (newData && newData.answered >= 3) {
      let newAcc = newData.correct / newData.answered;
      if (newAcc > S._practiceSnapshot.accuracy) {
        let improvement = Math.round((newAcc - S._practiceSnapshot.accuracy) * 100);
        showToast(t('toast.practiceImproved', { tag: cleanTag(tag), pct: improvement }), 4000);
      }
    }
  }
  S._practiceSnapshot = null;

  showScreen('sResults'); checkAch(); showShardPopups();

  if (passed) {
    S.lastFailedQuiz = null;
    S.reviewOpened = false;
  } else {
    S.lastFailedQuiz = S.curCat + S.curLevel;
    S.reviewOpened = false;
  }
  saveState();
  } finally { S._finishing = false; }
}

let _reviewFilter = 'all';
function openReview() {
  sfxK(); S.reviewOpened = true;
  bumpSessionStat('wrongReviewed', S.lastQuizAnswers.filter(a => !a.isCor).length);
  saveState();
  _reviewFilter = 'all';
  renderReview();
  showScreen('sReview');
}
function filterReview(filter) {
  _reviewFilter = filter;
  document.querySelectorAll('#sReview .coll-tab').forEach(b => b.classList.remove('active'));
  let tabId = filter === 'wrong' ? 'reviewTabWrong' : filter === 'weak' ? 'reviewTabWeak' : 'reviewTabAll';
  let tab = document.getElementById(tabId);
  if (tab) tab.classList.add('active');
  renderReview();
}
function renderReview() {
  let list = D.reviewList; list.innerHTML = '';
  let answers = S.lastQuizAnswers;
  if (_reviewFilter === 'wrong') answers = answers.filter(a => !a.isCor);
  else if (_reviewFilter === 'weak') {
    // Show wrong answers sorted by weakest tags
    let weakAreas = S.weakAreas || {};
    answers = answers.filter(a => !a.isCor).sort((a, b) => {
      let aWeak = (a.tags || []).reduce((s, t) => s + ((weakAreas[t] && weakAreas[t].wrong > 0) ? weakAreas[t].wrong / weakAreas[t].total : 0), 0);
      let bWeak = (b.tags || []).reduce((s, t) => s + ((weakAreas[t] && weakAreas[t].wrong > 0) ? weakAreas[t].wrong / weakAreas[t].total : 0), 0);
      return bWeak - aWeak;
    });
  }
  if (answers.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);"><i class="fas fa-check-circle" style="font-size:32px;display:block;margin-bottom:12px;color:var(--accent2)"></i>' + t('review.perfect') + '</div>';
    return;
  }
  answers.forEach((a, i) => {
    let div = document.createElement('div'); div.className = `review-item ${a.isCor ? 'was-correct' : 'was-wrong'}`;
    let letters = ['A', 'B', 'C', 'D'];
    let opts = a.shuffled || a.opts;
    let ansHtml = opts.map((o, j) => `<span class="review-answer ${j === a.correctDisplayIdx ? 'correct-a' : j === a.selectedDisplayIdx ? 'wrong-a' : ''}">${letters[j]}. ${escHtml(o)}</span>`).join('');
    let qEl = document.createElement('div'); qEl.className = 'review-q'; qEl.textContent = `${i + 1}. ${a.q}`;

    // Show your answer and correct answer explicitly for wrong answers
    if (!a.isCor && a.selectedOpt !== null && a.correctOpt) {
      let detailEl = document.createElement('div'); detailEl.className = 'review-detail';
      detailEl.style.cssText = 'font-size:13px;margin:4px 0 8px;line-height:1.6;';
      detailEl.innerHTML = `<span style="color:#ef4444"><i class="fas fa-times" style="margin-inline-start:4px"></i>${t('review.yourAnswer')} ${escHtml(a.selectedOpt || '(time expired)')}</span><br><span style="color:var(--accent2)"><i class="fas fa-check" style="margin-inline-start:4px"></i>${t('review.correct')}: ${escHtml(a.correctOpt)}</span>`;
      div.appendChild(qEl);
      div.appendChild(detailEl);
    } else {
      div.appendChild(qEl);
    }

    let ansEl = document.createElement('div'); ansEl.className = 'review-answers'; ansEl.innerHTML = ansHtml;
    div.appendChild(ansEl);

    // Enhanced explanation — collapsible on mobile
    let explText = (!a.isCor && a.explanationLong) ? a.explanationLong : a.expl;
    let explEl = document.createElement('div'); explEl.className = 'review-expl';
    let isLong = explText.length > 120;
    if (isLong) {
      let explToggle = document.createElement('button');
      explToggle.className = 'review-expl-toggle';
      explToggle.innerHTML = `<i class="fas fa-lightbulb" style="color:var(--accent);margin-inline-end:6px;"></i>${t('review.showExplanation')} <i class="fas fa-chevron-down" style="font-size:10px;opacity:0.5;"></i>`;
      let explContent = document.createElement('div');
      explContent.className = 'review-expl-collapsed';
      explContent.textContent = explText;
      explToggle.onclick = () => {
        let open = explContent.classList.toggle('review-expl-expanded');
        explToggle.querySelector('.fa-chevron-down, .fa-chevron-up')?.classList.toggle('fa-chevron-down', !open);
        explToggle.querySelector('.fa-chevron-down, .fa-chevron-up')?.classList.toggle('fa-chevron-up', open);
      };
      explEl.appendChild(explToggle);
      explEl.appendChild(explContent);
    } else {
      explEl.innerHTML = `<i class="fas fa-info-circle" style="color:var(--accent);margin-inline-end:4px;"></i>`;
      explEl.appendChild(document.createTextNode(explText));
    }
    div.appendChild(explEl);

    // Tags hidden for cleaner review UI

    // "Try similar" button for wrong answers
    if (!a.isCor && a.tags && a.tags.length > 0 && a.category) {
      let simBtn = document.createElement('button');
      simBtn.className = 'btn btn-ghost btn-sm';
      simBtn.style.cssText = 'margin-top:10px;font-size:12px;';
      simBtn.innerHTML = '<i class="fas fa-graduation-cap"></i> ' + t('review.trySimilar');
      simBtn.onclick = () => trySimilarQuestion(a);
      div.appendChild(simBtn);
    }

    list.appendChild(div);
  });
}

function trySimilarQuestion(answer) {
  // Find questions with matching tags in same category/level that haven't been answered recently
  let cat = answer.category;
  let lvl = answer.level;
  let tags = answer.tags || [];
  let pool = (QUESTIONS[cat] || []).filter(q => {
    if (q.lvl !== lvl) return false;
    if (q.id === answer.qId) return false;
    let overlap = (q.tags || []).filter(t => tags.includes(t)).length;
    return overlap > 0;
  });
  if (pool.length === 0) {
    // Expand to any level in same category
    pool = (QUESTIONS[cat] || []).filter(q => q.id !== answer.qId && (q.tags || []).some(t => tags.includes(t)));
  }
  if (pool.length === 0) {
    showToast(t('toast.noSimilar'));
    return;
  }
  // Start a 3-5 question practice quiz with matching questions
  let count = Math.min(5, Math.max(3, pool.length));
  let selected = shuffle(pool).slice(0, count);
  S.curCat = cat; S.curLevel = lvl; S.qIndex = 0; S.quizScore = 0; S.quizStreak = 0; S.quizXP = 0; S.lastQuizAnswers = []; S.isDaily = false;
  S.lifelinesUsed = { fifty: 0, time: 0, hint: 0 }; S._finishing = false;
  S.qs = smartShuffle(selected);
  let meta = CATEGORY_META[cat];
  if (meta) D.quizCatName.textContent = `${catName(cat)} — ${t('quiz.practiceQuestion')}`;
  D.quizCatDot.style.background = meta ? meta.color : 'var(--accent)';
  if (D.quizStageSubtitle) D.quizStageSubtitle.textContent = t('weak.practiceTitle');
  D.quizTotal.textContent = S.qs.length;
  bumpSessionStat('stagesStarted', 1);
  updateStats(); showScreen('sQuiz'); loadQ();
}

// All UI bindings wired in DOMContentLoaded below

// ==================== Achievements ====================
function checkAch() {
  let newlyUnlocked = [];
  ACHIEVEMENTS.forEach(a => {
    if (!S.unlockedAchievements.has(a.id) && a.check(S)) {
      S.unlockedAchievements.add(a.id); S.newAchievements.add(a.id);
      trackEvent('achievement_unlocked', { id: a.id, name: a.name });
      newlyUnlocked.push(a);
    }
  });

  newlyUnlocked.forEach((a, i) => {
    setTimeout(() => {
      sfxA();
      if (a.reward && a.reward.coins && !S.claimedAchRewards.has(a.id)) {
        S.coins += a.reward.coins;
        S.claimedAchRewards.add(a.id);
      }
      saveState();
      updateBadge();

      let trophyEl = document.createElement('div'); trophyEl.className = `trophy-modal tier-${a.tier.toLowerCase()}`;
      trophyEl.innerHTML = `
    <div class="trophy-icon"><i class="fas ${a.icon}"></i></div>
    <div class="trophy-info">
      <div class="trophy-label">${t('tier.' + a.tier.toLowerCase())} ${t('achieve.collected')}</div>
      <div class="trophy-name">${escHtml(achieveName(a.id))}</div>
      <div class="trophy-reward">+${a.reward.coins} ${t('hub.crowns')}</div>
    </div>
  `;
      document.body.appendChild(trophyEl);
      setTimeout(() => trophyEl.classList.add('show'), 10);
      setTimeout(() => { trophyEl.classList.remove('show'); setTimeout(() => trophyEl.remove(), 400); }, 4000);
    }, i * 4500);
  });
}
let _collTab = 'relics', _collFilter = 'all';

function switchCollTab(tab) {
  _collTab = tab;
  document.querySelectorAll('.coll-tab').forEach(b => b.classList.toggle('active', b.dataset.coll === tab));
  let realmFilter = $('collRealmFilter');
  if (realmFilter) realmFilter.style.display = tab === 'relics' ? 'inline-block' : 'none';
  renderCollection();
}
function filterCollection(filter) {
  if (filter) _collFilter = filter;
  document.querySelectorAll('.coll-filter').forEach(b => b.classList.toggle('active', b.dataset.filter === _collFilter));
  renderCollection();
}

function renderCollection() {
  let grid = D.achievementsGrid;
  if (!grid) return;
  grid.innerHTML = '';
  let realmFilter = $('collRealmFilter') ? $('collRealmFilter').value : 'all';
  let items = [];

  if (_collTab === 'relics') {
    items = RELIC_ITEMS.map(r => ({...r, _type:'relic', _unlocked: S.unlockedRelics.has(r.id), _isNew: S.newRelics.has(r.id)}));
  } else {
    items = ACHIEVEMENTS.map(a => ({...a, _type:'trophy', _unlocked: S.unlockedAchievements.has(a.id), _isNew: S.newAchievements.has(a.id)}));
  }

  if (_collFilter !== 'all') items = items.filter(i => i.rarity === _collFilter);
  if (_collTab === 'relics' && realmFilter !== 'all') items = items.filter(i => i.realm === realmFilter);

  let totalItems = _collTab === 'relics' ? RELIC_ITEMS.length : ACHIEVEMENTS.length;
  let unlockedCount = _collTab === 'relics' ? S.unlockedRelics.size : S.unlockedAchievements.size;
  D.achieveCount.textContent = `${unlockedCount} / ${totalItems} ${t('achieve.collected')}`;

  items.forEach(item => {
    let el = document.createElement('div');
    let rarityClass = `rarity-${item.rarity || 'Common'}`;
    let tierClass = item.tier ? `tier-${item.tier.toLowerCase()}` : '';
    el.className = `achievement-card ${item._unlocked ? 'unlocked' : 'locked'} ${item._isNew ? 'new-unlock' : ''} ${rarityClass} ${tierClass}`;

    let dispIcon = item.icon, dispName = item._type === 'relic' ? relicName(item.id) : achieveName(item.id), dispDesc = item._type === 'relic' ? relicDesc(item.id) : achieveDesc(item.id);
    let isPinned = S.pinnedShowcase && S.pinnedShowcase.includes(item.id);
    let pinHtml = isPinned ? '<i class="fas fa-thumbtack" style="position:absolute;top:12px;inset-inline-start:12px;color:var(--accent);font-size:12px;"></i>' : '';

    if (item._type === 'trophy' && !item._unlocked && item.hidden) {
      dispName = "???"; dispIcon = "fa-question"; dispDesc = t('achieve.secretDesc');
    } else if (item._type === 'trophy' && item._unlocked && item.hiddenDesc) {
      dispDesc = t('achieve.' + item.id + '.hiddenDesc', {}) || item.hiddenDesc;
    }

    let shardHtml = '';
    if (item._type === 'relic') {
      let shards = S.relicShards[item.id] || 0;
      let needed = item.shardsNeeded || 1;
      let pct = Math.min(100, (shards / needed) * 100);
      let rs = RARITY_STYLES[item.rarity] || RARITY_STYLES.Common;
      shardHtml = `<div class="shard-bar-outer"><div class="shard-bar-fill" style="width:${pct}%;background:${rs.color}"></div></div>
        <div style="font-size:10px;color:var(--fg-muted);margin-top:4px;">${shards}/${needed} ${t('achieve.shards')}</div>`;
    }

    let rs = RARITY_STYLES[item.rarity] || RARITY_STYLES.Common;
    let rarityLabel = `<div class="achievement-tier-label">${t('rarity.' + (item.rarity || item.tier).toLowerCase())}</div>`;

    el.innerHTML = `${pinHtml}<div class="badge-new">${t('achieve.new') || 'NEW'}</div>
      <div class="achievement-icon"><i class="fas ${dispIcon}"></i></div>
      <div class="achievement-name">${dispName}</div>
      <div class="achievement-desc">${dispDesc}</div>
      ${shardHtml}${rarityLabel}`;

    if (item._unlocked || item._type === 'trophy') {
      el.style.cursor = 'pointer';
      el.onclick = () => {
        sfxK();
        if (item._type === 'relic' && item._unlocked) openRelicModal(item);
        else togglePin(item);
      };
    }
    grid.appendChild(el);
  });
}

function openRelicModal(relic) {
  let rs = RARITY_STYLES[relic.rarity] || RARITY_STYLES.Common;
  let shards = S.relicShards[relic.id] || 0;
  let realmMeta = CATEGORY_META[relic.realm];
  let realmColor = realmMeta ? realmMeta.color : 'var(--accent)';
  $('relicModalContent').innerHTML = `
    <div style="font-size:48px;margin-bottom:12px;color:${rs.color};filter:drop-shadow(0 0 12px ${rs.color})"><i class="fas ${relic.icon}"></i></div>
    <h3 style="font-size:20px;font-weight:700;margin-bottom:4px;">${escHtml(relicName(relic.id))}</h3>
    <div style="font-size:12px;font-weight:800;letter-spacing:1px;color:${rs.color};margin-bottom:8px;">${t('rarity.' + relic.rarity.toLowerCase())}</div>
    <div style="font-size:14px;color:var(--fg-secondary);line-height:1.5;margin-bottom:12px;">${escHtml(relicDesc(relic.id))}</div>
    <div style="font-size:12px;color:${realmColor};font-weight:600;margin-bottom:8px;"><i class="fas ${realmMeta.icon}"></i> ${catName(relic.realm)}</div>
    <div style="font-size:13px;color:var(--fg-muted);">${t('achieve.shards')}: ${shards}/${relic.shardsNeeded}</div>`;
  $('relicModal').classList.add('open');
}
function closeRelicModal() { $('relicModal').classList.remove('open'); sfxK(); }

function togglePin(item) {
  if (!item._unlocked) return;
  if (!S.pinnedShowcase) S.pinnedShowcase = [];
  let idx = S.pinnedShowcase.indexOf(item.id);
  if (idx >= 0) S.pinnedShowcase.splice(idx, 1);
  else {
    if (S.pinnedShowcase.length >= 3) S.pinnedShowcase.shift();
    S.pinnedShowcase.push(item.id);
  }
  saveState();
  renderCollection();
}

// ==================== Profile ====================


function renderProfile() {
  let li = calcLevel();
  D.profileName.textContent = S.playerName;
  updateAvatars();
  D.profileLevel.textContent = t('profile.seekerRank', { lvl: li.lvl, rank: getRank(li.lvl) });
  D.profileXpCurrent.textContent = `${li.xpIn} ${t('misc.xp')}`; D.profileXpNeeded.textContent = `${li.xpNeed} ${t('misc.xp')}`;
  D.profileXpFill.style.width = `${li.pct}%`;

  // Title badge
  let titleBadge = $('profileTitleBadge');
  if (titleBadge) {
    let titleItem = SHOP_ITEMS.find(i => i.id === S.equippedTitle);
    titleBadge.textContent = titleItem ? shopName(titleItem.id) : t('rank.0');
  }

  // Frame ring
  let frameRing = $('profileFrameRing');
  if (frameRing) {
    let frameColors = { 'frame_bronze': '#cd7f32', 'frame_silver': '#c0c0c0', 'frame_gold': '#ffd700', 'frame_prism': '#a855f7' };
    let c = frameColors[S.equippedFrame];
    if (c && S.equippedFrame !== 'frame_none') {
      frameRing.style.borderColor = c;
      frameRing.style.boxShadow = `0 0 16px ${c}40`;
    } else {
      frameRing.style.borderColor = 'transparent';
      frameRing.style.boxShadow = 'none';
    }
  }

  let totStars = Object.values(S.categoryData).reduce((sum, c) => sum + c.levelData.reduce((s, l) => s + l.stars, 0), 0);
  let acc = S.totalAnswered > 0 ? Math.round((S.totalCorrect / S.totalAnswered) * 100) : 0;

  let weakCount = (S.skillProfile && S.skillProfile.tags) ? Object.values(S.skillProfile.tags).filter(t => t.answered >= 2 && (t.correct / t.answered) < 0.7).length : 0;

  D.profileStatsGrid.innerHTML = `
<div class="profile-stat-card"><div class="pval" style="color:#eab308">${S.coins || 0}</div><div class="plbl">${t('profile.crowns')}</div></div>
<div class="profile-stat-card"><div class="pval">${S.totalXP}</div><div class="plbl">${t('profile.totalXP')}</div></div>
<div class="profile-stat-card"><div class="pval">${S.levelsCleared}/35</div><div class="plbl">${t('profile.trials')}</div></div>
<div class="profile-stat-card"><div class="pval">${acc}%</div><div class="plbl">${t('profile.accuracy')}</div></div>
<div class="profile-stat-card"><div class="pval">${S.bestStreak}</div><div class="plbl">${t('profile.bestStreak')}</div></div>
<div class="profile-stat-card"><div class="pval">${S.realmsMastered}/7</div><div class="plbl">${t('profile.realmsMastered')}</div></div>
<div class="profile-stat-card"><div class="pval">${S.dailyStreak || 0}</div><div class="plbl">${t('profile.dailyStreak')}</div></div>
<div class="profile-stat-card"><div class="pval" style="color:${weakCount > 0 ? '#f97316' : 'var(--accent2)'}">${weakCount}</div><div class="plbl">${t('profile.weakAreas')}</div></div>`;

  // Combined showcase (relics + trophies)
  let showcase = $('profileShowcase');
  if (showcase) {
    let displayList = [];
    if (S.pinnedShowcase && S.pinnedShowcase.length > 0) {
      displayList = S.pinnedShowcase.map(id => {
        let relic = RELIC_ITEMS.find(r => r.id === id);
        if (relic) return { ...relic, _type: 'relic' };
        let trophy = ACHIEVEMENTS.find(a => a.id === id);
        if (trophy) return { ...trophy, _type: 'trophy' };
        return null;
      }).filter(Boolean);
    } else {
      let topRelics = RELIC_ITEMS.filter(r => S.unlockedRelics.has(r.id)).map(r => ({...r, _type:'relic'}));
      let topTrophies = ACHIEVEMENTS.filter(a => S.unlockedAchievements.has(a.id)).map(a => ({...a, _type:'trophy'}));
      let combined = [...topRelics, ...topTrophies];
      const rarityRank = { Mythic:5, Legendary:4, Epic:3, Rare:2, Common:1 };
      displayList = combined.sort((a,b) => (rarityRank[b.rarity]||0) - (rarityRank[a.rarity]||0)).slice(0, 3);
    }

    if (displayList.length > 0) {
      showcase.innerHTML = '<div style="font-size:13px;color:var(--muted);margin-bottom:12px;font-weight:600;">' + t('profile.hallOfFame') + '</div><div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">' +
        displayList.map(item => {
          let rs = RARITY_STYLES[item.rarity] || RARITY_STYLES.Common;
          let itemName = item._type === 'relic' ? relicName(item.id) : achieveName(item.id);
          return `<span style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:var(--card);border:1px solid ${rs.border};border-radius:10px;font-size:13px;font-weight:600;color:${rs.color}"><i class="fas ${item.icon}"></i> ${escHtml(itemName)}</span>`;
        }).join('') + '</div>';
    } else {
      showcase.innerHTML = '<div style="font-size:13px;color:var(--muted);text-align:center;">' + t('profile.collectRelics') + '</div>';
    }
  }
}

// ==================== Weak Areas Screen ====================
function renderWeakAreas() {
  let content = $('weakAreasContent');
  if (!content) return;
  let sp = S.skillProfile || { categories: {}, tags: {} };

  // Overview stats
  let totalTags = Object.keys(sp.tags || {}).length;
  let weakTags = Object.entries(sp.tags || {}).filter(([t, d]) => d.answered >= 2 && (d.correct / d.answered) < 0.7);
  let avgAcc = S.totalAnswered > 0 ? Math.round((S.totalCorrect / S.totalAnswered) * 100) : 0;
  let catMastered = 0, catLearning = 0;
  Object.keys(CATEGORY_META).forEach(cat => {
    let m = calcCategoryMastery(cat);
    if (m >= 70) catMastered++; else if (m > 0) catLearning++;
  });

  let html = `<div class="weak-overview">
    <div class="weak-stat-card"><div class="weak-stat-val" style="color:#f97316">${weakTags.length}</div><div class="weak-stat-lbl">${t('weak.weakAreas')}</div></div>
    <div class="weak-stat-card"><div class="weak-stat-val" style="color:var(--accent)">${catMastered}</div><div class="weak-stat-lbl">${t('weak.strongRealms')}</div></div>
    <div class="weak-stat-card"><div class="weak-stat-val" style="color:${avgAcc >= 70 ? 'var(--accent2)' : '#ef4444'}">${avgAcc}%</div><div class="weak-stat-lbl">${t('weak.overallAccuracy')}</div></div>
    <div class="weak-stat-card"><div class="weak-stat-val" style="color:#eab308">${catLearning}</div><div class="weak-stat-lbl">${t('weak.learning')}</div></div>
  </div>`;

  // Category mastery breakdown
  html += '<div class="weak-cat-section"><div class="weak-cat-title"><i class="fas fa-compass" style="color:var(--accent)"></i> ' + t('weak.realmMastery') + '</div>';
  Object.keys(CATEGORY_META).forEach(cat => {
    let m = calcCategoryMastery(cat);
    let cm = CATEGORY_META[cat];
    let ld = S.categoryData[cat].levelData;
    let done = ld.filter(l => l.completed).length;
    let stars = ld.reduce((s, l) => s + l.stars, 0);
    let tier, tierClass;
    if (m >= 80) { tier = t('weak.mastery.master'); tierClass = 'mastery-master'; }
    else if (m >= 60) { tier = t('weak.mastery.skilled'); tierClass = 'mastery-skilled'; }
    else if (m >= 40) { tier = t('weak.mastery.adept'); tierClass = 'mastery-adept'; }
    else if (m >= 20) { tier = t('weak.mastery.learning'); tierClass = 'mastery-learning'; }
    else { tier = t('weak.mastery.novice'); tierClass = 'mastery-novice'; }
    let barColor = m >= 80 ? '#a855f7' : m >= 60 ? '#10b981' : m >= 40 ? '#eab308' : m >= 20 ? '#f97316' : '#ef4444';
    html += `<div class="weak-tag-item" style="cursor:pointer" onclick="sfxK();openLevelSelect('${cat}')">
      <div class="weak-tag-icon" style="background:${cm.color}22;color:${cm.color}"><i class="fas ${cm.icon}"></i></div>
      <div class="weak-tag-info">
        <div class="weak-tag-name">${catName(cat)} <span class="mastery-badge ${tierClass}">${tier}</span></div>
        <div class="weak-tag-stats">${done}/5 ${t('weak.trials')} · ${m}% ${t('weak.mastery')}</div>
      </div>
      <div class="weak-tag-bar"><div class="weak-tag-bar-fill" style="width:${m}%;background:${barColor}"></div></div>
    </div>`;
  });
  html += '</div>';

  // Weak tags breakdown
  if (weakTags.length > 0) {
    html += '<div class="weak-cat-section"><div class="weak-cat-title"><i class="fas fa-crosshairs" style="color:#f97316"></i> ' + t('weak.weakestTopics') + '</div>';
    // Sort by accuracy ascending (weakest first)
    weakTags.sort((a, b) => (a[1].correct / a[1].answered) - (b[1].correct / b[1].answered));
    weakTags.slice(0, 8).forEach(([tag, data]) => {
      let acc = Math.round((data.correct / data.answered) * 100);
      let cat = findCatForTag(tag);
      let barColor = acc < 40 ? '#ef4444' : acc < 60 ? '#f97316' : '#eab308';
      let practiceBtn = cat ? `<button class="weak-practice-btn" onclick="event.stopPropagation();sfxK();startWeakAreaPractice('${cat}','${tag}')"><i class="fas fa-dumbbell"></i> ${t('weak.practice')}</button>` : '';
      html += `<div class="weak-tag-item">
        <div class="weak-tag-icon" style="background:${barColor}22;color:${barColor}">${Math.round(acc)}</div>
        <div class="weak-tag-info">
          <div class="weak-tag-name">${cleanTag(tag)}</div>
          <div class="weak-tag-stats">${data.correct}/${data.answered} ${t('weak.correct')} · ${acc}% ${t('weak.accuracy')}</div>
        </div>
        <div class="weak-tag-bar"><div class="weak-tag-bar-fill" style="width:${acc}%;background:${barColor}"></div></div>
        ${practiceBtn}
      </div>`;
    });
    html += '</div>';
  } else if (totalTags === 0) {
    html += '<div style="text-align:center;padding:40px;color:var(--muted)"><i class="fas fa-compass" style="font-size:32px;display:block;margin-bottom:12px;color:var(--accent)"></i>' + t('weak.noData') + '</div>';
  } else {
    html += '<div style="text-align:center;padding:30px;color:var(--accent2)"><i class="fas fa-check-circle" style="font-size:28px;display:block;margin-bottom:10px"></i>' + t('weak.noWeakAreas') + '</div>';
  }

  // Recent mistakes summary
  if (S.recentMistakes && S.recentMistakes.length > 0) {
    let recentTags = {};
    S.recentMistakes.slice(-20).forEach(m => {
      (m.tags || []).forEach(t => { recentTags[t] = (recentTags[t] || 0) + 1; });
    });
    let topMistakeTags = Object.entries(recentTags).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (topMistakeTags.length > 0) {
      html += '<div class="weak-cat-section"><div class="weak-cat-title"><i class="fas fa-book-open" style="color:var(--accent)"></i> ' + t('weak.recentTroubleSpots') + '</div>';
      topMistakeTags.forEach(([tag, count]) => {
        let cat = findCatForTag(tag);
        html += `<div class="weak-tag-item" style="padding:10px 14px">
          <div class="weak-tag-info"><div class="weak-tag-name" style="font-size:13px">${cleanTag(tag)}</div><div class="weak-tag-stats">${t('weak.recentMistakes', { n: count })}</div></div>
          ${cat ? `<button class="weak-practice-btn" onclick="event.stopPropagation();sfxK();startWeakAreaPractice('${cat}','${tag}')"><i class="fas fa-redo"></i> ${t('weak.practice')}</button>` : ''}
        </div>`;
      });
      html += '</div>';
    }
  }

  content.innerHTML = html;
}

