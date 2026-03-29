/**
 * DialogueSystem — renders branching dialogue trees in Phaser scenes
 * Uses Phaser.GameObjects to render dialogue box, character portrait, and choices
 */

export class DialogueSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {object} gameState - shared game state reference
   */
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.container = null;
    this.isActive = false;
    this.onComplete = null;
    this._currentNode = null;
    this._tree = null;
  }

  // ── START A DIALOGUE TREE ───────────────────────────────────────────────

  /**
   * @param {object} tree - dialogue tree (see dialogues.js for format)
   * @param {function} onComplete - called when tree ends
   */
  start(tree, onComplete = () => {}) {
    this.onComplete = onComplete;
    this._tree = tree;
    this.isActive = true;
    this._showNode(tree.root || tree.nodes?.[0]);
  }

  // ── SHOW A SINGLE NODE ──────────────────────────────────────────────────

  _showNode(node) {
    if (!node) { this._end(); return; }
    this._currentNode = node;
    this._clearUI();
    this._buildUI(node);
  }

  // ── BUILD UI ─────────────────────────────────────────────────────────────

  _buildUI(node) {
    const W = this.scene.scale.width;
    const H = this.scene.scale.height;
    const BOX_H = 80;
    const BOX_Y = H - BOX_H - 4;
    const PADDING = 8;

    this.container = this.scene.add.container(0, 0).setDepth(100);

    // Dim overlay
    const dim = this.scene.add.rectangle(0, 0, W, H, 0x000000, 0.4).setOrigin(0, 0);

    // Dialogue box
    const box = this.scene.add.rectangle(4, BOX_Y, W - 8, BOX_H, 0x12080e, 0.95).setOrigin(0, 0);
    const boxBorder = this.scene.add.rectangle(4, BOX_Y, W - 8, BOX_H, 0, 0)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xc8a030);

    // Character name tag
    const nameTag = this.scene.add.rectangle(PADDING + 2, BOX_Y - 12, 80, 14, 0x2a1040, 1).setOrigin(0, 0);
    const nameText = this.scene.add.text(PADDING + 6, BOX_Y - 11, node.speaker || '', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#c8a030',
      letterSpacing: 1,
    }).setOrigin(0, 0);

    // Character portrait (sprite frame hint)
    const portraitBg = this.scene.add.rectangle(PADDING + 2, BOX_Y + 4, 36, 36, 0x2a1040, 1).setOrigin(0, 0);

    // Dialogue text
    const fullText = node.text || '';
    const dialogueText = this.scene.add.text(PADDING + 44, BOX_Y + 6, '', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#e8d8b0',
      wordWrap: { width: W - PADDING - 44 - 12 },
      lineSpacing: 3,
    }).setOrigin(0, 0);

    // Typewriter effect
    let charIndex = 0;
    const typeTimer = this.scene.time.addEvent({
      delay: 28,
      repeat: fullText.length - 1,
      callback: () => {
        charIndex++;
        dialogueText.setText(fullText.substring(0, charIndex));
        if (charIndex % 3 === 0) {
          try { this.scene.sound.play('dialogue_blip', { volume: 0.3 }); } catch(_) {}
        }
      },
    });

    // Choices or continue prompt
    const choiceObjects = [];
    if (node.choices && node.choices.length > 0) {
      // Show choices after typewriter completes
      this.scene.time.delayedCall(fullText.length * 28 + 100, () => {
        node.choices.forEach((choice, idx) => {
          // Filter by trait/flag requirements
          if (choice.requires_trait && this.gameState.player?.trait !== choice.requires_trait) return;
          if (choice.requires_flag && !this.gameState.flags?.[choice.requires_flag]) return;

          const cy = BOX_Y + 42 + idx * 13;
          const choiceBg = this.scene.add.rectangle(PADDING + 44, cy, W - PADDING - 50, 11, 0x2a1a2a, 0.9).setOrigin(0, 0);
          const choiceText = this.scene.add.text(PADDING + 48, cy + 2, `▸ ${choice.label}`, {
            fontFamily: 'monospace',
            fontSize: '6px',
            color: '#c0b080',
          }).setOrigin(0, 0);

          // Hover tint
          choiceBg.setInteractive();
          choiceBg.on('pointerover', () => {
            choiceBg.setFillStyle(0x4a2a6a);
            choiceText.setColor('#ffdd88');
          });
          choiceBg.on('pointerout', () => {
            choiceBg.setFillStyle(0x2a1a2a);
            choiceText.setColor('#c0b080');
          });

          // Select choice
          const handler = () => {
            try { this.scene.sound.play('ui_click', { volume: 0.5 }); } catch(_) {}
            this._applyChoiceEffects(choice.effects || {});
            typeTimer.remove();
            if (choice.next) {
              const nextNode = this._tree.nodes?.find(n => n.id === choice.next);
              this._showNode(nextNode);
            } else {
              this._end();
            }
          };
          choiceBg.on('pointerdown', handler);
          choiceBg.on('pointerup', handler);   // touchstart compat

          this.container.add([choiceBg, choiceText]);
          choiceObjects.push(choiceBg, choiceText);
        });
      });
    } else {
      // Simple continue prompt
      const continueText = this.scene.add.text(W - 16, BOX_Y + BOX_H - 10, '▸▸', {
        fontFamily: 'monospace', fontSize: '7px', color: '#c8a030'
      }).setOrigin(1, 0);
      continueText.setInteractive({ useHandCursor: true });
      const advanceHandler = () => {
        typeTimer.remove();
        const nextNode = node.next
          ? this._tree.nodes?.find(n => n.id === node.next)
          : null;
        this._showNode(nextNode);
      };
      continueText.on('pointerdown', advanceHandler);
      this.container.add(continueText);

      // Also click anywhere on box to advance
      box.setInteractive();
      box.on('pointerdown', advanceHandler);
    }

    this.container.add([dim, box, boxBorder, nameTag, nameText, portraitBg, dialogueText]);
  }

  // ── EFFECTS ─────────────────────────────────────────────────────────────

  _applyChoiceEffects(effects) {
    if (!effects) return;
    if (effects.ryder_loyalty) this.gameState.relationships.loyalty = Math.max(0, Math.min(100, (this.gameState.relationships.loyalty || 50) + effects.ryder_loyalty));
    if (effects.nova_trust)    this.gameState.relationships.trust   = Math.max(0, Math.min(100, (this.gameState.relationships.trust   || 50) + effects.nova_trust));
    if (effects.jet_bond)      this.gameState.relationships.bond    = Math.max(0, Math.min(100, (this.gameState.relationships.bond    || 50) + effects.jet_bond));
    if (effects.money)         this.gameState.money   = Math.max(0, (this.gameState.money   || 0) + effects.money);
    if (effects.fame)          this.gameState.fame    = Math.max(0, (this.gameState.fame    || 0) + effects.fame);
    if (effects.reputation)    this.gameState.reputation = Math.max(0, Math.min(100, (this.gameState.reputation || 50) + effects.reputation));
    if (effects.flag)          this.gameState.flags[effects.flag] = true;
  }

  // ── CLEANUP ─────────────────────────────────────────────────────────────

  _clearUI() {
    if (this.container) {
      this.container.destroy(true);
      this.container = null;
    }
  }

  _end() {
    this._clearUI();
    this.isActive = false;
    if (this.onComplete) this.onComplete();
  }

  destroy() {
    this._clearUI();
    this.isActive = false;
  }
}
