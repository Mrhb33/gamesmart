# 🧠 Cerebrum Quest

> **Explore the Realms of Knowledge. Become a Legend.**

Cerebrum Quest is a premium, high-fidelity educational quiz game built for the modern web. Journey through seven distinct realms of human understanding, conquer 35 trials, collect ancient relics, and ascend from a Novice Seeker to a Knowledge Legend.

![Cerebrum Quest Preview](https://via.placeholder.com/1200x600?text=Cerebrum+Quest+Premium+UI)

---

## ✨ Features

- **🏛️ 7 Realms of Knowledge**: Explore History, Science, Art, Technology, and more.
- **⚔️ 35 Challenging Trials**: Five stages per realm with increasing difficulty.
- **👹 Boss Trials**: Face the ultimate challenge at the end of every realm.
- **🏆 Relic Collection**: Earn 20+ collectible relics (achievements) across multiple tiers.
- **🛡️ The Armory**: Spend your earned Crowns on custom avatars and profile cosmetics.
- **📈 Seeker Progression**: Level up your rank from Novice to Legend through XP.
- **📅 Daily Trials**: Test your limits with a unique challenge every single day.
- **🌍 Multi-language**: Full support for English and Arabic (RTL).
- **♿ Accessibility**: Optimized for screen readers, keyboard navigation, and reduced motion.
- **📱 Mobile-First PWA**: Fully responsive, offline-capable, and installable on any device.

## 🚀 Tech Stack

- **Core**: Vanilla HTML5, CSS3 (Modern Flex/Grid), and ES6+ JavaScript.
- **Styling**: Premium Glassmorphism design system with dynamic animations.
- **Architecture**: Lightweight Single Page Application (SPA).
- **Data**: Static JSON-based content delivery for speed and offline play.
- **Platform**: Progressive Web App (PWA) with Service Worker support.

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Mrhb33/gamesmart.git
   cd gamesmart
   ```
2. Install dependencies (if any):
   ```bash
   npm install
   ```

### Running the Game
Simply open `main.html` in your favorite modern browser, or use a local development server:
```bash
npx serve .
```

## 📜 Development Scripts

Cerebrum Quest comes with a suite of tools for content management and validation:

| Script | Description |
| :--- | :--- |
| `npm run validate` | Runs a basic integrity check on the questions database. |
| `npm run validate:audit` | Performs a deep audit of all game data and metadata. |
| `npm run enrich` | Automatically formats and enhances question metadata. |
| `npm run build` | Injects features and optimizes the game for production. |
| `npm run test` | Executes the core logic test suite. |
| `npm run fix:shuffle` | Re-shuffles answers and refreshes the data enrichment. |

## 📂 Project Structure

```text
├── src/                # Core JavaScript modules
│   ├── game.js         # Main game loop and logic
│   ├── screens.js      # SPA screen transitions and views
│   ├── state.js        # Global state and localStorage persistence
│   ├── data.js         # Content loading and trial processing
│   ├── ui.js           # UI utility functions and components
│   ├── i18n.js         # Internationalization and localization
│   ├── audio.js        # Sound system and ambiance
│   └── settings.js     # User preferences
├── styles.css          # Main stylesheet (Premium UI Design)
├── main.html           # Game entry point
├── questions.json      # Question database (350+ entries)
├── levels_metadata.json # Realm and Trial configurations
├── sw.js               # Service Worker for offline support
├── manifest.json       # PWA manifest
└── scripts/            # Build and validation tools (in root)
```

## 🎮 Game Design

For a deep dive into the mechanics, terminology, and progression systems, see the [GAME_DESIGN.md](GAME_DESIGN.md).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by the Cerebrum Quest Team.
