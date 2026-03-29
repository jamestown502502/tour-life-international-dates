/**
 * Static character data — bandmates and their base stats
 */
export const BANDMATES = {
  ryder: {
    id: 'ryder',
    name: 'Ryder Blaze',
    role: 'Guitarist',
    sprite: 'ryder',
    relationshipStat: 'loyalty',
    description: 'Hot-headed, intensely loyal, impulsive.',
    color: 0xc03030,
    // Bonuses when high relationship
    highBonus: { type: 'multiplier', value: 1.5, description: "Ryder's Riff — 2x score for 10 seconds" },
    // Penalties when low relationship
    lowPenalty: { type: 'event', description: 'Starts a brawl or triggers bad PR event' },
  },
  nova: {
    id: 'nova',
    name: 'Nova Wilde',
    role: 'Frontwoman',
    sprite: 'nova',
    relationshipStat: 'trust',
    description: 'Charismatic, media-savvy strategist.',
    color: 0xc8a030,
    highBonus: { type: 'unlock', value: 'vip', description: "Nova's Spotlight — lane shield for 15 seconds" },
    lowPenalty: { type: 'event', description: 'Leaks damaging story, locks VIP venues' },
  },
  jet: {
    id: 'jet',
    name: 'Jet',
    role: 'Drummer',
    sprite: 'jet',
    relationshipStat: 'bond',
    description: 'Chill, secret debts, wild connections.',
    color: 0x3070c0,
    highBonus: { type: 'slowmo', value: 0.6, description: "Jet's Groove — slow-mo timing window for 8 seconds" },
    lowPenalty: { type: 'event', description: 'Goes missing before gigs, triggers loan shark events' },
  },
};

export const PLAYER_TRAITS = {
  visionary: {
    id: 'visionary',
    label: 'Visionary',
    description: 'Unlocks creative dialogue branches. +10% Fame from gigs.',
    sprite: 'player_visionary',
    fameBonus: 0.10,
  },
  hustler: {
    id: 'hustler',
    label: 'Hustler',
    description: 'Unlocks business branches. +15% Money from gigs.',
    sprite: 'player_visionary', // reuse; color tint differs
    moneyBonus: 0.15,
    spriteTint: 0x40a040,
  },
  rebel: {
    id: 'rebel',
    label: 'Rebel',
    description: 'Unlocks confrontational branches. +20% Crowd Energy at concerts.',
    sprite: 'player_visionary',
    crowdBonus: 0.20,
    spriteTint: 0xc04040,
  },
};
