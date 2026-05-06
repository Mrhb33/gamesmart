// ==================== I18N / LOCALIZATION ====================
let _lang = localStorage.getItem('cerebrum_lang') || 'en';
(function() { document.documentElement.lang = _lang; document.documentElement.dir = _lang === 'ar' ? 'rtl' : 'ltr'; })();

const I18N = {
  en: {
    // Welcome
    'welcome.title': 'Cerebrum Quest',
    'welcome.subtitle': 'KNOWLEDGE ADVENTURE',
    'welcome.tagline': 'Seven realms of knowledge await. Conquer trials, collect ancient relics, and forge your legend.',
    'welcome.namePlaceholder': "Enter your name, Seeker...",
    'welcome.btnStart': 'Begin Quest',
    'welcome.statRealms': 'Realms',
    'welcome.statTrials': 'Trials',
    'welcome.statCollectibles': 'Collectibles',
    // Onboarding
    'onboard.step0Title': 'Choose Your Realm',
    'onboard.step0Desc': '7 realms of knowledge to explore and master',
    'onboard.step1Title': 'Conquer Trials',
    'onboard.step1Desc': '5 stages per realm — from apprentice to boss battle',
    'onboard.step2Title': 'Earn Crowns',
    'onboard.step2Desc': 'XP, crowns & sigils for every correct answer',
    'onboard.step3Title': 'Collect Relics',
    'onboard.step3Desc': '20 relics to discover — some are secret',
    'onboard.next': 'Next',
    'onboard.letsGo': "Let's Go!",
    'onboard.skip': 'Skip',
    // Nav
    'nav.realms': 'Realms',
    'nav.relics': 'Relics',
    'nav.armory': 'Armory',
    'nav.skills': 'Skills',
    'nav.codex': 'Codex',
    'nav.settings': 'Settings',
    // Hub
    'hub.chooseRealm': 'Choose Your Realm',
    'hub.subtitle': 'Conquer trials in each realm to rise through the ranks',
    'hub.trials': 'Trials',
    'hub.xp': 'XP',
    'hub.crowns': 'Crowns',
    'hub.accuracy': 'Accuracy',
    'hub.dailyTrial': 'Daily Trial',
    'hub.dailyDesc': '10 hard questions for massive XP & Crowns!',
    'hub.dailyDone': 'Completed today — return tomorrow!',
    'hub.weakAreas': 'Weak Areas',
    'hub.continueJourney': 'Continue Journey',
    'hub.bossGate': 'Boss Gate',
    'hub.mastered': 'Mastered',
    'hub.recommended': 'Start Here',
    'hub.continue': 'Continue',
    'hub.codex': 'Codex',
    'hub.grandmaster': 'Grandmaster',
    'hub.allRealmsConquered': 'All Realms Conquered',
    'hub.viewCodex': 'View your Codex to see the full journey',
    'hub.grandmasterAchieved': 'Grandmaster Achieved',
    'hub.grandmasterSub': 'All seven realms conquered. You are legendary.',
    'hub.latestRelic': 'Latest Relic Found',
    'hub.dayStreak': '{n}-day streak',
    'hub.realmMap': 'Realm Map',
    // Category meta
    'cat.science.name': 'Science',
    'cat.science.desc': 'Physics, chemistry, biology & the universe',
    'cat.history.name': 'History',
    'cat.history.desc': 'Civilizations, wars & humanity',
    'cat.geography.name': 'Geography',
    'cat.geography.desc': 'Countries, oceans & the world',
    'cat.math.name': 'Mathematics',
    'cat.math.desc': 'Numbers, patterns & logic',
    'cat.language.name': 'Language',
    'cat.language.desc': 'Words, grammar & communication',
    'cat.nature.name': 'Nature',
    'cat.nature.desc': 'Animals, ecosystems & living world',
    'cat.culture.name': 'Culture',
    'cat.culture.desc': 'Art, traditions & human creativity',
    // Level names
    'lvl.0': 'Apprentice',
    'lvl.1': 'Explorer',
    'lvl.2': 'Journeyman',
    'lvl.3': 'Adept',
    'lvl.4': 'Master',
    // Ranks
    'rank.0': 'Novice',
    'rank.1': 'Scholar',
    'rank.2': 'Sage',
    'rank.3': 'Polymath',
    'rank.4': 'Mastermind',
    'rank.5': 'Luminary',
    'rank.6': 'Legend',
    // Level select
    'ls.realmMap': 'Realm Map',
    'ls.warmup': 'Warm-up',
    'ls.challenge': 'Challenge',
    'ls.bossBattle': 'Boss Battle',
    'ls.boss': 'Boss',
    'ls.qs': 'Qs',
    // Quiz
    'quiz.retreat': 'Retreat',
    'quiz.bossQuestion': 'Boss Question',
    'quiz.next': 'Next',
    'quiz.correct': 'Correct!',
    'quiz.wrong': "Not quite — here's why:",
    'quiz.timesUp': "Time's up!",
    'quiz.bossTimesUp': "Boss escaped! Time's up!",
    'quiz.hintLabel': 'Hint:',
    'quiz.dailyTrial': 'Daily Trial',
    'quiz.trial': 'Trial',
    'quiz.practice': 'Weak Area Practice',
    'quiz.tip': 'Tip: Review this topic before your next attempt!',
    'quiz.fiftyFifty': '50/50',
    'quiz.freeze': 'Freeze',
    'quiz.hint': 'Hint',
    'quiz.free': 'Free',
    'quiz.bossTip': 'Boss tip: Answer carefully!',
    // Phases
    'phase.warmup': 'Warmup',
    'phase.confidence': 'Confidence',
    'phase.challenge': 'Challenge',
    'phase.bossPrep': 'Boss Prep',
    'phase.bonusChallenge': 'Bonus Challenge',
    'phase.finalPush': 'Final Push',
    'phase.boss': 'BOSS',
    // Combo
    'combo.0': 'Combo',
    'combo.1': 'Great Combo',
    'combo.2': 'Super Combo',
    'combo.3': 'Mega Combo',
    // Streak milestones
    'streak.0': 'Dedicated',
    'streak.1': 'Devoted',
    'streak.2': 'Unstoppable',
    'streak.3': 'Legendary',
    // Results
    'res.perfectRun': 'Perfect Run!',
    'res.bossDefeated': 'Boss Defeated!',
    'res.trialCleared': 'Trial Cleared!',
    'res.dailyCleared': 'Daily Trial Complete!',
    'res.soClose': 'So Close!',
    'res.almostThere': 'Almost There!',
    'res.perfectBoss': 'You flawlessly conquered the Boss Trial!',
    'res.perfectSub': 'Flawless victory! Amazing work.',
    'res.bossDefeatedSub': 'You overcame the ultimate challenge of this category!',
    'res.trialClearedSub': 'You mastered this trial!',
    'res.dailyCompleteSub': 'Daily Trial complete — great work!',
    'res.soCloseOneAway': 'You were one answer away! Try again for the clear.',
    'res.soCloseEdge': 'You are right on the edge. Focus and try again!',
    'res.almostSub': "Review the answers and try again — you'll improve!",
    'res.trialComplete': 'Trial Complete!',
    'res.trialUnlocked': 'Trial {n} Complete — Trial {next} Unlocked!',
    'res.nextTrial': 'Next Trial',
    'res.chooseRealm': 'Choose Another Realm',
    'res.backToRealms': 'Back to Realms',
    'res.retryStage': 'Retry Stage',
    'res.studyAnswers': 'Study Answers',
    'res.share': 'Share',
    'res.realmMap': 'Realm Map',
    'res.retryTrial': 'Retry Trial',
    'res.crowns': 'Crowns',
    'res.correct': 'Correct',
    'res.wrong': 'Wrong',
    'res.bestStreak': 'Best Streak',
    'res.bossStatus': 'Boss',
    'res.defeated': 'Defeated',
    'res.escaped': 'Escaped',
    'res.accuracy': 'Accuracy',
    'res.sigils': 'sigils',
    'res.perfectClear': 'Perfect Clear!',
    'res.bossDefeatedTag': 'Boss Defeated',
    'res.bossEscapedTag': 'Boss Escaped',
    'res.streakBonus': 'streak bonus',
    'res.speed': 'speed',
    // Result (used by finishLvl)
    'result.perfectRun': 'Perfect Run!',
    'result.perfectBossSub': 'You flawlessly conquered the Boss Trial!',
    'result.perfectSub': 'Flawless victory! Amazing work.',
    'result.bossDefeated': 'Boss Defeated!',
    'result.trialCleared': 'Trial Cleared!',
    'result.dailyComplete': 'Daily Trial Complete!',
    'result.bossSub': 'You overcame the ultimate challenge of this category!',
    'result.trialSub': 'You mastered this trial!',
    'result.soClose': 'So Close!',
    'result.oneAway': 'You were one answer away! Try again for the clear.',
    'result.onTheEdge': 'You are right on the edge. Focus and try again!',
    'result.almostThere': 'Almost There!',
    'result.almostThereSub': "Review the answers and try again — you'll improve!",
    'result.defeated': 'Defeated',
    'result.escaped': 'Escaped',
    'result.crowns': 'Crowns',
    'result.streakBonus': 'streak bonus',
    'result.speed': 'speed',
    'result.sigils': 'sigils',
    'result.perfectClear': 'Perfect Clear!',
    'result.boss': 'Boss',
    'result.dailyCompleteBanner': 'Daily Trial Complete!',
    'result.trialComplete': 'Trial {lvl} Complete!',
    'result.trialUnlocked': 'Trial {lvl} Unlocked',
    'result.nextTrial': 'Next Trial',
    'result.chooseRealm': 'Choose Another Realm',
    'result.backToRealms': 'Back to Realms',
    'result.retryStage': 'Retry Stage',
    'result.reviewMistakes': 'Review Mistakes',
    'result.focusOn': 'Focus on: {topics}',
    'result.almostPassing': 'You were only {pct}% away from passing. Almost there!',
    'result.reviewExplanations': 'Review the explanations below to understand the patterns.',
    'result.bossEscapedTip': 'The Boss escaped — practice the boss topic before retrying.',
    'result.encouragement50': 'Every mistake is a lesson. Review and come back stronger!',
    'result.encouragementLow': 'Take your time with Review Mistakes. Understanding beats speed!',
    'result.practiceTips': 'Practice Tips',
    // Review
    'review.title': 'Study Guide',
    'review.results': 'Results',
    'review.all': 'All',
    'review.wrong': 'Wrong',
    'review.weakAreas': 'Weak Areas',
    'review.perfect': 'Perfect! Nothing to review here.',
    'review.yourAnswer': 'Your answer:',
    'review.correctAnswer': 'Correct:',
    'review.timeExpired': '(time expired)',
    'review.trySimilar': 'Try Similar Question',
    'review.showExplanation': 'Show Explanation',
    // Weak Areas
    'weak.title': 'Weak Areas',
    'weak.realmMastery': 'Realm Mastery',
    'weak.weakestTopics': 'Weakest Topics',
    'weak.weakAreas': 'Weak Areas',
    'weak.strongRealms': 'Strong Realms',
    'weak.overallAccuracy': 'Overall Accuracy',
    'weak.learning': 'Learning',
    'weak.realmMap': 'Realm Map',
    'weak.mastery.master': 'Master',
    'weak.mastery.skilled': 'Skilled',
    'weak.mastery.adept': 'Adept',
    'weak.mastery.learning': 'Learning',
    'weak.mastery.novice': 'Novice',
    'weak.noData': 'Play some trials to see your weak areas! Your performance data will appear here.',
    'weak.allGood': 'No significant weak areas detected. Keep it up!',
    'weak.correct': 'correct',
    'weak.accuracy': 'accuracy',
    'weak.masteryPct': '{m}% mastery',
    'weak.trialsSigils': '{done}/5 trials · {stars}/15 sigils',
    'weak.trials': 'trials',
    'weak.sigils': 'sigils',
    'weak.mastery': 'mastery',
    'weak.noWeakAreas': 'No significant weak areas detected. Keep it up!',
    'weak.recentTroubleSpots': 'Recent Trouble Spots',
    'weak.recentMistakes': '{n} recent mistakes',
    'weak.practice': 'Practice',
    'weak.focusTag': 'Focus: {tag}',
    // Achievements
    'achieve.relicsTrophies': 'Relics & Trophies',
    'achieve.collected': 'Collected',
    'achieve.realmRelics': 'Realm Relics',
    'achieve.trophies': 'Trophies',
    'achieve.all': 'All',
    'achieve.allRealms': 'All Realms',
    'achieve.close': 'Close',
    'achieve.shards': 'shards',
    'achieve.new': 'NEW',
    'achieve.secretDesc': 'Keep exploring to discover this secret.',
    'achieve.filter.common': 'Common',
    'achieve.filter.rare': 'Rare',
    'achieve.filter.epic': 'Epic',
    'achieve.filter.legendary': 'Legendary',
    'achieve.filter.mythic': 'Mythic',
    // Achievement names & descriptions
    'achieve.first_step.name': 'First Step',
    'achieve.first_step.desc': 'Complete your first trial',
    'achieve.curious_mind.name': 'Curious Mind',
    'achieve.curious_mind.desc': 'Explore 3 different realms',
    'achieve.scholar.name': 'Scholar',
    'achieve.scholar.desc': 'Earn 500 total XP',
    'achieve.veteran.name': 'Veteran',
    'achieve.veteran.desc': 'Clear 10 trials',
    'achieve.encyclopedia.name': 'Encyclopedia',
    'achieve.encyclopedia.desc': 'Answer 100 questions total',
    'achieve.streak_5.name': 'On Fire',
    'achieve.streak_5.desc': 'Get a 5-answer streak',
    'achieve.speed_demon.name': 'Speed Demon',
    'achieve.speed_demon.desc': 'Answer in under 3 seconds',
    'achieve.level5.name': 'The Summit',
    'achieve.level5.desc': 'Complete any Boss Trial (Stage 5)',
    'achieve.polymath.name': 'Polymath',
    'achieve.polymath.desc': 'Explore all 7 realms',
    'achieve.survivor.name': 'Survivor',
    'achieve.survivor.desc': 'Answer a Stage 4+ question correctly',
    'achieve.pure_skill.name': 'Pure Skill',
    'achieve.pure_skill.desc': 'Clear a trial without using lifelines',
    'achieve.perfect.name': 'Perfectionist',
    'achieve.perfect.desc': 'Score 3 sigils on any trial',
    'achieve.streak_10.name': 'Unstoppable',
    'achieve.streak_10.desc': 'Get a 10-answer streak',
    'achieve.mastery.name': 'Realm Master',
    'achieve.mastery.desc': 'Complete all 5 trials in one realm',
    'achieve.mastermind.name': 'Mastermind',
    'achieve.mastermind.desc': 'Earn 2000 total XP',
    'achieve.daily_habit.name': 'Daily Devotion',
    'achieve.daily_habit.desc': 'Get a 3-day daily streak',
    'achieve.all_realms.name': 'Grand Master',
    'achieve.all_realms.desc': 'Complete all 35 trials',
    'achieve.perfect_realm.name': 'Flawless Realm',
    'achieve.perfect_realm.desc': 'Score 3 sigils on all 5 trials in a realm',
    'achieve.comeback.name': 'The Comeback',
    'achieve.comeback.desc': 'Return after 2+ days and clear a trial',
    'achieve.secret_perfect.name': 'Hidden Genius',
    'achieve.secret_perfect.hiddenDesc': 'Get a Perfect Run (100%) on any Boss Trial.',
    // Relic names & descriptions
    'relic.science_1.name': 'Atom Core',
    'relic.science_1.desc': 'Harness the fundamental building blocks of matter.',
    'relic.science_2.name': 'Quantum Lens',
    'relic.science_2.desc': 'See beyond the visible spectrum into quantum realms.',
    'relic.science_3.name': 'Star Compass',
    'relic.science_3.desc': 'Navigate by starlight through infinite knowledge.',
    'relic.history_1.name': 'Ancient Seal',
    'relic.history_1.desc': 'An unbroken seal from a forgotten dynasty.',
    'relic.history_2.name': 'Empire Crown',
    'relic.history_2.desc': 'Symbol of sovereignty across ages.',
    'relic.history_3.name': 'Time Scroll',
    'relic.history_3.desc': 'Unrolls to reveal the entire timeline of civilization.',
    'relic.geography_1.name': 'World Compass',
    'relic.geography_1.desc': 'Points toward undiscovered horizons.',
    'relic.geography_2.name': 'Ocean Pearl',
    'relic.geography_2.desc': 'Harvested from the deepest abyss.',
    'relic.geography_3.name': 'Mountain Crest',
    'relic.geography_3.desc': 'Forged at the summit of the world.',
    'relic.math_1.name': 'Golden Ratio',
    'relic.math_1.desc': 'The perfect proportion found everywhere in nature.',
    'relic.math_2.name': 'Infinity Stone',
    'relic.math_2.desc': 'Contains boundless computational energy.',
    'relic.math_3.name': 'Logic Cube',
    'relic.math_3.desc': 'Every side reveals a new dimension of reasoning.',
    'relic.language_1.name': 'Word Quill',
    'relic.language_1.desc': 'Writes in every tongue simultaneously.',
    'relic.language_2.name': 'Syntax Key',
    'relic.language_2.desc': 'Unlocks the hidden structure of communication.',
    'relic.language_3.name': 'Polyglot Mask',
    'relic.language_3.desc': 'Grants fluency in all languages past and present.',
    'relic.nature_1.name': 'Leaf Sigil',
    'relic.nature_1.desc': 'Pulses with the rhythm of the forest.',
    'relic.nature_2.name': 'Coral Heart',
    'relic.nature_2.desc': 'Beats with the currents of the deep ocean.',
    'relic.nature_3.name': 'Wild Crown',
    'relic.nature_3.desc': 'Woven from the oldest roots of the ancient grove.',
    'relic.culture_1.name': 'Festival Mask',
    'relic.culture_1.desc': 'Celebrates the creative spirit of humanity.',
    'relic.culture_2.name': 'Art Flame',
    'relic.culture_2.desc': 'Burns with the passion of a thousand artisans.',
    'relic.culture_3.name': 'Heritage Globe',
    'relic.culture_3.desc': 'Encapsulates all traditions of the world.',
    // Shop
    'shop.title': 'Armory',
    'shop.avatars': 'Avatars',
    'shop.frames': 'Frames',
    'shop.titles': 'Titles',
    'shop.themes': 'Themes',
    'shop.equipped': 'Equipped',
    'shop.equip': 'Equip',
    // Shop item names
    'shop.avatar_A.name': 'Default Seeker',
    'shop.avatar_B.name': 'Mech Sage',
    'shop.avatar_C.name': 'Dragon Scholar',
    'shop.avatar_D.name': 'Phantom Adept',
    'shop.frame_none.name': 'No Frame',
    'shop.frame_bronze.name': 'Bronze Ring',
    'shop.frame_silver.name': 'Silver Ring',
    'shop.frame_gold.name': 'Gold Ring',
    'shop.frame_prism.name': 'Prism Frame',
    'shop.title_novice.name': 'Novice',
    'shop.title_scholar.name': 'Scholar',
    'shop.title_sage.name': 'Sage',
    'shop.title_polymath.name': 'Polymath',
    'shop.title_luminary.name': 'Luminary',
    'shop.title_legend.name': 'Legend',
    'shop.theme_default.name': 'Default Dark',
    'shop.theme_ember.name': 'Ember Glow',
    'shop.theme_ocean.name': 'Ocean Depths',
    'shop.theme_cosmic.name': 'Cosmic Void',
    // Profile
    'profile.seekerRank': 'Seeker Rank {lvl} — {rank}',
    'profile.hallOfFame': 'Hall of Fame',
    'profile.hallOfFameEmpty': 'Collect relics to fill your Hall of Fame',
    'profile.editName': 'Edit Name',
    'profile.exportSave': 'Export Save',
    'profile.importSave': 'Import Save',
    'profile.resetProgress': 'Reset Progress',
    'profile.totalXP': 'Total XP',
    'profile.crowns': 'Crowns',
    'profile.trials': 'Trials',
    'profile.sigils': 'Sigils',
    'profile.relicScore': 'Relic Score',
    'profile.bestStreak': 'Best Streak',
    'profile.trophies': 'Trophies',
    'profile.realmRelics': 'Realm Relics',
    'profile.realmsMastered': 'Realms Mastered',
    'profile.perfectRuns': 'Perfect Runs',
    'profile.dailyStreak': 'Daily Streak',
    'profile.questions': 'Questions',
    'profile.weakAreas': 'Weak Areas',
    'profile.avgSpeed': 'Avg Speed',
    'profile.collectRelics': 'Collect relics to fill your Hall of Fame',
    // Settings
    'settings.title': 'Settings',
    'settings.sound': 'Sound',
    'settings.haptics': 'Haptics',
    'settings.reducedMotion': 'Reduced Motion',
    'settings.language': 'Language',
    'settings.exportSave': 'Export Save',
    'settings.importSave': 'Import Save',
    'settings.resetProgress': 'Reset Progress',
    // Modals
    'modal.editName': 'Edit Name',
    'modal.newName': 'New name...',
    'modal.cancel': 'Cancel',
    'modal.save': 'Save',
    // Confirm
    'confirm.retreatTitle': 'Retreat from Trial?',
    'confirm.retreatMsg': 'Progress in this trial will be lost.',
    'confirm.resetTitle': 'Reset Progress?',
    'confirm.resetMsg': 'All data will be erased permanently.',
    'confirm.areYouSure': 'Are you sure?',
    'confirm.cannotUndo': 'This action cannot be undone.',
    'confirm.confirm': 'Confirm',
    // Toasts
    'toast.notEnoughCrowns': 'Not enough crowns!',
    'toast.dailyDone': 'Daily Trial already completed today!',
    'toast.noHardQuestions': 'Not enough hard questions available.',
    'toast.noChallenges': 'No challenges available for this trial.',
    'toast.noPracticeQuestions': 'Not enough practice questions available.',
    'toast.noSimilar': 'No similar questions available yet.',
    'toast.missionComplete': 'Mission complete! +{xp} XP, +{coins} Crowns',
    'toast.weeklyComplete': 'Weekly goal complete! +{xp} XP, +{coins} Crowns',
    'toast.copied': 'Copied!',
    'toast.copyFailed': 'Could not copy',
    'toast.shareNotSupported': 'Share not supported',
    'toast.progressReset': 'Progress reset.',
    'toast.noSaveData': 'No save data found',
    'toast.saveExported': 'Save exported',
    'toast.exportFailed': 'Export failed',
    'toast.invalidSaveFile': 'Invalid save file',
    'toast.saveImported': 'Save imported — reloading...',
    'toast.backOnline': 'Back online',
    'toast.fiftyFifty': 'Two wrong answers removed!',
    'toast.freezeTime': '+10s Time Frozen!',
    'toast.practiceImproved': '{tag} improved by {pct}%! Keep it up!',
    'toast.questionsLoading': 'Questions still loading...',
    'toast.questionsFailed': 'Failed to load questions. Check your connection and refresh.',
    // Missions
    'missions.title': "Today's Missions",
    'missions.claim': 'Claim',
    'missions.claimed': 'Claimed',
    'missions.xp': 'XP',
    'missions.crowns': 'Crowns',
    // Mission templates
    'mission.answer_20.desc': 'Answer {n} questions',
    'mission.stages_2.desc': 'Complete {n} stages',
    'mission.correct_15.desc': 'Get {n} correct answers',
    'mission.stages_3.desc': 'Complete {n} stages',
    'mission.science_1.desc': 'Clear a Science stage',
    'mission.streak_5.desc': 'Get a {n}-answer streak',
    'mission.no_ll_1.desc': 'Clear a stage with no lifelines',
    'mission.daily_done.desc': "Complete today's Daily Trial",
    'mission.streak_8.desc': 'Get an {n}-answer streak',
    'mission.wrong_review.desc': 'Review {n} wrong answers',
    'mission.stages_5.desc': 'Complete {n} stages today',
    // Weekly
    'weekly.title': 'Weekly Goal',
    'weekly.status': '{done} / {target} stages this week',
    'weekly.claimReward': 'Claim Reward',
    'weekly.claimed': 'Claimed this week',
    // Comeback
    'comeback.welcomeBack': 'Welcome back{name}!',
    'comeback.greatToSee.1': 'Great to see you again after {days} day.',
    'comeback.greatToSee.many': 'Great to see you again after {days} days.',
    'comeback.continueWith': 'Continue with {realm}',
    'comeback.explore': 'Explore the Realms',
    // Daily chest
    'chest.dailyChest': 'Daily Chest!',
    'chest.dayStreak': '{n}-day streak',
    // Update
    'update.newVersion': 'New version available',
    'update.update': 'Update',
    // Failure tips
    'tips.title': 'Practice Tips',
    'tips.focusOn': 'Focus on: {tags}',
    'tips.almostThere': 'You were only {n}% away from passing. Almost there!',
    'tips.reviewExpl': 'Review the explanations below to understand the patterns.',
    'tips.bossEscaped': 'The Boss escaped — practice the boss topic before retrying.',
    'tips.everyMistake': 'Every mistake is a lesson. Review and come back stronger!',
    'tips.takeTime': 'Take your time with Review Mistakes. Understanding beats speed!',
    // Adaptive recs
    'rec.recommendedNext': 'Recommended Next',
    'rec.nextDesc': '{realm} · Trial {trial}',
    'rec.practiceWeak': 'Practice Weak Area',
    'rec.readyForBoss': 'Ready for Boss',
    'rec.readyForBossDesc': 'Boss Battle awaits!',
    'rec.reviewMistakes': 'Review Mistakes',
    'rec.improveScore': 'Improve Your Score',
    'rec.start': 'Start',
    'rec.reasonLowAcc': 'Low accuracy on',
    'rec.reasonRepeated': 'Repeated mistakes in',
    // Misc
    'misc.stage': 'Stage',
    'misc.or': 'or',
    // Aria labels
    'aria.mainNav': 'Main navigation',
    'aria.newItems': 'New items',
    'aria.retreatTrial': 'Retreat from trial',
    'aria.answerOptions': 'Answer options',
    'aria.nextQuestion': 'Next question',
    'aria.primaryAction': 'Primary action',
    'aria.retryTrial': 'Retry trial',
    'aria.studyAnswers': 'Study answers',
    'aria.shareResults': 'Share results',
    'aria.returnRealmMap': 'Return to realm map',
    'aria.closeSettings': 'Close settings',
    'aria.settings': 'Settings',
    // Missing UI keys
    'hub.sigils': 'Sigils',
    'misc.trial': 'Trial',
    'phase.battle': 'Battle',
    'profile.accuracy': 'Accuracy',
    'quiz.practiceQuestion': 'Weak Area Practice',
    'rec.practiceWeakArea': 'Practice Weak Area',
    'review.correct': 'Correct',
    'update.updateBtn': 'Update',
    'weak.practiceTitle': 'Weak Area Practice',
    'comeback.exploreRealms': 'Explore the Realms',
    'misc.xp': 'XP',
    'misc.crowns': 'Crowns',
    'misc.loading': 'Loading...',
    'misc.couldNotLoad': 'Could not load questions.<br>Please refresh the page.',
    'misc.10hardQuestions': '10 hard questions',
    'misc.offline': 'Offline',
    'misc.back': 'Back',
    'misc.close': 'Close',
    'misc.claim': 'Claim',
    'misc.share': 'Share',
    'coll.title': 'Collection',
    'coll.relics': 'Relics',
    'coll.trophies': 'Trophies',
    'coll.allRealms': 'All Realms',
    // Tiers
    'tier.bronze': 'Bronze',
    'tier.silver': 'Silver',
    'tier.gold': 'Gold',
    'tier.legendary': 'Legendary',
    'tier.platinum': 'Platinum',
    'tier.secret': 'Secret',
    // Rarity
    'rarity.common': 'Common',
    'rarity.rare': 'Rare',
    'rarity.epic': 'Epic',
    'rarity.legendary': 'Legendary',
    'rarity.mythic': 'Mythic',
    // Shard
    'achieve.shard': 'shard',
    'achieve.relicAssembled': 'Assembled',
    'achieve.shards': 'shards',
    // Mission templates
    'mission.answer_20.desc': 'Answer {n} questions',
    'mission.stages_2.desc': 'Complete {n} stages',
    'mission.correct_15.desc': 'Get {n} correct answers',
    'mission.stages_3.desc': 'Complete {n} stages',
    'mission.science_1.desc': 'Clear a Science stage',
    'mission.streak_5.desc': 'Get a {n}-answer streak',
    'mission.no_ll_1.desc': 'Clear a stage with no lifelines',
    'mission.daily_done.desc': "Complete today's Daily Trial",
    'mission.streak_8.desc': 'Get an {n}-answer streak',
    'mission.wrong_review.desc': 'Review {n} wrong answers',
    'mission.stages_5.desc': 'Complete {n} stages today',
    // Battle counter
    'quiz.battleOf': '{phase} · Battle {cur} of {total}'
  },
  ar: {
    // Welcome
    'welcome.title': 'سيريبروم كويست',
    'welcome.subtitle': 'مغامرة المعرفة',
    'welcome.tagline': 'سبعة عوالم معرفية بانتظارك. اخترق التحديات، اجمع الآثار القديمة، واصنع أسطورتك.',
    'welcome.namePlaceholder': 'أدخل اسمك أيها الباحث...',
    'welcome.btnStart': 'ابدأ الرحلة',
    'welcome.statRealms': 'عوالم',
    'welcome.statTrials': 'تحديات',
    'welcome.statCollectibles': 'مقتنيات',
    // Onboarding
    'onboard.step0Title': 'اختر عالمك',
    'onboard.step0Desc': '7 عوالم معرفية للاستكشاف والإتقان',
    'onboard.step1Title': 'اخترق التحديات',
    'onboard.step1Desc': '5 مراحل لكل عالم — من المبتدئ إلى معركة الزعيم',
    'onboard.step2Title': 'اكسب التيجان',
    'onboard.step2Desc': 'نقاط خبرة وتيجان وأختام لكل إجابة صحيحة',
    'onboard.step3Title': 'اجمع الآثار',
    'onboard.step3Desc': '20 أثرًا ليكتشف — بعضها سري',
    'onboard.next': 'التالي',
    'onboard.letsGo': 'هيا بنا!',
    'onboard.skip': 'تخطي',
    // Nav
    'nav.realms': 'العوالم',
    'nav.relics': 'الآثار',
    'nav.armory': 'الترسانة',
    'nav.skills': 'المهارات',
    'nav.codex': 'المخطوطة',
    'nav.settings': 'الإعدادات',
    // Hub
    'hub.chooseRealm': 'اختر عالمك',
    'hub.subtitle': 'اخترق التحديات في كل عالم لتصعد في الرتب',
    'hub.trials': 'تحديات',
    'hub.xp': 'خبرة',
    'hub.crowns': 'تيجان',
    'hub.accuracy': 'دقة',
    'hub.dailyTrial': 'التحدي اليومي',
    'hub.dailyDesc': '10 أسئلة صعبة لخبرة وتيجان ضخمة!',
    'hub.dailyDone': 'مكتمل اليوم — عُد غدًا!',
    'hub.weakAreas': 'نقاط الضعف',
    'hub.continueJourney': 'تابع الرحلة',
    'hub.bossGate': 'بوابة الزعيم',
    'hub.mastered': 'مُتقن',
    'hub.recommended': 'ابدأ هنا',
    'hub.continue': 'متابعة',
    'hub.codex': 'المخطوطة',
    'hub.grandmaster': 'الماجستير الأعظم',
    'hub.allRealmsConquered': 'جميع العوالم مفتوحة',
    'hub.viewCodex': 'اعرض المخطوطة لرؤية الرحلة كاملة',
    'hub.grandmasterAchieved': 'تحقيق الماجستير الأعظم',
    'hub.grandmasterSub': 'تم فتح جميع العوالم السبعة. أنت أسطوري.',
    'hub.latestRelic': 'آخر أثر عُثر عليه',
    'hub.dayStreak': 'سلسلة {n} يوم',
    'hub.realmMap': 'خريطة العوالم',
    // Category meta
    'cat.science.name': 'العلوم',
    'cat.science.desc': 'الفيزياء والكيمياء والأحياء والكون',
    'cat.history.name': 'التاريخ',
    'cat.history.desc': 'الحضارات والحروب والإنسانية',
    'cat.geography.name': 'الجغرافيا',
    'cat.geography.desc': 'الدول والمحيطات والعالم',
    'cat.math.name': 'الرياضيات',
    'cat.math.desc': 'الأرقام والأنماط والمنطق',
    'cat.language.name': 'اللغة',
    'cat.language.desc': 'الكلمات والقواعد والتواصل',
    'cat.nature.name': 'الطبيعة',
    'cat.nature.desc': 'الحيوانات والأنظمة البيئية والعالم الحي',
    'cat.culture.name': 'الثقافة',
    'cat.culture.desc': 'الفن والتقاليد والإبداع البشري',
    // Level names
    'lvl.0': 'مبتدئ',
    'lvl.1': 'مستكشف',
    'lvl.2': 'رحّالة',
    'lvl.3': 'خبير',
    'lvl.4': 'أستاذ',
    // Ranks
    'rank.0': 'مبتدئ',
    'rank.1': 'طالب علم',
    'rank.2': 'حكيم',
    'rank.3': 'موسوعي',
    'rank.4': 'عبقري',
    'rank.5': 'منير',
    'rank.6': 'أسطوري',
    // Level select
    'ls.realmMap': 'خريطة العوالم',
    'ls.warmup': 'إحماء',
    'ls.challenge': 'تحدي',
    'ls.bossBattle': 'معركة الزعيم',
    'ls.boss': 'زعيم',
    'ls.qs': 'سؤال',
    // Quiz
    'quiz.retreat': 'انسحاب',
    'quiz.bossQuestion': 'سؤال الزعيم',
    'quiz.next': 'التالي',
    'quiz.correct': 'صحيح!',
    'quiz.wrong': 'ليس تمامًا — إليك السبب:',
    'quiz.timesUp': 'انتهى الوقت!',
    'quiz.bossTimesUp': 'هرب الزعيم! انتهى الوقت!',
    'quiz.hintLabel': 'تلميح:',
    'quiz.dailyTrial': 'التحدي اليومي',
    'quiz.trial': 'تحدي',
    'quiz.practice': 'تدريب نقاط الضعف',
    'quiz.tip': 'نصيحة: راجع هذا الموضوع قبل المحاولة القادمة!',
    'quiz.fiftyFifty': '50/50',
    'quiz.freeze': 'تجميد',
    'quiz.hint': 'تلميح',
    'quiz.free': 'مجاني',
    'quiz.bossTip': 'نصيحة الزعيم: أجب بحذر!',
    // Phases
    'phase.warmup': 'إحماء',
    'phase.confidence': 'ثقة',
    'phase.challenge': 'تحدي',
    'phase.bossPrep': 'تهيئة الزعيم',
    'phase.bonusChallenge': 'تحدي إضافي',
    'phase.finalPush': 'الدفعة الأخيرة',
    'phase.boss': 'زعيم',
    // Combo
    'combo.0': 'كومبو',
    'combo.1': 'كومبو رائع',
    'combo.2': 'سوبر كومبو',
    'combo.3': 'ميجا كومبو',
    // Streak milestones
    'streak.0': 'مُثابر',
    'streak.1': 'مُتفانٍ',
    'streak.2': 'لا يُوقف',
    'streak.3': 'أسطوري',
    // Results
    'res.perfectRun': 'أداء مثالي!',
    'res.bossDefeated': 'تم هزيمة الزعيم!',
    'res.trialCleared': 'تم تجاوز التحدي!',
    'res.dailyCleared': 'التحدي اليومي مكتمل!',
    'res.soClose': 'قريب جدًا!',
    'res.almostThere': 'كاد أن يتحقق!',
    'res.perfectBoss': 'لقد تجاوزت تحدي الزعيم بشكل مثالي!',
    'res.perfectSub': 'انتصار بلا عيب! عمل رائع.',
    'res.bossDefeatedSub': 'لقد تجاوزت التحدي الأقصى في هذا التصنيف!',
    'res.trialClearedSub': 'لقد أتقنت هذا التحدي!',
    'res.dailyCompleteSub': 'التحدي اليومي مكتمل — عمل رائع!',
    'res.soCloseOneAway': 'كنت على بُعد إجابة واحدة! حاول مجددًا.',
    'res.soCloseEdge': 'أنت على الحافة. ركّز وحاول مجددًا!',
    'res.almostSub': 'راجع الإجابات وحاول مجددًا — ستتحسن!',
    'res.trialComplete': 'التحدي مكتمل!',
    'res.trialUnlocked': 'التحدي {n} مكتمل — التحدي {next} مفتوح!',
    'res.nextTrial': 'التحدي التالي',
    'res.chooseRealm': 'اختر عالمًا آخر',
    'res.backToRealms': 'العودة إلى العوالم',
    'res.retryStage': 'إعادة المرحلة',
    'res.studyAnswers': 'راجع الإجابات',
    'res.share': 'مشاركة',
    'res.realmMap': 'خريطة العوالم',
    'res.retryTrial': 'إعادة التحدي',
    'res.crowns': 'تيجان',
    'res.correct': 'صحيح',
    'res.wrong': 'خطأ',
    'res.bestStreak': 'أفضل سلسلة',
    'res.bossStatus': 'الزعيم',
    'res.defeated': 'مهزوم',
    'res.escaped': 'هارب',
    'res.accuracy': 'الدقة',
    'res.sigils': 'أختام',
    'res.perfectClear': 'تجاوز مثالي!',
    'res.bossDefeatedTag': 'الزعيم مهزوم',
    'res.bossEscapedTag': 'الزعيم هرب',
    'res.streakBonus': 'مكافأة السلسلة',
    'res.speed': 'سرعة',
    // Result (used by finishLvl)
    'result.perfectRun': 'أداء مثالي!',
    'result.perfectBossSub': 'لقد تجاوزت تحدي الزعيم بشكل مثالي!',
    'result.perfectSub': 'انتصار بلا عيب! عمل رائع.',
    'result.bossDefeated': 'تم هزيمة الزعيم!',
    'result.trialCleared': 'تم تجاوز التحدي!',
    'result.dailyComplete': 'التحدي اليومي مكتمل!',
    'result.bossSub': 'لقد تجاوزت التحدي الأقصى في هذا التصنيف!',
    'result.trialSub': 'لقد أتقنت هذا التحدي!',
    'result.soClose': 'قريب جدًا!',
    'result.oneAway': 'كنت على بُعد إجابة واحدة! حاول مجددًا.',
    'result.onTheEdge': 'أنت على الحافة. ركّز وحاول مجددًا!',
    'result.almostThere': 'كاد أن يتحقق!',
    'result.almostThereSub': 'راجع الإجابات وحاول مجددًا — ستتحسن!',
    'result.defeated': 'مهزوم',
    'result.escaped': 'هارب',
    'result.crowns': 'تيجان',
    'result.streakBonus': 'مكافأة السلسلة',
    'result.speed': 'سرعة',
    'result.sigils': 'أختام',
    'result.perfectClear': 'تجاوز مثالي!',
    'result.boss': 'الزعيم',
    'result.dailyCompleteBanner': 'التحدي اليومي مكتمل!',
    'result.trialComplete': 'التحدي {lvl} مكتمل!',
    'result.trialUnlocked': 'التحدي {lvl} مفتوح',
    'result.nextTrial': 'التحدي التالي',
    'result.chooseRealm': 'اختر عالمًا آخر',
    'result.backToRealms': 'العودة إلى العوالم',
    'result.retryStage': 'إعادة المرحلة',
    'result.reviewMistakes': 'مراجعة الأخطاء',
    'result.focusOn': 'ركّز على: {topics}',
    'result.almostPassing': 'كنت على بُعد {pct}% فقط من التجاوز. قريب!',
    'result.reviewExplanations': 'راجع الشروحات أدناه لفهم الأنماط.',
    'result.bossEscapedTip': 'هرب الزعيم — تدرب على موضوع الزعيم قبل إعادة المحاولة.',
    'result.encouragement50': 'كل خطأ هو درس. راجع وعُد أقوى!',
    'result.encouragementLow': 'خذ وقتك في مراجعة الأخطاء. الفهم يتفوق على السرعة!',
    'result.practiceTips': 'نصائح التدريب',
    // Review
    'review.title': 'دليل المراجعة',
    'review.results': 'النتائج',
    'review.all': 'الكل',
    'review.wrong': 'خطأ',
    'review.weakAreas': 'نقاط الضعف',
    'review.perfect': 'مثالي! لا شيء للمراجعة هنا.',
    'review.yourAnswer': 'إجابتك:',
    'review.correctAnswer': 'الصحيح:',
    'review.timeExpired': '(انتهى الوقت)',
    'review.trySimilar': 'جرّب سؤالًا مشابهًا',
    'review.showExplanation': 'عرض الشرح',
    // Weak Areas
    'weak.title': 'نقاط الضعف',
    'weak.realmMastery': 'إتقان العوالم',
    'weak.weakestTopics': 'أضعف المواضيع',
    'weak.weakAreas': 'نقاط الضعف',
    'weak.strongRealms': 'عوالم قوية',
    'weak.overallAccuracy': 'الدقة الإجمالية',
    'weak.learning': 'تعلّم',
    'weak.realmMap': 'خريطة العوالم',
    'weak.mastery.master': 'أستاذ',
    'weak.mastery.skilled': 'ماهر',
    'weak.mastery.adept': 'خبير',
    'weak.mastery.learning': 'متعلم',
    'weak.mastery.novice': 'مبتدئ',
    'weak.noData': 'العب بعض التحديات لترى نقاط ضعفك! بيانات أدائك ستظهر هنا.',
    'weak.allGood': 'لا نقاط ضعف ملحوظة. استمر!',
    'weak.correct': 'صحيح',
    'weak.accuracy': 'دقة',
    'weak.masteryPct': '{m}% إتقان',
    'weak.trialsSigils': '{done}/5 تحديات · {stars}/15 ختم',
    'weak.trials': 'تحديات',
    'weak.sigils': 'أختام',
    'weak.mastery': 'إتقان',
    'weak.noWeakAreas': 'لا نقاط ضعف ملحوظة. استمر!',
    'weak.recentTroubleSpots': 'نقاط المتاعب الأخيرة',
    'weak.recentMistakes': '{n} أخطاء حديثة',
    'weak.practice': 'تدريب',
    'weak.focusTag': 'التركيز: {tag}',
    // Achievements
    'achieve.relicsTrophies': 'الآثار والكؤوس',
    'achieve.collected': 'مجموع',
    'achieve.realmRelics': 'آثار العوالم',
    'achieve.trophies': 'الكؤوس',
    'achieve.all': 'الكل',
    'achieve.allRealms': 'جميع العوالم',
    'achieve.close': 'إغلاق',
    'achieve.shards': 'شظايا',
    'achieve.secretDesc': 'واصل الاستكشاف لتكتشف هذا السر.',
    'achieve.new': 'جديد',
    'achieve.filter.common': 'شائع',
    'achieve.filter.rare': 'نادر',
    'achieve.filter.epic': 'ملحمي',
    'achieve.filter.legendary': 'أسطوري',
    'achieve.filter.mythic': 'خرافي',
    // Achievement names & descriptions
    'achieve.first_step.name': 'الخطوة الأولى',
    'achieve.first_step.desc': 'أكمل أول تحدي',
    'achieve.curious_mind.name': 'عقل فضولي',
    'achieve.curious_mind.desc': 'استكشف 3 عوالم مختلفة',
    'achieve.scholar.name': 'طالب علم',
    'achieve.scholar.desc': 'اكسب 500 نقطة خبرة',
    'achieve.veteran.name': 'محارب قديم',
    'achieve.veteran.desc': 'اجتز 10 تحديات',
    'achieve.encyclopedia.name': 'موسوعة',
    'achieve.encyclopedia.desc': 'أجب على 100 سؤال',
    'achieve.streak_5.name': 'مشتعل',
    'achieve.streak_5.desc': 'حقق سلسلة 5 إجابات',
    'achieve.speed_demon.name': 'شيطان السرعة',
    'achieve.speed_demon.desc': 'أجب في أقل من 3 ثوانٍ',
    'achieve.level5.name': 'القمة',
    'achieve.level5.desc': 'أكمل أي تحدي زعيم (المرحلة 5)',
    'achieve.polymath.name': 'موسوعي',
    'achieve.polymath.desc': 'استكشف جميع العوالم السبعة',
    'achieve.survivor.name': 'ناجٍ',
    'achieve.survivor.desc': 'أجب على سؤال المرحلة 4+ بشكل صحيح',
    'achieve.pure_skill.name': 'مهارة خالصة',
    'achieve.pure_skill.desc': 'اجتز تحديًا دون استخدام أدوات',
    'achieve.perfect.name': 'كمالي',
    'achieve.perfect.desc': 'احصل على 3 أختام في أي تحدي',
    'achieve.streak_10.name': 'لا يُوقف',
    'achieve.streak_10.desc': 'حقق سلسلة 10 إجابات',
    'achieve.mastery.name': 'سيد العالم',
    'achieve.mastery.desc': 'أكمل جميع التحديات الخمسة في عالم واحد',
    'achieve.mastermind.name': 'عبقري',
    'achieve.mastermind.desc': 'اكسب 2000 نقطة خبرة',
    'achieve.daily_habit.name': 'إخلاص يومي',
    'achieve.daily_habit.desc': 'حقق سلسلة يومية لمدة 3 أيام',
    'achieve.all_realms.name': 'الماجستير الأعظم',
    'achieve.all_realms.desc': 'أكمل جميع التحديات الـ 35',
    'achieve.perfect_realm.name': 'عالم بلا عيب',
    'achieve.perfect_realm.desc': 'احصل على 3 أختام في جميع تحديات عالم واحد',
    'achieve.comeback.name': 'العودة القوية',
    'achieve.comeback.desc': 'عُد بعد يومين أو أكثر واجتز تحديًا',
    'achieve.secret_perfect.name': 'عبقري مخفي',
    'achieve.secret_perfect.hiddenDesc': 'حقق أداءً مثاليًا (100%) في تحدي زعيم.',
    // Relic names & descriptions
    'relic.science_1.name': 'نواة الذرة',
    'relic.science_1.desc': 'تسخّر اللبنات الأساسية للمادة.',
    'relic.science_2.name': 'عدسة الكم',
    'relic.science_2.desc': 'ترى ما وراء الطيف المرئي إلى عوالم الكم.',
    'relic.science_3.name': 'بوصلة النجوم',
    'relic.science_3.desc': 'تتنقل بضوء النجوم عبر المعرفة اللانهائية.',
    'relic.history_1.name': 'الختم القديم',
    'relic.history_1.desc': 'ختم لم يُكسر من سلالة منسية.',
    'relic.history_2.name': 'تاج الإمبراطورية',
    'relic.history_2.desc': 'رمز السيادة عبر العصور.',
    'relic.history_3.name': 'لفيفة الزمن',
    'relic.history_3.desc': 'تنكشف لتكشف الخط الزمني الكامل للحضارة.',
    'relic.geography_1.name': 'بوصلة العالم',
    'relic.geography_1.desc': 'تشير نحو آفاق لم تُكتشف.',
    'relic.geography_2.name': 'لؤلؤة المحيط',
    'relic.geography_2.desc': 'من أعماق الهاوية السحيقة.',
    'relic.geography_3.name': 'قمة الجبل',
    'relic.geography_3.desc': 'صُنعت في قمة العالم.',
    'relic.math_1.name': 'النسبة الذهبية',
    'relic.math_1.desc': 'التناسب المثالي الموجود في كل مكان في الطبيعة.',
    'relic.math_2.name': 'حجر اللانهاية',
    'relic.math_2.desc': 'يحتوي طاقة حوسبية لا حدود لها.',
    'relic.math_3.name': 'مكعب المنطق',
    'relic.math_3.desc': 'كل وجه يكشف بُعدًا جديدًا من التفكير.',
    'relic.language_1.name': 'ريشة الكلمات',
    'relic.language_1.desc': 'تكتب بكل لغة في آنٍ واحد.',
    'relic.language_2.name': 'مفتاح النحو',
    'relic.language_2.desc': 'يفتح البنية الخفية للتواصل.',
    'relic.language_3.name': 'قناع متعدد اللغات',
    'relic.language_3.desc': 'يمنح الطلاقة في جميع اللغات الماضية والحاضرة.',
    'relic.nature_1.name': 'ختم الورقة',
    'relic.nature_1.desc': 'ينبض بإيقاع الغابة.',
    'relic.nature_2.name': 'قلب المرجان',
    'relic.nature_2.desc': 'ينبض مع تيارات المحيط العميق.',
    'relic.nature_3.name': 'تاج البرية',
    'relic.nature_3.desc': 'منسوج من أقدم جذور البستان العتيق.',
    'relic.culture_1.name': 'قناع المهرجان',
    'relic.culture_1.desc': 'يحتفي بالروح الإبداعية للإنسانية.',
    'relic.culture_2.name': 'شعلة الفن',
    'relic.culture_2.desc': 'تحترق بشغف ألف حرفي.',
    'relic.culture_3.name': 'كرة التراث',
    'relic.culture_3.desc': 'تجسد جميع تقاليد العالم.',
    // Shop
    'shop.title': 'الترسانة',
    'shop.avatars': 'الصور الرمزية',
    'shop.frames': 'الإطارات',
    'shop.titles': 'الألقاب',
    'shop.themes': 'السمات',
    'shop.equipped': 'مُجهّز',
    'shop.equip': 'تجهيز',
    // Shop item names
    'shop.avatar_A.name': 'الباحث الافتراضي',
    'shop.avatar_B.name': 'حكيم الآلات',
    'shop.avatar_C.name': 'عالم التنين',
    'shop.avatar_D.name': 'خبير الأشباح',
    'shop.frame_none.name': 'بدون إطار',
    'shop.frame_bronze.name': 'خاتم برونزي',
    'shop.frame_silver.name': 'خاتم فضي',
    'shop.frame_gold.name': 'خاتم ذهبي',
    'shop.frame_prism.name': 'إطار موشوري',
    'shop.title_novice.name': 'مبتدئ',
    'shop.title_scholar.name': 'طالب علم',
    'shop.title_sage.name': 'حكيم',
    'shop.title_polymath.name': 'موسوعي',
    'shop.title_luminary.name': 'منير',
    'shop.title_legend.name': 'أسطورة',
    'shop.theme_default.name': 'الداكن الافتراضي',
    'shop.theme_ember.name': 'توهج الجمر',
    'shop.theme_ocean.name': 'أعماق المحيط',
    'shop.theme_cosmic.name': 'الفراغ الكوني',
    // Profile
    'profile.seekerRank': 'رتبة الباحث {lvl} — {rank}',
    'profile.hallOfFame': 'قاعة الشرف',
    'profile.hallOfFameEmpty': 'اجمع الآثار لملء قاعة الشرف',
    'profile.editName': 'تعديل الاسم',
    'profile.exportSave': 'تصدير الحفظ',
    'profile.importSave': 'استيراد الحفظ',
    'profile.resetProgress': 'إعادة التعيين',
    'profile.totalXP': 'مجموع الخبرة',
    'profile.crowns': 'تيجان',
    'profile.trials': 'التحديات',
    'profile.sigils': 'الأختام',
    'profile.relicScore': 'نقاط الآثار',
    'profile.bestStreak': 'أفضل سلسلة',
    'profile.trophies': 'الكؤوس',
    'profile.realmRelics': 'آثار العوالم',
    'profile.realmsMastered': 'عوالم متقنة',
    'profile.perfectRuns': 'أداء مثالي',
    'profile.dailyStreak': 'سلسلة يومية',
    'profile.questions': 'الأسئلة',
    'profile.weakAreas': 'نقاط الضعف',
    'profile.avgSpeed': 'متوسط السرعة',
    'profile.collectRelics': 'اجمع الآثار لملء قاعة الشرف',
    // Settings
    'settings.title': 'الإعدادات',
    'settings.sound': 'الصوت',
    'settings.haptics': 'الاهتزاز',
    'settings.reducedMotion': 'تقليل الحركة',
    'settings.language': 'اللغة',
    'settings.exportSave': 'تصدير الحفظ',
    'settings.importSave': 'استيراد الحفظ',
    'settings.resetProgress': 'إعادة التعيين',
    // Modals
    'modal.editName': 'تعديل الاسم',
    'modal.newName': 'اسم جديد...',
    'modal.cancel': 'إلغاء',
    'modal.save': 'حفظ',
    // Confirm
    'confirm.retreatTitle': 'انسحاب من التحدي؟',
    'confirm.retreatMsg': 'سيتم فقدان التقدم في هذا التحدي.',
    'confirm.resetTitle': 'إعادة التعيين؟',
    'confirm.resetMsg': 'سيتم مسح جميع البيانات نهائيًا.',
    'confirm.areYouSure': 'هل أنت متأكد؟',
    'confirm.cannotUndo': 'لا يمكن التراجع عن هذا الإجراء.',
    'confirm.confirm': 'تأكيد',
    // Toasts
    'toast.notEnoughCrowns': 'تيجان غير كافية!',
    'toast.dailyDone': 'التحدي اليومي مكتمل بالفعل!',
    'toast.noHardQuestions': 'لا توجد أسئلة صعبة كافية.',
    'toast.noChallenges': 'لا توجد تحديات متاحة لهذه المرحلة.',
    'toast.noPracticeQuestions': 'لا توجد أسئلة تدريب كافية.',
    'toast.noSimilar': 'لا توجد أسئلة مشابهة متاحة بعد.',
    'toast.missionComplete': 'المهمة مكتملة! +{xp} خبرة، +{coins} تيجان',
    'toast.weeklyComplete': 'الهدف الأسبوعي مكتمل! +{xp} خبرة، +{coins} تيجان',
    'toast.copied': 'تم النسخ!',
    'toast.copyFailed': 'تعذر النسخ',
    'toast.shareNotSupported': 'المشاركة غير مدعومة',
    'toast.progressReset': 'تم إعادة التعيين.',
    'toast.noSaveData': 'لا توجد بيانات محفوظة',
    'toast.saveExported': 'تم تصدير الحفظ',
    'toast.exportFailed': 'فشل التصدير',
    'toast.invalidSaveFile': 'ملف حفظ غير صالح',
    'toast.saveImported': 'تم استيراد الحفظ — جارٍ إعادة التحميل...',
    'toast.backOnline': 'تم الاتصال بالإنترنت',
    'toast.fiftyFifty': 'تم إزالة إجابتين خاطئتين!',
    'toast.freezeTime': '+10 ثوانٍ مجمدة!',
    'toast.practiceImproved': 'تحسّن {tag} بنسبة {pct}%! استمر!',
    'toast.questionsLoading': 'جارٍ تحميل الأسئلة...',
    'toast.questionsFailed': 'فشل تحميل الأسئلة. تحقق من الاتصال وأعد التحميل.',
    // Missions
    'missions.title': 'مهام اليوم',
    'missions.claim': 'استلام',
    'missions.claimed': 'مُستلم',
    'missions.xp': 'خبرة',
    'missions.crowns': 'تيجان',
    // Mission templates
    'mission.answer_20.desc': 'أجب على {n} سؤال',
    'mission.stages_2.desc': 'أكمل {n} مراحل',
    'mission.correct_15.desc': 'أجب بشكل صحيح على {n} أسئلة',
    'mission.stages_3.desc': 'أكمل {n} مراحل',
    'mission.science_1.desc': 'أكمل مرحلة علوم',
    'mission.streak_5.desc': 'حقق سلسلة {n} إجابات',
    'mission.no_ll_1.desc': 'أكمل مرحلة بدون أدوات',
    'mission.daily_done.desc': 'أكمل التحدي اليومي',
    'mission.streak_8.desc': 'حقق سلسلة {n} إجابات',
    'mission.wrong_review.desc': 'راجع {n} إجابات خاطئة',
    'mission.stages_5.desc': 'أكمل {n} مراحل اليوم',
    // Weekly
    'weekly.title': 'الهدف الأسبوعي',
    'weekly.status': '{done} / {target} مراحل هذا الأسبوع',
    'weekly.claimReward': 'استلام المكافأة',
    'weekly.claimed': 'تم الاستلام هذا الأسبوع',
    // Comeback
    'comeback.welcomeBack': 'مرحبًا بعودتك{name}!',
    'comeback.greatToSee.1': 'سرّنا رؤيتك مجددًا بعد يوم {days}.',
    'comeback.greatToSee.many': 'سرّنا رؤيتك مجددًا بعد {days} يوم.',
    'comeback.continueWith': 'تابع مع {realm}',
    'comeback.explore': 'استكشف العوالم',
    // Daily chest
    'chest.dailyChest': 'الصندوق اليومي!',
    'chest.dayStreak': 'سلسلة {n} يوم',
    // Update
    'update.newVersion': 'يتوفر إصدار جديد',
    'update.update': 'تحديث',
    // Failure tips
    'tips.title': 'نصائح التدريب',
    'tips.focusOn': 'ركّز على: {tags}',
    'tips.almostThere': 'كنت على بُعد {n}% فقط من التجاوز. قريب!',
    'tips.reviewExpl': 'راجع الشروحات أدناه لفهم الأنماط.',
    'tips.bossEscaped': 'هرب الزعيم — تدرب على موضوع الزعيم قبل إعادة المحاولة.',
    'tips.everyMistake': 'كل خطأ هو درس. راجع وعُد أقوى!',
    'tips.takeTime': 'خذ وقتك في مراجعة الأخطاء. الفهم يتفوق على السرعة!',
    // Adaptive recs
    'rec.recommendedNext': 'التالي الموصى به',
    'rec.nextDesc': '{realm} · تجربة {trial}',
    'rec.practiceWeak': 'تدريب نقاط الضعف',
    'rec.readyForBoss': 'مستعد للزعيم',
    'rec.readyForBossDesc': 'معركة الزعيم بانتظارك!',
    'rec.reviewMistakes': 'مراجعة الأخطاء',
    'rec.improveScore': 'حسّن نتيجتك',
    'rec.start': 'ابدأ',
    'rec.reasonLowAcc': 'دقة منخفضة في',
    'rec.reasonRepeated': 'أخطاء متكررة في',
    // Misc
    'misc.stage': 'مرحلة',
    'misc.or': 'أو',
    // Aria labels
    'aria.mainNav': 'التنقل الرئيسي',
    'aria.newItems': 'عناصر جديدة',
    'aria.retreatTrial': 'انسحاب من التحدي',
    'aria.answerOptions': 'خيارات الإجابة',
    'aria.nextQuestion': 'السؤال التالي',
    'aria.primaryAction': 'الإجراء الرئيسي',
    'aria.retryTrial': 'إعادة المحاولة',
    'aria.studyAnswers': 'دراسة الإجابات',
    'aria.shareResults': 'مشاركة النتائج',
    'aria.returnRealmMap': 'العودة إلى خريطة العوالم',
    'aria.closeSettings': 'إغلاق الإعدادات',
    'aria.settings': 'الإعدادات',
    // Missing UI keys
    'hub.sigils': 'أختام',
    'misc.trial': 'تحدي',
    'phase.battle': 'معركة',
    'profile.accuracy': 'الدقة',
    'quiz.practiceQuestion': 'تدريب نقاط الضعف',
    'rec.practiceWeakArea': 'تدريب نقاط الضعف',
    'review.correct': 'الصحيح',
    'update.updateBtn': 'تحديث',
    'weak.practiceTitle': 'تدريب نقاط الضعف',
    'comeback.exploreRealms': 'استكشف العوالم',
    'misc.xp': 'خبرة',
    'misc.crowns': 'تيجان',
    'misc.loading': 'جارٍ التحميل...',
    'misc.couldNotLoad': 'تعذر تحميل الأسئلة.<br>يرجى تحديث الصفحة.',
    'misc.10hardQuestions': '10 أسئلة صعبة',
    'misc.offline': 'غير متصل',
    'misc.back': 'رجوع',
    'misc.close': 'إغلاق',
    'misc.claim': 'استلام',
    'misc.share': 'مشاركة',
    'coll.title': 'المجموعة',
    'coll.relics': 'الآثار',
    'coll.trophies': 'الكؤوس',
    'coll.allRealms': 'جميع العوالم',
    // Tiers
    'tier.bronze': 'برونزي',
    'tier.silver': 'فضي',
    'tier.gold': 'ذهبي',
    'tier.legendary': 'أسطوري',
    'tier.platinum': 'بلاتيني',
    'tier.secret': 'سري',
    // Rarity
    'rarity.common': 'شائع',
    'rarity.rare': 'نادر',
    'rarity.epic': 'ملحمي',
    'rarity.legendary': 'أسطوري',
    'rarity.mythic': 'خرافي',
    // Shard
    'achieve.shard': 'شظية',
    'achieve.relicAssembled': 'مُجمّع',
    'achieve.shards': 'شظايا',
    // Mission templates
    'mission.answer_20.desc': 'أجب على {n} سؤال',
    'mission.stages_2.desc': 'أكمل {n} مراحل',
    'mission.correct_15.desc': 'أجب بشكل صحيح على {n} أسئلة',
    'mission.stages_3.desc': 'أكمل {n} مراحل',
    'mission.science_1.desc': 'أكمل مرحلة علوم',
    'mission.streak_5.desc': 'حقق سلسلة {n} إجابات',
    'mission.no_ll_1.desc': 'أكمل مرحلة بدون أدوات',
    'mission.daily_done.desc': 'أكمل التحدي اليومي',
    'mission.streak_8.desc': 'حقق سلسلة {n} إجابات',
    'mission.wrong_review.desc': 'راجع {n} إجابات خاطئة',
    'mission.stages_5.desc': 'أكمل {n} مراحل اليوم',
    // Battle counter
    'quiz.battleOf': '{phase} · معركة {cur} من {total}'
  }
};

function t(key, params) {
  let dict = I18N[_lang] || I18N.en;
  let str = dict[key];
  if (str === undefined) str = I18N.en[key];
  if (str === undefined) return key;
  if (params) Object.keys(params).forEach(k => { str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]); });
  return str;
}

function setLang(lang) {
  if (lang !== 'en' && lang !== 'ar') return;
  _lang = lang;
  localStorage.setItem('cerebrum_lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = lang === 'ar' ? 'سيريبروم كويست — مغامرة المعرفة' : 'Cerebrum Quest — Knowledge Adventure';
  updateStaticText();
  refreshCurrentScreen();
}

function getQText(q, field) {
  if (_lang !== 'en' && q.locale && q.locale[_lang] && q.locale[_lang][field] != null) return q.locale[_lang][field];
  return q[field];
}

function catName(cat) { return t('cat.' + cat + '.name'); }
function catDesc(cat) { return t('cat.' + cat + '.desc'); }
function lvlName(i) { return t('lvl.' + i); }
function rankName(i) { return t('rank.' + i); }
function achieveName(id) { return t('achieve.' + id + '.name'); }
function achieveDesc(id) { return t('achieve.' + id + '.desc'); }
function relicName(id) { return t('relic.' + id + '.name'); }
function relicDesc(id) { return t('relic.' + id + '.desc'); }
function shopName(id) { return t('shop.' + id + '.name'); }

function getLevelMeta(cat, lvlIdx) {
  let meta = (LEVELS_METADATA[cat] && LEVELS_METADATA[cat][lvlIdx]) || {};
  if (_lang !== 'en' && meta.i18n && meta.i18n[_lang]) return Object.assign({}, meta, meta.i18n[_lang]);
  return meta;
}

function updateStaticText() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-ph')); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
  _refreshHardcodedElements();
}

function _refreshHardcodedElements() {
  // Nav tabs
  _setText('[data-tab="hub"] .tab-label', 'nav.realms');
  _setText('[data-tab="achievements"] .tab-label', 'nav.relics');
  _setText('[data-tab="shop"] .tab-label', 'shop.title');
  _setText('[data-tab="profile"] .tab-label', 'nav.skills');

  // Welcome screen
  let sw = document.getElementById('sWelcome');
  if (sw && sw.classList.contains('active')) {
    let wt = sw.querySelector('.welcome-title'); if (wt) wt.textContent = t('welcome.title');
    let ws = sw.querySelector('.welcome-subtitle'); if (ws) ws.textContent = t('welcome.subtitle');
    let wg = sw.querySelector('.welcome-tagline'); if (wg) wg.textContent = t('welcome.tagline');
    let wi = document.getElementById('playerNameInput'); if (wi) wi.placeholder = t('welcome.namePlaceholder');
    let wb = document.getElementById('startBtn'); if (wb) wb.textContent = t('welcome.btnStart');
    let labels = sw.querySelectorAll('.stat-label');
    if (labels[0]) labels[0].textContent = t('welcome.statRealms');
    if (labels[1]) labels[1].textContent = t('welcome.statTrials');
    if (labels[2]) labels[2].textContent = t('welcome.statCollectibles');
  }

  // Hub stat labels (these are rebuilt by updateHub but set labels here too)
  _setText('.hub-stat-lbl:nth-of-type(1)', 'hub.trials');  // handled by data-i18n
  _setText('#hubXpLabel', 'hub.xp');
  _setText('#hubAccLabel', 'hub.accuracy');

  // Quiz labels
  let qb = document.getElementById('quizBackBtn'); if (qb) qb.innerHTML = '<i class="fas fa-times"></i> ' + t('quiz.retreat');
  let nq = document.getElementById('nextQBtn'); if (nq) nq.innerHTML = t('quiz.next') + ' <i class="fas fa-arrow-right"></i>';

  // Lifeline buttons
  let lf = document.getElementById('llFifty');
  if (lf) lf.innerHTML = '<i class="fas fa-percent"></i> ' + t('quiz.fiftyFifty') + ' <span style="font-size:10px;opacity:0.7">' + t('quiz.free') + '</span>';
  let lt = document.getElementById('llTime');
  if (lt) lt.innerHTML = '<i class="fas fa-snowflake"></i> ' + t('quiz.freeze') + ' <span style="font-size:10px;opacity:0.7">' + t('quiz.free') + '</span>';
  let lh = document.getElementById('llHint');
  if (lh) lh.innerHTML = '<i class="fas fa-lightbulb"></i> ' + t('quiz.hint');

  // Results static labels
  _setText('#resXPLabel', 'misc.xp');
  _setText('#resCoinsLabel', 'result.crowns');
  _setText('#resCorrectLabel', 'quiz.correct');
  _setText('#resWrongLabel', 'quiz.wrong');
  _setText('#scoreRingLabel', 'profile.accuracy');

  // Results buttons
  let rb = document.getElementById('retryBtn'); if (rb) rb.innerHTML = '<i class="fas fa-rotate-right"></i> ' + t('result.retryStage');
  let rv = document.getElementById('reviewBtn'); if (rv) rv.innerHTML = '<i class="fas fa-eye"></i> ' + t('result.reviewMistakes');
  let rs = document.getElementById('shareBtn'); if (rs) rs.innerHTML = '<i class="fas fa-share-nodes"></i> ' + t('misc.share');
  let rh = document.getElementById('backHubBtn'); if (rh) rh.innerHTML = '<i class="fas fa-compass"></i> ' + t('result.chooseRealm');

  // Review screen
  _setText('.review-header h2', 'review.title');
  let rba = document.getElementById('reviewBackBtn'); if (rba) rba.innerHTML = '<i class="fas fa-arrow-left"></i> ' + t('misc.back');
  _setText('#reviewTabAll', 'review.all');
  let rtw = document.getElementById('reviewTabWrong'); if (rtw) rtw.innerHTML = '<i class="fas fa-times-circle"></i> ' + t('review.wrong');
  let rte = document.getElementById('reviewTabWeak'); if (rte) rte.innerHTML = '<i class="fas fa-crosshairs"></i> ' + t('weak.weakAreas');

  // Collection screen
  _setText('.achievements-header h2', 'coll.title');
  _setText('#achieveCount', null); // dynamic count

  // Collection filter tabs
  let crt = document.querySelectorAll('[data-coll]');
  crt.forEach(b => {
    let key = b.getAttribute('data-coll');
    if (key === 'relics') b.innerHTML = '<i class="fas fa-gem"></i> ' + t('coll.relics');
    else if (key === 'trophies') b.innerHTML = '<i class="fas fa-trophy"></i> ' + t('coll.trophies');
  });

  // Rarity filters
  document.querySelectorAll('.coll-filter').forEach(b => {
    let f = b.getAttribute('data-filter');
    if (f === 'all') b.textContent = t('review.all');
    else if (f === 'Common') b.textContent = t('rarity.common');
    else if (f === 'Rare') b.textContent = t('rarity.rare');
    else if (f === 'Epic') b.textContent = t('rarity.epic');
    else if (f === 'Legendary') b.textContent = t('rarity.legendary');
  });

  // Shop tabs
  document.querySelectorAll('[data-shopcat]').forEach(b => {
    let c = b.getAttribute('data-shopcat');
    if (c === 'avatar') b.innerHTML = '<i class="fas fa-user"></i> ' + t('shop.avatars');
    else if (c === 'frame') b.innerHTML = '<i class="fas fa-ring"></i> ' + t('shop.frames');
    else if (c === 'title') b.innerHTML = '<i class="fas fa-scroll"></i> ' + t('shop.titles');
    else if (c === 'theme') b.innerHTML = '<i class="fas fa-palette"></i> ' + t('shop.themes');
  });

  // Profile buttons
  let pe = document.getElementById('profileEditBtn'); if (pe) pe.innerHTML = '<i class="fas fa-pen"></i> ' + t('profile.editName');
  let px = document.getElementById('exportSaveBtn'); if (px) px.innerHTML = '<i class="fas fa-download"></i> ' + t('profile.exportSave');
  let pi = document.getElementById('importSaveBtn'); if (pi) pi.innerHTML = '<i class="fas fa-upload"></i> ' + t('profile.importSave');
  let pr = document.getElementById('profileResetBtn'); if (pr) pr.innerHTML = '<i class="fas fa-rotate-left"></i> ' + t('profile.resetProgress');

  // Settings modal
  _setText('#settingsTitle', 'settings.title');
  let sl = document.querySelectorAll('.settings-label');
  if (sl[0]) sl[0].innerHTML = '<i class="fas fa-volume-high"></i> ' + t('settings.sound');
  if (sl[1]) sl[1].innerHTML = '<i class="fas fa-mobile-screen"></i> ' + t('settings.haptics');
  if (sl[2]) sl[2].innerHTML = '<i class="fas fa-eye-slash"></i> ' + t('settings.reducedMotion');
  if (sl[3]) sl[3].innerHTML = '<i class="fas fa-globe"></i> ' + t('settings.language');
  let se = document.getElementById('settingsExportBtn'); if (se) se.innerHTML = '<i class="fas fa-download"></i> ' + t('settings.exportSave');
  let si = document.getElementById('settingsImportBtn'); if (si) si.innerHTML = '<i class="fas fa-upload"></i> ' + t('settings.importSave');
  let sr = document.getElementById('settingsResetBtn'); if (sr) sr.innerHTML = '<i class="fas fa-rotate-left"></i> ' + t('settings.resetProgress');
  let sc = document.getElementById('settingsCloseBtn'); if (sc) sc.innerHTML = '<i class="fas fa-times"></i>';

  // Confirm modal
  _setText('#confirmTitle', 'confirm.areYouSure');
  _setText('#confirmMsg', 'confirm.cannotUndo');
  _setText('#confirmCancelBtn', 'modal.cancel');
  _setText('#confirmOkBtn', 'confirm.confirm');

  // Name modal
  let nmh = document.querySelector('#nameModal h3'); if (nmh) nmh.textContent = t('modal.editName');
  let nmi = document.getElementById('editNameInput'); if (nmi) nmi.placeholder = t('modal.newName');
  _setText('#nameCancelBtn', 'modal.cancel');
  _setText('#nameSaveBtn', 'modal.save');

  // Weak Areas header
  _setText('.weak-header h2', 'weak.title');
  let wba = document.querySelector('.weak-header .btn-ghost'); if (wba) wba.innerHTML = '<i class="fas fa-arrow-left"></i> ' + t('misc.back');

  // Chest overlay
  _setText('.chest-title', 'chest.dailyChest');
  _setText('.chest-close-btn', 'misc.claim');

  // Relic modal close
  let rmc = document.querySelector('#relicModal .btn-ghost'); if (rmc) rmc.textContent = t('misc.close');

  // Level select back button
  let lsba = document.querySelector('#sLevelSelect .btn-ghost'); if (lsba) lsba.innerHTML = '<i class="fas fa-arrow-left"></i> ' + t('misc.back');

  // Daily card
  let dc = document.querySelector('.daily-card h3');
  if (dc) dc.innerHTML = '<i class="fas fa-calendar-day"></i> ' + t('hub.dailyTrial');
  let dp = document.querySelector('.daily-card p');
  if (dp) dp.textContent = t('hub.dailyDesc');

  // Collection realm filter dropdown
  let crf = document.getElementById('collRealmFilter');
  if (crf) {
    crf.options[0].text = t('coll.allRealms');
    crf.options[1].text = catName('science');
    crf.options[2].text = catName('history');
    crf.options[3].text = catName('geography');
    crf.options[4].text = catName('math');
    crf.options[5].text = catName('language');
    crf.options[6].text = catName('nature');
    crf.options[7].text = catName('culture');
  }
}

function _setText(selector, key) {
  if (!key) return;
  let el = document.querySelector(selector);
  if (el) el.textContent = t(key);
}

function refreshCurrentScreen() {
  let active = document.querySelector('.screen.active');
  if (!active) return;
  let id = active.id;
  if (id === 'sHub') updateHub();
  else if (id === 'sShop') renderShop();
  else if (id === 'sAchievements') renderCollection();
  else if (id === 'sProfile') renderProfile();
  else if (id === 'sWeakAreas') renderWeakAreas();
  else if (id === 'sLevelSelect' && S.curCat) openLevelSelect(S.curCat);
  else if (id === 'sOnboarding') updateOnboardingText();
}

function updateOnboardingText() {
  let steps = document.querySelectorAll('.onboarding-step');
  if (steps[0]) { steps[0].querySelector('h2').textContent = t('onboard.step0Title'); steps[0].querySelector('p').textContent = t('onboard.step0Desc'); }
  if (steps[1]) { steps[1].querySelector('h2').textContent = t('onboard.step1Title'); steps[1].querySelector('p').textContent = t('onboard.step1Desc'); }
  if (steps[2]) { steps[2].querySelector('h2').textContent = t('onboard.step2Title'); steps[2].querySelector('p').textContent = t('onboard.step2Desc'); }
  if (steps[3]) { steps[3].querySelector('h2').textContent = t('onboard.step3Title'); steps[3].querySelector('p').textContent = t('onboard.step3Desc'); }
  let nextBtn = document.getElementById('onboardingNext');
  if (nextBtn) nextBtn.innerHTML = t('onboard.next') + ' <i class="fas fa-arrow-right"></i>';
  let skipBtn = document.getElementById('onboardingSkip');
  if (skipBtn) skipBtn.textContent = t('onboard.skip');
}
// ==================== END I18N ====================

function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
