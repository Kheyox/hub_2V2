export type PlayerIndex = 0 | 1;

export type PlayerProfiles = [
  { name: string; wins: number },
  { name: string; wins: number }
];

export type GameSettings = {
  matchesStart: number;
  ticTacToeSize: 3 | 4;
  hangmanErrors: number;
  sound: boolean;
  vibration: boolean;
};

export type GameProps = {
  players: PlayerProfiles;
  settings: GameSettings;
  onWin: (winner: PlayerIndex, score?: string) => void;
};
