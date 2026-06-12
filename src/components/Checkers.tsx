import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Piece = "r" | "R" | "b" | "B" | null;
type Move = { to: number; capture?: number };
type FullMove = Move & { from: number };

const initial = (size: number): Piece[] => Array.from({ length: size * size }, (_, index) => {
  const row = Math.floor(index / size);
  const col = index % size;
  const startRows = size === 8 ? 3 : 4;
  if ((row + col) % 2 === 0) return null;
  if (row < startRows) return "b";
  if (row > size - 1 - startRows) return "r";
  return null;
});

const owner = (piece: Piece): PlayerIndex | null => piece ? (piece.toLowerCase() === "r" ? 0 : 1) : null;
const isKing = (piece: Piece) => piece === "R" || piece === "B";

const movesFor = (board: Piece[], index: number, size: number): Move[] => {
  const piece = board[index];
  if (!piece) return [];
  const inside = (row: number, col: number) => row >= 0 && row < size && col >= 0 && col < size;
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

const applyMove = (board: Piece[], from: number, move: Move, size: number): { board: Piece[]; promoted: boolean } => {
  const next = [...board];
  let piece = next[from];
  next[from] = null;
  if (move.capture !== undefined) next[move.capture] = null;
  const row = Math.floor(move.to / size);
  const promoted = (piece === "r" && row === 0) || (piece === "b" && row === size - 1);
  if (piece === "r" && row === 0) piece = "R";
  if (piece === "b" && row === size - 1) piece = "B";
  next[move.to] = piece;
  return { board: next, promoted };
};

// Longueur maximale de la rafle commençant par ce mouvement de prise.
const chainLength = (board: Piece[], from: number, move: Move, size: number): number => {
  if (move.capture === undefined) return 0;
  const { board: next, promoted } = applyMove(board, from, move, size);
  if (promoted) return 1;
  const continuations = movesFor(next, move.to, size).filter((item) => item.capture !== undefined);
  if (!continuations.length) return 1;
  return 1 + Math.max(...continuations.map((item) => chainLength(next, move.to, item, size)));
};

const filterMajority = (board: Piece[], moves: FullMove[], size: number, majority: boolean): FullMove[] => {
  const captures = moves.filter((move) => move.capture !== undefined);
  if (!captures.length) return moves;
  if (!majority) return captures;
  const lengths = captures.map((move) => chainLength(board, move.from, move, size));
  const best = Math.max(...lengths);
  return captures.filter((_, index) => lengths[index] === best);
};

const legalMovesFor = (board: Piece[], player: PlayerIndex, size: number, majority: boolean): FullMove[] => {
  const moves = board.flatMap((piece, index) => owner(piece) === player ? movesFor(board, index, size).map((move) => ({ from: index, ...move })) : []);
  return filterMajority(board, moves, size, majority);
};

export function Checkers({ players, settings, onWin, feedback }: GameProps) {
  const size = settings.checkersSize;
  const majority = settings.checkersMajority;
  const [board, setBoard] = useState<Piece[]>(() => initial(size));
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [chain, setChain] = useState<number | null>(null);
  const reported = useRef(false);

  useEffect(() => {
    reported.current = false;
    setBoard(initial(size));
    setTurn(0);
    setSelected(null);
    setChain(null);
  }, [size]);

  const counts = useMemo(() => [board.filter((piece) => owner(piece) === 0).length, board.filter((piece) => owner(piece) === 1).length] as [number, number], [board]);
  const legalMoves = useMemo(() => {
    if (chain !== null) {
      const continuations = movesFor(board, chain, size).filter((move) => move.capture !== undefined).map((move) => ({ from: chain, ...move }));
      return filterMajority(board, continuations, size, majority);
    }
    return legalMovesFor(board, turn, size, majority);
  }, [board, turn, chain, size, majority]);
  const mustCapture = legalMoves.some((move) => move.capture !== undefined);
  const winner = counts[0] === 0 ? 1 : counts[1] === 0 ? 0 : legalMoves.length === 0 ? (turn === 0 ? 1 : 0) as PlayerIndex : null;
  const possible = selected === null ? [] : legalMoves.filter((move) => move.from === selected);
  const status = winner === null ? `${players[turn].name} ${chain !== null ? "enchaîne la prise" : mustCapture ? "doit prendre" : "avance"}` : `${players[winner].name} gagne`;

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    onWin(winner);
  }, [winner, onWin]);

  const click = (index: number) => {
    if (winner !== null) return;
    if (owner(board[index]) === turn && chain === null) {
      if (!legalMoves.some((move) => move.from === index)) return;
      setSelected(index);
      feedback("tap");
      return;
    }
    const move = possible.find((item) => item.to === index);
    if (selected === null || !move) return;
    const { board: next, promoted } = applyMove(board, selected, move, size);
    setBoard(next);
    feedback(move.capture !== undefined ? "drop" : "tap");
    const canChain = move.capture !== undefined && !promoted && movesFor(next, move.to, size).some((item) => item.capture !== undefined);
    if (canChain) {
      setChain(move.to);
      setSelected(move.to);
      return;
    }
    setChain(null);
    setSelected(null);
    setTurn(turn === 0 ? 1 : 0);
  };

  const reset = () => {
    reported.current = false;
    setBoard(initial(size));
    setTurn(0);
    setSelected(null);
    setChain(null);
  };

  return (
    <>
      <GameHeader title="Dames" status={status} onReset={reset} />
      <div className="duel-score">
        <span className={turn === 0 && winner === null ? "active" : ""}>{players[0].avatar} {players[0].name} · {counts[0]} pions</span>
        <span className={turn === 1 && winner === null ? "active" : ""}>{players[1].avatar} {players[1].name} · {counts[1]} pions</span>
      </div>
      <div className="checkers-board" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {board.map((piece, index) => (
          <button key={index} className={`checker-cell ${(Math.floor(index / size) + index) % 2 ? "dark" : ""} ${possible.some((move) => move.to === index) ? "valid" : ""} ${selected === index ? "selected" : ""}`} onClick={() => click(index)}>
            {piece && <span className={`checker-piece ${owner(piece) === 0 ? "red" : "black"} ${isKing(piece) ? "king" : ""}`} />}
          </button>
        ))}
      </div>
      {majority && <p className="hand-label">Prise majoritaire : tu dois jouer la rafle qui capture le plus de pions.</p>}
    </>
  );
}
