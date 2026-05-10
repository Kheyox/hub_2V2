import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Player = "X" | "O";
type Cell = Player | null;

const wins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const getWinner = (board: Cell[]) => wins.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c])?.map((index) => board[index])[0] || null;

export function TicTacToe({ players, onWin }: GameProps) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>("X");
  const reportedWinner = useRef<Player | null>(null);
  const winner = useMemo(() => getWinner(board), [board]);
  const isDraw = !winner && board.every(Boolean);
  const playerName = (symbol: Player) => players[symbol === "X" ? 0 : 1].name;
  const status = winner ? `${playerName(winner)} gagne` : isDraw ? "Match nul" : `A ${playerName(turn)} de jouer`;

  useEffect(() => {
    if (!winner || reportedWinner.current === winner) return;
    reportedWinner.current = winner;
    onWin((winner === "X" ? 0 : 1) as PlayerIndex);
  }, [winner, onWin]);

  const play = (index: number) => {
    if (winner || board[index]) return;
    const next = [...board];
    next[index] = turn;
    setBoard(next);
    setTurn(turn === "X" ? "O" : "X");
  };

  return (
    <>
      <GameHeader title="Morpion" status={status} onReset={() => { reportedWinner.current = null; setBoard(Array(9).fill(null)); setTurn("X"); }} />
      <div className="ttt-board">
        {board.map((cell, index) => (
          <button key={index} className="ttt-cell" onClick={() => play(index)} aria-label={`Case ${index + 1}`}>
            {cell}
          </button>
        ))}
      </div>
    </>
  );
}
