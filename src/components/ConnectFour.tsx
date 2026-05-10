import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Player = "R" | "Y";
type Cell = Player | null;

const rows = 6;
const cols = 7;

const winnerOf = (board: Cell[]) => {
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

export function ConnectFour({ players, onWin }: GameProps) {
  const [board, setBoard] = useState<Cell[]>(Array(rows * cols).fill(null));
  const [turn, setTurn] = useState<Player>("R");
  const reportedWinner = useRef<Player | null>(null);
  const winner = useMemo(() => winnerOf(board), [board]);
  const isDraw = !winner && board.every(Boolean);
  const playerName = (token: Player) => players[token === "R" ? 0 : 1].name;
  const status = winner ? `${playerName(winner)} gagne` : isDraw ? "Grille pleine" : `A ${playerName(turn)} de jouer`;

  useEffect(() => {
    if (!winner || reportedWinner.current === winner) return;
    reportedWinner.current = winner;
    onWin((winner === "R" ? 0 : 1) as PlayerIndex);
  }, [winner, onWin]);

  const drop = (col: number) => {
    if (winner) return;
    const next = [...board];
    for (let row = rows - 1; row >= 0; row -= 1) {
      const index = row * cols + col;
      if (!next[index]) {
        next[index] = turn;
        setBoard(next);
        setTurn(turn === "R" ? "Y" : "R");
        return;
      }
    }
  };

  return (
    <>
      <GameHeader title="Puissance 4" status={status} onReset={() => { reportedWinner.current = null; setBoard(Array(rows * cols).fill(null)); setTurn("R"); }} />
      <div className={`connect-wrap ${turn === "R" ? "red-turn" : "yellow-turn"}`}>
        <div className="connect-tray" aria-hidden="true">
          <span className="next-token" />
          <span>{winner ? "Partie terminee" : `${playerName(turn)} pose`}</span>
        </div>
        <div className="connect-board">
          {Array.from({ length: cols }).map((_, col) => (
            <button key={`drop-${col}`} className="drop-button" onClick={() => drop(col)} aria-label={`Jouer colonne ${col + 1}`}>
              <span />
            </button>
          ))}
          {board.map((cell, index) => (
            <button key={index} className={`connect-cell ${cell || ""}`} onClick={() => drop(index % cols)} aria-label={`Cellule ${index + 1}`}>
              {cell && <span className="connect-token" />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
