// Detect standalone mode
if (window.matchMedia('(display-mode:standalone)').matches || window.navigator.standalone === true) {
  document.body.classList.add('standalone');
}

// Prevent double-tap zoom
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Load settings early so vibe and audio can reference it
let _settings = JSON.parse(localStorage.getItem('cerebrum_settings') || '{}');
if (_settings.sound === undefined) _settings.sound = true;
if (_settings.haptics === undefined) _settings.haptics = true;
if (_settings.reducedMotion === undefined) _settings.reducedMotion = false;
function saveSettings() { try { localStorage.setItem('cerebrum_settings', JSON.stringify(_settings)); } catch(e){} }
const isReducedMotion = () => prefersReducedMotion || _settings.reducedMotion;
