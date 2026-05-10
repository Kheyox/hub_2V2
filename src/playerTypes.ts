export type PlayerIndex = 0 | 1;

export type PlayerProfiles = [
  { name: string; wins: number },
  { name: string; wins: number }
];

export type GameProps = {
  players: PlayerProfiles;
  onWin: (winner: PlayerIndex) => void;
};
