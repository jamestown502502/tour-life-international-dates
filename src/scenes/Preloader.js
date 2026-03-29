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

    // ── AUDIO (load with .ogg/.mp3 fallback) ──
    const audioFiles = [
      ['seattle_punk',    'assets/audio/music/seattle_punk'],
      ['newyork_hiphop',  'assets/audio/music/newyork_hiphop'],
      ['london_indie',    'assets/audio/music/london_indie'],
      ['tokyo_edm',       'assets/audio/music/tokyo_edm'],
      ['la_rock',         'assets/audio/music/la_rock'],
      ['bus_ambience',    'assets/audio/music/bus_ambience'],
      ['crowd_cheer',     'assets/audio/sfx/crowd_cheer'],
      ['crowd_boo',       'assets/audio/sfx/crowd_boo'],
      ['crowd_divebar',   'assets/audio/sfx/crowd_divebar'],
      ['ui_click',        'assets/audio/sfx/ui_click'],
      ['dialogue_blip',   'assets/audio/sfx/dialogue_blip'],
      ['note_perfect',    'assets/audio/sfx/note_perfect'],
      ['note_good',       'assets/audio/sfx/note_good'],
      ['note_miss',       'assets/audio/sfx/note_miss'],
      ['power_up',        'assets/audio/sfx/power_up'],
      ['scene_transition','assets/audio/sfx/scene_transition'],
      ['money_earn',      'assets/audio/sfx/money_earn'],
    ];
    audioFiles.forEach(([key, path]) => {
      this.load.audio(key, [`${path}.ogg`, `${path}.mp3`]);
    });
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
