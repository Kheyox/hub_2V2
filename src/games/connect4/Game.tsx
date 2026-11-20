import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { ConnectFourToken, connectFourWinner } from '../../gameEngines';
import { Button, PlayerPill } from '../../design-system';

const ROWS = 6;
const COLS = 7;

export function ConnectFourGame({ players, onWin, feedback }: GameProps) {
  const [board, setBoard] = useState<ConnectFourToken[]>(() => Array(ROWS * COLS).fill(null));
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const [isDraw, setIsDraw] = useState(false);

  const dropInCol = (col: number) => {
    if (isDraw) return;
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r * COLS + col] === null) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) {
      feedback('error');
      return;
    }

    const next = [...board];
    next[targetRow * COLS + col] = turn === 0 ? 'R' : 'Y';
    setBoard(next);
    feedback('drop');

    const winner = connectFourWinner(next, ROWS, COLS);
    if (winner) {
      onWin(winner === 'R' ? 0 : 1);
      return;
    }
    if (next.every((c) => c !== null)) {
      setIsDraw(true);
      feedback('error');
      return;
    }
    setTurn(turn === 0 ? 1 : 0);
  };

  const reset = () => {
    setBoard(Array(ROWS * COLS).fill(null));
    setTurn(0);
    setIsDraw(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={players[0].name} avatar={players[0].avatar} color={players[0].color} active={turn === 0 && !isDraw} />
        <PlayerPill name={players[1].name} avatar={players[1].avatar} color={players[1].color} active={turn === 1 && !isDraw} />
      </div>

      <div className="grid grid-cols-7 gap-1.5 p-2.5 rounded-card bg-surface border border-border w-full max-w-[340px]">
        {board.map((cell, idx) => {
          const col = idx % COLS;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => dropInCol(col)}
              className="aspect-square rounded-full border border-border bg-bg/60 transition-transform active:scale-95"
              style={{
                backgroundColor:
                  cell === 'R' ? players[0].color : cell === 'Y' ? players[1].color : undefined,
              }}
              aria-label={`Colonne ${col + 1}`}
            />
          );
        })}
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
