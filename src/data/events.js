/**
 * Road Trip randomized events — 25 events across 5 categories
 * Each event has: id, category, text, choices[], each choice has { label, effects{} }
 */
export const ROAD_TRIP_EVENTS = [

  // ── BAND DRAMA ────────────────────────────────────────────────────────────
  {
    id: 'ryder_brawl',
    category: 'band_drama',
    character: 'ryder',
    text: 'Ryder got into a fistfight at a truck stop. He says the guy "had it coming." Police are involved.',
    choices: [
      { label: 'Pay bail ($300)', effects: { money: -300, ryder_loyalty: +15 } },
      { label: 'Leave him (he finds his own way)', effects: { ryder_loyalty: -30, fame: -50 } },
      { label: 'Talk your way out', effects: { ryder_loyalty: +5, reputation: -10 } },
    ],
  },
  {
    id: 'nova_label_call',
    category: 'band_drama',
    character: 'nova',
    text: "Nova took a call from a major label — alone. She won't say what they talked about.",
    choices: [
      { label: 'Confront her directly', effects: { nova_trust: -10, flag: 'nova_confronted' } },
      { label: 'Ask Ryder to find out', effects: { ryder_loyalty: -5, nova_trust: -15 } },
      { label: 'Let it go for now', effects: { nova_trust: +5, flag: 'nova_secret_grows' } },
    ],
  },
  {
    id: 'jet_disappears',
    category: 'band_drama',
    character: 'jet',
    text: "Jet didn't show up to the van this morning. He texted: 'I'm fine. Don't wait.'",
    choices: [
      { label: 'Drive back to find him', effects: { money: -100, jet_bond: +20, time_lost: 1 } },
      { label: 'Wait 2 hours then leave', effects: { jet_bond: -10 } },
      { label: 'Leave immediately', effects: { jet_bond: -25, fame: -100 } },
    ],
  },
  {
    id: 'band_argument',
    category: 'band_drama',
    character: null,
    text: "Ryder and Nova are screaming at each other about the set list. Jet's pretending to be asleep.",
    choices: [
      { label: 'Side with Ryder', effects: { ryder_loyalty: +15, nova_trust: -15 } },
      { label: 'Side with Nova', effects: { nova_trust: +15, ryder_loyalty: -15 } },
      { label: 'Force a compromise', effects: { ryder_loyalty: +5, nova_trust: +5, reputation: +10 } },
      { label: 'Wake Jet up and make him decide', effects: { jet_bond: -5, ryder_loyalty: -5, nova_trust: -5 } },
    ],
  },

  // ── FINANCIAL ────────────────────────────────────────────────────────────
  {
    id: 'van_breakdown',
    category: 'financial',
    character: null,
    text: "The van broke down on the highway. Mechanic says it'll be $500. Or you could try to fix it yourself.",
    choices: [
      { label: 'Pay the mechanic ($500)', effects: { money: -500 } },
      { label: "Ryder says he can fix it (50% chance)", effects: { money: 0, ryder_loyalty: +10, random_chance: { success: {}, fail: { money: -800 } } } },
      { label: 'Hitchhike to next city', effects: { money: -100, fame: -50, ryder_loyalty: -10 } },
    ],
  },
  {
    id: 'merch_opportunity',
    category: 'financial',
    character: null,
    text: "A local print shop can rush-print T-shirts for tonight. It'll cost $400 but you could sell them for profit.",
    choices: [
      { label: 'Invest in merch ($400)', effects: { money: -400, fame: +50, potential_gain: 800 } },
      { label: 'Skip it', effects: {} },
    ],
  },
  {
    id: 'stolen_equipment',
    category: 'financial',
    character: null,
    text: "Someone broke into the van and stole $600 worth of gear. Nova thinks it was the rival band from last night.",
    choices: [
      { label: 'Replace the gear ($600)', effects: { money: -600 } },
      { label: 'Confront the rival band', effects: { fame: +100, random_chance: { success: { money: +200 }, fail: { ryder_loyalty: -10 } } } },
      { label: 'Report it to police', effects: { money: +200, time_lost: 1 } },
    ],
  },

  // ── MEDIA / PRESS ────────────────────────────────────────────────────────
  {
    id: 'radio_interview',
    category: 'media',
    character: null,
    text: "A local radio station wants a 10-minute interview right now. You're 45 minutes from soundcheck.",
    choices: [
      { label: 'Do the interview', effects: { fame: +300, nova_trust: +10, risk: 'late_soundcheck' } },
      { label: 'Decline politely', effects: { fame: -50 } },
      { label: 'Send Nova alone', effects: { nova_trust: +15, fame: +200 } },
    ],
  },
  {
    id: 'viral_moment',
    category: 'media',
    character: null,
    text: "Someone posted a 30-second clip of your last show and it's going viral. The caption is... not flattering.",
    choices: [
      { label: 'Lean into it (self-deprecating tweet)', effects: { fame: +500, reputation: -10 } },
      { label: 'Ignore it', effects: { fame: +200 } },
      { label: 'Ask Nova to do damage control', effects: { nova_trust: -5, fame: +300, reputation: +5 } },
    ],
  },
  {
    id: 'bad_review',
    category: 'media',
    character: null,
    text: "A major music blog just published a brutal review of your last show. 2/10. 'Derivative and soulless.'",
    choices: [
      { label: 'Respond publicly', effects: { fame: -100, reputation: -20 } },
      { label: 'Let it slide', effects: { fame: -150 } },
      { label: "Use Ryder's quote as comeback fuel", effects: { ryder_loyalty: +10, fame: +100 } },
    ],
  },

  // ── WILD CARD ────────────────────────────────────────────────────────────
  {
    id: 'jet_connections',
    category: 'wild_card',
    character: 'jet',
    text: "Jet has a 'friend' who owns an underground club and wants you to play a surprise set tonight. No pay, but massive exposure.",
    choices: [
      { label: 'Play the underground set', effects: { fame: +400, jet_bond: +15, money: 0 } },
      { label: 'Too risky, skip it', effects: { jet_bond: -10 } },
      { label: 'Negotiate for 50% door', effects: { jet_bond: +5, money: +300, fame: +200 } },
    ],
  },
  {
    id: 'celebrity_encounter',
    category: 'wild_card',
    character: null,
    text: "A famous musician is at the same diner. They saw your show last night and want to talk.",
    choices: [
      { label: 'Ask for a collaboration', effects: { fame: +600, flag: 'celeb_collab_pending' } },
      { label: 'Play it cool and chat', effects: { fame: +300, reputation: +10 } },
      { label: 'Ryder challenges them to a guitar duel', effects: { ryder_loyalty: +10, fame: +400, random_chance: { success: { fame: +500 }, fail: { fame: -100 } } } },
    ],
  },
  {
    id: 'superfan_encounter',
    category: 'wild_card',
    character: null,
    text: "A superfan has followed you three cities. They want to be your unofficial tour photographer.",
    choices: [
      { label: 'Welcome them aboard', effects: { fame: +150, flag: 'has_photographer' } },
      { label: 'Politely decline', effects: {} },
      { label: 'Make it official (pay $100/week)', effects: { money: -100, fame: +300 } },
    ],
  },
  {
    id: 'rival_sabotage',
    category: 'wild_card',
    character: null,
    text: "Your rival band tampered with your setlist flyers — they all say you're playing 2 hours earlier than planned.",
    choices: [
      { label: 'Hustle to spread the word', effects: { fame: -100, ryder_loyalty: -5 } },
      { label: 'Find the rival band and confront them', effects: { ryder_loyalty: +15, fame: +50, risk: 'altercation' } },
      { label: 'Nova handles it — social media blast', effects: { nova_trust: +10, fame: +50 } },
    ],
  },

  // ── OPPORTUNITY ──────────────────────────────────────────────────────────
  {
    id: 'festival_slot',
    category: 'opportunity',
    character: null,
    text: "A regional festival just had a last-minute cancellation. They want YOU to fill the slot in 6 hours.",
    choices: [
      { label: 'Do it — drop everything', effects: { fame: +800, money: +1000, jet_bond: -5 } },
      { label: 'Can\'t make it in time', effects: {} },
    ],
  },
  {
    id: 'music_placement',
    category: 'opportunity',
    character: null,
    text: "A TV show producer heard your track and wants to license it. They're offering $2,000.",
    choices: [
      { label: 'Accept the license ($2,000)', effects: { money: +2000, fame: +200 } },
      { label: 'Negotiate for more', effects: { random_chance: { success: { money: +3500, fame: +200 }, fail: {} } } },
      { label: 'Decline — the show feels off-brand', effects: { reputation: +15 } },
    ],
  },
  {
    id: 'open_mic_nearby',
    category: 'opportunity',
    character: null,
    text: "There's a packed open mic night at a bar 10 minutes away. You could crash it.",
    choices: [
      { label: 'Crash it — one acoustic song', effects: { fame: +150, nova_trust: +5 } },
      { label: 'Rest up for tomorrow', effects: { all_relationships: +5 } },
    ],
  },
];

/**
 * Pull a random event pool for road trip between cities.
 * Filters out events tied to flags or unavailable characters.
 */
export function drawRoadTripEvents(gameState, count = 2) {
  const available = ROAD_TRIP_EVENTS.filter(e => {
    // Don't draw jet events if jet bond is critically low
    if (e.character === 'jet' && gameState.relationships.bond < 10) return false;
    return true;
  });
  // Shuffle and return `count` events
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
