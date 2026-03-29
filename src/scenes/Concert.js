/**
 * Concert — Rhythm minigame scene
 * 4 lanes (Guitar/Bass/Keys/Drums), falling notes synced to beatmap JSON
 * Input: keyboard (D F G J) + touch tap zones
 */
import { getCityById } from '../data/cities.js';
import { RelationshipTracker } from '../systems/RelationshipTracker.js';

const LANES = 4;
const LANE_KEYS = ['D', 'F', 'G', 'J'];
const LANE_COLORS = [0xc03030, 0x3060c0, 0xc8a030, 0x30a040];
const LANE_LABELS = ['GUITAR', 'BASS', 'KEYS', 'DRUMS'];
const NOTE_SPEED = 180;   // px/sec — notes fall downward
const HIT_ZONE_Y_RATIO = 0.80; // hit zone at 80% of canvas height

export class Concert extends Phaser.Scene {
  constructor() { super('Concert'); }

  init(data) {
    this.gameState = data.gameState;
    this.city = getCityById(data.cityId || 'seattle');
    this._tracker = new RelationshipTracker(this.gameState);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.W = W;
    this.H = H;

    // ── STATE ──────────────────────────────────────────────────────
    this._score = 0;
    this._combo = 0;
    this._maxCombo = 0;
    this._notesPerfect = 0;
    this._notesGood = 0;
    this._notesOk = 0;
    this._notesMissed = 0;
    this._crowdEnergy = 50;      // 0–100
    this._powerUp = null;
    this._powerUpTimer = 0;
    this._gameStarted = false;
    this._gameOver = false;
    this._activeNotes = [];      // live note GameObjects
    this._notePool = [];         // object pool
    this._pendingNotes = [];     // from beatmap, sorted by time

    // Layout
    const laneW = Math.floor(W * 0.7 / LANES);
    const laneStartX = W * 0.15;
    this._laneX = Array.from({ length: LANES }, (_, i) => laneStartX + i * laneW + laneW / 2);
    this._hitZoneY = H * HIT_ZONE_Y_RATIO;

    // ── BACKGROUND ────────────────────────────────────────────────
    this.add.rectangle(0, 0, W, H, 0x06030f).setOrigin(0, 0);

    // Stage glow lines
    for (let i = 0; i < LANES; i++) {
      this.add.rectangle(this._laneX[i], H / 2, laneW - 2, H, LANE_COLORS[i], 0.03).setOrigin(0.5);
    }

    // Lane separators
    for (let i = 0; i <= LANES; i++) {
      this.add.rectangle(laneStartX + i * laneW, 0, 1, H, 0x2a1a3a).setOrigin(0, 0);
    }

    // ── HIT ZONES ──────────────────────────────────────────────────
    this._hitZoneRings = LANE_COLORS.map((color, i) => {
      const ring = this.add.circle(this._laneX[i], this._hitZoneY, laneW * 0.35, color, 0.2);
      this.add.circle(this._laneX[i], this._hitZoneY, laneW * 0.35, 0, 0)
        .setStrokeStyle(2, color, 0.8);
      return ring;
    });

    // Lane labels
    LANE_LABELS.forEach((label, i) => {
      this.add.text(this._laneX[i], this._hitZoneY + 22, label, {
        fontFamily: 'monospace', fontSize: '5px', color: '#604050', letterSpacing: 1,
      }).setOrigin(0.5);
    });

    // ── KEYBOARD ───────────────────────────────────────────────────
    this._keys = LANE_KEYS.map(k => this.input.keyboard?.addKey(k));
    this._keysDown = new Array(LANES).fill(false);

    // ── TOUCH ZONES ────────────────────────────────────────────────
    for (let i = 0; i < LANES; i++) {
      const zone = this.add.rectangle(this._laneX[i], this._hitZoneY, laneW - 4, 50, 0xffffff, 0)
        .setInteractive({ useHandCursor: false });
      zone.on('pointerdown', () => this._hitLane(i));
    }
    // Also: global touch — map x position to lane
    this.input.on('pointerdown', (ptr) => {
      const lane = this._xToLane(ptr.x);
      if (lane >= 0) this._hitLane(lane);
    });

    // ── HUD ────────────────────────────────────────────────────────
    this._buildHUD(W, H);

    // ── LOAD BEATMAP & START ───────────────────────────────────────
    const beatmapKey = this.city?.beatmap || 'beatmap_seattle';
    const beatmap = this.cache.json.get(beatmapKey);
    if (beatmap) {
      this._pendingNotes = [...beatmap.notes];
      this._timingWindows = beatmap.timing_windows || { perfect: 50, good: 100, ok: 150 };
      this._scoreValues = beatmap.score_multipliers || { perfect: 300, good: 150, ok: 50, miss: 0 };
    } else {
      // Fallback: generate basic notes
      this._pendingNotes = this._generateFallbackNotes();
      this._timingWindows = { perfect: 55, good: 105, ok: 155 };
      this._scoreValues = { perfect: 300, good: 150, ok: 50, miss: 0 };
    }
    this._totalNotes = this._pendingNotes.length;
    this._noteEndTime = this._pendingNotes[this._pendingNotes.length - 1]?.time || 60000;

    // Check for power-up
    const powerUpKey = this._tracker.getActivePowerUp();
    if (powerUpKey) this._activatePowerUp(powerUpKey);

    // Countdown then start
    this._showCountdown(() => this._startConcert());
  }

  _startConcert() {
    this._gameStarted = true;
    this._startTime = this.time.now;

    // Start music
    try {
      const musicKey = this.city?.music || 'seattle_punk';
      this._music = this.sound.add(musicKey, { loop: false, volume: 0.6 });
      this._music.play();
    } catch(_) {}
  }

  // ── UPDATE LOOP ─────────────────────────────────────────────────

  update(time, delta) {
    if (!this._gameStarted || this._gameOver) return;

    const elapsed = time - this._startTime; // ms since song started

    // Spawn pending notes
    const lookahead = (NOTE_SPEED / 1) * (this._hitZoneY / NOTE_SPEED) * 1000 + 300;
    while (this._pendingNotes.length > 0 && this._pendingNotes[0].time <= elapsed + lookahead) {
      const noteData = this._pendingNotes.shift();
      this._spawnNote(noteData, elapsed);
    }

    // Move active notes
    const laneW = Math.floor(this.W * 0.7 / LANES);
    for (let i = this._activeNotes.length - 1; i >= 0; i--) {
      const n = this._activeNotes[i];
      const noteElapsedMs = elapsed - n.spawnElapsed;
      const progress = noteElapsedMs / n.travelTimeMs;
      n.obj.y = Phaser.Math.Linear(-10, this._hitZoneY, progress);

      // Miss check: note passed hit zone
      if (n.obj.y > this._hitZoneY + 40 && !n.hit) {
        this._registerMiss(n.lane);
        this._removeNote(i);
      }
    }

    // Keyboard input
    this._keys?.forEach((key, lane) => {
      if (!key) return;
      const isDown = key.isDown;
      if (isDown && !this._keysDown[lane]) {
        this._keysDown[lane] = true;
        this._hitLane(lane);
      }
      if (!isDown) this._keysDown[lane] = false;
    });

    // Power-up countdown
    if (this._powerUpTimer > 0) {
      this._powerUpTimer -= delta;
      if (this._powerUpTimer <= 0) this._deactivatePowerUp();
    }

    // End check
    if (elapsed > this._noteEndTime + 2000 && this._pendingNotes.length === 0 && this._activeNotes.length === 0) {
      this._endConcert();
    }
  }

  // ── NOTE MANAGEMENT ─────────────────────────────────────────────

  _spawnNote(noteData, currentElapsed) {
    const x = this._laneX[noteData.lane];
    const laneW = Math.floor(this.W * 0.7 / LANES);
    const travelTimeMs = (this._hitZoneY / NOTE_SPEED) * 1000;

    // Get from pool or create
    let obj;
    const pooled = this._notePool.pop();
    if (pooled) {
      obj = pooled;
      obj.setActive(true).setVisible(true);
    } else {
      obj = this.add.rectangle(x, -10, laneW * 0.7, 10, LANE_COLORS[noteData.lane]);
      obj.setStrokeStyle(1, 0xffffff, 0.3);
    }
    obj.x = x;
    obj.y = -10;
    obj.setFillStyle(LANE_COLORS[noteData.lane]);

    this._activeNotes.push({
      obj,
      lane: noteData.lane,
      time: noteData.time,
      spawnElapsed: currentElapsed,
      travelTimeMs,
      hit: false,
    });
  }

  _removeNote(index) {
    const n = this._activeNotes[index];
    n.obj.setActive(false).setVisible(false);
    this._notePool.push(n.obj);
    this._activeNotes.splice(index, 1);
  }

  // ── INPUT / SCORING ─────────────────────────────────────────────

  _hitLane(lane) {
    if (!this._gameStarted || this._gameOver) return;
    // Flash hit zone
    this._hitZoneRings[lane].setAlpha(0.8);
    this.time.delayedCall(80, () => this._hitZoneRings[lane].setAlpha(0.2));

    const elapsed = this.time.now - this._startTime;

    // Find closest note in this lane
    let closest = null;
    let closestIdx = -1;
    let closestDelta = Infinity;
    this._activeNotes.forEach((n, i) => {
      if (n.hit || n.lane !== lane) return;
      const noteElapsed = elapsed - n.spawnElapsed;
      const noteY = Phaser.Math.Linear(-10, this._hitZoneY, noteElapsed / n.travelTimeMs);
      const delta = Math.abs(noteY - this._hitZoneY);
      // Convert pixel delta to time delta
      const timeDelta = (delta / NOTE_SPEED) * 1000;
      if (timeDelta < closestDelta) {
        closestDelta = timeDelta;
        closest = n;
        closestIdx = i;
      }
    });

    if (!closest) return; // no note to hit

    const tw = this._timingWindows;
    let rating;
    if (closestDelta <= tw.perfect) rating = 'perfect';
    else if (closestDelta <= tw.good) rating = 'good';
    else if (closestDelta <= tw.ok)   rating = 'ok';
    else return; // too far

    this._registerHit(rating, closest.lane, closestIdx);
  }

  _xToLane(x) {
    const laneW = Math.floor(this.W * 0.7 / LANES);
    const laneStart = this.W * 0.15;
    const i = Math.floor((x - laneStart) / laneW);
    return (i >= 0 && i < LANES) ? i : -1;
  }

  _registerHit(rating, lane, noteIndex) {
    const multiplier = this._powerUp === 'ryders_riff' ? 2 : 1;
    const points = (this._scoreValues[rating] || 0) * multiplier;
    this._score += points;
    this._combo++;
    this._maxCombo = Math.max(this._maxCombo, this._combo);
    this._crowdEnergy = Math.min(100, this._crowdEnergy + (rating === 'perfect' ? 3 : rating === 'good' ? 1.5 : 0.5));

    // Stats
    if (rating === 'perfect') this._notesPerfect++;
    else if (rating === 'good') this._notesGood++;
    else this._notesOk++;

    this._removeNote(noteIndex);

    // Visual feedback
    this._showHitFeedback(rating, this._laneX[lane]);
    try {
      this.sound.play(rating === 'perfect' ? 'note_perfect' : 'note_good', { volume: 0.5 });
    } catch(_) {}

    this._updateHUD();
  }

  _registerMiss(lane) {
    this._combo = 0;
    this._notesMissed++;
    this._crowdEnergy = Math.max(0, this._crowdEnergy - 4);
    if (this._powerUp !== 'nova_spotlight') {
      // nova_spotlight shields misses
    }
    this._updateHUD();
    this._showHitFeedback('miss', this._laneX[lane]);
    try { this.sound.play('note_miss', { volume: 0.4 }); } catch(_) {}
  }

  // ── VISUAL FEEDBACK ─────────────────────────────────────────────

  _showHitFeedback(rating, x) {
    const colors = { perfect: '#ffdd44', good: '#44aaff', ok: '#aa7722', miss: '#cc2222' };
    const labels = { perfect: 'PERFECT', good: 'GOOD', ok: 'OK', miss: 'MISS' };
    const txt = this.add.text(x, this._hitZoneY - 20, labels[rating], {
      fontFamily: 'monospace',
      fontSize: rating === 'perfect' ? '10px' : '7px',
      color: colors[rating],
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: txt, y: txt.y - 24, alpha: 0, duration: 500,
      onComplete: () => txt.destroy(),
    });

    if (rating === 'perfect') {
      this.cameras.main.shake(60, 0.003);
    }
  }

  // ── POWER-UPS ──────────────────────────────────────────────────

  _activatePowerUp(key) {
    this._powerUp = key;
    const durations = { ryders_riff: 10000, nova_spotlight: 15000, jets_groove: 8000 };
    this._powerUpTimer = durations[key] || 10000;

    if (key === 'jets_groove') {
      // Slow-mo: halve note speed
      // Implementation: double travelTime for pending notes
    }
    try { this.sound.play('power_up', { volume: 0.6 }); } catch(_) {}
    this._powerUpLabel?.setText(key.replace('_', "'s ").toUpperCase());
  }

  _deactivatePowerUp() {
    this._powerUp = null;
    this._powerUpTimer = 0;
    this._powerUpLabel?.setText('');
  }

  // ── HUD ────────────────────────────────────────────────────────

  _buildHUD(W, H) {
    // Score
    this._scoreTxt = this.add.text(4, 4, 'SCORE: 0', {
      fontFamily: 'monospace', fontSize: '7px', color: '#e8d080'
    }).setDepth(30);

    // Combo
    this._comboTxt = this.add.text(4, 14, '', {
      fontFamily: 'monospace', fontSize: '7px', color: '#c8a030'
    }).setDepth(30);

    // Crowd energy bar
    this.add.text(W - 4, 4, 'CROWD', {
      fontFamily: 'monospace', fontSize: '5px', color: '#806050'
    }).setOrigin(1, 0).setDepth(30);
    this._energyBarBg = this.add.rectangle(W - 4, 12, 60, 5, 0x2a1a3a).setOrigin(1, 0).setDepth(30);
    this._energyBar   = this.add.rectangle(W - 4, 12, 30, 5, 0xc84040).setOrigin(1, 0).setDepth(30);

    // City / genre label
    this.add.text(W/2, 4, (this.city?.name || '').toUpperCase() + ' — ' + (this.city?.genre || ''), {
      fontFamily: 'monospace', fontSize: '6px', color: '#6a4a6a', letterSpacing: 2
    }).setOrigin(0.5, 0).setDepth(30);

    // Power-up label
    this._powerUpLabel = this.add.text(W/2, H * 0.15, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffee44', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(30);
  }

  _updateHUD() {
    this._scoreTxt.setText(`SCORE: ${this._score.toLocaleString()}`);
    this._comboTxt.setText(this._combo > 1 ? `×${this._combo} COMBO` : '');
    const energyPct = this._crowdEnergy / 100;
    this._energyBar.width = 60 * energyPct;
    const energyColor = energyPct > 0.7 ? 0x30c040 : energyPct > 0.4 ? 0xc8a030 : 0xc84040;
    this._energyBar.setFillStyle(energyColor);
  }

  // ── COUNTDOWN ──────────────────────────────────────────────────

  _showCountdown(cb) {
    const W = this.W, H = this.H;
    let count = 3;
    const countTxt = this.add.text(W/2, H/2, `${count}`, {
      fontFamily: 'monospace', fontSize: '48px', color: '#e8d080',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(50);

    const tick = () => {
      if (count > 0) {
        countTxt.setText(count === 1 ? 'GO!' : `${count}`);
        countTxt.setScale(1.5);
        this.tweens.add({ targets: countTxt, scaleX: 1, scaleY: 1, alpha: count > 1 ? 1 : 0, duration: 800 });
        try { this.sound.play('ui_click', { volume: 0.5 }); } catch(_) {}
        count--;
        this.time.delayedCall(800, tick);
      } else {
        countTxt.destroy();
        cb();
      }
    };
    this.time.delayedCall(400, tick);
  }

  // ── END CONCERT ─────────────────────────────────────────────────

  _endConcert() {
    if (this._gameOver) return;
    this._gameOver = true;
    try { this._music?.stop(); } catch(_) {}
    try { this.sound.play(this._crowdEnergy > 50 ? 'crowd_cheer' : 'crowd_boo', { volume: 0.7 }); } catch(_) {}

    // Apply rewards to game state
    const totalNotes = this._notesPerfect + this._notesGood + this._notesOk + this._notesMissed;
    const accuracy = totalNotes > 0 ? (this._notesPerfect + this._notesGood) / totalNotes : 0;
    const scoreRatio = Math.min(1, this._score / (this._totalNotes * 300));

    const traitBonus = this.gameState.player?.trait === 'visionary' ? 1.1 : this.gameState.player?.trait === 'rebel' ? 1.2 : 1;
    const fameGain = Math.floor((this.city?.baseFameReward || 300) * scoreRatio * traitBonus);
    const moneyGain = Math.floor((this.city?.baseMoneyReward || 200) * accuracy);

    this.gameState.fame += fameGain;
    this.gameState.money += moneyGain;
    this.gameState.totalGigs = (this.gameState.totalGigs || 0) + 1;
    this.gameState.totalNotesPerfect = (this.gameState.totalNotesPerfect || 0) + this._notesPerfect;
    this.gameState.totalNotesMissed = (this.gameState.totalNotesMissed || 0) + this._notesMissed;
    this.gameState.flags.last_concert_score = scoreRatio;

    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Results', {
        gameState: this.gameState,
        cityId: this.city?.id,
        concertStats: {
          score: this._score,
          maxCombo: this._maxCombo,
          notesPerfect: this._notesPerfect,
          notesGood: this._notesGood,
          notesOk: this._notesOk,
          notesMissed: this._notesMissed,
          crowdEnergy: this._crowdEnergy,
          fameGain,
          moneyGain,
          accuracy,
        },
      });
    });
  }

  // ── FALLBACK NOTES ──────────────────────────────────────────────

  _generateFallbackNotes() {
    const notes = [];
    for (let t = 2000; t < 30000; t += 600) {
      notes.push({ id: notes.length, time: t, lane: notes.length % 4, type: 'tap', hold_duration: 0 });
    }
    return notes;
  }
}
