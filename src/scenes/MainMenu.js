/**
 * MainMenu — animated title screen with New Game / Continue / Settings
 */
import { SaveSystem } from '../systems/SaveSystem.js';

export class MainMenu extends Phaser.Scene {
  constructor() { super('MainMenu'); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── BACKGROUND ──────────────────────────────────────────────────────
    // Gradient-style layered rectangles (pixel art approach)
    this.add.rectangle(0, 0, W, H, 0x0a0510).setOrigin(0, 0);
    this.add.rectangle(0, H * 0.6, W, H * 0.4, 0x12080e).setOrigin(0, 0);

    // Stage light rays
    for (let i = 0; i < 5; i++) {
      const x = W * (0.1 + i * 0.2);
      const ray = this.add.triangle(
        x, H * 0.05,
        -30, 0, 30, 0, 0, H * 0.55,
        [0xc8a030, 0x4080c0, 0xc04080, 0x40a0c0, 0x80c040][i],
        0.08
      );
    }

    // Crowd silhouette (bottom strip)
    const crowdY = H - 40;
    for (let x = 0; x < W; x += 8) {
      const h = 12 + Math.sin(x * 0.3) * 8 + Math.random() * 6;
      this.add.rectangle(x, crowdY, 6, h, 0x1a0f1e).setOrigin(0, 1);
    }

    // ── TITLE TEXT ──────────────────────────────────────────────────────
    const title = this.add.text(W / 2, H * 0.22, 'TOUR LIFE', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#e8d080',
      stroke: '#2a1000',
      strokeThickness: 4,
      letterSpacing: 8,
    }).setOrigin(0.5).setAlpha(0);

    const subtitle = this.add.text(W / 2, H * 0.22 + 24, 'INTERNATIONAL DATES', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#a08040',
      letterSpacing: 6,
    }).setOrigin(0.5).setAlpha(0);

    // Animate in
    this.tweens.add({ targets: title, alpha: 1, y: H * 0.20, duration: 800, ease: 'Power2' });
    this.tweens.add({ targets: subtitle, alpha: 1, y: H * 0.22 + 26, duration: 800, delay: 300, ease: 'Power2' });

    // Pulsing glow on title
    this.tweens.add({
      targets: title,
      scaleX: 1.02, scaleY: 1.02,
      yoyo: true, repeat: -1, duration: 1200, ease: 'Sine.InOut',
    });

    // ── BANDMATE SILHOUETTES ────────────────────────────────────────────
    const bandY = H * 0.52;
    const chars = [
      { key: 'ryder', x: W * 0.30, tint: 0xc03030 },
      { key: 'player_visionary', x: W * 0.50, tint: 0xe8d080 },
      { key: 'nova', x: W * 0.70, tint: 0xc8a030 },
    ];
    chars.forEach(({ key, x, tint }) => {
      try {
        const sprite = this.add.sprite(x, bandY, key, 0)
          .setScale(3)
          .setTint(tint)
          .setAlpha(0.85);
        this.tweens.add({
          targets: sprite,
          y: bandY - 3, yoyo: true, repeat: -1,
          duration: 600 + Math.random() * 400, ease: 'Sine.InOut',
        });
      } catch (e) { /* sprite not loaded in dev mode */ }
    });

    // ── MENU BUTTONS ────────────────────────────────────────────────────
    const hasSave = SaveSystem.hasSave();
    const menuItems = [
      { label: 'NEW GAME', action: () => this._newGame() },
      ...(hasSave ? [{ label: 'CONTINUE', action: () => this._continue() }] : []),
      { label: 'SETTINGS', action: () => this._settings() },
    ];

    const menuStartY = H * 0.66;
    menuItems.forEach((item, i) => {
      const btnY = menuStartY + i * 18;
      const btn = this.add.text(W / 2, btnY, item.label, {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#c0a060',
        letterSpacing: 4,
      }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

      this.tweens.add({ targets: btn, alpha: 1, duration: 400, delay: 600 + i * 150 });

      btn.on('pointerover', () => {
        btn.setColor('#ffdd88');
        btn.setScale(1.08);
        try { this.sound.play('ui_click', { volume: 0.2 }); } catch(_) {}
      });
      btn.on('pointerout', () => {
        btn.setColor('#c0a060');
        btn.setScale(1);
      });
      btn.on('pointerdown', item.action);
      btn.on('pointerup', item.action);
    });

    // Keyboard: Enter or Space starts new game
    this.input.keyboard.once('keydown-ENTER', () => this._newGame());
    this.input.keyboard.once('keydown-SPACE', () => this._newGame());

    // ── FOOTER ──────────────────────────────────────────────────────────
    this.add.text(W / 2, H - 8, 'Bennett AI Solutions Inc. | v1.0', {
      fontFamily: 'monospace', fontSize: '5px', color: '#3a2830', letterSpacing: 1,
    }).setOrigin(0.5);

    // Play title music loop
    try {
      if (!this.sound.get('seattle_punk')) {
        this.sound.play('seattle_punk', { loop: true, volume: 0.3 });
      }
    } catch(_) {}
  }

  _newGame() {
    if (this._transitioning) return;
    this._transitioning = true;
    try { this.sound.stopAll(); } catch(_) {}
    try {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('CharacterCreate');
      });
      // Fallback: if fade event doesn't fire within 600ms, start anyway
      this.time.delayedCall(600, () => {
        if (this._transitioning) this.scene.start('CharacterCreate');
      });
    } catch(e) {
      this.scene.start('CharacterCreate');
    }
  }

  _continue() {
    if (this._transitioning) return;
    this._transitioning = true;
    const saved = SaveSystem.load();
    if (!saved) { this._newGame(); return; }
    try { this.sound.stopAll(); } catch(_) {}
    try {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('CityHub', { gameState: SaveSystem.merge(saved) });
      });
      this.time.delayedCall(600, () => {
        if (this._transitioning) this.scene.start('CityHub', { gameState: SaveSystem.merge(saved) });
      });
    } catch(e) {
      this.scene.start('CityHub', { gameState: SaveSystem.merge(saved) });
    }
  }

  _settings() {
    // Placeholder: toggle music volume
    const sfx = this.sound.getAllPlaying();
    sfx.forEach(s => s.setVolume(s.volume > 0 ? 0 : 0.3));
  }
}
