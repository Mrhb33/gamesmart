// ==================== Background Particles (optimized) ====================
const canvas = document.getElementById('bgCanvas'), ctx = canvas.getContext('2d');
let particles = [], mouseX = 0, mouseY = 0;
let _particleReduced = false, _pageHidden = false;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
function initParticles() {
  particles = [];
  let count = isReducedMotion() ? 0 : Math.min(35, Math.floor(window.innerWidth * window.innerHeight / 28000));
  for (let i = 0; i < count; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2, r: Math.random() * 2.5 + .8, alpha: Math.random() * .15 + .05, pulse: Math.random() * Math.PI * 2, pulseSpeed: Math.random() * .02 + .005, color: ['#f59e0b', '#10b981', '#06b6d4', '#a855f7', '#5b8def'][Math.floor(Math.random() * 5)] });
}
function setOSStatusBarColor(hexColor) {
  let metaThemeColor = document.querySelector("meta[name=theme-color]");
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", hexColor);
  }
}

let _lastBgTime = 0;
function animateBg(time) {
  requestAnimationFrame(animateBg);
  if (_pageHidden || isReducedMotion()) return;
  let dt = Math.min(time - _lastBgTime, 50);
  if (dt < 16) return;
  _lastBgTime = time;
  let timeScale = dt / 33;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let drawLines = !_particleReduced;
  if (drawLines) {
    const grd = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 300);
    grd.addColorStop(0, 'rgba(245,158,11,0.03)'); grd.addColorStop(0.5, 'rgba(91,141,239,0.015)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i]; p.x += p.vx * timeScale; p.y += p.vy * timeScale; p.pulse += p.pulseSpeed * timeScale;
    if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0; if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
    let pr = Math.max(.5, p.r + Math.sin(p.pulse) * .5);
    let pa = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3);
    // Core dot — skip glow gradient during quiz for performance
    ctx.beginPath(); ctx.arc(p.x, p.y, pr, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.globalAlpha = pa; ctx.fill();
    if (!drawLines) {
      // Simplified glow for quiz mode — smaller, no gradient
      ctx.beginPath(); ctx.arc(p.x, p.y, pr * 2.5, 0, Math.PI * 2); ctx.globalAlpha = pa * 0.15; ctx.fill();
    } else {
      let grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 4);
      grd.addColorStop(0, p.color); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(p.x, p.y, pr * 4, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.globalAlpha = pa * 0.3; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j], dx = p.x - p2.x, dy = p.y - p2.y, dist = dx * dx + dy * dy;
        if (dist < 14400) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.strokeStyle = p.color; ctx.globalAlpha = (1 - Math.sqrt(dist) / 120) * .04; ctx.lineWidth = .5; ctx.stroke(); }
      }
    }
  }
  ctx.globalAlpha = 1;
}
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
document.addEventListener('visibilitychange', () => { _pageHidden = document.hidden; });
resizeCanvas(); initParticles(); requestAnimationFrame(animateBg);

// ==================== Navigation ====================
var _currTab = 'hub';
var viewHistory = ['sWelcome'];
var currentScreenId = 'sWelcome';

function prepareScreenData(id) {
  _particleReduced = (id === 'sQuiz');
  if (id === 'sHub') { updateHub(); saveState(); }
  if (id === 'sShop') { renderShop(); saveState(); trackEvent('shop_opened'); }
  if (id === 'sAchievements') { renderCollection(); S.newAchievements.clear(); S.newRelics.clear(); updateBadge(); }
  if (id === 'sProfile') renderProfile();
  if (id === 'sWeakAreas') renderWeakAreas();
}

function updateBottomNavVisibility(id) {
  if (!D.mainNav) return;
  const isNavVisible = !(id === 'sWelcome' || id === 'sQuiz' || id === 'sOnboarding');
  if (isNavVisible) {
    D.mainNav.style.display = 'flex';
    // Small delay to allow display block to render before sliding in
    requestAnimationFrame(() => {
      D.mainNav.classList.add('visible');
    });
  } else {
    D.mainNav.classList.remove('visible');
    setTimeout(() => {
      if (!D.mainNav.classList.contains('visible')) D.mainNav.style.display = 'none';
    }, 300);
  }

  ['hub', 'shop', 'achievements', 'profile'].forEach(t => {
    let isActive = false;
    if (t === 'hub') isActive = ['sHub', 'sLevelSelect', 'sResults', 'sReview', 'sWeakAreas'].includes(id);
    else if (t === 'shop') isActive = id === 'sShop';
    else if (t === 'achievements') isActive = id === 'sAchievements';
    else if (t === 'profile') isActive = ['sProfile', 'sWeakAreas'].includes(id);
    let tab = document.querySelector(`[data-tab="${t}"]`);
    if (tab) {
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    }
  });
}

function showScreen(targetId, isBack = false) {
  // Backwards compatibility for old calls passing 'slide-left' string
  if (typeof isBack === 'string') isBack = false;
  if (currentScreenId === targetId) return;

  const currentScreen = document.getElementById(currentScreenId);
  const targetScreen = document.getElementById(targetId);
  
  if (!targetScreen) return;

  // Close any open modals when navigating
  $('settingsModal')?.classList.remove('open');
  $('confirmModal')?.classList.remove('open');
  $('nameModal')?.classList.remove('open');

  prepareScreenData(targetId);

  // Clean stale transition classes from target
  targetScreen.classList.remove('pushed-back', 'slide-left', 'slide-right');
  targetScreen.style.transform = '';

  // Force reflow to ensure DOM is ready
  void targetScreen.offsetWidth;

  if (isBack) {
    viewHistory.pop();

    requestAnimationFrame(() => {
      targetScreen.classList.add('active');

      if (currentScreen) {
        currentScreen.classList.remove('active');
        currentScreen.classList.add('pushed-back');
      }
    });
  } else {
    viewHistory.push(targetId);

    requestAnimationFrame(() => {
      targetScreen.classList.add('active');

      if (currentScreen) {
        currentScreen.classList.remove('active');
        currentScreen.classList.add('pushed-back');
      }
    });
  }
  
  currentScreenId = targetId;
  updateBottomNavVisibility(targetId);
  targetScreen.setAttribute('tabindex', '-1');
  targetScreen.focus({ preventScroll: true });
}

function handleHardwareBack() {
  if (viewHistory.length > 1) {
    const target = viewHistory[viewHistory.length - 2];
    showScreen(target, true);
  }
}

function switchTab(t) { 
  sfxK(); vibe(15); 
  let tabs = ['hub', 'achievements', 'shop', 'profile'];
  let oldIdx = tabs.indexOf(_currTab);
  let newIdx = tabs.indexOf(t);
  let isBack = false;
  
  // For tab switching, we simulate forward/back based on tab index
  if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
    isBack = newIdx < oldIdx;
    if (document.documentElement.dir === 'rtl') {
      isBack = !isBack;
    }
  }
  
  _currTab = t;
  showScreen('s' + t.charAt(0).toUpperCase() + t.slice(1), isBack); 
}
function updateBadge() {
  let b = D.achieveBadge;
  let count = S.newAchievements.size + S.newRelics.size;
  if (count > 0) { b.style.display = 'inline-block'; b.textContent = count; } else b.style.display = 'none';
}
function getRank(lvl) {
  let idx = PLAYER_RANKS.slice().reverse().findIndex(r => lvl >= r.minLvl);
  return t('rank.' + (PLAYER_RANKS.length - 1 - idx));
}
function calcLevel() {
  let l = 1, xp = 0; while (xp + l * 150 <= S.totalXP && l < 200) { xp += l * 150; l++; }
  let need = l * 150; let xpIn = S.totalXP - xp;
  return { lvl: l, xpIn, xpNeed: need, pct: Math.min(100, (xpIn / need) * 100) };
}

// ==================== Confirm Dialog ====================
// ==================== Edit / Reset / Confirm ====================
let cb = null;
function showCnf(t, m, onC) { _prevFocus = document.activeElement; D.confirmTitle.textContent = t; D.confirmMsg.textContent = m; cb = onC; D.confirmModal.classList.add('open'); D.confirmModal.querySelector('.btn-red')?.focus(); }

// ==================== Settings ====================
let _prevFocus = null;
function openSettings() {
  sfxK();
  _prevFocus = document.activeElement;
  let m = $('settingsModal');
  if (!m) return;
  $('settingSound').checked = _settings.sound;
  $('settingHaptics').checked = _settings.haptics;
  $('settingReducedMotion').checked = _settings.reducedMotion;
  $('settingLang').value = _lang;
  m.classList.add('open');
  $('settingsCloseBtn').focus();
}
function closeSettings() { sfxK(); $('settingsModal').classList.remove('open'); if (_prevFocus) _prevFocus.focus(); }

// ==================== Update Banner ====================
let _updatePoller = null;
function showUpdateBanner(sw) {
  if (document.getElementById('updateBanner')) return;
  let b = document.createElement('div');
  b.id = 'updateBanner';
  b.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--accent),#d97706);color:#000;padding:14px 28px;border-radius:var(--radius-md);font-size:14px;font-weight:700;z-index:99999;cursor:pointer;box-shadow:var(--shadow-lg);font-family:DM Sans,sans-serif;display:flex;align-items:center;gap:10px;transition:opacity .3s,transform .3s;';
  b.innerHTML = '<i class="fas fa-arrow-up-from-bracket"></i> ' + t('update.newVersion');
  let btn = document.createElement('button');
  btn.style.cssText = 'background:#000;color:#f59e0b;border:none;padding:6px 16px;border-radius:8px;font-weight:800;font-size:13px;cursor:pointer;font-family:inherit;';
  btn.textContent = t('update.updateBtn');
  btn.onclick = e => { e.stopPropagation(); b.style.opacity='0'; b.style.transform='translateX(-50%) translateY(20px)'; setTimeout(()=>b.remove(),300); sw.postMessage({ type: 'SKIP_WAITING' }); };
  b.appendChild(btn);
  document.body.appendChild(b);
}
function updateOfflineBadge() {
  let existing = document.getElementById('offlineBadge');
  if (!navigator.onLine) {
    if (existing) return;
    let badge = document.createElement('div');
    badge.id = 'offlineBadge';
    badge.style.cssText = 'position:fixed;top:calc(var(--nav-height) + 8px);right:12px;background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3);padding:6px 14px;border-radius:var(--radius-full);font-size:12px;font-weight:600;z-index:100;display:flex;align-items:center;gap:6px;font-family:DM Sans,sans-serif;';
    badge.innerHTML = '<i class="fas fa-signal"></i> ' + t('misc.offline');
    document.body.appendChild(badge);
  } else if (existing) {
    existing.remove();
  }
}

// ==================== Save Export / Import ====================
function exportSave() {
  try {
    const data = localStorage.getItem('cerebrum_save');
    if (!data) { showToast(t('toast.noSaveData')); return; }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `cerebrum-save-${new Date().toISOString().slice(0,10)}.json`;
    a.style.display = 'none'; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
    showToast(t('toast.saveExported'));
  } catch (e) { showToast(t('toast.exportFailed')); }
}
function importSave() {
  let input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = e => {
    let file = e.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = ev => {
      try {
        let raw = ev.target.result;
        let parsed = JSON.parse(raw);
        // Basic structure check
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          showToast(t('toast.invalidSaveFile')); return;
        }
        // Must have recognizable Cerebrum fields
        if (parsed.playerName === undefined && parsed.totalXP === undefined && parsed.categoryData === undefined) {
          showToast(t('toast.invalidSaveFile')); return;
        }
        // Validate via hydrateState to catch schema issues
        try { hydrateState(raw); } catch (e) { showToast(t('toast.invalidSaveFile')); return; }
        // Re-load original state (hydrateState mutated S)
        loadState();
        // Backup current save before overwriting
        let backup = localStorage.getItem('cerebrum_save');
        if (backup) localStorage.setItem('cerebrum_save_backup', backup);
        localStorage.setItem('cerebrum_save', raw);
        showToast(t('toast.saveImported'));
        setTimeout(() => window.location.reload(), 1000);
      } catch (e) { showToast(t('toast.invalidSaveFile')); }
    };
    reader.readAsText(file);
  };
  input.click();
}

function doReset() {
  clearAllTimers();
  S.totalXP = 0; S.curLevelNum = 1; S.bestStreak = 0; S.totalCorrect = 0; S.totalAnswered = 0; S.totalQuizzes = 0; S.perfectQuizzes = 0; S.hardCorrect = 0; S.fastAnswer = 0; S.levelsCleared = 0; S.lvl5Cleared = 0; S.tripleStars = 0; S.realmsMastered = 0;
  S.coins = 0; S.unlockedAvatars = ['A']; S.avatar = 'A'; S.lastDaily = 0; S.lastDailyDate = ''; S.dailyStreak = 0; S.isDaily = false; S.lifelinesUsed = { fifty: 0, time: 0, hint: 0 };
  S.onboardingDone = false; S.unlockedAchievements.clear(); S.newAchievements.clear(); S.claimedAchRewards.clear();
  S.pinnedAchievements = [];
  S.lastQuizAnswers = [];
  S.relicShards = {}; S.unlockedRelics.clear(); S.newRelics.clear();
  S.unlockedShopItems = ['avatar_A','frame_none','title_novice','theme_default'];
  S.equippedFrame = 'frame_none'; S.equippedTitle = 'title_novice'; S.equippedTheme = 'theme_default';
  S.pinnedShowcase = [];
  S.lastDailyDate = ''; S.dailyChestShown = ''; S.missionDate = ''; S.missions = [];
  S.missionSessionStats = { questionsAnswered:0, correctAnswers:0, stagesStarted:0, stagesCompleted:0, dailyCompleted:false, noLifelineStages:0, wrongReviewed:0, starsEarned:0, maxStreak:0 };
  S.weeklyGoalDate = ''; S.weeklyStagesCompleted = 0; S.weeklyGoalClaimed = false;
  S.lastPlayDate = ''; S.comebackShown = '';
  S.skillProfile = { categories: {}, tags: {}, avgResponseTime: 0, totalResponseTime: 0, responseCount: 0 };
  S.stageMastery = {}; S.recentMistakes = [];
  S.answeredQuestionIds = {}; S.weakAreas = {};
  // Reset theme if a custom theme was applied
  if (S.equippedTheme !== 'theme_default') applyTheme('theme_default');
  Object.keys(S.categoryData).forEach(c => { S.categoryData[c].levelData.forEach(l => { l.stars = 0; l.completed = false; }); });
  saveState(); renderProfile(); updateAvatars(); showToast(t('toast.progressReset'));
}
window.addEventListener('online', () => { updateOfflineBadge(); showToast(t('toast.backOnline')); });
window.addEventListener('offline', updateOfflineBadge);
updateOfflineBadge();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    reg.update();
    if (reg.waiting) showUpdateBanner(reg.waiting);
    reg.addEventListener('updatefound', () => {
      let sw = reg.installing;
      sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner(sw);
      });
    });
    // Poll for updates every 2 minutes (not 60s — avoids unnecessary cache misses)
    _updatePoller = setInterval(() => reg.update(), 120 * 1000);
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => { window.location.reload(); });
}

function animateValue(obj, start, end, duration) {
  if (!obj) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // easeOutExpo
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    obj.textContent = Math.floor(easeProgress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

document.addEventListener('contextmenu', e => {
  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
  }
});
