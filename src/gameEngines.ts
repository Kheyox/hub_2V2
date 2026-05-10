export type ConnectFourToken = "R" | "Y" | null;
export type YatzyCategory = "ones" | "twos" | "threes" | "fours" | "fives" | "sixes" | "chance" | "yatzy";

export const connectFourWinner = (board: ConnectFourToken[], rows = 6, cols = 7) => {
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const player = board[row * cols + col];
      if (!player) continue;

      for (const [dr, dc] of dirs) {
        let count = 0;
        for (let step = 0; step < 4; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (r >= 0 && r < rows && c >= 0 && c < cols && board[r * cols + c] === player) count += 1;
        }
        if (count === 4) return player;
      }
    }
  }

  return null;
};

export const yatzyScoreFor = (category: YatzyCategory, dice: number[]) => {
  const targetByCategory: Record<Exclude<YatzyCategory, "chance" | "yatzy">, number> = {
    ones: 1,
    twos: 2,
    threes: 3,
    fours: 4,
    fives: 5,
    sixes: 6
  };
  if (category === "chance") return dice.reduce((sum, value) => sum + value, 0);
  if (category === "yatzy") return dice.every((value) => value === dice[0]) ? 50 : 0;
  return dice.filter((value) => value === targetByCategory[category]).reduce((sum, value) => sum + value, 0);
};

export const normalizeVersion = (version: string) => version.replace(/^v/i, "").trim();

export const compareVersions = (a: string, b: string) => {
  const left = normalizeVersion(a).split(".").map(Number);
  const right = normalizeVersion(b).split(".").map(Number);
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (left[index] || 0) - (right[index] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
};
