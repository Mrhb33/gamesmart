// ==================== Audio System ====================
let aCtx = null;
let _audioUnlocked = false;
function getAudioCtx() {
  try {
    if (!aCtx) { aCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    if (aCtx.state === 'suspended') aCtx.resume();
    return aCtx;
  } catch (e) { return null; }
}
// Unlock audio on first user gesture
document.addEventListener('click', () => { _audioUnlocked = true; getAudioCtx(); }, { once: true });
document.addEventListener('touchstart', () => { _audioUnlocked = true; getAudioCtx(); }, { once: true });
function playTone(freq, dur, type = 'sine', vol = .12) {
  if (!_settings.sound || !_audioUnlocked) return;
  try { let a = getAudioCtx(); if (!a) return; let o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = freq; g.gain.value = vol; g.gain.exponentialRampToValueAtTime(.001, a.currentTime + dur); o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + dur); } catch (e) { }
}
// Correct answer — ascending triad
function sfxC() { playTone(523, .1); setTimeout(() => playTone(659, .1), 80); setTimeout(() => playTone(784, .15), 160); }
// Wrong answer — low buzz
function sfxW() { playTone(200, .25, 'sawtooth', .08); }
// Button tap
function sfxK() { playTone(880, .05, 'sine', .06); }
// Achievement unlock — triumphant fanfare
function sfxA() { playTone(784, .08); setTimeout(() => playTone(988, .08), 80); setTimeout(() => playTone(1175, .12), 160); setTimeout(() => playTone(1568, .2), 260); }
// Timeout/failure
function sfxT() { playTone(300, .15, 'triangle', .08); setTimeout(() => playTone(220, .3, 'triangle', .06), 150); }
// Reward earned — sparkle
function sfxReward() { playTone(1047, .06, 'sine', .08); setTimeout(() => playTone(1319, .06, 'sine', .07), 60); setTimeout(() => playTone(1568, .1, 'sine', .09), 120); }
// Trophy/relic unlock — magical chime
function sfxTrophy() { playTone(659, .12, 'triangle', .1); setTimeout(() => playTone(880, .12, 'triangle', .09), 100); setTimeout(() => playTone(1175, .15, 'triangle', .1), 200); setTimeout(() => playTone(1568, .25, 'sine', .08), 320); }
// Boss start — ominous rumble
function sfxBossStart() { playTone(80, .4, 'sawtooth', .06); setTimeout(() => playTone(100, .3, 'sawtooth', .05), 200); setTimeout(() => playTone(120, .2, 'square', .04), 400); }
// Boss defeated — epic victory
function sfxBossDefeated() { playTone(523, .1, 'square', .08); setTimeout(() => playTone(659, .1, 'square', .08), 100); setTimeout(() => playTone(784, .1, 'square', .08), 200); setTimeout(() => playTone(1047, .2, 'sine', .1), 300); setTimeout(() => playTone(1319, .3, 'sine', .1), 420); }

const vibe = (ms) => {
  if (!_settings.haptics) return;
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { }
};
// Celebratory haptic pattern for rewards
function vibeCelebrate() { vibe([50, 50, 50, 50, 100]); }

function confetti() {
  if (isReducedMotion()) return;
  for (let i = 0; i < 50; i++) {
    let p = document.createElement('div'); p.style.cssText = 'position:fixed;border-radius:50%;left:50%;top:50%;z-index:9999;pointer-events:none;';
    let size = Math.random() * 6 + 4;
    p.style.width = size + 'px'; p.style.height = size + 'px';
    p.style.backgroundColor = ['#f59e0b', '#10b981', '#06b6d4', '#a855f7', '#5b8def', '#ec4899'][Math.floor(Math.random() * 6)];
    p.style.boxShadow = '0 0 6px ' + p.style.backgroundColor;
    let a = Math.random() * Math.PI * 2, v = Math.random() * 12 + 5;
    p.style.transition = 'all .9s cubic-bezier(.2,1,.3,1)';
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translate(${Math.cos(a) * v * 20}px, ${Math.sin(a) * v * 20 + 180}px) rotate(${Math.random() * 360}deg)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 950);
  }
}
