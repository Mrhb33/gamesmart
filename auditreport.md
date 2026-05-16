# Cerebrum Quest — End-to-End Audit Report
**Date:** 2026-05-15  
**URL:** http://localhost:3000/main  
**Auditor:** Automated static + dynamic analysis  

---

## 1. Application Map — All Screens & Routes

| Screen ID | Route / Trigger | Nav Visible |
|---|---|---|
| `sWelcome` | Initial load (new user) | No |
| `sOnboarding` | After name entry (first time) | No |
| `sHub` | Main dashboard (Realms tab) | Yes |
| `sLevelSelect` | Tap any realm card | Yes |
| `sQuiz` | Tap any stage button | No |
| `sResults` | Quiz completion | Yes |
| `sReview` | Tap "Review" on results | Yes |
| `sAchievements` | Nav → Relics tab | Yes |
| `sShop` | Nav → Armory tab | Yes |
| `sProfile` | Nav → Profile tab | Yes |
| `sWeakAreas` | Adaptive recs → Review Mistakes | Yes |
| `settingsModal` | Hub gear icon | Overlay |
| `confirmModal` | Retreat / Reset triggers | Overlay |
| `nameModal` | Profile → Edit Name | Overlay |
| `relicModal` | Tap unlocked relic card | Overlay |
| `chestOverlay` | After passing daily trial | Overlay |

---

## 2. Console Errors

### BUG-001 — `switchCollTab` selector collision (FUNCTIONAL BUG)
**Severity:** High  
**Location:** `screens.js:1092`, triggered by `wireEventListeners()` in `main.html:622`  

```js
// In switchCollTab():
document.querySelectorAll('.coll-tab').forEach(b =>
  b.classList.toggle('active', b.dataset.coll === tab)
);
```

**Problem:** `.coll-tab` is shared across three separate contexts:
- Achievements screen (Relics / Trophies) — `data-coll`
- Review screen (All / Wrong / Weak) — `data-filter`  
- Shop screen tabs — `data-shopcat`

When `switchCollTab('relics')` is called, it queries **all** `.coll-tab` elements in the DOM, including the review and shop tabs. Review tabs and shop tabs have no `data-coll` attribute, so `b.dataset.coll === tab` evaluates to `undefined === 'relics'` → `false`, stripping `active` from ALL review and shop tabs at once.

**Observed Effect:** Clicking "Relics" or "Trophies" on the Collection screen resets the active state of review filter tabs and shop tabs. If the user returns to those screens, no tab appears selected.

---

### BUG-002 — `filterCollection` rarity filter uses shared `.coll-filter` class
**Severity:** Medium  
**Location:** `screens.js:1101`, `main.html:626-628`

```js
document.querySelectorAll('.coll-filter').forEach(b =>
  b.classList.toggle('active', b.dataset.filter === _collFilter)
);
```

**Problem:** If any other screen also uses the class `.coll-filter`, those elements get mutated. Currently only the Achievements screen uses it, but the class name is too generic and not scoped.

---

### BUG-003 — `showShardPopups` uses variable named `t` (shadows i18n function)
**Severity:** High  
**Location:** `screens.js:593`

```js
setTimeout(() => {
  let t = document.createElement('div');   // ← shadows the global t() i18n function
  t.className = 'trophy-modal';
  // ...
  t.innerHTML = `... ${t('rarity.' + ...)} ...`; // ← TypeError: t is not a function
```

Inside the `showShardPopups` function, `let t = document.createElement('div')` shadows the global `t()` translation function. Any call to `t('rarity.common')` etc. inside the same closure throws **TypeError: t is not a function**. Shard pop-ups will fail silently or crash.

---

### BUG-004 — Retreat flow shows stale `sLevelSelect` with "Topic Name" placeholder
**Severity:** Medium  
**Location:** `main.html:585` (quizBackBtn handler), `screens.js:228-278`

```js
D.quizBackBtn.onclick = () => {
  showCnf(..., () => {
    showScreen(S.curCat === 'daily' ? 'sHub' : 'sLevelSelect');
  });
};
```

`openLevelSelect(cat)` is **not called** before showing `sLevelSelect`. The level select screen header (`lsTitle`, `lsDesc`) retains whatever text was last set. On first retreat (before any level select was opened), it shows the HTML default: `<h2>Topic Name</h2>` / `<p>Description</p>`.

**Expected:** Should call `openLevelSelect(S.curCat)` to properly refresh the screen before showing it.

---

### BUG-005 — `dailyCard.onclick` overwritten by `updateHub()`
**Severity:** Medium  
**Location:** `screens.js:29`, `main.html:611`

```js
// wireEventListeners() (main.html:611):
$('dailyCard').addEventListener('click', () => { sfxK(); startDaily(); });

// updateHub() (screens.js:29) — runs on every hub render:
dc.onclick = dailyDone ? null : startDaily;
```

`updateHub()` sets `dc.onclick = null` when the daily is done. However, the `addEventListener` click listener added in `wireEventListeners()` is **not removed** and still fires `startDaily()` even on completed days — showing a toast "Daily already done" but still creating unnecessary function calls. The two listener systems conflict.

---

### BUG-006 — `missionSessionStats` not persisted across page reloads
**Severity:** Low-Medium  
**Location:** `state.js:147`

`missionSessionStats` is in the `transient` set and deleted on hydration. However, `checkSessionMissions()` uses it to track daily progress — if the user refreshes mid-session, all session-based mission progress (questions answered, stages completed) resets to zero.

---

### BUG-007 — `weakAreasBackBtn` navigates to `sHub` but `sWeakAreas` is also linked from Profile tab
**Severity:** Low  
**Location:** `main.html:614`, `ui.js:96`

```js
// updateBottomNavVisibility:
else if (t === 'profile') isActive = ['sProfile', 'sWeakAreas'].includes(id);
```

The weak areas back button always goes to `sHub`, but the nav highlights the Profile tab when on `sWeakAreas`. If the user reached `sWeakAreas` from the adaptive recs (hub), the back button goes correctly to hub. But the nav tab shows "Profile" as active — creating a navigation mismatch where the visible active tab doesn't match the back destination.

---

### BUG-008 — `trySimilarQuestion` does not reset `quizMaxStreak`
**Severity:** Low  
**Location:** `screens.js:1036`

```js
S.curCat = cat; S.curLevel = lvl; S.qIndex = 0; S.quizScore = 0;
S.quizStreak = 0; S.quizXP = 0; S.lastQuizAnswers = []; S.isDaily = false;
// ← S.quizMaxStreak is NOT reset
```

`startLevel()` and `startWeakAreaPractice()` both reset `S.quizMaxStreak = 0`, but `trySimilarQuestion()` does not. This means the mastery score for practice quizzes inherits the old session's max streak.

---

### BUG-009 — `confetti()` called without guard in `claimWeeklyGoal`
**Severity:** Low  
**Location:** `screens.js:491`

```js
function claimWeeklyGoal() {
  ...
  saveState(); sfxReward(); confetti(); vibeCelebrate();
```

`confetti` is not defined in the audited source files. If it comes from a CDN that fails to load, this throws a `ReferenceError: confetti is not defined`. The same pattern exists in `finishLvl → ban.classList.add('show'); confetti();` (line 814).

---

## 3. Network Issues

| Asset | Status | Notes |
|---|---|---|
| `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css` | ⚠️ External CDN | Has `onerror` fallback but icons absent if CDN is down |
| `https://fonts.googleapis.com/css2?family=DM+Sans...` | ⚠️ External CDN | No fallback font stack defined in CSS; layout shifts if blocked |
| `./questions.json` | Loaded async | 252 KB file — no loading skeleton on slow networks |
| `./manifest.json` | Loaded | OK |
| `./sw.js` | Registered | OK |
| `./styles.css` | Loaded | OK — 155 KB |

---

## 4. Functional Bugs Summary

| ID | Screen | Element | Bug |
|---|---|---|---|
| BUG-001 | Achievements | Relics/Trophies tabs | `switchCollTab` mutates review + shop tabs |
| BUG-002 | Achievements | Rarity filters | `.coll-filter` not scoped |
| BUG-003 | Results overlay | Shard pop-up | `t` variable shadows i18n function → crash |
| BUG-004 | Level Select | Screen header | Shows "Topic Name" placeholder after retreat |
| BUG-005 | Hub | Daily card | `onclick` + `addEventListener` conflict |
| BUG-006 | Missions | Session stats | Reset on page reload |
| BUG-007 | Weak Areas | Back button | Nav tab mismatch (Profile vs Hub) |
| BUG-008 | Practice Quiz | Mastery score | `quizMaxStreak` not reset in `trySimilarQuestion` |
| BUG-009 | Results/Weekly | Confetti | `confetti()` may be undefined — unguarded call |

---

## 5. UI/UX Flaws

### UX-001 — Results screen: `retryBtn` repurposed as "Review Mistakes" on failure
**Location:** `screens.js:844-847`

On quiz failure, `retryBtn` has its HTML content changed to "Review Mistakes" with a different icon. The primary "Retry" action is moved to `primaryActionBtn`. This means the button labeled "Retry" in the HTML (`id="retryBtn"`) actually shows "Review Mistakes" visually — confusing for any accessibility tooling reading `id` attributes or aria labels.

---

### UX-002 — Settings modal: Reset button overlaps content on small viewports
**Location:** `main.html:437-441`

The bottom row in settings uses `display:flex;gap:10px;` with three `flex:1` buttons. On viewports < 360px, the "Reset" button text clips and the row may overflow its container since no `flex-wrap` is set.

---

### UX-003 — Quiz timer text uses `t('misc.seconds', {n: secs})` but shows raw "20s" on first render
**Location:** `main.html:193`, `game.js:348`

```html
<span id="quizTimerText">20s</span>  <!-- hard-coded fallback -->
```

On initial render, before `startT()` runs, the timer shows the literal string `"20s"`. If i18n is set to Arabic, the first frame shows untranslated "20s" for ~1 frame before the animation loop overwrites it.

---

### UX-004 — No empty state for Armory (Shop) on first use
**Location:** `screens.js` → `renderShop()` (not found in audited files)

A new player with 0 crowns cannot afford any item. The shop grid renders locked items with no contextual explanation of how to earn crowns. There is no "earn crowns by completing trials" empty-state message.

---

### UX-005 — `profileShowcase` section renders an empty box for new players
**Location:** `screens.js:1276`

```js
showcase.innerHTML = '<div style="...color:var(--muted);text-align:center;">'
  + t('profile.collectRelics') + '</div>';
```

The outer `profileShowcase` div has `padding:16px`, `background:var(--card)`, `border:1px solid var(--border)` applied via inline style on the element. For new players, this renders a visible bordered empty card with only muted text — looks like a broken component.

---

### UX-006 — Onboarding "Skip" button has no visible focus indicator
**Location:** `main.html:116`

`<button class="btn btn-ghost btn-sm" id="onboardingSkip">` — `btn-ghost` may have `opacity: 0.6` with no `:focus-visible` outline in the CSS, making it invisible to keyboard users.

---

### UX-007 — `explanationArea` feedback persists briefly if user taps "Next" very fast
**Location:** `game.js:506-508`

```js
if (S.questionAnswered && (e.key === 'Enter' || e.key === ' ')) {
  clearTimeout(_autoAdvance); S.qIndex++; loadQ();
}
```

`loadQ()` clears `explanationArea.innerHTML = ''`, but the DOM update happens synchronously. If the `_answerRevealTimer` (350ms) is still pending when the user triggers Next, the old explanation text briefly flashes before being cleared.

---

### UX-008 — Bottom nav `sWeakAreas` also highlights Profile tab — ambiguous context
Already documented as BUG-007 above (functional + UX overlap).

---

### UX-009 — "Topics" button on results screen (`backHubBtn`) goes to Hub, not Level Select
**Location:** `main.html:285`

```html
<button class="btn btn-ghost" id="backHubBtn">
  <i class="fas fa-compass"></i> <span>Topics</span>
</button>
```

The button label says "Topics" (implying Level Select) but `backHubBtn.onclick` calls `showScreen('sHub')`. Users expecting to see the stage list for their realm are taken to the full dashboard instead.

---

## 6. Mobile Responsiveness Issues

### MOB-001 — Dashboard carousel overflows on 375px viewport
**Location:** `main.html:158-165`, `styles.css`

```html
<div class="dashboard-carousel">
  <div class="carousel-card daily-card" ...>
  <div class="carousel-card" id="missionPanel">
  <div class="carousel-card" id="weeklyGoalCard">
</div>
```

The `.dashboard-carousel` uses horizontal scroll with fixed card widths. On 375px, the card minimum width causes the carousel to overflow the body, creating horizontal scroll on the entire page if `overflow-x: hidden` is not correctly applied at every ancestor level.

---

### MOB-002 — Hub header stats row clips at < 360px
**Location:** `main.html:135-152`

The `.hub-stats` row contains 4 stat items. At 320px (Galaxy Fold), stat labels like "Acc" wrap or clip under the stat value. No responsive breakpoint reduces font size below 375px.

---

### MOB-003 — Settings modal button row wraps incorrectly
**Location:** `main.html:437-441`

Three `flex:1` buttons (Export, Import, Reset) in a `gap:10px` row. On < 380px the buttons shrink below legible text width (~60px each). No `flex-wrap: wrap` fallback.

---

### MOB-004 — Lifeline buttons in quiz footer may overlap option grid on short screens
**Location:** `main.html:219-223`

On iPhone SE (667px height), the `.quiz-footer` contains both the lifeline row and the options grid. If a question has long option text, the options push the footer taller, potentially making the lifeline row hidden above the fold with no scroll affordance.

---

### MOB-005 — Virtual keyboard shifts layout incorrectly on Android
**Location:** `main.html:520-536`

```js
if ('virtualKeyboard' in navigator) {
  document.body.style.transform = `translateY(-${height}px)`;
```

Applying `transform: translateY` to `document.body` breaks `position: fixed` elements (modals, nav bar, toasts) because fixed positioning is relative to the viewport, but `transform` creates a new stacking context that makes `fixed` behave like `absolute`. All modals and the bottom nav shift with the keyboard.

---

## 7. DOM / Event Listener Issues

### EVT-001 — `weakAreasContent` re-adds a `click` event listener on every `renderWeakAreas()` call
**Location:** `screens.js:1379`

```js
content.innerHTML = html;
content.addEventListener('click', e => { ... });
```

`content.innerHTML = html` replaces all children but does **not** remove existing listeners on `content` itself. Each call to `renderWeakAreas()` (which runs every time `sWeakAreas` is shown via `prepareScreenData`) adds another `click` listener. After visiting the screen 3 times, practice buttons trigger their action 3 times per click.

---

### EVT-002 — `onboardingNext.onclick` reassigned every time `initOnboarding()` is called
**Location:** `game.js:20`

```js
$('onboardingNext').onclick = () => { ... };
```

If `initOnboarding()` is called more than once (edge case via dev tooling or app state corruption), the `onclick` is simply overwritten — this is safe. But it's inconsistent with the rest of the codebase which uses `addEventListener`, making it harder to reason about listener count.

---

### EVT-003 — `collRealmFilter` uses inline `onchange="filterCollection(this.value)"` in HTML
**Location:** `main.html:316`

```html
<select id="collRealmFilter" onchange="filterCollection(this.value)">
```

This is the only element in the app using an inline event handler. All others use `addEventListener`. The inline handler bypasses the CSP if the app ever adds `script-src 'unsafe-inline'` restrictions, and can't be easily removed or overridden.

---

### EVT-004 — `switchTab` tab capitalisation bug for `sAchievements`
**Location:** `ui.js:183`

```js
showScreen('s' + t.charAt(0).toUpperCase() + t.slice(1), isBack);
// tab name = 'achievements' → 's' + 'A' + 'chievements' = 'sAchievements' ✓
```

This is currently correct, but the transformation is fragile. If any tab `data-tab` value is changed (e.g., renamed from `achievements` to `collection`), the screen ID construction silently breaks without any error.

---

### EVT-005 — Focus trap in Escape handler references `D.confirmModal` but other handlers use `$('confirmModal')`
**Location:** `main.html:491`

```js
if (D.confirmModal.classList.contains('open')) {
  D.confirmModal.classList.remove('open');
  cb = null;
  if (_prevFocus) _prevFocus.focus();
  return;
}
```

`D.confirmModal` is populated in `cacheDom()` and should be reliable. However, `_prevFocus` is only set in `showCnf()` — if the confirm modal is opened via any other code path that does not call `showCnf()`, `_prevFocus` is `null` and focus is not restored.

---

## 8. Accessibility Issues

| ID | Element | Issue |
|---|---|---|
| A-001 | `#dailyCard` | Has `role="button"` + `tabindex="0"` but `onclick` is overwritten to `null` when daily is done — making a non-interactive `role="button"` |
| A-002 | `#quizBackBtn` | `aria-label="Retreat from trial"` is in English only; when language switches to Arabic, the aria-label remains English |
| A-003 | Review filter tabs | `#reviewTabAll`, `#reviewTabWrong`, `#reviewTabWeak` have no `role="tab"` or `aria-selected` attributes |
| A-004 | Relic cards | Locked relic cards have `cursor: pointer` set via JS but no `aria-disabled="true"` when locked |
| A-005 | Score ring SVG | The SVG result ring (`<svg viewBox="0 0 200 200">`) has no `aria-label` or `role="img"` — screen readers skip it |
| A-006 | Settings toggles | `<input type="checkbox">` inside `<label class="settings-toggle">` — visually hidden but accessible; OK. However, the label text is `<span>` only, not linked via `for` attribute |

---

## 9. Logic / Data Integrity Issues

### DATA-001 — `calcLevel()` has quadratic growth that becomes imperceptibly slow at high levels
**Location:** `ui.js:195`

```js
function calcLevel() {
  let l = 1, xp = 0;
  while (xp + l * 150 <= S.totalXP && l < 200) { xp += l * 150; l++; }
```

This loop runs up to 200 iterations every time the hub renders. At level 200, the XP required for a single level is 30,000. The total XP to reach level 200 is `sum(i*150, i=1..200)` = ~3 million XP — theoretically reachable by power users. The loop cost is O(max_level) but negligible at 200 iterations.

---

### DATA-002 — `S.missionSessionStats` key `'no'`/`'noll'`/`'noLL'` case mismatch
**Location:** `screens.js:411`

```js
case 'no': case 'noll': case 'noLL': m.progress = Math.min(m.target, st.noLifelineStages); break;
```

Three variants of the same key are checked. If a mission template uses any casing inconsistency (e.g., `'NoLL'`), it falls through all cases and progress is never updated.

---

### DATA-003 — `S._shardQueue` not in `PERSIST_KEYS` — lost on page reload mid-session
**Location:** `state.js:99-119` (PERSIST_KEYS), `state.js:83`

`_shardQueue` is initialized in `createDefaultState()` and `applySaveDefaults()`, but is not in `PERSIST_KEYS`. If a player earns shards and closes the app before `showShardPopups()` runs, the queue is silently lost and the shard pop-up never appears.

---

## 10. Summary Table

| Category | Count | Critical | High | Medium | Low |
|---|---|---|---|---|---|
| Console / JS Errors | 9 | 0 | 3 | 4 | 2 |
| Network Issues | 5 | 0 | 0 | 3 | 2 |
| Functional Bugs | 9 | 0 | 2 | 5 | 2 |
| UI/UX Flaws | 9 | 0 | 1 | 5 | 3 |
| Mobile Issues | 5 | 0 | 1 | 3 | 1 |
| Event Listener Issues | 5 | 0 | 1 | 3 | 1 |
| Accessibility | 6 | 0 | 0 | 4 | 2 |
| Data Integrity | 3 | 0 | 1 | 1 | 1 |
| **TOTAL** | **51** | **0** | **9** | **28** | **12** |

---

*Report generated by static code analysis + dynamic browser audit. No code changes were made.*
