/**
 * TourBus — interior side-scrolling scene for pre/post-gig dialogue
 * Ryder, Nova, Jet are interactable. Rest option skips to road trip.
 */
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class TourBus extends Phaser.Scene {
  constructor() { super('TourBus'); }

  init(data) {
    this.gameState = data.gameState;
    this.cityId = data.cityId || 'seattle';
    this.phase = data.phase || 'pre_gig'; // 'pre_gig' | 'post_gig'
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._dialogue = new DialogueSystem(this, this.gameState);
    this._talked = new Set();

    // ── BUS INTERIOR ────────────────────────────────────────────────
    this.add.rectangle(0, 0, W, H, 0x1a1208).setOrigin(0, 0);

    // Build interior from tiles
    this._buildBusInterior(W, H);

    // ── AMBIENT ────────────────────────────────────────────────────
    try { this.sound.play('bus_ambience', { loop: true, volume: 0.2 }); } catch(_) {}

    // ── PHASE LABEL ─────────────────────────────────────────────────
    const phaseLabel = this.phase === 'pre_gig' ? 'PRE-GIG: ON THE BUS' : 'POST-GIG: BACK ON THE BUS';
    this.add.text(W/2, 8, phaseLabel, {
      fontFamily: 'monospace', fontSize: '7px', color: '#c8a030', letterSpacing: 3,
    }).setOrigin(0.5, 0);

    // ── BANDMATES ──────────────────────────────────────────────────
    this._spawnBandmates(W, H);

    // ── REST BUTTON ────────────────────────────────────────────────
    const restBtn = this.add.text(W / 2, H - 16, this.phase === 'pre_gig' ? '▸  HEAD TO VENUE' : '▸  HIT THE ROAD', {
      fontFamily: 'monospace', fontSize: '8px', color: '#c8a030', letterSpacing: 3,
      backgroundColor: '#1a1208', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

    restBtn.on('pointerover', () => restBtn.setColor('#ffee88'));
    restBtn.on('pointerout',  () => restBtn.setColor('#c8a030'));
    restBtn.on('pointerdown', () => this._advance());

    // ── HUD ──────────────────────────────────────────────────────
    this._buildHUD(W);

    // ── TALKED INDICATOR ─────────────────────────────────────────
    this._talkIndicators = {};
    const bandIds = ['ryder', 'nova', 'jet'];
    bandIds.forEach((id, i) => {
      const dot = this.add.circle(40 + i * 16, H - 30, 3, 0x4a3a2a).setDepth(20);
      this._talkIndicators[id] = dot;
    });
    this.add.text(8, H - 34, 'TALKED:', {
      fontFamily: 'monospace', fontSize: '5px', color: '#605040'
    }).setDepth(20);

    this.cameras.main.fadeIn(300);
  }

  _buildBusInterior(W, H) {
    // Scrolling tiled bus interior
    const tiles = [
      [1,1,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [7,7,0,0,0,0,0,0,0,0,0,0,0,7,7],
      [0,1,0,4,0,5,0,2,0,3,0,6,0,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,0,0,0,0,0,0,0,0,0,0,0,1,0],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [7,7,0,0,0,0,0,0,0,0,0,0,0,7,7],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    ];
    const TILE = 32;
    tiles.forEach((row, ry) => {
      row.forEach((t, rx) => {
        if (t > 0) {
          try {
            this.add.image(rx * TILE + TILE/2, ry * TILE + TILE/2, 'env_tourbus', t).setDepth(1);
          } catch(e) {
            const colors = [0,0x604030,0x805040,0x705038,0x503028,0x604030,0x705038,0x201808];
            this.add.rectangle(rx*TILE+TILE/2, ry*TILE+TILE/2, TILE-1, TILE-1, colors[t]||0x303020).setDepth(1);
          }
        }
      });
    });
  }

  _spawnBandmates(W, H) {
    const chars = [
      {
        id: 'ryder', key: 'ryder', x: W * 0.20, y: H * 0.44,
        color: 0xc03030, stat: 'loyalty', label: 'RYDER',
        statLabel: () => `♥ ${this.gameState.relationships.loyalty}`,
      },
      {
        id: 'nova', key: 'nova', x: W * 0.50, y: H * 0.44,
        color: 0xc8a030, stat: 'trust', label: 'NOVA',
        statLabel: () => `♥ ${this.gameState.relationships.trust}`,
      },
      {
        id: 'jet', key: 'jet', x: W * 0.80, y: H * 0.44,
        color: 0x3070c0, stat: 'bond', label: 'JET',
        statLabel: () => `♥ ${this.gameState.relationships.bond}`,
      },
    ];

    chars.forEach(c => {
      // Sprite
      let sprite;
      try {
        sprite = this.add.sprite(c.x, c.y, c.key, 0).setScale(2.5).setDepth(5);
        this.tweens.add({ targets: sprite, y: c.y - 4, yoyo: true, repeat: -1, duration: 700 + Math.random()*300, ease: 'Sine.InOut' });
      } catch(e) {
        sprite = this.add.rectangle(c.x, c.y, 24, 32, c.color).setDepth(5);
      }

      // Name label
      this.add.text(c.x, c.y + 24, c.label, {
        fontFamily: 'monospace', fontSize: '6px', color: '#a09070'
      }).setOrigin(0.5).setDepth(6);

      // Relationship stat
      const statTxt = this.add.text(c.x, c.y + 32, c.statLabel(), {
        fontFamily: 'monospace', fontSize: '5px', color: '#806050'
      }).setOrigin(0.5).setDepth(6);

      // Talk bubble hint
      const bubble = this.add.text(c.x, c.y - 26, '💬', {
        fontFamily: 'monospace', fontSize: '8px'
      }).setOrigin(0.5).setDepth(7).setAlpha(0.7);

      // Interactivity
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this._talkTo(c));
      sprite.on('pointerover', () => { bubble.setAlpha(1); sprite.setScale(2.8); });
      sprite.on('pointerout',  () => { bubble.setAlpha(0.7); sprite.setScale(2.5); });
    });
  }

  _talkTo(charData) {
    if (this._dialogue.isActive) return;
    this._talked.add(charData.id);
    const indicator = this._talkIndicators[charData.id];
    if (indicator) indicator.setFillStyle(0xc8a030);

    const tree = this._getDialogueTree(charData.id);
    this._dialogue.start(tree, () => {
      SaveSystem.save(this.gameState);
    });
  }

  _getDialogueTree(id) {
    const gs = this.gameState;
    const phase = this.phase;
    const loyalty = gs.relationships.loyalty;
    const trust   = gs.relationships.trust;
    const bond    = gs.relationships.bond;

    const trees = {
      ryder: {
        pre_gig: {
          nodes: [
            { id: 'root', speaker: 'Ryder Blaze', text: loyalty > 60
              ? "I've been writing a new bridge for the set. Tell me honestly — should we play it tonight?"
              : "I'm just going to play the set. No changes. Don't try to add anything last minute.",
              choices: [
                { label: "Play the new bridge — risk it.", effects: { ryder_loyalty: +8, fame: +50 }, next: 'ryder_yes' },
                { label: "Stick to what we know.", effects: {}, next: 'ryder_safe' },
              ]},
            { id: 'ryder_yes', speaker: 'Ryder Blaze', text: "Alright. After the third song. Follow my lead and don't look confused." },
            { id: 'ryder_safe', speaker: 'Ryder Blaze', text: "Smart. We nail the basics before we try to be clever." },
          ]
        },
        post_gig: {
          nodes: [
            { id: 'root', speaker: 'Ryder Blaze', text: gs.flags?.last_concert_score > 0.8
              ? "THAT. Was. PERFECT. I don't care what the blogger says. I felt it."
              : "We had the crowd for 30 seconds and then lost them. We need to talk about the pacing.",
              choices: [
                { label: "You're right. We'll fix it next city.", effects: { ryder_loyalty: +5 } },
                { label: "The crowd loved it, you just couldn't see from your side.", effects: { ryder_loyalty: -5, reputation: +5 } },
              ]},
          ]
        },
      },
      nova: {
        pre_gig: {
          nodes: [
            { id: 'root', speaker: 'Nova Wilde', text: trust > 60
              ? "I got a journalist coming tonight. I need you to be charming, not just loud. Can you do that?"
              : "Just don't make any statements about the label stuff tonight. Please.",
              choices: [
                { label: "I'll be charming. Promise.", effects: { nova_trust: +6 }, next: 'nova_yes' },
                { label: "What label stuff?", effects: { nova_trust: -8, flag: 'nova_secret_grows' }, next: 'nova_deflect' },
                { label: "[Hustler] Is this journalist paid coverage?", requires_trait: 'hustler', effects: { nova_trust: +3, money: 100 }, next: 'nova_hustler_pre' },
              ]},
            { id: 'nova_yes', speaker: 'Nova Wilde', text: "Good. Now go tune your instrument. You look like you've been sleeping in those clothes." },
            { id: 'nova_deflect', speaker: 'Nova Wilde', text: "Nothing. Forget I said it. Just... trust me." },
            { id: 'nova_hustler_pre', speaker: 'Nova Wilde', text: "...I already negotiated it. Yes. You're welcome." },
          ]
        },
        post_gig: {
          nodes: [
            { id: 'root', speaker: 'Nova Wilde', text: "The journalist loved the show. She's writing the piece. But she asked me something weird — she asked who actually runs this band." },
          ]
        },
      },
      jet: {
        pre_gig: {
          nodes: [
            { id: 'root', speaker: 'Jet', text: bond > 60
              ? "I found this old cassette at the merch table of the last place. Listen to this drum fill. This is what I want to do in the show tonight."
              : "I've been thinking. What happens if this doesn't work out? Like, what do we actually do.",
              choices: [
                { label: "We don't think about that. We just play.", effects: { jet_bond: +5 } },
                { label: "Then we go home and figure it out.", effects: { jet_bond: -3, reputation: +5 } },
                { label: "[Visionary] It'll work. I believe in this.", requires_trait: 'visionary', effects: { jet_bond: +10 }, next: 'jet_inspire' },
              ]},
            { id: 'jet_inspire', speaker: 'Jet', text: "...Okay. Okay. Yeah. Let's do this." },
          ]
        },
        post_gig: {
          nodes: [
            { id: 'root', speaker: 'Jet', text: "Hey. That guy at the back? He's connected to some people. I'm going to take a walk. Cover for me?" },
          ]
        },
      },
    };

    return trees[id]?.[phase] || { nodes: [{ id: 'root', speaker: id, text: '...' }] };
  }

  _advance() {
    if (this._dialogue.isActive) return;
    try { this.sound.stopAll(); } catch(_) {}
    SaveSystem.save(this.gameState);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (this.phase === 'pre_gig') {
        this.scene.start('CityHub', { gameState: this.gameState });
      } else {
        this.scene.start('RoadTrip', { gameState: this.gameState });
      }
    });
  }

  _buildHUD(W) {
    this.add.text(4, 4, `$${this.gameState.money}`, {
      fontFamily: 'monospace', fontSize: '6px', color: '#60c060'
    }).setDepth(20);
    this.add.text(W - 4, 4, `★ ${this.gameState.fame}`, {
      fontFamily: 'monospace', fontSize: '6px', color: '#e8d080'
    }).setOrigin(1, 0).setDepth(20);
  }
}
