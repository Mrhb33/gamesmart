# Cerebrum Quest — QA Checklist

Manual test matrix for release readiness.

## New Player Onboarding
- [ ] First load shows welcome screen with name input
- [ ] "Begin Quest" starts onboarding (4 steps)
- [ ] Onboarding skip works
- [ ] Onboarding completion lands on hub
- [ ] Name persists after refresh

## Resume Existing Player
- [ ] Returning player skips welcome, lands on hub
- [ ] All stats (XP, crowns, trials, accuracy) restored correctly
- [ ] Avatar and equipped items persist
- [ ] Daily streak continues from last session

## Realm Navigation
- [ ] Hub shows all 7 realm cards with stage paths
- [ ] Stage path nodes show correct done/next/locked states
- [ ] Clicking a realm opens level select
- [ ] "Realm Map" back button works
- [ ] Locked stages cannot be started

## Quiz Flow
- [ ] Questions load with shuffled options
- [ ] Timer counts down correctly
- [ ] Correct answer: green highlight, XP fly, streak increment
- [ ] Wrong answer: red highlight, shake animation, streak reset
- [ ] Timeout: correct answer revealed, treated as wrong
- [ ] Phase labels (Warmup / Skirmish / Boss Battle) display
- [ ] Progress bar advances with each question

## Boss Question
- [ ] Boss warning banner appears on last question
- [ ] Boss start sound plays
- [ ] Timer is reduced for boss questions
- [ ] Boss defeated shows in results
- [ ] Boss escaped shows in results

## Stage Completion
- [ ] Pass (>=60%): "Trial Cleared!" with confetti and banner
- [ ] Fail (<60%): "Almost There!" with retry option
- [ ] Stars awarded: 3 for perfect, 2 for 80%+, 1 for 60%+
- [ ] XP, crowns, sigils calculated correctly
- [ ] Next trial unlocked after passing
- [ ] Perfect run (100%) gets special title

## Daily Trial
- [ ] Daily card shows streak badge
- [ ] Can only complete once per day
- [ ] 10 hard questions selected
- [ ] Daily chest appears on completion
- [ ] Streak increments correctly
- [ ] After completing, card shows "Completed today"

## Missions
- [ ] 3 daily missions generate correctly
- [ ] Progress updates during play
- [ ] Claim button appears when complete
- [ ] Rewards (XP + crowns) granted on claim
- [ ] Missions reset at midnight

## Weekly Goal
- [ ] Weekly progress bar tracks stage completions
- [ ] Claim button appears when target met
- [ ] Resets each week

## Achievements / Relics
- [ ] New achievement badge appears in nav
- [ ] Collection gallery shows all relics with filters
- [ ] Relic modal shows details
- [ ] Shard popups appear when earned

## Armory / Shop
- [ ] Shop tabs (Avatars, Frames, Titles, Themes) render
- [ ] Buying item deducts crowns
- [ ] Equipping item updates display
- [ ] Insufficient crowns shows error toast

## Profile / Codex
- [ ] All stats display correctly
- [ ] Edit name works
- [ ] Hall of Fame shows top collectibles
- [ ] Frame ring renders equipped frame color

## Settings
- [ ] Settings modal opens from nav gear icon
- [ ] Sound toggle mutes/unmutes all audio
- [ ] Haptics toggle enables/disables vibration
- [ ] Reduced motion toggle disables animations
- [ ] Settings persist across sessions
- [ ] Language shows "coming soon"

## Save Export / Import
- [ ] Export downloads a .json file
- [ ] Import loads a valid save file
- [ ] Invalid file shows error toast
- [ ] Backup created before import overwrite
- [ ] Page reloads after import

## Reset Progress
- [ ] Confirmation modal appears
- [ ] All data cleared on confirm
- [ ] Cancel preserves data

## Offline Mode
- [ ] App loads when offline (after first visit)
- [ ] Offline badge shows in top-right
- [ ] "Back online" toast on reconnect
- [ ] Questions available offline

## Service Worker Update
- [ ] Update banner appears when new version detected
- [ ] Clicking Update applies new version
- [ ] Page reloads with new content

## Responsive Layout
### Mobile (390px width)
- [ ] All screens fit without horizontal scroll
- [ ] Quiz options are tappable (min 44px height)
- [ ] Nav tabs readable and tappable
- [ ] Text doesn't overflow cards
- [ ] Modals fit within viewport

### Desktop (1200px+ width)
- [ ] Content centered with max-width
- [ ] Category grid shows multiple columns
- [ ] No excessive whitespace

## Accessibility
- [ ] Keyboard navigation works for quiz (keys 1-4, Enter, Space)
- [ ] Escape closes modals
- [ ] Focus visible on all interactive elements
- [ ] Screen reader announces correct/wrong answers
- [ ] Correct/wrong answers have icons, not just color
- [ ] Reduced motion removes all animations
- [ ] ARIA labels on key buttons

## Audio
- [ ] Sounds play after first user interaction
- [ ] No sounds before user interaction
- [ ] Mute toggle stops all sounds
- [ ] Correct answer sound distinct from wrong
- [ ] Boss start sound plays on boss questions
- [ ] Reward sound plays on mission/weekly claims

## Haptics
- [ ] Correct answer: short positive vibration
- [ ] Wrong answer: single negative vibration
- [ ] Reward claim: celebratory pattern
- [ ] Haptics toggle disables all vibration

## Edge Cases
- [ ] Double-tap zoom prevented
- [ ] No console errors during normal play
- [ ] Rapid button tapping doesn't break quiz
- [ ] Back button during quiz shows confirmation
- [ ] Timer doesn't continue after quiz exit
- [ ] Very long player names don't break layout
