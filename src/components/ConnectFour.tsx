import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import { connectFourWinningLine } from "../gameEngines";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Player = "R" | "Y";
type Cell = Player | null;

const rows = 6;
const cols = 7;

export function ConnectFour({ players, onWin, feedback }: GameProps) {
  const [board, setBoard] = useState<Cell[]>(Array(rows * cols).fill(null));
  const [turn, setTurn] = useState<Player>("R");
  const reportedWinner = useRef<Player | null>(null);
  const winningLine = useMemo(() => connectFourWinningLine(board, rows, cols), [board]);
  const winner = winningLine ? board[winningLine[0]] : null;
  const isDraw = !winner && board.every(Boolean);
  const playerName = (token: Player) => players[token === "R" ? 0 : 1].name;
  const status = winner ? `${playerName(winner)} gagne` : isDraw ? "Grille pleine — match nul" : `À ${playerName(turn)} de jouer`;

  useEffect(() => {
    if (!winner || reportedWinner.current === winner) return;
    reportedWinner.current = winner;
    onWin((winner === "R" ? 0 : 1) as PlayerIndex);
  }, [winner, onWin]);

  const drop = (col: number) => {
    if (winner) {
      feedback("error");
      return;
    }
    const next = [...board];
    for (let row = rows - 1; row >= 0; row -= 1) {
      const index = row * cols + col;
      if (!next[index]) {
        next[index] = turn;
        setBoard(next);
        setTurn(turn === "R" ? "Y" : "R");
        feedback("drop");
        return;
      }
    }
    feedback("error");
  };

  return (
    <>
      <GameHeader title="Puissance 4" status={status} onReset={() => { reportedWinner.current = null; setBoard(Array(rows * cols).fill(null)); setTurn("R"); }} />
      <div className={`connect-wrap ${turn === "R" ? "red-turn" : "yellow-turn"}`}>
        <div className="connect-tray" aria-hidden="true">
          <span className="next-token" />
          <span>{winner ? "Partie terminée" : `${playerName(turn)} pose un jeton`}</span>
        </div>
        <div className="connect-board">
          {Array.from({ length: cols }).map((_, col) => (
            <button key={`drop-${col}`} className="drop-button" onClick={() => drop(col)} aria-label={`Jouer colonne ${col + 1}`}>
              <span />
            </button>
          ))}
          {board.map((cell, index) => (
            <button key={index} className={`connect-cell ${cell || ""} ${winningLine?.includes(index) ? "winner" : ""}`} onClick={() => drop(index % cols)} aria-label={`Cellule ${index + 1}`}>
              {cell && <span className="connect-token" />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
