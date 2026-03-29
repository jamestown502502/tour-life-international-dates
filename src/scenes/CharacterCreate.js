/**
 * CharacterCreate — player customization screen
 * Choose: Name, Instrument, Skin Tone, Outfit, Personality Trait
 */
import { DEFAULT_STATE } from '../systems/SaveSystem.js';
import { PLAYER_TRAITS } from '../data/characters.js';

export class CharacterCreate extends Phaser.Scene {
  constructor() { super('CharacterCreate'); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._config = {
      name: 'Your Name',
      trait: 'visionary',
      instrument: 'guitar',
      skinTone: 0,
      outfit: 0,
    };

    // ── BG ──────────────────────────────────────────────────────────────
    this.add.rectangle(0, 0, W, H, 0x0d0818).setOrigin(0, 0);
    this.add.text(W/2, 10, 'CREATE YOUR CHARACTER', {
      fontFamily: 'monospace', fontSize: '9px', color: '#c8a030', letterSpacing: 4,
    }).setOrigin(0.5, 0);

    // ── PREVIEW ─────────────────────────────────────────────────────────
    this._previewSprite = this.add.sprite(W * 0.2, H * 0.45, 'player_visionary', 0)
      .setScale(5)
      .setOrigin(0.5);

    // Idle bob
    this.tweens.add({
      targets: this._previewSprite,
      y: H * 0.45 - 4, yoyo: true, repeat: -1, duration: 800, ease: 'Sine.InOut',
    });

    // ── NAME INPUT ──────────────────────────────────────────────────────
    const nameLabel = this.add.text(W * 0.40, 32, 'NAME:', {
      fontFamily: 'monospace', fontSize: '7px', color: '#a08060'
    });

    const nameBox = this.add.rectangle(W * 0.40, 44, 120, 12, 0x2a1a3a).setOrigin(0, 0);
    const nameBox2 = this.add.rectangle(W * 0.40, 44, 120, 12, 0, 0).setOrigin(0, 0).setStrokeStyle(1, 0x4a3a6a);
    this._nameText = this.add.text(W * 0.40 + 4, 46, 'PLAYER', {
      fontFamily: 'monospace', fontSize: '7px', color: '#e8d8a0'
    });

    // Click to "edit" name (prompt workaround for game context)
    nameBox.setInteractive();
    nameBox.on('pointerdown', () => {
      const input = window.prompt('Enter your band name:', this._config.name);
      if (input && input.trim()) {
        this._config.name = input.trim().toUpperCase().substring(0, 14);
        this._nameText.setText(this._config.name);
      }
    });

    // ── INSTRUMENT ──────────────────────────────────────────────────────
    this._buildSelector(W * 0.40, 62, 'INSTRUMENT:',
      ['Guitar', 'Bass', 'Keys', 'Violin'],
      (val) => { this._config.instrument = val.toLowerCase(); }
    );

    // ── TRAIT ──────────────────────────────────────────────────────────
    const traitY = 100;
    this.add.text(W * 0.40, traitY, 'PERSONALITY:', {
      fontFamily: 'monospace', fontSize: '7px', color: '#a08060'
    });

    Object.values(PLAYER_TRAITS).forEach((trait, i) => {
      const tx = W * 0.40 + i * 60;
      const ty = traitY + 12;
      const btn = this.add.rectangle(tx, ty, 54, 16, 0x1a1030).setOrigin(0, 0)
        .setStrokeStyle(1, 0x3a2a5a)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(tx + 4, ty + 4, trait.label.toUpperCase(), {
        fontFamily: 'monospace', fontSize: '5px', color: '#a080c0'
      });

      btn.on('pointerover', () => btn.setFillStyle(0x3a1a5a));
      btn.on('pointerout', () => btn.setFillStyle(this._config.trait === trait.id ? 0x3a1a5a : 0x1a1030));
      btn.on('pointerdown', () => {
        this._config.trait = trait.id;
        this._descText.setText(trait.description);
        try { this.sound.play('ui_click', { volume: 0.4 }); } catch(_) {}
      });
    });

    this._descText = this.add.text(W * 0.40, traitY + 34, PLAYER_TRAITS.visionary.description, {
      fontFamily: 'monospace', fontSize: '6px', color: '#806050',
      wordWrap: { width: W * 0.56 }
    });

    // ── SKIN TONE ──────────────────────────────────────────────────────
    const skinColors = [0xf8d8a8, 0xe0b880, 0xc09050, 0x805030, 0x503020, 0x201010];
    this.add.text(W * 0.40, 148, 'SKIN TONE:', {
      fontFamily: 'monospace', fontSize: '7px', color: '#a08060'
    });
    skinColors.forEach((color, i) => {
      const s = this.add.rectangle(W * 0.40 + i * 14, 160, 12, 12, color).setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });
      s.on('pointerdown', () => {
        this._config.skinTone = i;
        this._previewSprite.setTint(color);
      });
    });

    // ── START BUTTON ────────────────────────────────────────────────────
    const startBtn = this.add.text(W / 2, H - 20, '▸  BEGIN THE TOUR', {
      fontFamily: 'monospace', fontSize: '9px', color: '#c8a030', letterSpacing: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setColor('#ffee88').setScale(1.05));
    startBtn.on('pointerout',  () => startBtn.setColor('#c8a030').setScale(1));
    startBtn.on('pointerdown', () => this._startGame());

    this.cameras.main.fadeIn(400);
  }

  _buildSelector(x, y, label, options, onChange) {
    this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '7px', color: '#a08060' });
    let current = 0;
    const display = this.add.text(x + 70, y, options[0].toUpperCase(), {
      fontFamily: 'monospace', fontSize: '7px', color: '#e8d8a0'
    });
    const prev = this.add.text(x + 60, y, '◂', { fontFamily: 'monospace', fontSize: '7px', color: '#c8a030' })
      .setInteractive({ useHandCursor: true });
    const next = this.add.text(x + 110, y, '▸', { fontFamily: 'monospace', fontSize: '7px', color: '#c8a030' })
      .setInteractive({ useHandCursor: true });
    const update = (dir) => {
      current = (current + dir + options.length) % options.length;
      display.setText(options[current].toUpperCase());
      onChange(options[current]);
      try { this.sound.play('ui_click', { volume: 0.3 }); } catch(_) {}
    };
    prev.on('pointerdown', () => update(-1));
    next.on('pointerdown', () => update(+1));
  }

  _startGame() {
    const gameState = {
      ...DEFAULT_STATE,
      player: { ...this._config },
    };
    try { this.sound.stopAll(); } catch(_) {}
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TourBus', { gameState, cityId: 'seattle', phase: 'pre_gig' });
    });
  }
}
