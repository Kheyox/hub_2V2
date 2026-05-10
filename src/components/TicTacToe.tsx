import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Player = "X" | "O";
type Cell = Player | null;

const linesFor = (size: number) => {
  const lines: number[][] = [];
  for (let row = 0; row < size; row += 1) lines.push(Array.from({ length: size }, (_, col) => row * size + col));
  for (let col = 0; col < size; col += 1) lines.push(Array.from({ length: size }, (_, row) => row * size + col));
  lines.push(Array.from({ length: size }, (_, index) => index * size + index));
  lines.push(Array.from({ length: size }, (_, index) => index * size + (size - 1 - index)));
  return lines;
};

const getWinner = (board: Cell[], size: number) =>
  linesFor(size).find((line) => board[line[0]] && line.every((index) => board[index] === board[line[0]]))?.map((index) => board[index])[0] || null;

export function TicTacToe({ players, settings, onWin, feedback }: GameProps) {
  const size = settings.ticTacToeSize;
  const [board, setBoard] = useState<Cell[]>(Array(size * size).fill(null));
  const [turn, setTurn] = useState<Player>("X");
  const reportedWinner = useRef<Player | null>(null);
  const winner = useMemo(() => getWinner(board, size), [board, size]);
  const isDraw = !winner && board.every(Boolean);
  const playerName = (symbol: Player) => players[symbol === "X" ? 0 : 1].name;
  const status = winner ? `${playerName(winner)} gagne` : isDraw ? "Match nul" : `A ${playerName(turn)} de jouer`;

  useEffect(() => {
    if (!winner || reportedWinner.current === winner) return;
    reportedWinner.current = winner;
    onWin((winner === "X" ? 0 : 1) as PlayerIndex);
  }, [winner, onWin]);

  useEffect(() => {
    reportedWinner.current = null;
    setBoard(Array(size * size).fill(null));
    setTurn("X");
  }, [size]);

  const play = (index: number) => {
    if (winner || board[index]) {
      feedback("error");
      return;
    }
    const next = [...board];
    next[index] = turn;
    setBoard(next);
    setTurn(turn === "X" ? "O" : "X");
    feedback("tap");
  };

  return (
    <>
      <GameHeader title="Morpion" status={status} onReset={() => { reportedWinner.current = null; setBoard(Array(size * size).fill(null)); setTurn("X"); }} />
      <div className="ttt-board" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {board.map((cell, index) => (
          <button key={index} className="ttt-cell" onClick={() => play(index)} aria-label={`Case ${index + 1}`}>
            {cell}
          </button>
        ))}
      </div>
    </>
  );
}
