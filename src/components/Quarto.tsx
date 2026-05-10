import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

const lines = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
  [0, 5, 10, 15], [3, 6, 9, 12]
];

const hasQuarto = (board: Array<number | null>) => lines.some((line) => {
  const pieces = line.map((index) => board[index]);
  if (pieces.some((piece) => piece === null)) return false;
  return [0, 1, 2, 3].some((bit) => pieces.every((piece) => ((piece as number) >> bit & 1) === ((pieces[0] as number) >> bit & 1)));
});

export function Quarto({ players, onWin }: GameProps) {
  const [board, setBoard] = useState<Array<number | null>>(Array(16).fill(null));
  const [available, setAvailable] = useState<number[]>(Array.from({ length: 16 }, (_, index) => index));
  const [piece, setPiece] = useState<number | null>(null);
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const [phase, setPhase] = useState<"place" | "choose">("choose");
  const reported = useRef(false);
  const winner = hasQuarto(board) ? turn : null;
  const status = winner === null ? (phase === "place" ? `${players[turn].name} place` : `${players[turn].name} choisit`) : `${players[winner].name} gagne`;
  const remaining = useMemo(() => available.filter((item) => item !== piece), [available, piece]);

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    onWin(winner);
  }, [winner, onWin]);

  const place = (index: number) => {
    if (phase !== "place" || piece === null || board[index] !== null || winner !== null) return;
    const next = [...board];
    next[index] = piece;
    setBoard(next);
    setAvailable(available.filter((item) => item !== piece));
    setPiece(null);
    setPhase("choose");
  };

  const choose = (nextPiece: number) => {
    if (phase !== "choose" || winner !== null || !available.includes(nextPiece)) return;
    setPiece(nextPiece);
    setTurn(turn === 0 ? 1 : 0);
    setPhase("place");
  };

  const reset = () => {
    reported.current = false;
    setBoard(Array(16).fill(null));
    setAvailable(Array.from({ length: 16 }, (_, index) => index));
    setPiece(null);
    setTurn(0);
    setPhase("choose");
  };

  return (
    <>
      <GameHeader title="Quarto" status={status} onReset={reset} />
      <div className="quarto-current">Piece a placer: {piece === null ? "-" : piece + 1}</div>
      <div className="quarto-board">
        {board.map((placed, index) => <button key={index} className="quarto-cell" onClick={() => place(index)}>{placed !== null && <QuartoPiece value={placed} />}</button>)}
      </div>
      <div className="piece-bank">
        {remaining.map((item) => <button key={item} disabled={phase !== "choose"} onClick={() => choose(item)}><QuartoPiece value={item} /></button>)}
      </div>
    </>
  );
}

function QuartoPiece({ value }: { value: number }) {
  const tall = Boolean(value & 1);
  const round = Boolean(value & 2);
  const light = Boolean(value & 4);
  const hollow = Boolean(value & 8);
  return <span className={`quarto-piece ${tall ? "tall" : ""} ${round ? "round" : ""} ${light ? "light" : ""} ${hollow ? "hollow" : ""}`} />;
}
