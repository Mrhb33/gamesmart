# Cerebrum Quest — Game Design Document

## Core Fantasy

You are a **Knowledge Seeker** exploring seven realms of human understanding. Each realm has five stages of increasing difficulty, culminating in a Boss Trial. You answer questions to progress, earn XP and Coins, collect Relics (achievements), and build your seeker profile from Novice to Legend.

## Terminology Map

| Old Label | New Label | Context |
|---|---|---|
| Topics | Realms | Hub, nav, category cards |
| Levels | Trials | Level select, quiz header |
| Levels (player) | Seeker Rank | Profile, hub header |
| Daily Challenge | Daily Trial | Hub card, quiz |
| Achievements | Relics | Nav, achievements screen |
| Shop | Armory | Nav tab |
| Trophies | Relics | Trophy modal |
| Stars | Sigils | Results, level cards |
| Coins | Crowns | Shop, rewards |

## Player Journey

1. **Welcome** — Name entry, cinematic feel. Shows "7 Realms · 35 Trials · 20 Relics".
2. **Onboarding** — 4-step guided intro: Pick a Realm → Clear Trials → Earn Crowns → Collect Relics.
3. **Realm Map (Hub)** — Shows all 7 realms with progress. Daily Trial banner. Player header with rank + XP bar.
4. **Trial Select** — Realm-specific level list with themed titles, boss markers, star ratings.
5. **Quiz Battle** — Timed questions with lifelines, streak tracking, XP flyouts.
6. **Results / Rewards** — Score ring, stars, coins, reward breakdown, next-trial CTA.
7. **Review / Learn** — Post-quiz answer review with explanations.
8. **Relics (Achievements)** — Grid of collectible relics with tiers (Bronze → Legendary + Secret).
9. **Armory (Shop)** — Spend crowns on avatars and cosmetics.
10. **Profile / Collection** — Stats, showcase, hall of fame, daily streak.

## Progression Systems

### XP & Seeker Rank
- XP earned per correct answer, scaled by trial difficulty and streak bonuses.
- Ranks: Novice → Scholar → Sage → Polymath → Mastermind → Luminary → Legend.
- XP formula: `level * 150` XP per rank-up.

### Stars (Sigils)
- 0–3 per trial based on accuracy: 100% → 3★, 80%+ → 2★, 60%+ → 1★.
- "Flawless Realm" = 3★ on all 5 trials in a realm.

### Crowns (Coins)
- Earned from trials (based on stars), relic rewards, daily trial bonus.
- Spent in Armory on avatars and lifelines during quiz.

### Relics (Achievements)
- 20 relics across tiers: Bronze, Silver, Gold, Platinum, Legendary, Secret.
- Each rewards crowns on unlock.
- Pin up to 3 to profile showcase.

## Retention Mechanics

1. **Daily Trial** — 10 hard questions, big rewards, 24h cooldown.
2. **Daily Streak** — Consecutive days of daily completion tracked.
3. **Boss Trials** — Level 5 of each realm is a boss fight (10th question is the boss).
4. **Secret Relics** — Hidden achievements that reward curiosity (comeback, perfect level 5).
5. **Realm Mastery** — Completing all 5 trials in a realm.

## Mobile-First Design Principles

- Bottom navigation on mobile (≤700px), top nav on desktop.
- Touch targets ≥44px.
- No horizontal scroll.
- Safe-area-inset support for notched devices.
- Standalone PWA mode support.

## Architecture

- **Single-page app** in `main.html` (HTML + CSS + JS, no framework).
- **Static data** in `questions.json` and `levels_metadata.json`.
- **PWA** via `manifest.json` and `sw.js`.
- **State** persisted to `localStorage` (`cerebrum_save`).
- **Build step** via `build_v3.js` (injects features into template).

## Feature Roadmap (TODO)

- [ ] Realm map with visual node-based path instead of flat card grid
- [ ] Animated realm entry transitions
- [ ] Boss question with special UI (timer changes, dramatic sound)
- [ ] Combo system (fast consecutive correct answers)
- [ ] Weekly challenge / leaderboard (needs backend)
- [ ] Unlockable realm themes / cosmetics
- [ ] Sound toggle in settings
- [ ] Accessibility audit (screen reader, high contrast)
- [ ] Offline indicator
- [ ] Profile export/import
