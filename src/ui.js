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
function animateBg() {
  if (_pageHidden || isReducedMotion()) { requestAnimationFrame(animateBg); return; }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let drawLines = !_particleReduced;
  if (drawLines) {
    const grd = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 300);
    grd.addColorStop(0, 'rgba(245,158,11,0.03)'); grd.addColorStop(0.5, 'rgba(91,141,239,0.015)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i]; p.x += p.vx; p.y += p.vy; p.pulse += p.pulseSpeed;
    if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0; if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
    let pr = Math.max(.5, p.r + Math.sin(p.pulse) * .5);
    let pa = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3);
    // Glow
    let grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 4);
    grd.addColorStop(0, p.color); grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(p.x, p.y, pr * 4, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.globalAlpha = pa * 0.3; ctx.fill();
    // Core dot
    ctx.beginPath(); ctx.arc(p.x, p.y, pr, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.globalAlpha = pa; ctx.fill();
    if (drawLines) {
      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j], dx = p.x - p2.x, dy = p.y - p2.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.strokeStyle = p.color; ctx.globalAlpha = (1 - dist / 120) * .04; ctx.lineWidth = .5; ctx.stroke(); }
      }
    }
  }
  ctx.globalAlpha = 1; requestAnimationFrame(animateBg);
}
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
document.addEventListener('visibilitychange', () => { _pageHidden = document.hidden; });
resizeCanvas(); initParticles(); animateBg();

// ==================== Navigation ====================
function showScreen(id) {
  // Close any open modals when navigating
  $('settingsModal')?.classList.remove('open');
  $('confirmModal')?.classList.remove('open');
  $('nameModal')?.classList.remove('open');

  const allScreens = ['sHub', 'sLevelSelect', 'sQuiz', 'sResults', 'sReview', 'sWeakAreas', 'sAchievements', 'sProfile', 'sWelcome', 'sShop', 'sOnboarding'];
  allScreens.forEach(s => { let el = $(s); if (el) el.classList.remove('active'); });
  let target = $(id);
  if (!target) return;
  target.classList.add('active');
  if (D.mainNav) D.mainNav.style.display = (id === 'sWelcome' || id === 'sQuiz' || id === 'sOnboarding') ? 'none' : 'flex';

  _particleReduced = (id === 'sQuiz');

  if (id === 'sHub') { updateHub(); saveState(); }
  if (id === 'sShop') { renderShop(); saveState(); trackEvent('shop_opened'); }
  if (id === 'sAchievements') renderCollection();
  if (id === 'sProfile') renderProfile();
  if (id === 'sWeakAreas') renderWeakAreas();

  ['hub', 'shop', 'achievements', 'profile'].forEach(t => {
    let isActive = false;
    if (t === 'hub') isActive = ['sHub', 'sLevelSelect', 'sResults', 'sReview', 'sWeakAreas'].includes(id);
    else if (t === 'shop') isActive = id === 'sShop';
    else if (t === 'achievements') isActive = id === 'sAchievements';
    else if (t === 'profile') isActive = ['sProfile', 'sShop', 'sWeakAreas'].includes(id);
    document.querySelector(`[data-tab="${t}"]`)?.classList.toggle('active', isActive);
  });
  if (id === 'sAchievements') { S.newAchievements.clear(); S.newRelics.clear(); updateBadge(); }
}
function switchTab(t) { sfxK(); showScreen('s' + t.charAt(0).toUpperCase() + t.slice(1)); }
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
    badge.style.cssText = 'position:fixed;top:calc(var(--nav-height) + 8px);right:12px;background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3);padding:6px 14px;border-radius:var(--radius-full);font-size:12px;font-weight:600;z-index:100;display:flex;align-items:center;gap:6px;font-family:DM Sans,sans-serif;backdrop-filter:blur(8px);';
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
        let parsed = JSON.parse(ev.target.result);
        // Validate: must have recognizable Cerebrum fields
        if (!parsed || typeof parsed !== 'object' || (parsed.playerName === undefined && parsed.totalXP === undefined)) {
          showToast(t('toast.invalidSaveFile'));
          return;
        }
        // Backup current save before overwriting
        let backup = localStorage.getItem('cerebrum_save');
        if (backup) localStorage.setItem('cerebrum_save_backup', backup);
        localStorage.setItem('cerebrum_save', ev.target.result);
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
  S.coins = 0; S.unlockedAvatars = ['A']; S.avatar = 'A'; S.lastDaily = 0; S.dailyStreak = 0; S.isDaily = false; S.lifelinesUsed = { fifty: 0, time: 0, hint: 0 };
  S.onboardingDone = false; S.unlockedAchievements.clear(); S.newAchievements.clear(); S.lastQuizAnswers = [];
  S.relicShards = {}; S.unlockedRelics.clear(); S.newRelics.clear();
  S.unlockedShopItems = ['avatar_A','frame_none','title_novice','theme_default'];
  S.equippedFrame = 'frame_none'; S.equippedTitle = 'title_novice'; S.equippedTheme = 'theme_default';
  S.pinnedShowcase = [];
  S.lastDailyDate = ''; S.dailyChestShown = ''; S.missionDate = ''; S.missions = [];
  S.weeklyGoalDate = ''; S.weeklyStagesCompleted = 0; S.weeklyGoalClaimed = false;
  S.lastPlayDate = ''; S.comebackShown = '';
  S.skillProfile = { categories: {}, tags: {}, avgResponseTime: 0, totalResponseTime: 0, responseCount: 0 };
  S.stageMastery = {}; S.recentMistakes = [];
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
