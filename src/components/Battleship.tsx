import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";
import { Handover } from "./Handover";

type Cell = { ship: number | null; hit: boolean };
const size = 6;
const fleet = [3, 2, 2];

const emptyBoard = (): Cell[] => Array.from({ length: size * size }, () => ({ ship: null, hit: false }));

const cellsFor = (start: number, length: number, horizontal: boolean): number[] | null => {
  const row = Math.floor(start / size);
  const col = start % size;
  if (horizontal && col + length > size) return null;
  if (!horizontal && row + length > size) return null;
  return Array.from({ length }, (_, offset) => (row + (horizontal ? 0 : offset)) * size + col + (horizontal ? offset : 0));
};

const randomFleet = (): Cell[] => {
  const board = emptyBoard();
  fleet.forEach((length, shipIndex) => {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() > 0.5;
      const start = Math.floor(Math.random() * size * size);
      const cells = cellsFor(start, length, horizontal);
      if (!cells || cells.some((index) => board[index].ship !== null)) continue;
      cells.forEach((index) => {
        board[index].ship = shipIndex;
      });
      placed = true;
    }
  });
  return board;
};

const remaining = (board: Cell[]) => board.filter((cell) => cell.ship !== null && !cell.hit).length;

type Phase = "place0" | "hand1" | "place1" | "handPlay" | "play";

export function Battleship({ players, onWin, feedback }: GameProps) {
  const [phase, setPhase] = useState<Phase>("place0");
  const [boards, setBoards] = useState<[Cell[], Cell[]]>([emptyBoard(), emptyBoard()]);
  const [horizontal, setHorizontal] = useState(true);
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const reported = useRef(false);
  const placing: PlayerIndex = phase === "place0" ? 0 : 1;
  const placedShips = useMemo(() => {
    const ships = new Set<number>();
    boards[placing].forEach((cell) => { if (cell.ship !== null) ships.add(cell.ship); });
    return ships;
  }, [boards, placing]);
  const nextShip = fleet.findIndex((_, index) => !placedShips.has(index));
  const allPlaced = nextShip === -1;
  const left = useMemo(() => [remaining(boards[0]), remaining(boards[1])] as [number, number], [boards]);
  const winner = phase === "play" ? (left[0] === 0 ? 1 : left[1] === 0 ? 0 : null) : null;
  const target: PlayerIndex = winner !== null ? (winner === 0 ? 1 : 0) : turn === 0 ? 1 : 0;
  const status = phase === "play"
    ? (winner === null ? `${players[turn].name} attaque` : `${players[winner].name} gagne`)
    : `${players[placing].name} place sa flotte`;

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    onWin(winner, `${left[winner === 0 ? 1 : 0]} cases intactes`);
  }, [winner, left, onWin]);

  const placeAt = (index: number) => {
    if (allPlaced) return;
    const cells = cellsFor(index, fleet[nextShip], horizontal);
    if (!cells || cells.some((cell) => boards[placing][cell].ship !== null)) {
      feedback("error");
      return;
    }
    const next: [Cell[], Cell[]] = [boards[0].map((cell) => ({ ...cell })), boards[1].map((cell) => ({ ...cell }))];
    cells.forEach((cell) => {
      next[placing][cell].ship = nextShip;
    });
    setBoards(next);
    feedback("drop");
  };

  const clearPlacement = () => {
    const next: [Cell[], Cell[]] = [boards[0].map((cell) => ({ ...cell })), boards[1].map((cell) => ({ ...cell }))];
    next[placing] = emptyBoard();
    setBoards(next);
    feedback("tap");
  };

  const autoPlace = () => {
    const next: [Cell[], Cell[]] = [boards[0].map((cell) => ({ ...cell })), boards[1].map((cell) => ({ ...cell }))];
    next[placing] = randomFleet();
    setBoards(next);
    feedback("dice");
  };

  const confirmPlacement = () => {
    if (!allPlaced) return;
    feedback("tap");
    setPhase(placing === 0 ? "hand1" : "handPlay");
  };

  const attack = (index: number) => {
    if (phase !== "play" || winner !== null) return;
    if (boards[target][index].hit) return;
    const next: [Cell[], Cell[]] = [boards[0].map((cell) => ({ ...cell })), boards[1].map((cell) => ({ ...cell }))];
    next[target][index].hit = true;
    setBoards(next);
    feedback(next[target][index].ship !== null ? "win" : "drop");
    if (next[target][index].ship === null) setTurn(target);
  };

  const reset = () => {
    reported.current = false;
    setBoards([emptyBoard(), emptyBoard()]);
    setPhase("place0");
    setHorizontal(true);
    setTurn(0);
  };

  if (phase === "hand1") {
    return (
      <>
        <GameHeader title="Bataille navale" status={status} onReset={reset} />
        <Handover to={players[1].name} note="Sa flotte restera secrète." onReady={() => setPhase("place1")} />
      </>
    );
  }

  if (phase === "handPlay") {
    return (
      <>
        <GameHeader title="Bataille navale" status={status} onReset={reset} />
        <Handover to={players[0].name} note="Que la bataille commence !" onReady={() => setPhase("play")} />
      </>
    );
  }

  if (phase === "place0" || phase === "place1") {
    return (
      <>
        <GameHeader title="Bataille navale" status={status} onReset={reset} />
        <p className="hand-label">
          {allPlaced
            ? "Flotte prête ! Valide pour continuer."
            : `Place ton navire de ${fleet[nextShip]} case${fleet[nextShip] > 1 ? "s" : ""} (${placedShips.size + 1}/${fleet.length}).`}
        </p>
        <div className="battle-board placing">
          {boards[placing].map((cell, index) => (
            <button key={index} className={`battle-cell ${cell.ship !== null ? "own-ship" : ""}`} onClick={() => placeAt(index)} aria-label={`Case ${index + 1}`}>
              {cell.ship !== null ? "⛵" : ""}
            </button>
          ))}
        </div>
        <div className="action-row">
          <button className="mini-action" onClick={() => { setHorizontal(!horizontal); feedback("tap"); }}>
            Sens : {horizontal ? "Horizontal ↔" : "Vertical ↕"}
          </button>
          <button className="mini-action" onClick={autoPlace}>Aléatoire 🎲</button>
        </div>
        <div className="action-row">
          <button className="mini-action" onClick={clearPlacement}>Tout effacer</button>
          <button className="mini-action primary-mini" disabled={!allPlaced} onClick={confirmPlacement}>Valider la flotte</button>
        </div>
      </>
    );
  }

  return (
    <>
      <GameHeader title="Bataille navale" status={status} onReset={reset} />
      <div className="duel-score">
        <span className={turn === 0 && winner === null ? "active" : ""}>{players[0].avatar} {players[0].name} · {left[0]} cases</span>
        <span className={turn === 1 && winner === null ? "active" : ""}>{players[1].avatar} {players[1].name} · {left[1]} cases</span>
      </div>
      <p className="hand-label">Flotte de {players[target].name} — un tir touché fait rejouer</p>
      <div className="battle-board">
        {boards[target].map((cell, index) => (
          <button key={index} className={`battle-cell ${cell.hit ? (cell.ship !== null ? "hit" : "miss") : ""}`} onClick={() => attack(index)} aria-label={`Tir case ${index + 1}`}>
            {cell.hit ? (cell.ship !== null ? "✕" : "•") : ""}
          </button>
        ))}
      </div>
    </>
  );
}
