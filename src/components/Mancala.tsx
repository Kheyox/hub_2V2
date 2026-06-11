import { useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

const initialPits = () => Array(12).fill(4) as number[];
const sideEmpty = (pits: number[], player: PlayerIndex) => (player === 0 ? pits.slice(0, 6) : pits.slice(6, 12)).every((value) => value === 0);
const ownPit = (pit: number, player: PlayerIndex) => player === 0 ? pit >= 0 && pit < 6 : pit >= 6 && pit < 12;
const oppositePit = (pit: number) => 11 - pit;

export function Mancala({ players, onWin }: GameProps) {
  const [pits, setPits] = useState<number[]>(initialPits);
  const [stores, setStores] = useState<[number, number]>([0, 0]);
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const reported = useRef(false);
  const finished = sideEmpty(pits, 0) || sideEmpty(pits, 1);
  const finalStores: [number, number] = finished ? [stores[0] + pits.slice(0, 6).reduce((a, b) => a + b, 0), stores[1] + pits.slice(6).reduce((a, b) => a + b, 0)] : stores;
  const winner = finalStores[0] === finalStores[1] ? null : (finalStores[0] > finalStores[1] ? 0 : 1) as PlayerIndex;
  const status = finished ? (winner === null ? "Égalité" : `${players[winner].name} gagne`) : `${players[turn].name} sème`;

  useEffect(() => {
    if (!finished || winner === null || reported.current) return;
    reported.current = true;
    onWin(winner);
  }, [finished, winner, onWin]);

  const play = (pit: number) => {
    if (finished || pits[pit] === 0 || (turn === 0 ? pit > 5 : pit < 6)) return;
    const nextPits = [...pits];
    const nextStores: [number, number] = [...stores];
    let stones = nextPits[pit];
    nextPits[pit] = 0;
    let pos = pit;
    while (stones > 0) {
      pos = (pos + 1) % 14;
      if (pos === 6) {
        if (turn === 0) { nextStores[0] += 1; stones -= 1; }
      } else if (pos === 13) {
        if (turn === 1) { nextStores[1] += 1; stones -= 1; }
      } else {
        const pitIndex = pos > 6 ? pos - 1 : pos;
        nextPits[pitIndex] += 1;
        stones -= 1;
      }
    }
    const lastPit = pos === 6 || pos === 13 ? null : pos > 6 ? pos - 1 : pos;
    if (lastPit !== null && ownPit(lastPit, turn) && nextPits[lastPit] === 1) {
      const opposite = oppositePit(lastPit);
      if (nextPits[opposite] > 0) {
        nextStores[turn] += nextPits[opposite] + nextPits[lastPit];
        nextPits[opposite] = 0;
        nextPits[lastPit] = 0;
      }
    }
    setPits(nextPits);
    setStores(nextStores);
    if (!((turn === 0 && pos === 6) || (turn === 1 && pos === 13))) setTurn(turn === 0 ? 1 : 0);
  };

  const reset = () => {
    reported.current = false;
    setPits(initialPits());
    setStores([0, 0]);
    setTurn(0);
  };

  return (
    <>
      <GameHeader title="Mancala" status={status} onReset={reset} />
      <div className="duel-score">
        <span className={turn === 0 && !finished ? "active" : ""}>{players[0].name} · {finalStores[0]} graines</span>
        <span className={turn === 1 && !finished ? "active" : ""}>{players[1].name} · {finalStores[1]} graines</span>
      </div>
      <div className="mancala-board">
        <div className="mancala-store store-1" aria-label={`Grenier de ${players[1].name}`}>{stores[1]}</div>
        <div className="mancala-pits">
          {[11, 10, 9, 8, 7, 6].map((index) => (
            <button key={index} className={`mancala-pit ${turn === 1 && !finished && pits[index] > 0 ? "playable" : ""}`} onClick={() => play(index)} aria-label={`Case ${index + 1}: ${pits[index]} graines`}>
              <strong>{pits[index]}</strong>
            </button>
          ))}
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <button key={index} className={`mancala-pit ${turn === 0 && !finished && pits[index] > 0 ? "playable" : ""}`} onClick={() => play(index)} aria-label={`Case ${index + 1}: ${pits[index]} graines`}>
              <strong>{pits[index]}</strong>
            </button>
          ))}
        </div>
        <div className="mancala-store store-0" aria-label={`Grenier de ${players[0].name}`}>{stores[0]}</div>
      </div>
      <p className="hand-label">Rangée du bas : {players[0].name} · Rangée du haut : {players[1].name}. Un dernier coup dans ton grenier rejoue.</p>
    </>
  );
}
