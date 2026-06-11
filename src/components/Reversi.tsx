import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Player = "B" | "W";
type Cell = Player | null;

const size = 8;
const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
];

const initialBoard = (): Cell[] => {
  const board = Array<Cell>(size * size).fill(null);
  board[27] = "W";
  board[28] = "B";
  board[35] = "B";
  board[36] = "W";
  return board;
};

const other = (player: Player): Player => (player === "B" ? "W" : "B");
const inside = (row: number, col: number) => row >= 0 && row < size && col >= 0 && col < size;

const flipsFor = (board: Cell[], index: number, player: Player) => {
  if (board[index]) return [];
  const row = Math.floor(index / size);
  const col = index % size;
  const flipped: number[] = [];

  for (const [dr, dc] of directions) {
    const line: number[] = [];
    let nextRow = row + dr;
    let nextCol = col + dc;

    while (inside(nextRow, nextCol) && board[nextRow * size + nextCol] === other(player)) {
      line.push(nextRow * size + nextCol);
      nextRow += dr;
      nextCol += dc;
    }

    if (line.length && inside(nextRow, nextCol) && board[nextRow * size + nextCol] === player) {
      flipped.push(...line);
    }
  }

  return flipped;
};

const validMoves = (board: Cell[], player: Player) =>
  board.map((_, index) => ({ index, flips: flipsFor(board, index, player) })).filter((move) => move.flips.length > 0);

const score = (board: Cell[]) => ({
  B: board.filter((cell) => cell === "B").length,
  W: board.filter((cell) => cell === "W").length
});

export function Reversi({ players, onWin }: GameProps) {
  const [board, setBoard] = useState<Cell[]>(initialBoard);
  const [player, setPlayer] = useState<Player>("B");
  const reportedWinner = useRef<PlayerIndex | null>(null);
  const moves = useMemo(() => validMoves(board, player), [board, player]);
  const nextMoves = useMemo(() => validMoves(board, other(player)), [board, player]);
  const points = useMemo(() => score(board), [board]);
  const finished = board.every(Boolean) || (!moves.length && !nextMoves.length);
  const skipped = !finished && !moves.length;
  const winnerIndex = points.B === points.W ? null : ((points.B > points.W ? 0 : 1) as PlayerIndex);
  const leader = winnerIndex === null ? "Égalité" : `${players[winnerIndex].name} gagne`;
  const status = finished ? `${leader} ${points.B}-${points.W}` : skipped ? `${player === "B" ? players[0].name : players[1].name} passe son tour` : `${player === "B" ? players[0].name : players[1].name} joue`;
  const validSet = new Map(moves.map((move) => [move.index, move.flips]));

  useEffect(() => {
    if (!finished || winnerIndex === null || reportedWinner.current === winnerIndex) return;
    reportedWinner.current = winnerIndex;
    onWin(winnerIndex);
  }, [finished, winnerIndex, onWin]);

  const play = (index: number) => {
    const flips = validSet.get(index);
    if (!flips || finished) return;
    const next = [...board];
    next[index] = player;
    flips.forEach((flipIndex) => {
      next[flipIndex] = player;
    });
    const nextPlayer = other(player);
    setBoard(next);
    setPlayer(validMoves(next, nextPlayer).length ? nextPlayer : player);
  };

  const reset = () => {
    reportedWinner.current = null;
    setBoard(initialBoard());
    setPlayer("B");
  };

  return (
    <>
      <GameHeader title="Reversi" status={status} onReset={reset} />
      <div className="reversi-score">
        <span><i className="reversi-disc B" />{players[0].name} {points.B}</span>
        <span><i className="reversi-disc W" />{players[1].name} {points.W}</span>
      </div>
      <div className="reversi-board">
        {board.map((cell, index) => (
          <button key={index} className={validSet.has(index) ? "reversi-cell valid" : "reversi-cell"} onClick={() => play(index)} aria-label={`Case ${index + 1}`}>
            {cell && <span className={`reversi-disc ${cell}`} />}
          </button>
        ))}
      </div>
    </>
  );
}
