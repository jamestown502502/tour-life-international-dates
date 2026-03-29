# Tour Life: International Dates — Product Requirements Document

**Version:** 1.0
**Type:** Browser-Based Simulation Adventure / Rhythm RPG
**Platform:** Web (Desktop + Mobile browsers)
**Engine:** Phaser.js 3.x + Vite

---

## 1. Product Overview

**Tour Life: International Dates** is a 2D browser-based Simulation Adventure and Rhythm RPG. The player leads a breakout band from dive bars to international stadiums, managing bandmate relationships, surviving road trip disasters, and performing rhythm-based concerts across global cities. One shot at fame. Every decision counts.

**Core Promise:** The chaos and exhilaration of being in a touring band — the arguments on the bus, the bad gigs, the unexpected breakout moments — all distilled into a fast, emotionally driven game playable in any browser.

---

## 2. Target Audience

- **Primary:** Fans of rhythm games (Guitar Hero, Beat Saber), life sims (Stardew Valley), and narrative RPGs (Disco Elysium)
- **Age Range:** 16–35
- **Platform Habits:** Mobile-first casual players + desktop gamers
- **Session Length:** 15–45 minutes per sitting

---

## 3. Core Game Loop

```
[City Hub: Explore + Prepare]
        ↓
[Tour Bus: Dialogue + Relationship Management]
        ↓
[Road Trip: Randomized Event Resolution]
        ↓
[Concert: Rhythm Minigame Performance]
        ↓
[Results: Fame/Reputation/Relationship Changes]
        ↓
[Next City — Loop Repeats]
```

---

## 4. Characters

### The Player (Custom Lead)
- Fully customizable: name, appearance, instrument, personality trait
- Personality trait chosen at start affects dialogue options throughout
- Traits: **Visionary** (unlock creative branches), **Hustler** (unlock business branches), **Rebel** (unlock confrontational branches)

### Ryder Blaze — Guitarist
- Archetype: Hot-headed, intensely loyal, impulsive
- Relationship stat: **Loyalty** (0–100)
- Low loyalty → starts brawls, triggers bad PR events
- High loyalty → boosts crowd energy in rock-heavy sets, unlocks "Ryder's Riff" concert power-up
- Key dialogue arc: His rivalry with Nova threatens to split the band at the midpoint

### Nova Wilde — Frontwoman / Vocalist
- Archetype: Charismatic, media-savvy strategist
- Relationship stat: **Trust** (0–100)
- Low trust → blocks VIP venues, leaks damaging stories to press
- High trust → unlocks VIP city hub areas, negotiates better gig payouts, unlocks "Nova's Spotlight" concert power-up
- Key dialogue arc: She has a secret deal with a label that may sell the band out

### Jet — Drummer
- Archetype: Chill, laid-back, but carrying secret debts
- Relationship stat: **Bond** (0–100)
- Low bond → disappears before gigs, introduces shady random events
- High bond → unlocks underground gig side quests, introduces eccentric contacts with big rewards
- Key dialogue arc: Loan sharks catch up to him in Tokyo — player must decide whether to cover his debt

---

## 5. Game Scenes & Systems

### 5.1 Main Menu
- Animated pixel art title screen with looping background track
- Options: New Game, Continue, Settings (volume, controls)
- Animated bandmates silhouetted on a stage

### 5.2 Character Creation
- Choose: Name, Instrument (Guitar / Bass / Keys / Violin), Skin tone palette, Outfit, Personality Trait
- Live pixel art preview updates as player customizes

### 5.3 City Hub (Top-Down 2D)
- Explorable 2D pixel art city environments per stop:
  - **Seattle:** Dive bar district, rainy streets
  - **New York:** Cramped backstage arena hallway
  - **London:** Pub row, foggy alley
  - **Tokyo:** Neon arcade district
  - **Los Angeles:** Stadium parking lot + VIP gate
- NPCs with one-off dialogue, side quests, local flavor
- Interact with venue door to trigger Concert phase
- Interact with Tour Bus to trigger Tour Bus scene

### 5.4 Tour Bus (Interior 2D)
- Side-scrolling bus interior: bunks, kitchenette, small stage area
- Interact with Ryder, Nova, Jet individually
- Triggers full dialogue tree encounters
- Relationship stats tracked here
- "Rest" option skips to next city (costs relationship points if anyone wanted to talk)

### 5.5 Road Trip (Event Screen)
- Triggered between cities
- Randomized card-style events drawn from pool of 40+ events
- Examples:
  - "Ryder crashed the van into a guardrail. Pay $500 repair or lose gig?"
  - "A journalist wants an exclusive. Which bandmate do you feature?"
  - "Jet's loan shark calls. Pay $1,000 now or face consequences in Tokyo."
  - "Nova booked a surprise pop-up gig. Play it or rest?"
- Choices affect: Money, Fame, Relationships, next City's available content

### 5.6 Concert (Rhythm Minigame)
- Falling note highway (4 lanes: Guitar, Bass, Keys, Drums)
- Notes sync to custom JSON beatmap tied to the city's genre track
- Timing zones: PERFECT → GOOD → OK → MISS
- Performance score feeds into:
  - End-of-show "Crowd Energy" meter
  - Fame points gained
  - Relationship reaction from bandmates
- Power-ups: Ryder's Riff (2x score multiplier), Nova's Spotlight (lane shield), Jet's Groove (slow-mo window)
- Fail state: Crowd boos → Fame loss, bandmate relationship drops

### 5.7 Results Screen
- Post-concert breakdown: Score, Crowd Energy, Fame Gained, Money Earned
- Bandmate reaction dialogue (1 line each, reflects relationship level)
- "Next City" button advances the campaign

---

## 6. Progression System

| Metric | Description |
|--------|-------------|
| Fame | Global score 0–10,000. Determines which venues unlock. |
| Money | Earned at gigs, spent on repairs/bribes/gear |
| Relationships | Ryder Loyalty / Nova Trust / Jet Bond (0–100 each) |
| Reputation | Indie Darling ↔ Sellout spectrum (affects dialogue options) |

**Win Condition:** Reach LA with Fame ≥ 8,000 → Stadium concert finale
**Lose Condition:** Fame drops to 0, or all three relationship stats hit 0 simultaneously (band breaks up)

---

## 7. Cities & Music Tracks

| City | Venue Size | Genre Track | Unlock Condition |
|------|-----------|-------------|-----------------|
| Seattle | Dive Bar | Grunge/Punk | Start |
| New York | Mid-size club | Hip-Hop/R&B | Fame ≥ 500 |
| London | Theatre | Acoustic Indie | Fame ≥ 1,500 |
| Tokyo | Neon club | EDM/Hyperpop | Fame ≥ 3,000 |
| Los Angeles | Stadium | Stadium Rock | Fame ≥ 8,000 |

---

## 8. Technical Requirements

### 8.1 Tech Stack
- **Engine:** Phaser.js 3.60+
- **Bundler:** Vite 5.x
- **Language:** Vanilla JavaScript (ES modules)
- **Rendering:** Phaser WebGL canvas with pixel art filter (`pixelArt: true`)
- **Audio:** Phaser Web Audio API

### 8.2 Input
- All interactive elements respond to both `click` and `touchstart`
- Rhythm game notes respond to keyboard (DFGJ keys) AND touch tap zones
- Canvas has `touch-action: none` applied to prevent scroll/zoom on mobile

### 8.3 Responsive Layout
- Game canvas: fixed 480×270 internal resolution (16:9)
- CSS scales canvas to fill viewport while maintaining aspect ratio (letterboxing)
- No zoom-on-double-tap on mobile (meta viewport tag set correctly)

### 8.4 Performance
- 60fps via `requestAnimationFrame` (Phaser default game loop)
- Sprite sheets preloaded per scene, not globally
- Audio files: `.ogg` primary, `.mp3` fallback

### 8.5 Save System
- Auto-save to `localStorage` after each scene transition
- Save data: `{ fame, money, relationships, currentCity, flags, playerConfig }`

### 8.6 Offline Support
- Service Worker caches all static assets on first load
- Game fully playable offline after initial visit

---

## 9. Asset Manifest

### Sprites (32×32 per frame, sprite sheets)
- `player_[trait].png` — 9 frames (idle, walk×2, run, jump, interact, talk, celebrate, hurt)
- `ryder.png` — 9 frames same layout
- `nova.png` — 9 frames same layout
- `jet.png` — 9 frames same layout
- `env_divebar.png` — 9 tiles (floor, wall, bar, stool, stage, amp, mic, light, exit)
- `env_tourbus.png` — 9 tiles (bunk, window, kitchenette, couch, table, gear pile, curtain, floor, ceiling)
- `env_stadium.png` — 9 tiles (stage, light rig, crowd block, barrier, screen, speaker, floor, backstage, banner)

### Audio
- `seattle_punk.ogg` — Grunge/Punk (90–120 BPM)
- `newyork_hiphop.ogg` — Hip-Hop/R&B (85–95 BPM)
- `london_indie.ogg` — Acoustic Indie (100–110 BPM)
- `tokyo_edm.ogg` — EDM/Hyperpop (128–140 BPM)
- `la_rock.ogg` — Stadium Rock (120–130 BPM)
- `bus_ambience.ogg` — Loop (engine hum, road noise)
- SFX: `crowd_cheer.ogg`, `crowd_boo.ogg`, `ui_click.ogg`, `dialogue_blip.ogg`, `note_perfect.ogg`, `note_miss.ogg`

### Beatmaps
- `beatmap_seattle.json`
- `beatmap_newyork.json`
- `beatmap_london.json`
- `beatmap_tokyo.json`
- `beatmap_la.json`

---

## 10. MVP Scope (v1.0)

**In MVP:**
- All 5 cities with distinct environments
- Full concert rhythm minigame with beatmap sync
- Dialogue system with Ryder, Nova, Jet (3 scenes each)
- Road Trip event system (20 events minimum)
- Character creation (3 traits, 4 instruments)
- Fame/Money/Relationship tracking
- Save/load via localStorage
- Mobile touch support

**Post-launch (v1.1+):**
- Additional cities (Berlin, São Paulo, Sydney)
- Band recording studio mini-game
- Social sharing (post your score card)
- Leaderboard
- Unlockable band skins/outfits

---

## 11. Success Metrics
- Player completes 3+ city gigs in one session
- Concert rhythm minigame achieves ≥ 80% "feels responsive" in user testing
- Game loads under 3 seconds on mobile (4G connection)
- Zero crashes on iOS Safari and Android Chrome

---

*PRD generated for Bennett AI Solutions Inc. | Tour Life v1.0*
