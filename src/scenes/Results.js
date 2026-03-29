/**
 * Results — post-concert breakdown screen
 * Shows score, accuracy, fame/money gains, and bandmate reactions
 */
import { RelationshipTracker } from '../systems/RelationshipTracker.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class Results extends Phaser.Scene {
  constructor() { super('Results'); }

  init(data) {
    this.gameState = data.gameState;
    this.cityId = data.cityId;
    this.stats = data.concertStats || {};
    this._tracker = new RelationshipTracker(this.gameState);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const stats = this.stats;

    // BG
    this.add.rectangle(0, 0, W, H, 0x06030f).setOrigin(0, 0);
    // Stage light wash
    this.add.rectangle(W/2, 0, W, H * 0.5, 0xc8a030, 0.05).setOrigin(0.5, 0);

    // Title
    this.add.text(W/2, 10, 'SHOW COMPLETE', {
      fontFamily: 'monospace', fontSize: '10px', color: '#c8a030', letterSpacing: 5
    }).setOrigin(0.5, 0);

    // Score block
    const scoreColor = stats.score > 50000 ? '#ffee44' : stats.score > 20000 ? '#c8a030' : '#a08050';
    this.add.text(W/2, 30, stats.score?.toLocaleString() || '0', {
      fontFamily: 'monospace', fontSize: '20px', color: scoreColor, stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 0).setAlpha(0);

    // Accuracy / grades
    const totalHit = (stats.notesPerfect || 0) + (stats.notesGood || 0) + (stats.notesOk || 0);
    const totalNotes = totalHit + (stats.notesMissed || 0);
    const accuracy = totalNotes > 0 ? Math.round((totalHit / totalNotes) * 100) : 0;
    const grade = accuracy >= 95 ? 'S' : accuracy >= 80 ? 'A' : accuracy >= 60 ? 'B' : accuracy >= 40 ? 'C' : 'D';

    // Animate score in
    this.time.delayedCall(200, () => {
      const scoreBlock = this.children.list.find(c => c.type === 'Text' && c.y === 30);
      if (scoreBlock) this.tweens.add({ targets: scoreBlock, alpha: 1, y: 28, duration: 500, ease: 'Back.Out' });
    });

    // Grade
    const gradeColors = { S: '#ffee44', A: '#c8a030', B: '#60a0c0', C: '#a08040', D: '#804030' };
    this.add.text(W * 0.82, 36, grade, {
      fontFamily: 'monospace', fontSize: '32px', color: gradeColors[grade] || '#aaaaaa',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    // Stats grid
    const rows = [
      ['PERFECT',  stats.notesPerfect || 0,  '#ffee44'],
      ['GOOD',     stats.notesGood || 0,     '#44aaff'],
      ['OK',       stats.notesOk || 0,       '#aa7722'],
      ['MISS',     stats.notesMissed || 0,   '#cc3333'],
      ['MAX COMBO',stats.maxCombo || 0,      '#c8a030'],
      ['ACCURACY', `${accuracy}%`,           '#60c060'],
    ];
    rows.forEach(([label, value, color], i) => {
      const y = 62 + i * 12;
      this.add.text(W * 0.15, y, label, { fontFamily: 'monospace', fontSize: '6px', color: '#806050' });
      this.add.text(W * 0.65, y, `${value}`, { fontFamily: 'monospace', fontSize: '6px', color }).setOrigin(0, 0);
    });

    // Separator
    this.add.rectangle(W/2, 138, W - 20, 1, 0x2a1a3a).setOrigin(0.5);

    // Gains
    this.add.text(W * 0.15, 144, `★ FAME  +${stats.fameGain || 0}`, { fontFamily: 'monospace', fontSize: '7px', color: '#e8d080' });
    this.add.text(W * 0.15, 156, `$ MONEY +${stats.moneyGain || 0}`, { fontFamily: 'monospace', fontSize: '7px', color: '#60c060' });
    this.add.text(W * 0.55, 144, `★ TOTAL: ${this.gameState.fame}`, { fontFamily: 'monospace', fontSize: '7px', color: '#c0a030' });

    // Crowd energy bar
    this.add.text(W/2, 170, 'CROWD ENERGY', { fontFamily: 'monospace', fontSize: '5px', color: '#806050', letterSpacing: 2 }).setOrigin(0.5);
    this.add.rectangle(W/2, 180, W * 0.7, 6, 0x2a1a3a).setOrigin(0.5);
    const energyPct = (stats.crowdEnergy || 50) / 100;
    this.add.rectangle(W * 0.15 + (W * 0.7 * energyPct / 2), 180, W * 0.7 * energyPct, 6,
      energyPct > 0.7 ? 0x30c040 : energyPct > 0.4 ? 0xc8a030 : 0xc84040).setOrigin(0.5);

    // Bandmate reactions
    this.add.text(W/2, 190, 'BAND REACTIONS', { fontFamily: 'monospace', fontSize: '5px', color: '#504040', letterSpacing: 2 }).setOrigin(0.5);
    const scoreRatio = stats.accuracy || 0;
    const maxScore = 999999;
    ['ryder', 'nova', 'jet'].forEach((char, i) => {
      const reaction = this._tracker.getPostGigReaction(char, scoreRatio * maxScore, maxScore);
      const colors = { ryder: '#c03030', nova: '#c8a030', jet: '#3070c0' };
      const y = 202 + i * 18;
      this.add.text(W * 0.12, y, char.toUpperCase() + ':', { fontFamily: 'monospace', fontSize: '5px', color: colors[char] });
      this.add.text(W * 0.30, y, `"${reaction}"`, {
        fontFamily: 'monospace', fontSize: '5px', color: '#908070',
        wordWrap: { width: W * 0.64 }, lineSpacing: 2
      });
    });

    // Continue button
    const continueBtn = this.add.text(W/2, H - 12, '▸  CONTINUE', {
      fontFamily: 'monospace', fontSize: '8px', color: '#c8a030', letterSpacing: 3,
      backgroundColor: '#0a0510', padding: { x: 8, y: 3 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerover', () => continueBtn.setColor('#ffee88'));
    continueBtn.on('pointerout',  () => continueBtn.setColor('#c8a030'));
    continueBtn.on('pointerdown', () => this._continue());

    // Apply relationship bonuses based on crowd energy
    if (energyPct > 0.7) {
      this._tracker.applyEffects({ ryder_loyalty: 5, nova_trust: 5, jet_bond: 5 });
    } else if (energyPct < 0.3) {
      this._tracker.applyEffects({ ryder_loyalty: -5, nova_trust: -5, jet_bond: -5 });
    }

    SaveSystem.save(this.gameState);
    this.cameras.main.fadeIn(400);
  }

  _continue() {
    try { this.sound.play('ui_click', { volume: 0.4 }); } catch(_) {}
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TourBus', {
        gameState: this.gameState,
        cityId: this.cityId,
        phase: 'post_gig',
      });
    });
  }
}
