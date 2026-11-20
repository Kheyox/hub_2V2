import { GameSettings, PlayerProfile } from '../playerTypes';

export type ThemeId = 'dark' | 'arcade' | 'wood' | 'neon';

export interface MatchRecord {
  id: string;
  gameId: string;
  winner: 0 | 1 | 'draw';
  playedAt: string;
}

export interface PersistedAppState {
  schemaVersion: 2;
  theme: ThemeId;
  players: [PlayerProfile, PlayerProfile];
  favorites: string[];
  recents: string[];
  history: MatchRecord[];
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  gameSettings: GameSettings;
}

const STORAGE_KEY = 'versus.v2.state';

export const DEFAULT_APP_STATE: PersistedAppState = {
  schemaVersion: 2,
  theme: 'dark',
  players: [
    { name: 'Joueur 1', wins: 0, avatar: '🦊', color: '#38bdf8' },
    { name: 'Joueur 2', wins: 0, avatar: '🐼', color: '#f43f5e' },
  ],
  favorites: [],
  recents: [],
  history: [],
  soundEnabled: true,
  musicEnabled: false,
  hapticsEnabled: true,
  gameSettings: {
    matchesStart: 21,
    ticTacToeSize: 3,
    hangmanErrors: 6,
    memorySize: 4,
    checkersSize: 8,
    checkersMajority: true,
    sound: true,
    music: false,
    vibration: true,
  },
};

export function loadAppState(): PersistedAppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APP_STATE;
    const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
    if (parsed.schemaVersion !== 2) return DEFAULT_APP_STATE;
    return {
      ...DEFAULT_APP_STATE,
      ...parsed,
      gameSettings: {
        ...DEFAULT_APP_STATE.gameSettings,
        ...(parsed.gameSettings ?? {}),
      },
    };
  } catch {
    return DEFAULT_APP_STATE;
  }
}

export function saveAppState(state: PersistedAppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}
