/**
 * SaveSystem — localStorage persistence for Tour Life game state
 */

const SAVE_KEY = 'tour_life_save_v1';

export const DEFAULT_STATE = {
  // Player
  player: {
    name: 'Player',
    trait: 'visionary',
    instrument: 'guitar',
    skinTone: 0,
    outfit: 0,
  },
  // Progress
  currentCityIndex: 0,
  fame: 0,
  money: 500,
  reputation: 50,  // 0=sellout, 100=indie legend
  // Band relationships (0–100)
  relationships: {
    loyalty: 50,   // Ryder
    trust: 50,     // Nova
    bond: 50,      // Jet
  },
  // Flags
  flags: {},
  // Concert history
  concertHistory: [],
  // Session stats
  totalGigs: 0,
  totalNotesPerfect: 0,
  totalNotesMissed: 0,
  // Timestamp
  savedAt: null,
};

export class SaveSystem {
  static save(state) {
    try {
      const data = { ...state, savedAt: Date.now() };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('SaveSystem: Failed to save', e);
      return false;
    }
  }

  static load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('SaveSystem: Failed to load', e);
      return null;
    }
  }

  static hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  static deleteSave() {
    localStorage.removeItem(SAVE_KEY);
  }

  static merge(saved) {
    // Deep merge with defaults to handle version changes
    return {
      ...DEFAULT_STATE,
      ...saved,
      player: { ...DEFAULT_STATE.player, ...(saved.player || {}) },
      relationships: { ...DEFAULT_STATE.relationships, ...(saved.relationships || {}) },
      flags: { ...(saved.flags || {}) },
    };
  }
}
