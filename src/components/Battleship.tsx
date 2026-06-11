import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Cell = { ship: number | null; hit: boolean };
const size = 6;
const fleet = [3, 2, 1];

const makeFleet = (): Cell[] => {
  const board: Cell[] = Array.from({ length: size * size }, () => ({ ship: null, hit: false }));
  fleet.forEach((length, shipIndex) => {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() > 0.5;
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (horizontal && col + length > size) continue;
      if (!horizontal && row + length > size) continue;
      const cells = Array.from({ length }, (_, offset) => (row + (horizontal ? 0 : offset)) * size + col + (horizontal ? offset : 0));
      if (cells.some((index) => board[index].ship !== null)) continue;
      cells.forEach((index) => {
        board[index].ship = shipIndex;
      });
      placed = true;
    }
  });
  return board;
};

const remaining = (board: Cell[]) => board.filter((cell) => cell.ship !== null && !cell.hit).length;

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
    onWin(winner, `${left[winner === 0 ? 1 : 0]} cases restantes`);
  }, [winner, left, onWin]);

  const attack = (index: number) => {
    if (winner !== null) return;
    const target = turn === 0 ? 1 : 0;
    if (boards[target][index].hit) return;
    const next: [Cell[], Cell[]] = [boards[0].map((cell) => ({ ...cell })), boards[1].map((cell) => ({ ...cell }))];
    next[target][index].hit = true;
    setBoards(next);
    if (next[target][index].ship === null) setTurn(target as PlayerIndex);
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
      <div className="duel-score">
        <span className={turn === 0 && winner === null ? "active" : ""}>{players[0].name} · {left[0]} cases à couler</span>
        <span className={turn === 1 && winner === null ? "active" : ""}>{players[1].name} · {left[1]} cases à couler</span>
      </div>
      <p className="hand-label">Flotte de {players[winner === null ? target : (winner === 0 ? 1 : 0)].name} — un tir touché fait rejouer</p>
      <div className="battle-board">
        {boards[winner === null ? target : (winner === 0 ? 1 : 0)].map((cell, index) => (
          <button key={index} className={`battle-cell ${cell.hit ? (cell.ship !== null ? "hit" : "miss") : ""}`} onClick={() => attack(index)} aria-label={`Tir case ${index + 1}`}>
            {cell.hit ? (cell.ship !== null ? "✕" : "•") : ""}
          </button>
        ))}
      </div>
    </>
  );
}
