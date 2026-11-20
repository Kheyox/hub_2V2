import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { Button, PlayerPill } from '../../design-system';

// 4 attributs binaires (0..15) : bit0=clair/foncé, bit1=rond/carré, bit2=grand/petit, bit3=plein/creux
const LINES = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
  [0, 5, 10, 15], [3, 6, 9, 12],
];

function hasQuarto(board: (number | null)[]): boolean {
  for (const line of LINES) {
    const pieces = line.map((i) => board[i]);
    if (pieces.some((p) => p === null)) continue;
    const nums = pieces as number[];
    for (let bit = 0; bit < 4; bit++) {
      const mask = 1 << bit;
      const allSet = nums.every((n) => (n & mask) !== 0);
      const allUnset = nums.every((n) => (n & mask) === 0);
      if (allSet || allUnset) return true;
    }
  }
  return false;
}

function PieceBadge({ id }: { id: number }) {
  const light = (id & 1) === 0;
  const round = (id & 2) === 0;
  const big = (id & 4) === 0;
  const solid = (id & 8) === 0;
  return (
    <span
      className={`inline-block border-2 ${round ? 'rounded-full' : 'rounded-sm'} ${
        big ? 'w-7 h-7' : 'w-4 h-4'
      } ${light ? 'border-amber-300' : 'border-sky-400'} ${
        solid ? (light ? 'bg-amber-300' : 'bg-sky-400') : 'bg-transparent'
      }`}
    />
  );
}

export function QuartoGame({ players, onWin, feedback }: GameProps) {
  const [board, setBoard] = useState<(number | null)[]>(() => Array(16).fill(null));
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [isDraw, setIsDraw] = useState(false);

  const used = new Set(board.filter((p): p is number => p !== null));

  const placePiece = (cellIdx: number) => {
    if (selectedPiece === null || board[cellIdx] !== null || isDraw) return;
    const next = [...board];
    next[cellIdx] = selectedPiece;
    setBoard(next);
    setSelectedPiece(null);
    feedback('drop');

    if (hasQuarto(next)) {
      onWin(turn, 'Quarto !');
      return;
    }
    if (next.every((c) => c !== null)) {
      setIsDraw(true);
      feedback('error');
      return;
    }
    // Le joueur qui vient de poser choisit maintenant la pièce pour l'adversaire
  };

  const pickPiece = (pieceId: number) => {
    if (selectedPiece !== null || used.has(pieceId) || isDraw) return;
    feedback('tap');
    setSelectedPiece(pieceId);
    setTurn(turn === 0 ? 1 : 0);
  };

  const reset = () => {
    setBoard(Array(16).fill(null));
    setTurn(0);
    setSelectedPiece(null);
    setIsDraw(false);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={players[0].name} avatar={players[0].avatar} color={players[0].color} active={turn === 0 && !isDraw} />
        <PlayerPill name={players[1].name} avatar={players[1].avatar} color={players[1].color} active={turn === 1 && !isDraw} />
      </div>

      <p className="text-xs font-medium text-muted">
        {selectedPiece !== null
          ? `${players[turn].name} : pose la pièce choisie`
          : `${players[turn].name} : choisis une pièce pour l'adversaire`}
      </p>

      <div className="grid grid-cols-4 gap-1.5 p-2 rounded-card bg-surface border border-border w-full max-w-[260px] aspect-square">
        {board.map((cell, idx) => (
          <button
            key={idx}
            type="button"
            disabled={selectedPiece === null || cell !== null}
            onClick={() => placePiece(idx)}
            className="rounded-btn bg-surface-2 border border-border flex items-center justify-center hover:border-brand disabled:hover:border-border"
          >
            {cell !== null && <PieceBadge id={cell} />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-8 gap-1.5 w-full max-w-[320px]">
        {Array.from({ length: 16 }).map((_, id) => {
          const isUsed = used.has(id);
          const isSelected = selectedPiece === id;
          return (
            <button
              key={id}
              type="button"
              disabled={isUsed || selectedPiece !== null}
              onClick={() => pickPiece(id)}
              className={`aspect-square rounded-btn border flex items-center justify-center ${
                isSelected
                  ? 'border-brand bg-brand/20'
                  : isUsed
                    ? 'opacity-20 border-border bg-surface'
                    : 'border-border bg-surface hover:border-brand'
              }`}
            >
              <PieceBadge id={id} />
            </button>
          );
        })}
      </div>

      {isDraw && (
        <Button variant="primary" size="sm" onClick={reset}>
          Match nul — Rejouer
        </Button>
      )}
    </div>
  );
}
