import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Cell = { ship: boolean; hit: boolean };
const size = 5;

const makeFleet = (): Cell[] => {
  const board = Array.from({ length: size * size }, () => ({ ship: false, hit: false }));
  let placed = 0;
  while (placed < 6) {
    const index = Math.floor(Math.random() * board.length);
    if (!board[index].ship) {
      board[index].ship = true;
      placed += 1;
    }
  }
  return board;
};

const remaining = (board: Cell[]) => board.filter((cell) => cell.ship && !cell.hit).length;

export function Battleship({ players, onWin }: GameProps) {
  const [boards, setBoards] = useState<[Cell[], Cell[]]>([makeFleet(), makeFleet()]);
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const reported = useRef(false);
  const left = useMemo(() => [remaining(boards[0]), remaining(boards[1])] as [number, number], [boards]);
  const winner = left[0] === 0 ? 1 : left[1] === 0 ? 0 : null;
  const status = winner === null ? `${players[turn].name} attaque` : `${players[winner].name} gagne`;

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    onWin(winner);
  }, [winner, onWin]);

  const attack = (index: number) => {
    if (winner !== null) return;
    const target = turn === 0 ? 1 : 0;
    if (boards[target][index].hit) return;
    const next: [Cell[], Cell[]] = [boards[0].map((cell) => ({ ...cell })), boards[1].map((cell) => ({ ...cell }))];
    next[target][index].hit = true;
    setBoards(next);
    if (!next[target][index].ship) setTurn(target as PlayerIndex);
  };

  const reset = () => {
    reported.current = false;
    setBoards([makeFleet(), makeFleet()]);
    setTurn(0);
  };

  const target = turn === 0 ? 1 : 0;

  return (
    <>
      <GameHeader title="Bataille navale" status={status} onReset={reset} />
      <div className="duel-score"><span>{players[0].name}: {left[0]} navires</span><span>{players[1].name}: {left[1]} navires</span></div>
      <div className="battle-board">
        {boards[target].map((cell, index) => (
          <button key={index} className={`battle-cell ${cell.hit ? (cell.ship ? "hit" : "miss") : ""}`} onClick={() => attack(index)} aria-label={`Tir ${index + 1}`}>
            {cell.hit ? (cell.ship ? "X" : "•") : ""}
          </button>
        ))}
      </div>
    </>
  );
}
