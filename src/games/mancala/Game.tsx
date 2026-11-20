import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { Card, PlayerPill } from '../../design-system';

// Indices 0..5 = J1, 6 = Grenier J1, 7..12 = J2, 13 = Grenier J2
const INITIAL_PITS = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];

export function MancalaGame({ players, onWin, feedback }: GameProps) {
  const [pits, setPits] = useState<number[]>(INITIAL_PITS);
  const [turn, setTurn] = useState<PlayerIndex>(0);

  const sow = (pitIdx: number) => {
    const isP1 = turn === 0;
    if (isP1 && (pitIdx < 0 || pitIdx > 5)) return;
    if (!isP1 && (pitIdx < 7 || pitIdx > 12)) return;
    if (pits[pitIdx] === 0) return;

    const next = [...pits];
    let seeds = next[pitIdx];
    next[pitIdx] = 0;
    let idx = pitIdx;
    const ownStore = isP1 ? 6 : 13;
    const oppStore = isP1 ? 13 : 6;

    while (seeds > 0) {
      idx = (idx + 1) % 14;
      if (idx === oppStore) continue;
      next[idx] += 1;
      seeds -= 1;
    }

    feedback('drop');

    const p1Empty = next.slice(0, 6).every((s) => s === 0);
    const p2Empty = next.slice(7, 13).every((s) => s === 0);
    if (p1Empty || p2Empty) {
      const s1 = next[6] + next.slice(0, 6).reduce((a, b) => a + b, 0);
      const s2 = next[13] + next.slice(7, 13).reduce((a, b) => a + b, 0);
      next[6] = s1;
      next[13] = s2;
      setPits(next);
      onWin(s1 >= s2 ? 0 : 1, `${s1} - ${s2}`);
      return;
    }

    setPits(next);
    if (idx !== ownStore) {
      setTurn(turn === 0 ? 1 : 0);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={`${players[0].name} (${pits[6]})`} avatar={players[0].avatar} color={players[0].color} active={turn === 0} />
        <PlayerPill name={`${players[1].name} (${pits[13]})`} avatar={players[1].avatar} color={players[1].color} active={turn === 1} />
      </div>

      <Card className="w-full space-y-3">
        <div className="grid grid-cols-6 gap-1.5">
          {[12, 11, 10, 9, 8, 7].map((idx) => (
            <button
              key={idx}
              type="button"
              disabled={turn !== 1 || pits[idx] === 0}
              onClick={() => sow(idx)}
              className="aspect-square rounded-full bg-surface-2 border border-border font-bold text-sm disabled:opacity-40 hover:border-brand"
              style={{ color: players[1].color }}
            >
              {pits[idx]}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center px-2 py-1 text-xs font-bold text-muted">
          <span style={{ color: players[1].color }}>Grenier {players[1].avatar} : {pits[13]}</span>
          <span style={{ color: players[0].color }}>{pits[6]} : {players[0].avatar} Grenier</span>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <button
              key={idx}
              type="button"
              disabled={turn !== 0 || pits[idx] === 0}
              onClick={() => sow(idx)}
              className="aspect-square rounded-full bg-surface-2 border border-border font-bold text-sm disabled:opacity-40 hover:border-brand"
              style={{ color: players[0].color }}
            >
              {pits[idx]}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
