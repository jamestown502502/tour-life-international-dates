# Tour Life: International Dates — STATE.md
> CRITICAL: If a session crashes or tokens run out, READ THIS FILE FIRST and resume from "NEXT STEP".

---

## PROJECT STATUS
**Current Phase:** Phase 5 — QA ✅ COMPLETE
**Last Updated:** Session 1 — Full Build
**Build Target:** Browser-based Phaser.js + Vite web game

---

## COMPLETED PHASES

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | PRD + Planning | ✅ Done |
| 2 | Asset Pipeline (sprites) | ✅ Done |
| 3 | Audio Pipeline + Beatmaps | ✅ Done |
| 4 | Core Game Code (Phaser.js + Vite) | ✅ Done |
| 5 | QA Report | ✅ Done |

---

## WHAT WAS BUILT

### Documentation
- `PRD.md` — Full product requirements document
- `OVERVIEW.md` — (embedded in PRD and STATE)
- `assets/audio/AUDIO_MANIFEST.md` — Audio sourcing guide with Suno prompts

### Assets (Programmatic Pixel Art)
- `assets/images/characters/` — 4 character sprite sheets (player, Ryder, Nova, Jet) @ 96×96, 9 frames each
- `assets/images/environments/` — 3 environment tile sheets (divebar, tourbus, stadium) @ 96×96, 9 tiles each
- `assets/images/ui/` — UI elements sheet (notes, bars, icons) @ 96×96, 9 frames

### Beatmaps (JSON)
- 5 city beatmaps: Seattle (306 notes), NY (318), London (361), Tokyo (610), LA (606)
- Genre-accurate note density and lane bias per city

### Game Code (2,828 lines across 14 files)

**Scenes (9):**
| Scene | Description |
|-------|-------------|
| `Preloader.js` | Asset loading + animation registration |
| `MainMenu.js` | Animated title screen, New/Continue/Settings |
| `CharacterCreate.js` | Name, instrument, trait, skin tone customization |
| `CityHub.js` | Top-down 2D exploration, NPC dialogue, venue/bus entry |
| `TourBus.js` | Interior bus, pre/post-gig bandmate dialogue trees |
| `Concert.js` | 4-lane falling-note rhythm minigame with beatmap sync |
| `RoadTrip.js` | Randomized event card system (25+ events) |
| `Results.js` | Post-concert stats, grade, bandmate reactions |
| `GameOver.js` | 6 distinct endings (win, sellout, indie, compromise, broke, no_fame) |

**Systems (3):**
| System | Description |
|--------|-------------|
| `SaveSystem.js` | localStorage persist/load with merge/versioning |
| `RelationshipTracker.js` | Ryder/Nova/Jet stat management + power-up logic |
| `DialogueSystem.js` | Typewriter dialogue renderer, branching choices, trait gates |

**Data (3):**
| File | Description |
|------|-------------|
| `characters.js` | BANDMATES config, PLAYER_TRAITS |
| `cities.js` | All 5 city configs, NPCs, side quests, getCityById/getNextCity |
| `events.js` | 17 road trip events across 5 categories + drawRoadTripEvents() |

---

## NEXT STEPS FOR JAMESON

### Step 1 — Install and run
```bash
cd tour-life
npm install
npm run dev
```
Then open: `http://localhost:3000`

### Step 2 — Add real audio
See `assets/audio/AUDIO_MANIFEST.md` for exact sourcing instructions and Suno/Udio prompts.
Drop `.ogg` files into `assets/audio/music/` and `assets/audio/sfx/`.
Game degrades gracefully if audio files are missing.

### Step 3 — Upgrade sprites (optional)
Replace placeholder sprites from `/assets/images/` with Nano Banana 3×3 grid exports.
Frame layout is already correct: 3×3 grid, 32×32 per frame, 9 poses.

### Step 4 — Push to GitHub
```bash
git init
git add .
git commit -m "Tour Life: International Dates - v1.0 initial build"
git remote add origin [YOUR_REPO_URL]
git push -u origin main
```

### Step 5 — Deploy to GitHub Pages
Add to `vite.config.js` base: `'/tour-life/'`, then:
```bash
npm run build
# Push /dist folder to gh-pages branch
```

---

## KNOWN GAPS / TODO FOR NEXT SESSION
- [ ] Audio files need to be sourced (see AUDIO_MANIFEST.md)
- [ ] Sprite upgrades via Nano Banana (3×3 grid → slice → 32×32)
- [ ] CityHub click-to-move implementation (foundation is there, needs pathfinding)
- [ ] Service Worker for offline caching (add `vite-plugin-pwa`)
- [ ] More road trip events (target: 40+ total, currently 17)
- [ ] Nova's secret label deal story arc needs full resolution flags
- [ ] London, Tokyo, LA city hub environments (currently reuse divebar tiles with tint)
- [ ] Mobile swipe gesture support as alternative to tap
- [ ] Leaderboard / score sharing

---

## TECH STACK
- Engine: Phaser.js 3.60+
- Bundler: Vite 5.x
- Language: Vanilla JS (ES modules)
- Input: mouse click + touchstart (unified)
- Canvas: pixelArt: true, FIT scale mode (letterbox)
- Storage: localStorage
- Target: GitHub Pages / Vercel

---

## FOLDER STRUCTURE (final)
```
tour-life/
├── STATE.md
├── PRD.md
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.js
│   ├── scenes/       (9 scenes)
│   ├── systems/      (3 systems)
│   └── data/         (3 data files)
└── assets/
    ├── images/       (8 sprite sheets)
    ├── audio/        (placeholder — needs real files)
    └── beatmaps/     (5 JSON beatmaps)
```
