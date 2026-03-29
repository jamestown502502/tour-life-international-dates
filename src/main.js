/**
 * Tour Life: International Dates
 * Main entry point — Phaser game configuration
 */

import Phaser from 'phaser';
import { MainMenu } from './scenes/MainMenu.js';
import { CharacterCreate } from './scenes/CharacterCreate.js';
import { CityHub } from './scenes/CityHub.js';
import { TourBus } from './scenes/TourBus.js';
import { RoadTrip } from './scenes/RoadTrip.js';
import { Concert } from './scenes/Concert.js';
import { Results } from './scenes/Results.js';
import { GameOver } from './scenes/GameOver.js';
import { Preloader } from './scenes/Preloader.js';

// ─── GAME CONFIG ──────────────────────────────────────────────────────────────

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 270,
  parent: 'game-container',
  pixelArt: true,             // No anti-aliasing on sprites
  antialias: false,
  backgroundColor: '#0a0510',

  scale: {
    mode: Phaser.Scale.FIT,   // Letterbox/pillarbox to fill viewport
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },

  audio: {
    disableWebAudio: false,
  },

  scene: [
    Preloader,
    MainMenu,
    CharacterCreate,
    CityHub,
    TourBus,
    RoadTrip,
    Concert,
    Results,
    GameOver,
  ],
};

// ─── BOOT ────────────────────────────────────────────────────────────────────

const game = new Phaser.Game(config);

// Remove loading screen once Phaser is ready
game.events.once(Phaser.Core.Events.READY, () => {
  const loadingBar = document.getElementById('loading-bar');
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingBar) loadingBar.style.width = '100%';
  setTimeout(() => {
    if (loadingScreen) loadingScreen.classList.add('hidden');
  }, 600);
});

export default game;
