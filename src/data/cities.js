/**
 * City configuration — each tour stop
 */
export const CITIES = [
  {
    id: 'seattle',
    name: 'Seattle',
    country: 'USA',
    venueName: 'The Rusty Nail',
    venueType: 'dive_bar',
    env: 'env_divebar',
    beatmap: 'beatmap_seattle',
    music: 'seattle_punk',
    genre: 'Grunge / Punk',
    fameRequired: 0,
    baseMoneyReward: 200,
    baseFameReward: 300,
    bgColor: 0x1a2030,
    accentColor: 0x4080c0,
    description: 'Rainy streets. Sticky floors. Your first real gig.',
    npcDialogues: [
      { name: 'Bartender', text: "You kids actually brought your own gear? Nice. Beer's two bucks if you play good." },
      { name: 'Local Fan', text: 'I saw The Emeralds here back in \'09. You remind me of them. Don\'t screw it up.' },
      { name: 'Rival Band', text: 'Cute. You brought your whole friend group to fill the venue.' },
    ],
    sideQuest: {
      id: 'seattle_equipment',
      title: 'Borrowed Gear',
      description: 'The house amp is broken. Find a replacement or busk outside for $150.',
      choices: ['Fix it ($50)', 'Busk for it (mini-game)'],
      rewards: [{ money: -50 }, { money: 150, fame: 50 }],
    },
  },
  {
    id: 'newyork',
    name: 'New York',
    country: 'USA',
    venueName: 'Club Vertex',
    venueType: 'mid_club',
    env: 'env_divebar',   // reuse with tint
    beatmap: 'beatmap_newyork',
    music: 'newyork_hiphop',
    genre: 'Hip-Hop / R&B',
    fameRequired: 500,
    baseMoneyReward: 600,
    baseFameReward: 700,
    bgColor: 0x0f0f1a,
    accentColor: 0x8040c0,
    description: 'The city that never sleeps. Neither will you after this gig.',
    npcDialogues: [
      { name: 'Club Promoter', text: 'You got buzz. Not enough for the VIP room yet. Earn it.' },
      { name: 'Music Blogger', text: 'I\'m writing a piece on emerging acts. Which one of you is the real story?' },
      { name: 'Street Musician', text: 'I been here 12 years. You want the real audience? They\'re outside, not in there.' },
    ],
    sideQuest: {
      id: 'ny_journalist',
      title: 'The Exclusive',
      description: 'A music journalist wants a one-on-one. Who do you send?',
      choices: ['Send Ryder', 'Send Nova', 'Send Jet', 'Go yourself'],
      rewards: [
        { ryder_loyalty: 10, fame: 100 },
        { nova_trust: 10, fame: 200, money: 100 },
        { jet_bond: 10, fame: 50 },
        { fame: 150, reputation: 10 },
      ],
    },
  },
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    venueName: 'The Monarch',
    venueType: 'theatre',
    env: 'env_divebar',
    beatmap: 'beatmap_london',
    music: 'london_indie',
    genre: 'Acoustic Indie',
    fameRequired: 1500,
    baseMoneyReward: 1000,
    baseFameReward: 1200,
    bgColor: 0x151a10,
    accentColor: 0x60a040,
    description: 'Foggy alleys. A storied stage. Critics with pints and opinions.',
    npcDialogues: [
      { name: 'Venue Manager', text: "We've had Oasis and Blur through these doors. Don't embarrass us." },
      { name: 'Music Critic', text: 'Derivative. But there\'s something there. I might write about it. Might.' },
      { name: 'Local Fan', text: 'I queued four hours for you. This better be worth it.' },
    ],
    sideQuest: {
      id: 'london_critic',
      title: 'The Review',
      description: 'The NME critic is in the crowd. Play safe or take risks?',
      choices: ['Play it safe', 'Take creative risks'],
      rewards: [{ fame: 200 }, { fame: 500, money: -200 }],
    },
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    venueName: 'Club Neon',
    venueType: 'neon_club',
    env: 'env_stadium',   // reuse with tint
    beatmap: 'beatmap_tokyo',
    music: 'tokyo_edm',
    genre: 'EDM / Hyperpop',
    fameRequired: 3000,
    baseMoneyReward: 2000,
    baseFameReward: 2500,
    bgColor: 0x0a0520,
    accentColor: 0xc040c0,
    description: 'Neon everywhere. The crowd moves like one organism. Don\'t miss a beat.',
    npcDialogues: [
      { name: 'Club Owner', text: 'In Tokyo, the music IS the fashion. Are you dressed for it?' },
      { name: 'Superfan', text: 'I flew from Osaka for this. You\'re the only band that matters right now.' },
      { name: 'Loan Shark', text: "Tell Jet I'm here. He knows what this means." },
    ],
    sideQuest: {
      id: 'tokyo_jet_debt',
      title: "Jet's Debt",
      description: "Jet's loan shark is outside. ¥200,000 ($1,400). What do you do?",
      choices: ['Cover the debt ($1,400)', 'Let Jet handle it', 'Negotiate ($700 + favor)'],
      rewards: [
        { money: -1400, jet_bond: 30 },
        { jet_bond: -20, random_event: 'loan_shark_consequence' },
        { money: -700, jet_bond: 15, flag: 'debt_favor_owed' },
      ],
    },
  },
  {
    id: 'la',
    name: 'Los Angeles',
    country: 'USA',
    venueName: 'The Coliseum',
    venueType: 'stadium',
    env: 'env_stadium',
    beatmap: 'beatmap_la',
    music: 'la_rock',
    genre: 'Stadium Rock',
    fameRequired: 8000,
    baseMoneyReward: 10000,
    baseFameReward: 5000,
    bgColor: 0x1a0505,
    accentColor: 0xc04000,
    description: 'The final night. 80,000 people. One chance at history.',
    npcDialogues: [
      { name: 'Label Exec', text: "I've been watching you since Seattle. Today we talk contracts." },
      { name: 'Backstage Crew', text: 'You want the big lights or the intimate setup? What kind of band are you?' },
      { name: 'Ryder (pre-show)', text: 'Whatever happens out there... this is why we started, yeah?' },
    ],
    sideQuest: {
      id: 'la_label_deal',
      title: 'The Deal',
      description: 'The label offer: $2M advance, but they own your music. Sign or walk?',
      choices: ['Sign the deal', 'Walk away', 'Negotiate indie terms'],
      rewards: [
        { money: 2000000, reputation: -50, flag: 'signed_label', ending: 'sellout' },
        { money: 0, reputation: 100, flag: 'indie_forever', ending: 'indie_legend' },
        { money: 500000, reputation: 50, flag: 'hybrid_deal', ending: 'compromise' },
      ],
    },
  },
];

export function getCityById(id) {
  return CITIES.find(c => c.id === id);
}

export function getNextCity(currentId) {
  const idx = CITIES.findIndex(c => c.id === currentId);
  return idx < CITIES.length - 1 ? CITIES[idx + 1] : null;
}
