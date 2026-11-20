import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { Button, PlayerPill } from '../../design-system';
import { CellValue, getTicTacToeWinner } from './engine';

export function TicTacToeGame({ players, settings, onWin, feedback }: GameProps) {
  const size = settings.ticTacToeSize;
  const [board, setBoard] = useState<CellValue[]>(() => Array(size * size).fill(null));
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const [isDraw, setIsDraw] = useState(false);

  const handlePlay = (idx: number) => {
    if (board[idx] !== null || isDraw) return;
    const next = [...board];
    next[idx] = turn;
    setBoard(next);
    feedback('tap');

    const result = getTicTacToeWinner(next, size);
    if (result === 'draw') {
      setIsDraw(true);
      feedback('error');
      return;
    }
    if (result !== null) {
      onWin(result);
      return;
    }
    setTurn(turn === 0 ? 1 : 0);
  };

  const reset = () => {
    setBoard(Array(size * size).fill(null));
    setTurn(0);
    setIsDraw(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={players[0].name} avatar={players[0].avatar} color={players[0].color} active={turn === 0 && !isDraw} />
        <PlayerPill name={players[1].name} avatar={players[1].avatar} color={players[1].color} active={turn === 1 && !isDraw} />
      </div>

      <div
        className="grid gap-2 w-full aspect-square max-w-[320px]"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {board.map((cell, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePlay(idx)}
            className="rounded-card bg-surface border border-border flex items-center justify-center text-3xl font-extrabold transition-transform active:scale-95 hover:bg-surface-2"
            style={{ color: cell !== null ? players[cell].color : undefined }}
          >
            {cell === 0 ? '✕' : cell === 1 ? '◯' : ''}
          </button>
        ))}
      </div>

      {isDraw && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-semibold text-muted">Match nul !</p>
          <Button variant="primary" size="sm" onClick={reset}>
            Rejouer la manche
          </Button>
        </div>
      )}
    </div>
  );
}
