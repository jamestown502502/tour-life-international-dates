/**
 * Preloader — loads all game assets before MainMenu
 */
export class Preloader extends Phaser.Scene {
  constructor() { super('Preloader'); }

  preload() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Progress bar
    const barBg = this.add.rectangle(W/2, H/2 + 20, 200, 8, 0x2a1a3a);
    const bar   = this.add.rectangle(W/2 - 100, H/2 + 20, 0, 8, 0xc8a030).setOrigin(0, 0.5);
    this.add.text(W/2, H/2, 'LOADING...', {
      fontFamily: 'monospace', fontSize: '10px', color: '#a08060', letterSpacing: 4
    }).setOrigin(0.5);

    this.load.on('progress', v => { bar.width = 200 * v; });

    // ── CHARACTER SPRITES ──
    this.load.spritesheet('player_visionary', 'assets/images/characters/player_visionary.png',
      { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('ryder', 'assets/images/characters/ryder.png',
      { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('nova', 'assets/images/characters/nova.png',
      { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('jet', 'assets/images/characters/jet.png',
      { frameWidth: 32, frameHeight: 32 });

    // ── ENVIRONMENT TILES ──
    this.load.spritesheet('env_divebar', 'assets/images/environments/env_divebar.png',
      { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('env_tourbus', 'assets/images/environments/env_tourbus.png',
      { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('env_stadium', 'assets/images/environments/env_stadium.png',
      { frameWidth: 32, frameHeight: 32 });

    // ── UI ELEMENTS ──
    this.load.spritesheet('ui_elements', 'assets/images/ui/ui_elements.png',
      { frameWidth: 32, frameHeight: 32 });

    // ── BEATMAPS ──
    this.load.json('beatmap_seattle',  'assets/beatmaps/beatmap_seattle.json');
    this.load.json('beatmap_newyork',  'assets/beatmaps/beatmap_newyork.json');
    this.load.json('beatmap_london',   'assets/beatmaps/beatmap_london.json');
    this.load.json('beatmap_tokyo',    'assets/beatmaps/beatmap_tokyo.json');
    this.load.json('beatmap_la',       'assets/beatmaps/beatmap_la.json');

    // ── AUDIO: skipped — no audio files bundled in this build ──
    // Audio files are listed in assets/audio/AUDIO_MANIFEST.md
    // When audio is added, restore these load calls.
  }

  create() {
    // Register character animations
    this._createAnims('player_visionary');
    this._createAnims('ryder');
    this._createAnims('nova');
    this._createAnims('jet');

    this.scene.start('MainMenu');
  }

  _createAnims(key) {
    const frameNames = ['idle','walk_a','walk_b','run','jump','interact','talk','celebrate','hurt'];
    frameNames.forEach((name, i) => {
      this.anims.create({
        key: `${key}_${name}`,
        frames: this.anims.generateFrameNumbers(key, { start: i, end: i }),
        frameRate: 8,
        repeat: name.includes('walk') || name === 'run' ? -1 : 0,
      });
    });
    // Walk cycle animation (loops walk_a ↔ walk_b)
    this.anims.create({
      key: `${key}_walk`,
      frames: this.anims.generateFrameNumbers(key, { frames: [1, 2] }),
      frameRate: 6,
      repeat: -1,
    });
  }
}
