Here is the ultimate, hyper-comprehensive master plan to completely re-engineer "Cerebrum Quest" from a web-based PWA into a AAA-quality, native-feeling mobile game. 

This document is designed as a complete technical and design specification. It covers UI/UX paradigms, hardware-accelerated animations, typography scaling, mobile ergonomics, code-level refactoring, and performance optimizations.

---

# 📱 CEREBRUM QUEST: THE NATIVE MOBILE OVERHAUL MASTER PLAN
**Version 2.0 Architectural & Design Specification**

## TABLE OF CONTENTS
1. [Executive Summary: Web vs. Native Paradigm](#1-executive-summary)
2. [Phase 1: Eradicating Web Behaviors (The Foundation)](#2-phase-1-eradicating-web-behaviors)
3. [Phase 2: Mobile-First Design System & Typography](#3-phase-2-mobile-first-design-system)
4. [Phase 3: Viewport, Safe Areas & Keyboard Management](#4-phase-3-viewport--safe-areas)
5. [Phase 4: Hardware-Accelerated Routing & Transitions](#5-phase-4-hardware-accelerated-routing)
6. [Phase 5: Component-by-Component Re-engineering](#6-phase-5-component-re-engineering)
    * 5.1 The Bottom Navigation Bar
    * 5.2 The Quiz / Battle Screen
    * 5.3 Bottom Sheet Modals (Replacing Centered Popups)
    * 5.4 The Hub / Dashboard
    * 5.5 The Results Screen
7. [Phase 6: "Game Feel" (Juice, Micro-interactions & Audio)](#7-phase-6-game-feel)
8. [Phase 7: Performance & Frame Rate Optimization (60 FPS)](#8-phase-7-performance)
9. [Phase 8: Advanced PWA & OS Integration](#9-phase-8-advanced-pwa)
10. [Phase 9: Step-by-Step Implementation Roadmap](#10-phase-9-roadmap)

---

## 1. Executive Summary: Web vs. Native Paradigm <a name="1-executive-summary"></a>

The current implementation of Cerebrum Quest suffers from the "Uncanny Valley of PWAs". It runs in a mobile browser, but it uses desktop web paradigms:
* **Fluid Typography (`vw` units):** Text scales weirdly on different devices, making it look huge on tall phones and tiny on wide ones.
* **Layout Thrashing (`display: none`):** Switching screens forces the browser to recalculate the entire DOM, causing stuttering (jank).
* **Document Scrolling:** The body behaves like a scrollable document, allowing "rubber-banding" at the top and bottom.
* **Un-ergonomic Layouts:** Modals appear in the center of the screen, and answers require stretching the thumb, rather than resting in natural "Thumb Zones".

**The Goal:** We must trick the user's brain into believing they downloaded this app from the App Store or Google Play. This requires strict grid systems, fixed typography scales, push/pop view controllers, and immediate tactile feedback.

---

## 2. Phase 1: Eradicating Web Behaviors <a name="2-phase-1-eradicating-web-behaviors"></a>

Before we build the game, we must destroy the default behaviors of the mobile web browser.

### 2.1 The Native CSS Reset
Add this strictly to the top of your `styles.css`. This prevents text highlighting, callout menus, double-tap zooming, and pull-to-refresh.

```css
/* ==========================================================================
   NATIVE MOBILE RESET
   ========================================================================== */
:root {
  /* Prevent tap highlight colors on Android */
  -webkit-tap-highlight-color: transparent;
  /* Smooth scrolling across the app */
  scroll-behavior: smooth;
}

html, body {
  width: 100%;
  height: 100%;
  /* Use dynamic viewport height to fix iOS Safari bottom bar issues */
  height: 100dvh; 
  margin: 0;
  padding: 0;
  /* Prevent pull-to-refresh and rubber-banding */
  overscroll-behavior-y: none;
  /* Prevent horizontal scroll entirely */
  overflow-x: hidden;
  /* Lock background scrolling */
  overflow-y: hidden;
  /* Prevent user text selection */
  -webkit-user-select: none;
  user-select: none;
  /* Prevent magnifying glass/callout on long press */
  -webkit-touch-callout: none;
  background-color: var(--bg-deep);
}

/* Re-enable selection ONLY for inputs */
input, textarea {
  -webkit-user-select: auto;
  user-select: auto;
}

/* Remove default button styles */
button {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  /* Ensure fast touch response */
  touch-action: manipulation; 
}
```

### 2.2 Fixing Image and Drag Behaviors
```css
img, svg {
  /* Prevent drag-and-drop of images */
  -webkit-user-drag: none;
  pointer-events: none; /* Let clicks pass through icons to the button */
}
```

---

## 3. Phase 2: Mobile-First Design System & Typography <a name="3-phase-2-mobile-first-design-system"></a>

The current use of `clamp(14px, 3vw, 15px)` creates inconsistent sizes. Native apps use strict integer-based scales (like Apple's Human Interface Guidelines or Google's Material Design).

### 3.1 Strict Typography Scale (CSS Variables)
Replace your `:root` typography section with this exact scale. Note that we do not use `vw` for font sizes on mobile.

```css
:root {
  /* 
   * MOBILE TYPOGRAPHY SCALE (Base: 15px)
   * Designed for readability at standard phone distances (12-18 inches)
   */
  --text-micro:   10px; /* Badges, tiny tags */
  --text-xs:      12px; /* Secondary labels, bottom nav text */
  --text-sm:      14px; /* Descriptions, subtitles */
  --text-base:    15px; /* Primary body text, standard buttons */
  --text-md:      17px; /* Important buttons, list items */
  --text-lg:      20px; /* Section headers, modal titles */
  --text-xl:      24px; /* Page titles */
  --text-2xl:     28px; /* Prominent numbers (Scores) */
  --text-3xl:     34px; /* Hero titles (Welcome screen) */
  --text-display: 48px; /* Massive stats (Total XP) */

  /* Line Heights */
  --lh-tight:  1.2;
  --lh-base:   1.4;
  --lh-loose:  1.6;
}

/* Apply to body */
body {
  font-size: var(--text-base);
  line-height: var(--lh-base);
  letter-spacing: -0.01em; /* Modern apps slightly tighten text */
}

/* Heading Classes for Game Use */
.title-hero { font-size: var(--text-3xl); font-weight: 800; line-height: var(--lh-tight); letter-spacing: -0.02em; }
.title-screen { font-size: var(--text-xl); font-weight: 700; line-height: var(--lh-tight); }
.title-section { font-size: var(--text-lg); font-weight: 700; line-height: var(--lh-tight); }
.text-body { font-size: var(--text-base); color: var(--fg); }
.text-sub { font-size: var(--text-sm); color: var(--fg-secondary); }
.text-caption { font-size: var(--text-xs); color: var(--fg-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
```

### 3.2 Spacing & Ergonomic Grid
Native apps use an 8pt grid. This ensures perfect alignment. 
* Never use random values like `14px` or `26px`.
* Use `4, 8, 12, 16, 24, 32, 40, 48, 64`.

```css
:root {
  /* Standardized 8pt Grid Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;   /* Standard edge padding for mobile */
  --space-6: 24px;   /* Space between distinct sections */
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Ergonomics */
  --touch-target: 48px; /* Apple/Google mandate 44-48px minimum touch area */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;  /* For bottom sheets */
  --radius-pill: 9999px;
}
```

---

## 4. Phase 3: Viewport, Safe Areas & Keyboard Management <a name="4-phase-3-viewport--safe-areas"></a>

### 4.1 Meta Tags Update
Your current `viewport-fit=cover` is good, but we need to ensure the keyboard doesn't break the layout on modern Android devices.

```html
<!-- Replace your current viewport meta with this -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=overlays-content">
```
*Note: `interactive-widget=overlays-content` tells Chrome not to shrink `100vh` when the keyboard opens. We will manage the input focus manually via JS.*

### 4.2 Safe Area Padding Management
iPhones have notches and home bars. We must pad the main containers.

```css
.app-container {
  /* This holds the current active screen */
  position: relative;
  width: 100vw;
  height: 100dvh; /* Dynamic viewport height */
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
  overflow: hidden;
}

/* Any screen that scrolls internally */
.scrollable-content {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior-y: contain; /* Prevent scrolling the body */
  -webkit-overflow-scrolling: touch; /* Momentum scrolling on iOS */
  padding-bottom: calc(var(--nav-height) + var(--space-6)); /* Space for bottom nav */
}
```

### 4.3 Virtual Keyboard Fix (JS)
When the user taps "Enter Name", the keyboard pops up. Instead of letting the browser scroll awkwardly, we slide the specific input element into view.

```javascript
// In settings.js or main initialization
if ('virtualKeyboard' in navigator) {
  navigator.virtualKeyboard.overlaysContent = true;
  navigator.virtualKeyboard.addEventListener('geometrychange', (event) => {
    const { y, height } = event.target.boundingRect;
    if (height > 0) {
      // Keyboard opened
      document.body.style.transform = `translateY(-${height / 2}px)`;
      document.body.style.transition = 'transform 0.3s cubic-bezier(0.2, 1, 0.3, 1)';
    } else {
      // Keyboard closed
      document.body.style.transform = 'translateY(0)';
    }
  });
}
```

---

## 5. Phase 4: Hardware-Accelerated Routing & Transitions <a name="5-phase-4-hardware-accelerated-routing"></a>

**CRITICAL FIX:** Your current `showScreen(id)` function toggles `display: none`. This is a massive performance bottleneck on mobile. When `display` changes, the browser performs a "Layout/Reflow" of the entire DOM, dropping frames.

Native apps use a "View Stack". Screens sit next to each other in memory, and we use `transform: translateX` to slide them over.

### 5.1 The New Router CSS
```css
/* Container holding all screens */
.view-stack {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.screen {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100%; height: 100%;
  background: var(--bg-deep);
  z-index: 10;
  
  /* Start hidden and pushed to the right */
  visibility: hidden;
  transform: translateX(100%);
  opacity: 0;
  
  /* HARDWARE ACCELERATION */
  will-change: transform, opacity, visibility;
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), 
              opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1),
              visibility 0s linear 0.4s; /* Hide after transition */
}

/* Active screen */
.screen.active {
  visibility: visible;
  transform: translateX(0);
  opacity: 1;
  z-index: 20;
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), 
              opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1),
              visibility 0s linear 0s; /* Show immediately */
}

/* Screen pushed back in the stack (Hub behind Quiz) */
.screen.pushed-back {
  visibility: visible;
  transform: translateX(-25%); /* iOS style subtle parallax push */
  opacity: 0.5;
  z-index: 10;
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), 
              opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}
```

### 5.2 The New JS Router Logic
Replace your current `showScreen()` function with this view-controller logic.

```javascript
let viewHistory = ['sWelcome']; // Track history for back button hardware
let currentScreenId = 'sWelcome';

function navigateTo(targetId, isBack = false) {
  if (currentScreenId === targetId) return;

  const currentScreen = document.getElementById(currentScreenId);
  const targetScreen = document.getElementById(targetId);
  
  if (!targetScreen) return;

  // Pre-render state updates before animation starts to prevent mid-frame stutter
  prepareScreenData(targetId);

  // Force reflow to ensure DOM is ready
  void targetScreen.offsetWidth; 

  if (isBack) {
    // Sliding back: Target comes from left (-25%), Current goes to right (100%)
    targetScreen.classList.remove('pushed-back', 'active');
    targetScreen.style.transform = 'translateX(-25%)';
    
    // Animate
    requestAnimationFrame(() => {
      targetScreen.classList.add('active');
      targetScreen.style.transform = ''; // clears inline style, uses CSS rule
      
      currentScreen.classList.remove('active');
      // Let it return to default CSS state (translateX(100%))
    });
    
    viewHistory.pop();
  } else {
    // Sliding forward: Target comes from right (100%), Current pushes left (-25%)
    viewHistory.push(targetId);
    
    requestAnimationFrame(() => {
      targetScreen.classList.add('active');
      
      currentScreen.classList.remove('active');
      currentScreen.classList.add('pushed-back');
    });
  }
  
  currentScreenId = targetId;
  updateBottomNavVisibility(targetId);
}

function handleHardwareBack() {
  if (viewHistory.length > 1) {
    const target = viewHistory[viewHistory.length - 2];
    navigateTo(target, true);
  }
}
```

---

## 6. Phase 5: Component-by-Component Re-engineering <a name="6-phase-5-component-re-engineering"></a>

### 6.1 The Bottom Navigation Bar (Ergonomics)
Top navigation on mobile is obsolete. Users cannot reach the top of modern 6.5+ inch screens. We must lock the nav to the bottom.

**CSS Update:**
```css
.main-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(64px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(10, 15, 26, 0.85); /* Darker for better contrast */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  z-index: 100;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.main-nav.visible {
  transform: translateY(0);
}

.nav-tab {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  color: var(--fg-muted);
  transition: color 0.2s;
  /* Massive touch target */
  min-width: 64px;
}

.nav-tab i { font-size: 20px; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.nav-tab .tab-label { font-size: 10px; font-weight: 600; }

/* Active State "Juice" */
.nav-tab.active { color: var(--accent); }
.nav-tab.active i {
  transform: translateY(-2px) scale(1.1);
  filter: drop-shadow(0 4px 6px rgba(245,158,11,0.4));
}
```

### 6.2 The Quiz / Battle Screen (The Core Loop)
Currently, your question text and answers share a scrolling container. On mobile, the question should be anchored to the top/middle, and answers anchored strictly to the bottom, within easy thumb reach.

**HTML Layout Restructure:**
```html
<section id="sQuiz" class="screen">
  <!-- Top Bar: Fixed -->
  <div class="quiz-header">
    <button class="btn-icon" onclick="confirmRetreat()"><i class="fas fa-xmark"></i></button>
    <div class="quiz-progress-pill">
      <div class="timer-fill" id="timerFill"></div>
      <span id="quizTimerText">20s</span>
    </div>
    <div class="quiz-score-pill"><i class="fas fa-star"></i> <span id="quizScore">0</span></div>
  </div>

  <!-- Question Area: Flexible height, centers content -->
  <div class="quiz-body">
    <div class="quiz-meta-tags">
      <span class="tag-realm" id="quizCatName">Science</span>
      <span class="tag-diff" id="quizStageSubtitle">Stage 1</span>
    </div>
    <h2 class="question-text" id="questionText">What is the capital of France?</h2>
  </div>

  <!-- Answers Area: Anchored to bottom -->
  <div class="quiz-footer">
    <!-- Lifelines sit right above answers -->
    <div class="lifeline-row">
      <button class="ll-btn" id="llFifty"><i class="fas fa-percent"></i></button>
      <button class="ll-btn" id="llTime"><i class="fas fa-snowflake"></i></button>
      <button class="ll-btn" id="llHint"><i class="fas fa-lightbulb"></i></button>
    </div>
    
    <div class="options-grid" id="optionsList">
      <!-- Buttons injected here via JS -->
    </div>
  </div>
</section>
```

**CSS for Quiz:**
```css
#sQuiz {
  display: flex;
  flex-direction: column;
  padding: env(safe-area-inset-top) var(--space-4) env(safe-area-inset-bottom) var(--space-4);
}

.quiz-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.quiz-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: var(--space-6) 0;
  overflow-y: auto; /* Only scroll question if it's crazy long */
}

.question-text {
  font-size: var(--text-2xl);
  font-weight: 700;
  line-height: var(--lh-tight);
}

.quiz-footer {
  flex-shrink: 0;
  padding-bottom: var(--space-4);
}

/* Stacking options for thumbs */
.options-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.option-btn {
  width: 100%;
  min-height: 56px; /* Huge thumb target */
  padding: var(--space-3) var(--space-4);
  background: var(--bg-elevated);
  border: 2px solid rgba(255,255,255,0.05);
  border-radius: var(--radius-lg);
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--fg);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  /* The Secret Sauce for tactile feel */
  transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), 
              background-color 0.2s, 
              border-color 0.2s;
}

/* TACTILE FEEDBACK */
.option-btn:active {
  transform: scale(0.96); /* Presses inward physically */
  background: rgba(255,255,255,0.1);
}

/* High performance timer bar */
.quiz-progress-pill {
  position: relative;
  background: var(--bg-elevated);
  height: 32px;
  border-radius: 16px;
  width: 120px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.timer-fill {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 100%;
  background: var(--accent2);
  transform-origin: left; /* Scale from left to right */
  /* JS sets: transform: scaleX(0.5) */
  will-change: transform;
}
#quizTimerText {
  position: relative;
  z-index: 2;
  font-weight: 700;
  font-size: 14px;
}
```

### 5.3 Bottom Sheet Modals (Replacing Centered Popups)
Centered popups are hard to reach on large phones. Native apps use Bottom Sheets (like iOS Share Sheets or Android Bottom Dialogs).

**HTML Update (Apply to Settings, Confirm, Name Edit):**
```html
<div id="settingsModal" class="bottom-sheet-overlay">
  <div class="bottom-sheet-content">
    <div class="drag-handle"></div>
    <h3 class="sheet-title">Settings</h3>
    <!-- Content -->
  </div>
</div>
```

**CSS Update:**
```css
.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0,0,0,0.6);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0s linear 0.3s;
}

.bottom-sheet-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  max-height: 90dvh;
  background: var(--bg-surface);
  border-radius: 24px 24px 0 0;
  padding: var(--space-6) var(--space-4) calc(var(--space-6) + env(safe-area-inset-bottom));
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
}

.bottom-sheet-overlay.open {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s ease;
}

.bottom-sheet-overlay.open .bottom-sheet-content {
  transform: translateY(0);
}

.drag-handle {
  width: 40px;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  margin: 0 auto var(--space-4);
}
```

### 5.4 The Hub / Dashboard (Horizontal Scrolling)
Vertical scrolling lists feel like websites. Horizontal carousels feel like apps. 
Change the "Missions", "Weekly Goal", and "Daily Challenge" into a horizontal swipe area.

**CSS Update:**
```css
.dashboard-carousel {
  display: flex;
  overflow-x: auto;
  gap: var(--space-4);
  padding: 0 var(--space-4);
  margin: 0 calc(var(--space-4) * -1); /* Break out of parent padding */
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Hide scrollbar */
}
.dashboard-carousel::-webkit-scrollbar { display: none; }

.carousel-card {
  scroll-snap-align: center;
  flex: 0 0 85%; /* Take up 85% of screen width, peek next card */
  background: var(--card);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}
```

### 5.5 The Results Screen
Remove the grid of stats. Use a large circular ring for accuracy, followed by a vertical list of achievements.

```css
.results-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-6);
  animation: bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.stat-row:last-child { border-bottom: none; }

.stat-label { font-size: var(--text-sm); color: var(--fg-secondary); }
.stat-val { font-size: var(--text-md); font-weight: 700; font-family: monospace; /* Monospace for numbers aligns beautifully */ }
```

---

## 7. Phase 6: "Game Feel" (Juice, Micro-interactions & Audio) <a name="7-phase-6-game-feel"></a>

A web app changes state instantly. A game *celebrates* state changes.

### 7.1 Number Lerping (Animating Numbers)
When you gain XP or Crowns on the result screen, don't just print the final number. Animate it rolling up from zero.

**JS Addition:**
```javascript
// A reusable function to animate numbers ticking up
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // Ease out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.floor(easeProgress * (end - start) + start);
    obj.innerHTML = currentVal;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      // Trigger a tiny haptic pop when it finishes
      if (window.vibe) vibe(10);
    }
  };
  window.requestAnimationFrame(step);
}

// Usage in FinishLvl():
// animateValue(document.getElementById('resXP'), 0, S.quizXP, 1200);
```

### 7.2 Native Haptic Feedback Mapping
You have basic vibration, but we need to map it to iOS/Android haptic patterns.
*   **Light Tap (10ms):** Button presses, selecting an answer.
*   **Medium Pop (30ms):** Opening a bottom sheet, claiming a mission.
*   **Success (Two quick pops):** Correct answer `[15, 100, 15]`.
*   **Error (Heavy buzz):** Wrong answer `[100, 50, 100]`.

**Update `audio.js`:**
```javascript
function vibe(pattern) {
  if (!_settings.haptics) return;
  if (!navigator.vibrate) return;
  
  // Pattern map for semantic calls
  const patterns = {
    'tap': [10],
    'pop': [30],
    'success': [15, 80, 15],
    'error': [100, 50, 100],
    'celebrate': [50, 50, 50, 50, 100]
  };
  
  const v = typeof pattern === 'string' ? patterns[pattern] : pattern;
  try { navigator.vibrate(v); } catch(e){}
}
```

### 7.3 Visualizing Correct/Wrong (The "Flash")
When picking an answer, we want a momentary full-screen tint flash, just like Duolingo.

```css
/* Add an overlay div to body for flashes */
.screen-flash {
  position: fixed; inset: 0; z-index: 9999;
  pointer-events: none; opacity: 0;
}
.flash-correct {
  background: var(--accent2);
  animation: flashAnim 0.4s ease-out;
}
.flash-wrong {
  background: var(--danger);
  animation: flashAnim 0.4s ease-out;
}
@keyframes flashAnim {
  0% { opacity: 0.3; }
  100% { opacity: 0; }
}
```

---

## 8. Phase 7: Performance & Frame Rate Optimization <a name="8-phase-7-performance"></a>

### 8.1 The Backdrop-Filter Problem
`backdrop-filter: blur(8px)` requires the GPU to render the DOM underneath the element, apply a Gaussian blur algorithm, and render it every single frame. On low-to-mid range Androids, this halves your frame rate.

**Optimization Strategy:**
1. Remove `backdrop-filter` from `.category-card`, `.option-btn`, and small elements.
2. Only use it for massive overlays (Bottom Sheets, Main Nav).
3. Replace the glass effect on small cards with a solid, slightly transparent color and a subtle inner shadow.

```css
/* Optimized Card Background */
.category-card {
  background: rgba(26, 34, 54, 0.95); /* Solid enough to obscure background */
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 6px rgba(0,0,0,0.2);
  /* NO BACKDROP FILTER */
}
```

### 8.2 Canvas Throttling
Your background particles run infinitely via `requestAnimationFrame`. Even when hidden by an opaque screen, they consume CPU/Battery.

**Update `animateBg()` in `ui.js`:**
```javascript
let lastFrameTime = 0;
const targetFPS = 30; // 30 FPS is plenty for background particles on mobile
const frameDelay = 1000 / targetFPS;

function animateBg(timestamp) {
  // If app is hidden, OR if we are on a screen that obscures the background, stop rendering.
  if (_pageHidden || isReducedMotion() || currentScreenId === 'sQuiz') { 
    requestAnimationFrame(animateBg); 
    return; 
  }

  // Throttle FPS
  if (timestamp - lastFrameTime < frameDelay) {
    requestAnimationFrame(animateBg);
    return;
  }
  lastFrameTime = timestamp;

  // ... rest of canvas rendering logic ...
}
```

### 8.3 Hardware Accelerated Timer (No SetInterval DOM Updates)
Changing `.style.width` forces reflow.

```javascript
// In startT()
let startTime = performance.now();
let durMs = dur;

function updateTimerBar(timestamp) {
  if(!S.timerInterval) return; // If cancelled
  
  let elapsed = timestamp - startTime;
  let remaining = durMs - elapsed;
  S.timeLeft = Math.max(0, remaining);
  
  let scale = Math.max(0, remaining / durMs);
  
  // Transform scaleX is hardware accelerated. No reflow!
  D.timerFill.style.transform = `scaleX(${scale})`;
  
  // Only update text once per second to save DOM writes
  let secs = Math.ceil(remaining / 1000);
  if(D.quizTimerText.dataset.secs != secs) {
    D.quizTimerText.textContent = secs + 's';
    D.quizTimerText.dataset.secs = secs;
  }
  
  if (remaining > 0) {
    S.timerInterval = requestAnimationFrame(updateTimerBar);
  } else {
    timeOut();
  }
}
S.timerInterval = requestAnimationFrame(updateTimerBar);
```

---

## 9. Phase 8: Advanced PWA & OS Integration <a name="9-phase-8-advanced-pwa"></a>

### 9.1 Dynamic Theme Color Matching
When the user opens a Bottom Sheet (which is dark), the phone's status bar (clock/battery) should match. When they are on the blue Science realm, it should match that.

**JS Logic:**
```javascript
function setOSStatusBarColor(hexColor) {
  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', hexColor);
  }
}

// Example usage:
// When opening Bottom Sheet: setOSStatusBarColor('#000000');
// When closing Bottom Sheet: setOSStatusBarColor('#0a0f1a');
```

### 9.2 Disable Context Menus & Long-Press Links
Currently, long pressing on an image or text might pop up iOS "Share/Copy" menus.

```javascript
// Add to settings.js
document.addEventListener('contextmenu', event => {
  // Allow context menu only on inputs if needed
  if(event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
    event.preventDefault();
  }
});
```

---

## 10. Phase 9: Step-by-Step Implementation Roadmap <a name="10-phase-9-roadmap"></a>

To prevent breaking your app while applying this massive overhaul, execute in this order:

### **1: The Core Foundation (CSS & Viewport)**
1. Replace `<meta name="viewport">` with the updated string containing `interactive-widget=overlays-content`.
2. Add the **Native CSS Reset** to the top of `styles.css`.
3. Strip out all `vw` font sizing and replace with the **Mobile Typography Scale** (`px`).
4. Replace all hardcoded pixel margins/paddings with the **8pt Grid Variables** (`--space-1`, etc.).

### **2: Structural Layouts & Routing**
1. Change `body` to `height: 100dvh` and apply safe-area insets.
2. Implement the **JS Router Logic** (`navigateTo`).
3. Apply the CSS `.view-stack` and `.screen` transition rules (Hardware-accelerated sliding).
4. Lock the `.main-nav` to the bottom of the screen permanently and increase tab hitboxes to `64px`.

### **3: The Core Game Loop (Quiz Refactoring)**
1. Rewrite the `#sQuiz` HTML to use Flexbox with top/bottom anchoring (Question top, Buttons bottom).
2. Change the timer implementation from `setInterval`/`width` to `requestAnimationFrame`/`transform: scaleX`.
3. Add the Tactile Feedback CSS (`:active { transform: scale(0.96) }`) to `.option-btn`.

### **4: Modals to Bottom Sheets**
1. Convert `#settingsModal`, `#confirmModal`, and `#nameModal` HTML to the bottom sheet structure.
2. Apply the `.bottom-sheet-overlay` CSS.
3. Update JS functions (`openSettings`, `showCnf`) to add/remove classes that trigger the upward slide animation.

### **5: Performance & "Juice"**
1. Go through `styles.css` and remove `backdrop-filter: blur` from all small repeating elements (category cards, options, stat pills).
2. Add the `animateValue` (Lerp) function to the Results screen XP and Coin counting.
3. Add the `screen-flash` overlay and trigger it on correct/wrong answers.
4. Update `audio.js` `vibe()` function to use the semantic pattern mapping (`tap`, `success`, `error`).
5. Throttle the canvas `requestAnimationFrame` to 30 FPS.

### **6: Final QA & Polish**
*   **Testing on iOS Safari:** Check that swiping back/forward physically on the screen does not conflict with your JS router (Overscroll prevention handles this). Check safe areas around the notch.
*   **Testing on Android Chrome:** Tap an input field and verify the keyboard sliding logic pushes the UI up smoothly without crushing the layout.
*   **Offline Mode:** Turn on Airplane mode, reload the app, ensure the Service Worker serves the cached assets and the `offlineBadge` UI appears correctly.

This plan addresses every shortcoming of standard web development transposed onto mobile, utilizing modern CSS features (`dvh`, `env()`, `transform`, `will-change`) and strict mobile design patterns (Thumb zones, Bottom Sheets, Lerped numbers) to yield a genuinely professional, app-store-quality game experience.