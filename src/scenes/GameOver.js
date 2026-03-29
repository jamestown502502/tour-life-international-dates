/**
 * GameOver — handles both win endings and loss endings
 */
import { SaveSystem } from '../systems/SaveSystem.js';

const ENDINGS = {
  win: {
    title: 'YOU MADE IT.',
    subtitle: 'THE WORLD KNOWS YOUR NAME.',
    color: '#e8d080',
    body: "From a sticky-floored dive bar in Seattle to 80,000 people in Los Angeles.\nYou held the band together. You played every note.\nThis is what you came for.",
  },
  sellout: {
    title: 'FAME. FORTUNE. SILENCE.',
    subtitle: 'SIGNED. SEALED. SOLD.',
    color: '#c03030',
    body: "You signed the deal. The label owns your music now.\nThe money is real. The art is gone.\nHistory will remember you — just not the way you planned.",
  },
  indie_legend: {
    title: 'YOU WALKED AWAY.',
    subtitle: 'AND THAT\'S THE SONG THEY STILL PLAY.',
    color: '#60c080',
    body: "You turned down the deal. You kept the music yours.\nNo platinum records. No stadium residency.\nBut every night, somewhere, someone plays your record like it saved their life.",
  },
  compromise: {
    title: 'THE MIDDLE PATH.',
    subtitle: 'HALF OF EVERYTHING.',
    color: '#c8a030',
    body: "You negotiated. You kept some control.\nYou made some money. You gave some away.\nNot a victory. Not a surrender. A career.",
  },
  band_broke: {
    title: 'THE BAND IS OVER.',
    subtitle: 'SOME THINGS CAN\'T BE UNSAID.',
    color: '#804040',
    body: "Ryder left first. Nova followed.\nJet didn't say goodbye — just stopped showing up.\nYou were this close. But distance kills bands faster than failure.",
  },
  no_fame: {
    title: 'THE TOUR IS CANCELLED.',
    subtitle: 'NOT EVERY STORY HAS A STAGE.',
    color: '#606060',
    body: "The venues stopped calling. The fans moved on.\nIt happens to most bands.\nBut you played. That part was real.",
  },
};

export class GameOver extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.gameState = data.gameState;
    this.type = data.type || 'band_broke';
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const ending = ENDINGS[this.type] || ENDINGS.band_broke;

    // BG
    this.add.rectangle(0, 0, W, H, 0x050308).setOrigin(0, 0);

    // Subtle spotlight
    this.add.circle(W/2, H * 0.3, 120, 0xc8a030, 0.06);

    // Title
    const title = this.add.text(W/2, H * 0.18, ending.title, {
      fontFamily: 'monospace', fontSize: '12px', color: ending.color,
      stroke: '#000', strokeThickness: 3, letterSpacing: 3
    }).setOrigin(0.5).setAlpha(0);

    const sub = this.add.text(W/2, H * 0.18 + 18, ending.subtitle, {
      fontFamily: 'monospace', fontSize: '6px', color: '#706050', letterSpacing: 4
    }).setOrigin(0.5).setAlpha(0);

    // Body text (typewriter)
    const bodyText = this.add.text(W/2, H * 0.40, '', {
      fontFamily: 'monospace', fontSize: '6px', color: '#c0b090',
      wordWrap: { width: W - 40 }, lineSpacing: 4, align: 'center'
    }).setOrigin(0.5, 0).setAlpha(0);

    // Final stats
    const stats = [
      `CITIES PLAYED: ${(this.gameState.currentCityId ? ['seattle','newyork','london','tokyo','la'].indexOf(this.gameState.currentCityId) + 1 : 0)} / 5`,
      `TOTAL FAME: ${this.gameState.fame?.toLocaleString() || 0}`,
      `TOTAL GIGS: ${this.gameState.totalGigs || 0}`,
      `PERFECT NOTES: ${this.gameState.totalNotesPerfect || 0}`,
      `FINAL MONEY: $${this.gameState.money?.toLocaleString() || 0}`,
    ];
    const statsBlock = this.add.text(W/2, H * 0.64, stats.join('\n'), {
      fontFamily: 'monospace', fontSize: '6px', color: '#504040', lineSpacing: 4, align: 'center'
    }).setOrigin(0.5, 0).setAlpha(0);

    // Animate sequence
    this.tweens.add({ targets: title, alpha: 1, y: H * 0.16, duration: 800, delay: 300, ease: 'Power2' });
    this.tweens.add({ targets: sub,   alpha: 1, duration: 600, delay: 800 });
    this.tweens.add({ targets: bodyText, alpha: 1, duration: 400, delay: 1200, onComplete: () => {
      let i = 0;
      const full = ending.body;
      this.time.addEvent({ delay: 20, repeat: full.length - 1, callback: () => {
        i++; bodyText.setText(full.substring(0, i));
      }});
    }});
    this.tweens.add({ targets: statsBlock, alpha: 1, duration: 600, delay: 1200 + ending.body.length * 20 + 400 });

    // Play again / Main menu
    const playAgain = this.add.text(W/2 - 50, H - 16, 'PLAY AGAIN', {
      fontFamily: 'monospace', fontSize: '7px', color: '#c8a030', letterSpacing: 2,
      backgroundColor: '#1a0f10', padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const mainMenu = this.add.text(W/2 + 50, H - 16, 'MAIN MENU', {
      fontFamily: 'monospace', fontSize: '7px', color: '#806050', letterSpacing: 2,
      backgroundColor: '#1a0f10', padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playAgain.on('pointerdown', () => {
      SaveSystem.deleteSave();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('CharacterCreate'));
    });
    mainMenu.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MainMenu'));
    });

    [playAgain, mainMenu].forEach(btn => {
      btn.on('pointerover', () => btn.setColor('#ffee88'));
      btn.on('pointerout',  () => btn.setColor(btn === playAgain ? '#c8a030' : '#806050'));
    });

    this.cameras.main.fadeIn(600);
  }
}
