/**
 * RelationshipTracker — manages Ryder/Nova/Jet relationship stats
 * and applies side effects when thresholds are crossed
 */

export const THRESHOLDS = {
  critical: 15,   // < 15: severe penalties, band-break risk
  low:      35,   // < 35: penalties active
  neutral:  50,   // 35–65: normal
  high:     70,   // > 70: bonuses unlock
  maxed:    90,   // > 90: special story events unlock
};

export class RelationshipTracker {
  constructor(gameState) {
    this.state = gameState;
  }

  get loyalty() { return this.state.relationships.loyalty; }
  get trust()   { return this.state.relationships.trust; }
  get bond()    { return this.state.relationships.bond; }

  // ── MODIFY ─────────────────────────────────────────────────────────────

  change(stat, delta) {
    const current = this.state.relationships[stat] ?? 50;
    this.state.relationships[stat] = Math.max(0, Math.min(100, current + delta));
    return this.state.relationships[stat];
  }

  applyEffects(effects) {
    const messages = [];
    if (effects.ryder_loyalty !== undefined) {
      const val = this.change('loyalty', effects.ryder_loyalty);
      messages.push({ character: 'ryder', stat: 'loyalty', delta: effects.ryder_loyalty, newVal: val });
    }
    if (effects.nova_trust !== undefined) {
      const val = this.change('trust', effects.nova_trust);
      messages.push({ character: 'nova', stat: 'trust', delta: effects.nova_trust, newVal: val });
    }
    if (effects.jet_bond !== undefined) {
      const val = this.change('bond', effects.jet_bond);
      messages.push({ character: 'jet', stat: 'bond', delta: effects.jet_bond, newVal: val });
    }
    if (effects.all_relationships !== undefined) {
      ['loyalty','trust','bond'].forEach(stat => {
        const val = this.change(stat, effects.all_relationships);
        messages.push({ character: stat, delta: effects.all_relationships, newVal: val });
      });
    }
    if (effects.money !== undefined) {
      this.state.money = Math.max(0, this.state.money + effects.money);
    }
    if (effects.fame !== undefined) {
      this.state.fame = Math.max(0, this.state.fame + effects.fame);
    }
    if (effects.reputation !== undefined) {
      this.state.reputation = Math.max(0, Math.min(100, this.state.reputation + effects.reputation));
    }
    if (effects.flag) {
      this.state.flags[effects.flag] = true;
    }
    return messages;
  }

  // ── STATUS CHECKS ───────────────────────────────────────────────────────

  getLevel(stat) {
    const v = this.state.relationships[stat] ?? 50;
    if (v < THRESHOLDS.critical) return 'critical';
    if (v < THRESHOLDS.low)      return 'low';
    if (v < THRESHOLDS.high)     return 'neutral';
    if (v < THRESHOLDS.maxed)    return 'high';
    return 'maxed';
  }

  isBandBroken() {
    return (
      this.loyalty < THRESHOLDS.critical &&
      this.trust   < THRESHOLDS.critical &&
      this.bond    < THRESHOLDS.critical
    );
  }

  // Returns active power-up key or null
  getActivePowerUp() {
    if (this.loyalty >= THRESHOLDS.high) return 'ryders_riff';
    if (this.trust   >= THRESHOLDS.high) return 'nova_spotlight';
    if (this.bond    >= THRESHOLDS.high) return 'jets_groove';
    return null;
  }

  // Returns post-gig bandmate reaction line
  getPostGigReaction(character, score, maxScore) {
    const pct = score / maxScore;
    const stat = { ryder: 'loyalty', nova: 'trust', jet: 'bond' }[character];
    const level = this.getLevel(stat);

    const reactions = {
      ryder: {
        high:     pct > 0.8 ? "THAT'S what I'm talking about!! Let's go again!" : "Could've been louder, but yeah. Good show.",
        neutral:  pct > 0.8 ? "Alright, alright. Not bad." : "We've done better. Way better.",
        low:      pct > 0.8 ? "Whatever." : "We need to talk about the set list. Seriously.",
        critical: "I don't even know why I'm still here.",
      },
      nova: {
        high:     pct > 0.8 ? "The crowd energy was PERFECT. This is exactly the story I want to tell." : "Good momentum. We need a stronger close next time.",
        neutral:  pct > 0.8 ? "Strong show. I'll post the highlights." : "We need to tighten the second half.",
        low:      pct > 0.8 ? "Fine. It worked." : "That was not our best look.",
        critical: "I'm having conversations you don't know about. Just saying.",
      },
      jet: {
        high:     pct > 0.8 ? "Bro. BRO. Did you feel that groove section? That was insane." : "Solid. I think my kit was slightly off, but yeah.",
        neutral:  pct > 0.8 ? "Yeah man, that was cool." : "I might know a spot if we want to practice tomorrow.",
        low:      pct > 0.8 ? "Cool." : "I got some stuff going on. Just... heads up.",
        critical: "I can't talk right now.",
      },
    };

    return reactions[character]?.[level] ?? "...";
  }
}
