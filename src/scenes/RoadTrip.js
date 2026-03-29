/**
 * RoadTrip — randomized event card screen between cities
 * Draws 2 events, player resolves each with choice buttons
 */
import { drawRoadTripEvents } from '../data/events.js';
import { getCityById, getNextCity } from '../data/cities.js';
import { RelationshipTracker } from '../systems/RelationshipTracker.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class RoadTrip extends Phaser.Scene {
  constructor() { super('RoadTrip'); }

  init(data) {
    this.gameState = data.gameState;
    this._tracker = new RelationshipTracker(this.gameState);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._events = drawRoadTripEvents(this.gameState, 2);
    this._eventIndex = 0;

    // ── BG ──────────────────────────────────────────────────────────
    this.add.rectangle(0, 0, W, H, 0x0a1018).setOrigin(0, 0);
    // Scrolling road lines (visual)
    this._roadLines = [];
    for (let i = 0; i < 6; i++) {
      const line = this.add.rectangle(W/2, H * (i/6), 3, H/8, 0x304050).setOrigin(0.5);
      this._roadLines.push(line);
    }

    // Bus silhouette at top
    this.add.rectangle(W/2, 24, 80, 28, 0x2a1a10).setOrigin(0.5);
    this.add.rectangle(W/2, 24, 76, 24, 0x3a2a18).setOrigin(0.5);
    this.add.rectangle(W/2 + 24, 22, 12, 10, 0x204030).setOrigin(0.5); // window
    this.add.rectangle(W/2 - 8, 22, 12, 10, 0x204030).setOrigin(0.5);  // window
    this.add.text(W/2, 24, 'TOUR BUS', { fontFamily: 'monospace', fontSize: '5px', color: '#806050' }).setOrigin(0.5);

    this.add.text(W/2, 46, 'ON THE ROAD...', {
      fontFamily: 'monospace', fontSize: '7px', color: '#4a6a6a', letterSpacing: 4
    }).setOrigin(0.5);

    try { this.sound.play('bus_ambience', { loop: true, volume: 0.15 }); } catch(_) {}

    this.cameras.main.fadeIn(400);
    this.time.delayedCall(800, () => this._showEvent());
  }

  update() {
    // Animate road lines moving downward
    this._roadLines.forEach(line => {
      line.y += 2;
      if (line.y > this.scale.height) line.y = 0;
    });
  }

  _showEvent() {
    if (this._eventIndex >= this._events.length) {
      this._advance();
      return;
    }
    const event = this._events[this._eventIndex];
    this._buildEventCard(event);
  }

  _buildEventCard(event) {
    const W = this.scale.width;
    const H = this.scale.height;

    // Clear previous card
    if (this._cardContainer) this._cardContainer.destroy(true);
    this._cardContainer = this.add.container(0, 0).setDepth(10);

    // Event counter
    const counter = this.add.text(W/2, 56, `EVENT ${this._eventIndex + 1} OF ${this._events.length}`, {
      fontFamily: 'monospace', fontSize: '5px', color: '#4a4a6a', letterSpacing: 2
    }).setOrigin(0.5);

    // Card background
    const cardBg = this.add.rectangle(W/2, H * 0.45, W - 20, H * 0.42, 0x12080e).setOrigin(0.5)
      .setStrokeStyle(1, 0x4a3a6a);

    // Category tag
    const catColors = {
      band_drama: 0xc03030, financial: 0x30c030,
      media: 0x3080c0, wild_card: 0xc8a030, opportunity: 0xa030c0,
    };
    const catBg = this.add.rectangle(W/2, H * 0.25, 80, 12, catColors[event.category] || 0x4a4a4a).setOrigin(0.5);
    const catTxt = this.add.text(W/2, H * 0.25, event.category.replace('_', ' ').toUpperCase(), {
      fontFamily: 'monospace', fontSize: '5px', color: '#ffffff', letterSpacing: 2
    }).setOrigin(0.5);

    // Character portrait hint
    if (event.character) {
      const charColors = { ryder: 0xc03030, nova: 0xc8a030, jet: 0x3070c0 };
      this.add.circle(W * 0.15, H * 0.35, 14, charColors[event.character] || 0x606060)
        .setStrokeStyle(1, 0xffffff, 0.3);
      this.add.text(W * 0.15, H * 0.35 + 18, event.character.toUpperCase(), {
        fontFamily: 'monospace', fontSize: '5px', color: '#a09080'
      }).setOrigin(0.5);
    }

    // Event text
    const evText = this.add.text(W/2, H * 0.38, event.text, {
      fontFamily: 'monospace', fontSize: '6px', color: '#d8c8a0',
      wordWrap: { width: W - 36 }, lineSpacing: 3, align: 'center'
    }).setOrigin(0.5, 0);

    // Choices
    const choiceStartY = H * 0.58;
    event.choices.forEach((choice, i) => {
      const cy = choiceStartY + i * 20;
      const btn = this.add.rectangle(W/2, cy, W - 30, 16, 0x1a0f2a).setOrigin(0.5)
        .setStrokeStyle(1, 0x3a2a5a)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(W/2, cy, `▸ ${choice.label}`, {
        fontFamily: 'monospace', fontSize: '6px', color: '#b0a070', align: 'center'
      }).setOrigin(0.5);

      btn.on('pointerover', () => { btn.setFillStyle(0x3a1a5a); label.setColor('#ffee88'); });
      btn.on('pointerout',  () => { btn.setFillStyle(0x1a0f2a); label.setColor('#b0a070'); });

      const handleSelect = () => {
        try { this.sound.play('ui_click', { volume: 0.4 }); } catch(_) {}
        this._resolveChoice(choice);
      };
      btn.on('pointerdown', handleSelect);

      this._cardContainer.add([btn, label]);
    });

    this._cardContainer.add([counter, cardBg, catBg, catTxt, evText]);
    // Slide in
    this._cardContainer.setAlpha(0);
    this.tweens.add({ targets: this._cardContainer, alpha: 1, duration: 300 });
  }

  _resolveChoice(choice) {
    const effects = choice.effects || {};
    const messages = this._tracker.applyEffects(effects);

    // Handle random_chance
    if (effects.random_chance) {
      const success = Math.random() > 0.45;
      const sub = success ? effects.random_chance.success : effects.random_chance.fail;
      if (sub) this._tracker.applyEffects(sub);
    }

    SaveSystem.save(this.gameState);
    this._showEffectSummary(messages, effects, () => {
      this._eventIndex++;
      this.time.delayedCall(300, () => this._showEvent());
    });
  }

  _showEffectSummary(messages, effects, cb) {
    const W = this.scale.width;
    const H = this.scale.height;

    // Quick popup showing what changed
    const popup = this.add.container(W/2, H * 0.82).setDepth(20);
    const bg = this.add.rectangle(0, 0, W - 20, 30, 0x1a1030, 0.95).setStrokeStyle(1, 0x4a3a6a);
    popup.add(bg);

    const lines = [];
    if (effects.money)          lines.push(`${effects.money > 0 ? '+' : ''}$${effects.money}`);
    if (effects.fame)           lines.push(`★${effects.fame > 0 ? '+' : ''}${effects.fame}`);
    if (effects.ryder_loyalty)  lines.push(`Ryder ${effects.ryder_loyalty > 0 ? '+' : ''}${effects.ryder_loyalty}`);
    if (effects.nova_trust)     lines.push(`Nova ${effects.nova_trust > 0 ? '+' : ''}${effects.nova_trust}`);
    if (effects.jet_bond)       lines.push(`Jet ${effects.jet_bond > 0 ? '+' : ''}${effects.jet_bond}`);

    const summary = lines.join('  |  ');
    const txt = this.add.text(0, 0, summary || 'No change', {
      fontFamily: 'monospace', fontSize: '6px', color: '#c8a030'
    }).setOrigin(0.5);
    popup.add(txt);

    this.time.delayedCall(1200, () => {
      this.tweens.add({ targets: popup, alpha: 0, duration: 300, onComplete: () => { popup.destroy(); cb(); } });
    });
  }

  _advance() {
    // Check band-broken state
    if (this._tracker.isBandBroken()) {
      this._goToGameOver('band_broke');
      return;
    }
    // Check game over (fame 0)
    if (this.gameState.fame <= 0) {
      this._goToGameOver('no_fame');
      return;
    }

    // Advance to next city
    const currentCity = getCityById(this.gameState.currentCityId || 'seattle');
    const nextCity = getNextCity(currentCity?.id || 'seattle');

    try { this.sound.stopAll(); } catch(_) {}
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (nextCity) {
        this.gameState.currentCityId = nextCity.id;
        this.scene.start('TourBus', {
          gameState: this.gameState,
          cityId: nextCity.id,
          phase: 'pre_gig',
        });
      } else {
        // Final city completed — go to results/credits
        this.scene.start('GameOver', { gameState: this.gameState, type: 'win' });
      }
    });
  }

  _goToGameOver(reason) {
    try { this.sound.stopAll(); } catch(_) {}
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameOver', { gameState: this.gameState, type: reason });
    });
  }
}
