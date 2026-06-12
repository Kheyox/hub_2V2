import type { SfxKind } from "./sound";

export type PlayerIndex = 0 | 1;

export type PlayerProfile = {
  name: string;
  wins: number;
  avatar: string;
  color: string;
};

export type PlayerProfiles = [PlayerProfile, PlayerProfile];

export type GameSettings = {
  matchesStart: number;
  ticTacToeSize: 3 | 4;
  hangmanErrors: number;
  memorySize: 4 | 6;
  checkersSize: 8 | 10;
  checkersMajority: boolean;
  sound: boolean;
  music: boolean;
  vibration: boolean;
};

export type GameProps = {
  players: PlayerProfiles;
  settings: GameSettings;
  onWin: (winner: PlayerIndex, score?: string) => void;
  feedback: (kind: SfxKind) => void;
};
