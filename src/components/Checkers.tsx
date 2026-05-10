import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Piece = "r" | "R" | "b" | "B" | null;
type Move = { to: number; capture?: number };
const size = 8;

const initial = (): Piece[] => Array.from({ length: 64 }, (_, index) => {
  const row = Math.floor(index / size);
  const col = index % size;
  if ((row + col) % 2 === 0) return null;
  if (row < 3) return "b";
  if (row > 4) return "r";
  return null;
});

const owner = (piece: Piece): PlayerIndex | null => piece ? (piece.toLowerCase() === "r" ? 0 : 1) : null;
const isKing = (piece: Piece) => piece === "R" || piece === "B";
const inside = (row: number, col: number) => row >= 0 && row < size && col >= 0 && col < size;

const movesFor = (board: Piece[], index: number): Move[] => {
  const piece = board[index];
  if (!piece) return [];
  const row = Math.floor(index / size);
  const col = index % size;
  const dirs = isKing(piece) ? [[1, -1], [1, 1], [-1, -1], [-1, 1]] : owner(piece) === 0 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  const moves: Move[] = [];
  dirs.forEach(([dr, dc]) => {
    const r1 = row + dr;
    const c1 = col + dc;
    const r2 = row + dr * 2;
    const c2 = col + dc * 2;
    if (inside(r1, c1) && !board[r1 * size + c1]) moves.push({ to: r1 * size + c1 });
    if (inside(r2, c2) && board[r1 * size + c1] && owner(board[r1 * size + c1]) !== owner(piece) && !board[r2 * size + c2]) {
      moves.push({ to: r2 * size + c2, capture: r1 * size + c1 });
    }
  });
  return moves;
};

const legalMovesFor = (board: Piece[], player: PlayerIndex) => {
  const moves = board.flatMap((piece, index) => owner(piece) === player ? movesFor(board, index).map((move) => ({ from: index, ...move })) : []);
  const captures = moves.filter((move) => move.capture !== undefined);
  return captures.length ? captures : moves;
};

export function Checkers({ players, onWin }: GameProps) {
  const [board, setBoard] = useState<Piece[]>(initial);
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const reported = useRef(false);
  const counts = useMemo(() => [board.filter((piece) => owner(piece) === 0).length, board.filter((piece) => owner(piece) === 1).length] as [number, number], [board]);
  const legalMoves = useMemo(() => legalMovesFor(board, turn), [board, turn]);
  const mustCapture = legalMoves.some((move) => move.capture !== undefined);
  const winner = counts[0] === 0 ? 1 : counts[1] === 0 ? 0 : legalMoves.length === 0 ? (turn === 0 ? 1 : 0) as PlayerIndex : null;
  const possible = selected === null ? [] : legalMoves.filter((move) => move.from === selected);
  const status = winner === null ? `${players[turn].name} ${mustCapture ? "doit prendre" : "avance"}` : `${players[winner].name} gagne`;

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    onWin(winner);
  }, [winner, onWin]);

  const click = (index: number) => {
    if (winner !== null) return;
    if (owner(board[index]) === turn) {
      if (!legalMoves.some((move) => move.from === index)) return;
      setSelected(index);
      return;
    }
    const move = possible.find((item) => item.to === index);
    if (selected === null || !move) return;
    const next = [...board];
    let piece = next[selected];
    next[selected] = null;
    if (move.capture !== undefined) next[move.capture] = null;
    const row = Math.floor(move.to / size);
    if (piece === "r" && row === 0) piece = "R";
    if (piece === "b" && row === size - 1) piece = "B";
    next[move.to] = piece;
    setBoard(next);
    setSelected(null);
    setTurn(turn === 0 ? 1 : 0);
  };

  const reset = () => {
    reported.current = false;
    setBoard(initial());
    setTurn(0);
    setSelected(null);
  };

  return (
    <>
      <GameHeader title="Dames" status={status} onReset={reset} />
      <div className="duel-score"><span>{players[0].name}: {counts[0]}</span><span>{players[1].name}: {counts[1]}</span></div>
      <div className="checkers-board">
        {board.map((piece, index) => (
          <button key={index} className={`checker-cell ${(Math.floor(index / size) + index) % 2 ? "dark" : ""} ${possible.some((move) => move.to === index) ? "valid" : ""}`} onClick={() => click(index)}>
            {piece && <span className={`checker-piece ${owner(piece) === 0 ? "red" : "black"} ${isKing(piece) ? "king" : ""}`} />}
          </button>
        ))}
      </div>
    </>
  );
}
