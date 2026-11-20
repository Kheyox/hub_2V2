import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { PlayerPill } from '../../design-system';

type Piece = { owner: PlayerIndex; king: boolean } | null;

function createBoard(size: 8 | 10): Piece[] {
  const rows = size === 10 ? 4 : 3;
  const board: Piece[] = Array(size * size).fill(null);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r + c) % 2 === 1) {
        if (r < rows) board[r * size + c] = { owner: 1, king: false };
        else if (r >= size - rows) board[r * size + c] = { owner: 0, king: false };
      }
    }
  }
  return board;
}

export function CheckersGame({ players, settings, onWin, feedback }: GameProps) {
  const size = settings.checkersSize;
  const [board, setBoard] = useState<Piece[]>(() => createBoard(size));
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const [selected, setSelected] = useState<number | null>(null);

  const getMoves = (b: Piece[], idx: number): { to: number; capture?: number }[] => {
    const p = b[idx];
    if (!p) return [];
    const r = Math.floor(idx / size);
    const c = idx % size;
    const dirs = p.king
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : p.owner === 0
        ? [[-1, -1], [-1, 1]]
        : [[1, -1], [1, 1]];

    const moves: { to: number; capture?: number }[] = [];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      const nIdx = nr * size + nc;
      if (!b[nIdx]) {
        moves.push({ to: nIdx });
      } else if (b[nIdx]?.owner !== p.owner) {
        const jr = nr + dr;
        const jc = nc + dc;
        if (jr >= 0 && jr < size && jc >= 0 && jc < size) {
          const jIdx = jr * size + jc;
          if (!b[jIdx]) moves.push({ to: jIdx, capture: nIdx });
        }
      }
    }
    return moves;
  };

  const validTargets = selected !== null ? getMoves(board, selected) : [];

  const handleCell = (idx: number) => {
    const piece = board[idx];
    if (piece && piece.owner === turn) {
      feedback('tap');
      setSelected(idx);
      return;
    }

    if (selected === null) return;
    const move = validTargets.find((m) => m.to === idx);
    if (!move) return;

    const next = [...board];
    const moved = { ...next[selected]! };
    const targetRow = Math.floor(idx / size);
    if ((moved.owner === 0 && targetRow === 0) || (moved.owner === 1 && targetRow === size - 1)) {
      moved.king = true;
    }
    next[idx] = moved;
    next[selected] = null;
    if (move.capture !== undefined) next[move.capture] = null;

    setBoard(next);
    setSelected(null);
    feedback(move.capture !== undefined ? 'drop' : 'tap');

    const opp: PlayerIndex = turn === 0 ? 1 : 0;
    const oppPieces = next.filter((c) => c?.owner === opp).length;
    if (oppPieces === 0) {
      onWin(turn, 'Plus de pions adverses');
      return;
    }
    setTurn(opp);
  };

  const p0Count = board.filter((c) => c?.owner === 0).length;
  const p1Count = board.filter((c) => c?.owner === 1).length;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={`${players[0].name} (${p0Count})`} avatar={players[0].avatar} color={players[0].color} active={turn === 0} />
        <PlayerPill name={`${players[1].name} (${p1Count})`} avatar={players[1].avatar} color={players[1].color} active={turn === 1} />
      </div>

      <div
        className="grid p-1.5 rounded-card bg-surface border border-border w-full max-w-[340px] aspect-square"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {board.map((cell, idx) => {
          const r = Math.floor(idx / size);
          const c = idx % size;
          const dark = (r + c) % 2 === 1;
          const isSel = selected === idx;
          const isTarget = validTargets.some((m) => m.to === idx);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCell(idx)}
              className={`aspect-square flex items-center justify-center ${
                dark ? 'bg-surface-2' : 'bg-bg/40'
              } ${isSel ? 'ring-2 ring-brand inset-0' : ''} ${isTarget ? 'bg-brand/25' : ''}`}
            >
              {cell && (
                <span
                  className="w-3/4 h-3/4 rounded-full flex items-center justify-center text-[10px] font-bold text-bg shadow"
                  style={{ backgroundColor: players[cell.owner].color }}
                >
                  {cell.king ? '★' : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
