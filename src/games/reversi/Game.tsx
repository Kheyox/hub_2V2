import { useMemo, useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { PlayerPill } from '../../design-system';

const SIZE = 8;
const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

type Cell = PlayerIndex | null;

function createBoard(): Cell[] {
  const b: Cell[] = Array(SIZE * SIZE).fill(null);
  b[3 * SIZE + 3] = 1;
  b[3 * SIZE + 4] = 0;
  b[4 * SIZE + 3] = 0;
  b[4 * SIZE + 4] = 1;
  return b;
}

function getFlips(board: Cell[], idx: number, player: PlayerIndex): number[] {
  if (board[idx] !== null) return [];
  const r = Math.floor(idx / SIZE);
  const c = idx % SIZE;
  const opp: PlayerIndex = player === 0 ? 1 : 0;
  const flips: number[] = [];

  for (const [dr, dc] of DIRS) {
    const line: number[] = [];
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
      const nIdx = nr * SIZE + nc;
      if (board[nIdx] === opp) {
        line.push(nIdx);
      } else if (board[nIdx] === player) {
        if (line.length > 0) flips.push(...line);
        break;
      } else {
        break;
      }
      nr += dr;
      nc += dc;
    }
  }
  return flips;
}

export function ReversiGame({ players, onWin, feedback }: GameProps) {
  const [board, setBoard] = useState<Cell[]>(createBoard);
  const [turn, setTurn] = useState<PlayerIndex>(0);

  const validMoves = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < board.length; i++) {
      if (getFlips(board, i, turn).length > 0) set.add(i);
    }
    return set;
  }, [board, turn]);

  const counts = useMemo(() => {
    let c0 = 0;
    let c1 = 0;
    for (const cell of board) {
      if (cell === 0) c0++;
      else if (cell === 1) c1++;
    }
    return [c0, c1] as const;
  }, [board]);

  const play = (idx: number) => {
    const flips = getFlips(board, idx, turn);
    if (flips.length === 0) return;

    const next = [...board];
    next[idx] = turn;
    for (const f of flips) next[f] = turn;
    setBoard(next);
    feedback('drop');

    const opp: PlayerIndex = turn === 0 ? 1 : 0;
    const oppHasMove = next.some((_, i) => getFlips(next, i, opp).length > 0);
    const selfHasMove = next.some((_, i) => getFlips(next, i, turn).length > 0);

    if (!oppHasMove && !selfHasMove) {
      const s0 = next.filter((c) => c === 0).length;
      const s1 = next.filter((c) => c === 1).length;
      onWin(s0 >= s1 ? 0 : 1, `${s0} - ${s1}`);
      return;
    }
    setTurn(oppHasMove ? opp : turn);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={`${players[0].name} (${counts[0]})`} avatar={players[0].avatar} color={players[0].color} active={turn === 0} />
        <PlayerPill name={`${players[1].name} (${counts[1]})`} avatar={players[1].avatar} color={players[1].color} active={turn === 1} />
      </div>

      <div className="grid grid-cols-8 gap-1 p-2 rounded-card bg-surface border border-border w-full max-w-[340px] aspect-square">
        {board.map((cell, idx) => {
          const isValid = validMoves.has(idx);
          return (
            <button
              key={idx}
              type="button"
              disabled={!isValid}
              onClick={() => play(idx)}
              className={`rounded-md border border-border flex items-center justify-center transition-colors ${
                isValid ? 'bg-surface-2 hover:border-brand' : 'bg-bg/50'
              }`}
            >
              {cell !== null ? (
                <span
                  className="w-3/4 h-3/4 rounded-full shadow-sm"
                  style={{ backgroundColor: players[cell].color }}
                />
              ) : isValid ? (
                <span className="w-2 h-2 rounded-full bg-brand/50" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
