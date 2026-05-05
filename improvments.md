# Cerebrum Quest Improvement Plan

Audit date: 2026-05-05

## Current State

Cerebrum Quest is a static single-page quiz game with 7 realms, 35 stages, 350 questions, local save data, achievements, relics, shop items, missions, weekly goals, adaptive practice, audio/haptics, and PWA offline support.

The game has a strong foundation, but the codebase has grown into a large global-script app. Several features are implemented in JavaScript but are missing their matching HTML controls or containers, which means some systems are partially hidden or unreachable.

Validation status:

- `node validate_questions.js --audit` passes.
- `node build_v3.js` passes.
- Question set: 350 total questions, 7 categories, 5 levels per category, 10 questions per level.
- Answer distribution is healthy overall: A 25%, B 25%, C 26%, D 24%.
- Warnings remain: 2 per-level answer-position balance warnings and 7 category warnings for missing Arabic translations.

## Highest Priority Fixes

### 1. Fix Returning Player Startup

Problem:

`main.html` calls `startGame()` for returning players before `loadQuestions()` finishes. `startGame()` calls `requireQuestions()`, so returning players can be blocked by the "questions loading" state and remain on the welcome flow.

Plan:

- Change the startup sequence so `loadQuestions()` completes before auto-resuming a returning player.
- Make `loadQuestions()` return a boolean or throw a controlled error.
- After questions are ready, initialize missions, weekly goals, static text, saved player state, and then route to the correct screen.
- Add a small loading state on first boot so users do not tap into the game before data is ready.

### 2. Add Missing DOM For Implemented Features

Problem:

Several JavaScript features target IDs or controls that are not present in `main.html`, so the features either silently do nothing or are unreachable.

Missing or likely missing elements:

- `missionPanel`
- `weeklyGoalCard`
- `continueCard`
- `rewardsCard`
- `shopTabs`
- `collRealmFilter`
- collection tabs and filters using `.coll-tab` / `.coll-filter`
- `quizStageSubtitle`
- `bossWarning`
- `llHint`
- visible settings button that calls `openSettings()`

Plan:

- Add the missing containers to the hub, quiz, shop, and achievements screens.
- Add a settings icon button to the main nav or profile header.
- Add the hint lifeline button to the quiz lifeline row.
- Add boss warning and stage subtitle UI in the quiz header.
- Add shop category tabs for avatars, frames, titles, and themes.
- Add achievements/relics tabs and filters so relic code is actually usable.

### 3. Normalize Daily Trial Dates

Problem:

Daily trial logic uses both `new Date().toDateString()` and `getISODate()`. Mixed date formats make streak logic harder to reason about and easier to break across time zones.

Plan:

- Use one daily key format everywhere, preferably `YYYY-MM-DD` from `getISODate()`.
- Replace `S.lastDaily` checks with `S.lastDailyDate`.
- Keep a migration path for old saves that only have `lastDaily`.
- Reset or maintain streak based on the number of days between the last daily date and today.

### 4. Make The Save Model Safer

Problem:

The app stores a large global `S` object in localStorage. Some transient fields are stripped, but feature growth increases the chance of saving runtime-only state, stale fields, or incompatible data.

Plan:

- Create a dedicated `createDefaultState()` function.
- Create explicit `serializeState()` and `hydrateState()` functions.
- Persist only allowed save keys instead of cloning almost all of `S`.
- Add save schema validation during import.
- Add real migrations for each `SAVE_VERSION` change.

### 5. Reduce Inline HTML And Inline Event Handlers

Problem:

The UI is built with many `innerHTML` templates and inline `onclick` attributes. Some strings are escaped, but the pattern makes security, testing, and refactoring harder.

Plan:

- Prefer `document.createElement()` for interactive UI.
- Attach events with `addEventListener()`.
- Keep `innerHTML` only for trusted icon markup or very small static fragments.
- Add helper render functions for buttons, cards, progress bars, and stat tiles.
- Remove inline `onclick` from generated cards and buttons.

## Gameplay Improvements

### 1. Improve The First 5 Minutes

- Show a clearer first-time path: name entry, onboarding, first recommended realm, first trial.
- After onboarding, highlight one suggested realm instead of showing all choices equally.
- Add a quick "continue" card once the player has started progression.
- Show one immediate reward after the first cleared trial.

### 2. Make Boss Trials Feel Distinct

- Use the existing boss metadata for stronger presentation.
- Add the missing `bossWarning` UI.
- Change timer color and audio only for boss questions.
- Add a boss result row in the results screen.
- Reward boss wins with relic shards or bonus crowns.

### 3. Finish Adaptive Practice UX

- Surface weak areas from `skillProfile.tags` in the profile and hub.
- Let users start a short practice quiz from each weak-area card.
- Show "why recommended" labels, such as low accuracy, repeated mistakes, or slow response time.
- Track whether adaptive practice improves the tag accuracy.

### 4. Balance Rewards

- Review the economy around crowns, lifelines, shop costs, daily rewards, mission rewards, and weekly rewards.
- Prevent lifelines from feeling too expensive early.
- Add unlock requirements to some titles/themes so the shop is not only currency-based.
- Show reward previews before starting a trial.

### 5. Improve Review And Learning

- Make review available after every quiz and from recent mistakes in profile.
- Add filters for wrong answers, boss questions, and weak tags.
- Add a "try similar" path for more than one question, not only a single generated practice flow.
- Use longer explanations when the player is wrong and shorter confirmation when correct.

## Content Improvements

### 1. Resolve Question Audit Warnings

- Rebalance science level 4 answer positions.
- Rebalance geography level 4 answer positions.
- Review the near-duplicate math questions:
  - `math[37]`
  - `math[48]`

### 2. Complete Arabic Localization

- Each category currently has 45 of 50 questions missing Arabic translations.
- Decide whether Arabic is a supported release language now or a future feature.
- If supported now, complete Arabic translations for all question text, options, explanations, hints, and long explanations.
- If not supported now, hide Arabic in settings until translations are complete.

### 3. Expand Question Depth

- Add more than 10 questions per level so repeat play has variety.
- Target 20 questions per level as the next milestone.
- Add more `explanationLong` content for harder questions.
- Add source review for factual accuracy on history, science, and geography questions.

## UI And Accessibility Improvements

### 1. Accessibility

- Add `aria-live` announcements for correct/wrong/timeout states.
- Ensure all modal dialogs have `role="dialog"`, `aria-modal="true"`, labels, and focus trapping.
- Use real buttons for all clickable cards or give cards full keyboard behavior.
- Make option buttons use `aria-checked` when acting as radio options.
- Keep answer icons visible so correctness is not color-only.
- Test keyboard-only flow for welcome, onboarding, hub, quiz, review, shop, and settings.

### 2. Mobile Layout

- Test at 360px, 390px, 430px, 700px, and desktop widths.
- Verify long questions and long answer options do not push controls out of view.
- Keep quiz controls stable so option reveal and explanation text do not cause awkward layout jumps.
- Confirm the bottom nav does not cover content in standalone PWA mode.

### 3. Visual Polish

- Replace placeholder text like "Topics", "Levels", "Awards", "Trophies", and "Shop" with the newer terminology from `GAME_DESIGN.md`: Realms, Trials, Relics, Armory, Sigils, Crowns.
- Add PWA screenshots referenced by `manifest.json`.
- Add realm-specific visual identity to level select and results.
- Make the reward and mastery systems visible earlier in the experience.

## Architecture Improvements

### 1. Split Global Scripts Into Modules

Current files are separated by topic, but they still share globals heavily.

Plan:

- Convert scripts to ES modules.
- Move constants into dedicated modules.
- Move state logic into a state service.
- Move rendering logic into screen-specific modules.
- Make game-flow functions accept dependencies instead of relying on every global.

### 2. Add A Small Test Harness

Plan:

- Keep `validate_questions.js` as the data gate.
- Add unit tests for:
  - save migration
  - daily streak logic
  - reward calculation
  - star calculation
  - mission progress
  - weekly goal reset
  - question selection and boss placement
- Add a browser smoke test for first load, start trial, answer question, finish trial, review, and reset.

### 3. Improve Build And Release Safety

Plan:

- Add a `test` script that runs validation, strict validation, and browser smoke tests.
- Make `build_v3.js` fail if required DOM IDs referenced by JavaScript are missing from `main.html`.
- Add a service-worker cache version check that forces developers to update `CACHE_VERSION` when core assets change.
- Add a release checklist generated from `QA_CHECKLIST.md`.

## PWA And Offline Improvements

- Cache local assets during install, but avoid making CDN font/icon caching a release blocker.
- Add local fallback icons or bundle Font Awesome assets to improve offline reliability.
- Add install screenshots to `manifest.json`.
- Add a visible offline badge test.
- Add a data version to cached question files so stale question data can be detected.

## Suggested Implementation Order

1. Fix boot order and returning-player resume.
2. Add missing DOM containers and controls for already-implemented features.
3. Normalize daily date and streak logic.
4. Add tests for daily logic, reward logic, and startup routing.
5. Complete shop, relic, mission, weekly, and weak-area UI surfaces.
6. Clean up terminology across the app.
7. Improve accessibility and modal focus behavior.
8. Expand and localize question content.
9. Refactor global scripts into modules.
10. Add browser smoke tests and make them part of release validation.

## Definition Of Better

The game will be in a better place when:

- Returning players reliably resume into the game.
- Every implemented feature has visible UI and can be tested by a player.
- Daily streaks behave correctly across days and time zones.
- Settings, shop tabs, relic filters, missions, weekly goals, hint lifeline, boss warning, and weak-area practice are reachable.
- Data validation has zero warnings or intentionally documented warnings.
- A release can be checked with one command.
- The first session feels guided, rewarding, and polished.
- The code is easier to change without breaking unrelated screens.
