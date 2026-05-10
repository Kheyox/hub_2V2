import { useMemo, useState } from "react";
import { GameHeader } from "../App";

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

export function ConnectFour() {
  const [board, setBoard] = useState<Cell[]>(Array(rows * cols).fill(null));
  const [turn, setTurn] = useState<Player>("R");
  const winner = useMemo(() => winnerOf(board), [board]);
  const isDraw = !winner && board.every(Boolean);
  const status = winner ? `Victoire ${winner === "R" ? "Rouge" : "Jaune"}` : isDraw ? "Grille pleine" : `Au tour de ${turn === "R" ? "Rouge" : "Jaune"}`;

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
      <GameHeader title="Puissance 4" status={status} onReset={() => { setBoard(Array(rows * cols).fill(null)); setTurn("R"); }} />
      <div className="connect-board">
        {Array.from({ length: cols }).map((_, col) => (
          <button key={`drop-${col}`} className="drop-button" onClick={() => drop(col)} aria-label={`Colonne ${col + 1}`} />
        ))}
        {board.map((cell, index) => (
          <button key={index} className={`connect-cell ${cell || ""}`} onClick={() => drop(index % cols)} aria-label={`Cellule ${index + 1}`} />
        ))}
      </div>
    </>
  );
}
