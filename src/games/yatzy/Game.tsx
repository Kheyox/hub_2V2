import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import {
  YatzyCategory,
  YatzyScoreSheet,
  yatzyScoreFor,
  yatzyTotalFor,
} from '../../gameEngines';
import { Button, Card, PlayerPill } from '../../design-system';

const CATEGORY_LABELS: Record<YatzyCategory, string> = {
  ones: 'As (1)',
  twos: 'Deux (2)',
  threes: 'Trois (3)',
  fours: 'Quatre (4)',
  fives: 'Cinq (5)',
  sixes: 'Six (6)',
  threeKind: 'Brelan',
  fourKind: 'Carré',
  fullHouse: 'Full',
  smallStraight: 'Petite suite',
  largeStraight: 'Grande suite',
  yatzy: 'Yatzy',
  chance: 'Chance',
};

const YATZY_CATEGORIES = Object.keys(CATEGORY_LABELS) as YatzyCategory[];

function emptySheet(): YatzyScoreSheet {
  return YATZY_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = null;
    return acc;
  }, {} as YatzyScoreSheet);
}

function rollDice(prev: number[], held: boolean[]): number[] {
  return prev.map((d, i) => (held[i] ? d : 1 + Math.floor(Math.random() * 6)));
}

export function YatzyGame({ players, onWin, feedback }: GameProps) {
  const [dice, setDice] = useState<number[]>(() => rollDice([1, 1, 1, 1, 1], [false, false, false, false, false]));
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState(2);
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const [sheets, setSheets] = useState<[YatzyScoreSheet, YatzyScoreSheet]>(() => [emptySheet(), emptySheet()]);

  const handleRoll = () => {
    if (rollsLeft <= 0) return;
    feedback('dice');
    setDice((prev) => rollDice(prev, held));
    setRollsLeft((r) => r - 1);
  };

  const toggleHold = (idx: number) => {
    feedback('tap');
    setHeld((prev) => prev.map((h, i) => (i === idx ? !h : h)));
  };

  const pickCategory = (cat: YatzyCategory) => {
    if (sheets[turn][cat] !== null) return;
    const score = yatzyScoreFor(cat, dice);
    const nextSheets: [YatzyScoreSheet, YatzyScoreSheet] = [{ ...sheets[0] }, { ...sheets[1] }];
    nextSheets[turn][cat] = score;
    setSheets(nextSheets);
    feedback('drop');

    const allDone =
      YATZY_CATEGORIES.every((c) => nextSheets[0][c] !== null) &&
      YATZY_CATEGORIES.every((c) => nextSheets[1][c] !== null);

    if (allDone) {
      const t0 = yatzyTotalFor(nextSheets[0]);
      const t1 = yatzyTotalFor(nextSheets[1]);
      onWin(t0 >= t1 ? 0 : 1, `${t0} - ${t1} pts`);
      return;
    }

    setTurn(turn === 0 ? 1 : 0);
    setHeld([false, false, false, false, false]);
    setDice(rollDice([1, 1, 1, 1, 1], [false, false, false, false, false]));
    setRollsLeft(2);
  };

  const t0 = yatzyTotalFor(sheets[0]);
  const t1 = yatzyTotalFor(sheets[1]);

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={`${players[0].name} (${t0})`} avatar={players[0].avatar} color={players[0].color} active={turn === 0} />
        <PlayerPill name={`${players[1].name} (${t1})`} avatar={players[1].avatar} color={players[1].color} active={turn === 1} />
      </div>

      <Card className="w-full space-y-3">
        <div className="grid grid-cols-5 gap-2">
          {dice.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleHold(i)}
              className={`aspect-square rounded-btn border text-xl font-extrabold transition-all ${
                held[i] ? 'bg-brand text-bg border-brand scale-95' : 'bg-surface-2 text-ink border-border'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <Button variant="primary" fullWidth size="sm" disabled={rollsLeft <= 0} onClick={handleRoll}>
          Lancer ({rollsLeft} restant{rollsLeft > 1 ? 's' : ''})
        </Button>
      </Card>

      <div className="grid grid-cols-2 gap-1.5 w-full">
        {YATZY_CATEGORIES.map((cat) => {
          const used = sheets[turn][cat] !== null;
          const preview = yatzyScoreFor(cat, dice);
          return (
            <button
              key={cat}
              type="button"
              disabled={used}
              onClick={() => pickCategory(cat)}
              className={`flex items-center justify-between rounded-btn border px-2.5 py-1.5 text-xs ${
                used
                  ? 'bg-surface/40 border-border text-muted opacity-50'
                  : 'bg-surface border-border hover:border-brand text-ink'
              }`}
            >
              <span className="truncate">{CATEGORY_LABELS[cat]}</span>
              <span className="font-bold text-brand">{used ? sheets[turn][cat] : preview}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
