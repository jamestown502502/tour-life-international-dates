/**
 * CityHub — top-down 2D exploration scene
 * Player can walk around, talk to NPCs, enter venue, or go to Tour Bus
 */
import { DialogueSystem } from '../systems/DialogueSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { getCityById } from '../data/cities.js';

const TILE = 32;
const SPEED = 80;

// Tilemap layout for each venue type (0=floor, 1=wall, 2=bar/counter, 3=stool, 4=stage, 5=amp, 6=mic, 7=light, 8=exit)
const DIVEBAR_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,3,0,3,0,0,0,0,0,0,5,0,5,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,2,2,2,2,0,0,0,0,0,4,4,4,1],
  [1,0,0,0,0,0,0,0,7,0,7,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,6,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,8,1,1,1,1,1,1,1],
];

export class CityHub extends Phaser.Scene {
  constructor() { super('CityHub'); }

  init(data) {
    this.gameState = data.gameState;
    this.city = getCityById(this.gameState.currentCityId || 'seattle');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._dialogue = new DialogueSystem(this, this.gameState);

    // ── BUILD TILEMAP ─────────────────────────────────────────────────
    this._buildTilemap();

    // ── PLAYER ────────────────────────────────────────────────────────
    const startX = 7 * TILE + TILE/2;
    const startY = 6 * TILE + TILE/2;
    try {
      this._player = this.physics.add.sprite(startX, startY, this.gameState.player.trait === 'visionary' ? 'player_visionary' : 'player_visionary', 0)
        .setScale(1.5)
        .setDepth(10);
    } catch(e) {
      this._player = this.physics.add.rectangle(startX, startY, 16, 24, 0xe8d080).setDepth(10);
    }
    this._player.setCollideWorldBounds(true);

    // Collide with wall tiles
    if (this._wallGroup) {
      this.physics.add.collider(this._player, this._wallGroup);
    }

    // ── BANDMATE NPCS ────────────────────────────────────────────────
    this._npcs = [];
    this._spawnBandmates();
    this._spawnCityNPCs();

    // ── INPUT ────────────────────────────────────────────────────────
    this._cursors = this.input.keyboard?.createCursorKeys();
    this._wasd = this.input.keyboard?.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });

    // Touch / click to move
    this.input.on('pointerdown', (ptr) => this._handleTap(ptr));

    // ── HUD ───────────────────────────────────────────────────────────
    this._buildHUD();

    // ── CAMERA ───────────────────────────────────────────────────────
    const mapW = DIVEBAR_MAP[0].length * TILE;
    const mapH = DIVEBAR_MAP.length * TILE;
    this.cameras.main.setBounds(0, 0, mapW, mapH);
    this.cameras.main.startFollow(this._player, true, 0.1, 0.1);

    // ── AMBIENT AUDIO ────────────────────────────────────────────────
    try {
      this.sound.play('crowd_divebar', { loop: true, volume: 0.25 });
    } catch(_) {}

    this.cameras.main.fadeIn(300);

    // ── TUTORIAL HINT (first city only) ─────────────────────────────
    if (!this.gameState.flags?.seen_hub_tutorial) {
      this.gameState.flags.seen_hub_tutorial = true;
      this.time.delayedCall(600, () => {
        this._showHint('Walk to the STAGE to start your gig.\nWalk to the EXIT to get back on the bus.');
      });
    }
  }

  _buildTilemap() {
    this._wallGroup = this.physics.add.staticGroup();
    const map = DIVEBAR_MAP;
    map.forEach((row, ry) => {
      row.forEach((tile, rx) => {
        const x = rx * TILE;
        const y = ry * TILE;
        const frameIdx = tile;
        try {
          const t = this.add.image(x + TILE/2, y + TILE/2, 'env_divebar', frameIdx).setDepth(1);
          if (tile === 1) { // Wall
            const wall = this._wallGroup.create(x + TILE/2, y + TILE/2, null).setVisible(false);
            wall.setSize(TILE, TILE);
          }
          if (tile === 4) { // Stage — interactive
            t.setInteractive({ useHandCursor: true });
            t.on('pointerdown', () => this._enterVenue());
          }
          if (tile === 8) { // Exit — interactive
            t.setInteractive({ useHandCursor: true });
            t.on('pointerdown', () => this._exitToTourBus());
          }
        } catch(e) {
          // Fallback color blocks during dev
          const colors = [0x503020,0x302010,0x402015,0x201008,0x604030,0x302018,0x503828,0x705040,0x181010];
          this.add.rectangle(x + TILE/2, y + TILE/2, TILE-1, TILE-1, colors[tile] || 0x303030).setDepth(1);
        }
      });
    });
  }

  _spawnBandmates() {
    const bandmates = [
      { key: 'ryder', x: 4 * TILE + TILE/2, y: 3 * TILE + TILE/2, color: 0xc03030, stat: 'loyalty' },
      { key: 'nova',  x: 9 * TILE + TILE/2, y: 3 * TILE + TILE/2, color: 0xc8a030, stat: 'trust' },
      { key: 'jet',   x: 6 * TILE + TILE/2, y: 5 * TILE + TILE/2, color: 0x3070c0, stat: 'bond' },
    ];
    bandmates.forEach(b => {
      try {
        const s = this.add.sprite(b.x, b.y, b.key, 0).setScale(1.5).setDepth(8).setTint(b.color);
        s.setInteractive({ useHandCursor: true });
        s.on('pointerdown', () => this._talkToBandmate(b.key));
        this._npcs.push({ sprite: s, ...b });
      } catch(e) {
        const rect = this.add.rectangle(b.x, b.y, 20, 24, b.color).setDepth(8).setInteractive();
        rect.on('pointerdown', () => this._talkToBandmate(b.key));
        this._npcs.push({ sprite: rect, ...b });
      }
    });
  }

  _spawnCityNPCs() {
    const npcs = this.city?.npcDialogues || [];
    const positions = [{ x: 2*TILE+TILE/2, y: 2*TILE+TILE/2 }, { x: 12*TILE+TILE/2, y: 2*TILE+TILE/2 }, { x: 11*TILE+TILE/2, y: 5*TILE+TILE/2 }];
    npcs.forEach((npc, i) => {
      const pos = positions[i] || { x: 3*TILE, y: 3*TILE };
      const rect = this.add.rectangle(pos.x, pos.y, 18, 22, 0x706050).setDepth(8).setInteractive();
      const label = this.add.text(pos.x, pos.y - 16, npc.name, {
        fontFamily: 'monospace', fontSize: '5px', color: '#a09080'
      }).setOrigin(0.5).setDepth(9);
      rect.on('pointerdown', () => {
        if (!this._dialogue.isActive) {
          this._dialogue.start({
            nodes: [{ id: 'root', speaker: npc.name, text: npc.text }]
          });
        }
      });
    });
  }

  _talkToBandmate(key) {
    if (this._dialogue.isActive) return;
    const { BANDMATE_DIALOGUES } = this._getBandmateDialogues();
    const tree = BANDMATE_DIALOGUES[key] || { nodes: [{ id: 'root', speaker: key, text: '...' }] };
    this._dialogue.start(tree);
  }

  _getBandmateDialogues() {
    const gs = this.gameState;
    const BANDMATE_DIALOGUES = {
      ryder: {
        nodes: [
          { id: 'root', speaker: 'Ryder Blaze', text: gs.relationships.loyalty > 60
            ? "You ready for tonight? I've been warming up for two hours. This crowd won't know what hit 'em."
            : "Look. I just need you to know the set list. Don't wing it like last time.",
            choices: [
              { label: 'Let\'s give them everything.', effects: { ryder_loyalty: +5 }, next: 'ryder_hype' },
              { label: 'Just stay focused tonight.', effects: {}, next: 'ryder_cool' },
              { label: '[Rebel] We should change the opener.', requires_trait: 'rebel', effects: { ryder_loyalty: -5, fame: +20 }, next: 'ryder_rebel' },
            ]},
          { id: 'ryder_hype', speaker: 'Ryder Blaze', text: "YEAH! That's what I'm saying! Let's burn this place DOWN." },
          { id: 'ryder_cool', speaker: 'Ryder Blaze', text: "...Fine. I'll keep it tight. But if Nova tries to cut my solo AGAIN—" },
          { id: 'ryder_rebel', speaker: 'Ryder Blaze', text: "Finally. I've been saying this for weeks. What did you have in mind?" },
        ]
      },
      nova: {
        nodes: [
          { id: 'root', speaker: 'Nova Wilde', text: gs.relationships.trust > 60
            ? "I just got off the phone with a blogger — she's doing a piece on underground acts. If tonight goes well, we could be in it."
            : "I need you to let me handle the post-show press. Don't just... wander off like last time.",
            choices: [
              { label: 'You handle the press, I handle the music.', effects: { nova_trust: +5 }, next: 'nova_agree' },
              { label: '[Hustler] How do we monetize that coverage?', requires_trait: 'hustler', effects: { nova_trust: +8, money: 50 }, next: 'nova_hustler' },
              { label: 'Who were you really calling?', effects: { nova_trust: -5, flag: 'nova_confronted' }, next: 'nova_confront' },
            ]},
          { id: 'nova_agree', speaker: 'Nova Wilde', text: "Good. That's the deal. You focus on the music, I handle the narrative. We both win." },
          { id: 'nova_hustler', speaker: 'Nova Wilde', text: "I like how you think. I'm already negotiating a merch deal. Don't worry about it." },
          { id: 'nova_confront', speaker: 'Nova Wilde', text: "...It was a personal call. Drop it." },
        ]
      },
      jet: {
        nodes: [
          { id: 'root', speaker: 'Jet', text: gs.relationships.bond > 60
            ? "Yo, I know a place after the show. Back-alley session. Legendary drum circle. You in?"
            : "I'm fine. Just... got some stuff on my mind. Don't read into it.",
            choices: [
              { label: 'I\'m in. Let\'s go.', effects: { jet_bond: +8 }, next: 'jet_yes' },
              { label: 'After the show. Focus now.', effects: {}, next: 'jet_focus' },
              { label: '[Visionary] What\'s really going on with you?', requires_trait: 'visionary', effects: { jet_bond: +12 }, next: 'jet_honest' },
            ]},
          { id: 'jet_yes', speaker: 'Jet', text: "Bro. YES. Okay. You're cool. You're actually cool." },
          { id: 'jet_focus', speaker: 'Jet', text: "...Yeah. Yeah okay. I'm good." },
          { id: 'jet_honest', speaker: 'Jet', text: "...It's the debt thing. I didn't want you involved. But... yeah. It's getting real. Thanks for asking, man." },
        ]
      },
    };
    return { BANDMATE_DIALOGUES };
  }

  _enterVenue() {
    if (this._dialogue.isActive) return;
    try { this.sound.stopAll(); } catch(_) {}
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Concert', {
        gameState: this.gameState,
        cityId: this.gameState.currentCityId || 'seattle',
      });
    });
  }

  _exitToTourBus() {
    if (this._dialogue.isActive) return;
    try { this.sound.stopAll(); } catch(_) {}
    SaveSystem.save(this.gameState);
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TourBus', {
        gameState: this.gameState,
        cityId: this.gameState.currentCityId || 'seattle',
        phase: 'pre_gig',
      });
    });
  }

  _buildHUD() {
    const W = this.scale.width;
    // Sticky HUD (fixed camera)
    const hud = this.add.container(0, 0).setDepth(50).setScrollFactor(0);

    const hudBg = this.add.rectangle(0, 0, W, 16, 0x0a0510, 0.85).setOrigin(0, 0);
    const cityName = this.add.text(4, 3, (this.city?.name || 'CITY').toUpperCase(), {
      fontFamily: 'monospace', fontSize: '6px', color: '#c8a030', letterSpacing: 2,
    });
    const fameText = this.add.text(W - 4, 3, `★ ${this.gameState.fame}`, {
      fontFamily: 'monospace', fontSize: '6px', color: '#e8d080',
    }).setOrigin(1, 0);
    const moneyText = this.add.text(W - 60, 3, `$${this.gameState.money}`, {
      fontFamily: 'monospace', fontSize: '6px', color: '#60c060',
    }).setOrigin(0, 0);

    hud.add([hudBg, cityName, fameText, moneyText]);

    // Relationship dots
    const rels = [
      { color: 0xc03030, val: this.gameState.relationships.loyalty },
      { color: 0xc8a030, val: this.gameState.relationships.trust },
      { color: 0x3070c0, val: this.gameState.relationships.bond },
    ];
    rels.forEach((r, i) => {
      const dot = this.add.circle(W * 0.45 + i * 14, 8, 4, r.color, r.val / 100);
      dot.setScrollFactor(0).setDepth(51);
      hud.add(dot);
    });
  }

  _showHint(msg) {
    const W = this.scale.width;
    const H = this.scale.height;
    const hint = this.add.text(W/2, H - 30, msg, {
      fontFamily: 'monospace', fontSize: '6px', color: '#c8a030',
      backgroundColor: '#0a0510cc', padding: { x: 6, y: 4 },
      align: 'center',
    }).setOrigin(0.5).setDepth(60).setScrollFactor(0);
    this.time.delayedCall(4000, () => {
      this.tweens.add({ targets: hint, alpha: 0, duration: 600, onComplete: () => hint.destroy() });
    });
  }

  update() {
    if (this._dialogue.isActive) {
      if (this._player.body) this._player.body.setVelocity(0, 0);
      return;
    }

    const speed = SPEED;
    let vx = 0, vy = 0;

    const cur = this._cursors;
    const wasd = this._wasd;

    if (cur?.left.isDown  || wasd?.left.isDown)  vx = -speed;
    if (cur?.right.isDown || wasd?.right.isDown) vx = +speed;
    if (cur?.up.isDown    || wasd?.up.isDown)    vy = -speed;
    if (cur?.down.isDown  || wasd?.down.isDown)  vy = +speed;

    if (this._player.body) {
      this._player.body.setVelocity(vx, vy);
      if (Math.abs(vx) + Math.abs(vy) > 0) {
        try { this._player.anims.play(this.gameState.player.trait + '_visionary_walk', true); } catch(_) {}
      } else {
        try { this._player.anims.stop(); } catch(_) {}
      }
    }

    // Proximity check — auto-prompt when near venue entrance or exit
    if (this._player.x > 7*TILE && this._player.x < 8*TILE && this._player.y > 7*TILE) {
      this._showHint('[TAP STAGE] to start your gig');
    }
  }

  _handleTap(ptr) {
    // Tap anywhere to set move target (simple click-to-move)
    this._moveTarget = { x: ptr.worldX, y: ptr.worldY };
  }
}
