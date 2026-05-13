export type ConnectFourToken = "R" | "Y" | null;
export type YatzyCategory =
  | "ones"
  | "twos"
  | "threes"
  | "fours"
  | "fives"
  | "sixes"
  | "onePair"
  | "twoPairs"
  | "threeKind"
  | "fourKind"
  | "smallStraight"
  | "largeStraight"
  | "fullHouse"
  | "chance"
  | "yatzy";
export type YatzyScoreSheet = Record<YatzyCategory, number | null>;

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
  const counts = dice.reduce<Record<number, number>>((current, value) => ({ ...current, [value]: (current[value] || 0) + 1 }), {});
  const values = [1, 2, 3, 4, 5, 6];
  const targetByCategory: Partial<Record<YatzyCategory, number>> = {
    ones: 1,
    twos: 2,
    threes: 3,
    fours: 4,
    fives: 5,
    sixes: 6
  };
  const upperTarget = targetByCategory[category];
  if (upperTarget) return dice.filter((value) => value === upperTarget).reduce((sum, value) => sum + value, 0);
  if (category === "onePair") {
    const pair = [...values].reverse().find((value) => counts[value] >= 2);
    return pair ? pair * 2 : 0;
  }
  if (category === "twoPairs") {
    const pairs = [...values].reverse().filter((value) => counts[value] >= 2).slice(0, 2);
    return pairs.length === 2 ? pairs.reduce((sum, value) => sum + value * 2, 0) : 0;
  }
  if (category === "threeKind") {
    const value = [...values].reverse().find((item) => counts[item] >= 3);
    return value ? value * 3 : 0;
  }
  if (category === "fourKind") {
    const value = [...values].reverse().find((item) => counts[item] >= 4);
    return value ? value * 4 : 0;
  }
  if (category === "smallStraight") return values.slice(0, 5).every((value) => counts[value] === 1) ? 15 : 0;
  if (category === "largeStraight") return values.slice(1, 6).every((value) => counts[value] === 1) ? 20 : 0;
  if (category === "fullHouse") {
    const hasThree = values.some((value) => counts[value] === 3);
    const hasPair = values.some((value) => counts[value] === 2);
    return hasThree && hasPair ? dice.reduce((sum, value) => sum + value, 0) : 0;
  }
  if (category === "chance") return dice.reduce((sum, value) => sum + value, 0);
  if (category === "yatzy") return dice.every((value) => value === dice[0]) ? 50 : 0;
  return 0;
};

export const yatzyUpperTotal = (sheet: YatzyScoreSheet) => (
  (sheet.ones || 0) + (sheet.twos || 0) + (sheet.threes || 0) + (sheet.fours || 0) + (sheet.fives || 0) + (sheet.sixes || 0)
);

export const yatzyBonusFor = (sheet: YatzyScoreSheet) => yatzyUpperTotal(sheet) >= 63 ? 50 : 0;

export const yatzyTotalFor = (sheet: YatzyScoreSheet) => (
  Object.values(sheet).reduce<number>((sum, value) => sum + (value || 0), 0) + yatzyBonusFor(sheet)
);

export const emptyYatzySheet = (): YatzyScoreSheet => ({
  ones: null,
  twos: null,
  threes: null,
  fours: null,
  fives: null,
  sixes: null,
  onePair: null,
  twoPairs: null,
  threeKind: null,
  fourKind: null,
  smallStraight: null,
  largeStraight: null,
  fullHouse: null,
  chance: null,
  yatzy: null
});

export const isYatzySheetComplete = (sheet: YatzyScoreSheet) => Object.values(sheet).every((value) => value !== null);

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
