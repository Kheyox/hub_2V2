import { useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

const symbols = ["A", "B", "C", "D", "E", "F", "G", "H"];
const makeDeck = () => [...symbols, ...symbols].map((symbol, id) => ({ symbol, id })).sort(() => Math.random() - 0.5);

export function MemoryDuel({ players, onWin }: GameProps) {
  const [deck, setDeck] = useState(makeDeck);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const reported = useRef(false);
  const finished = found.length === deck.length;
  const winner = score[0] === score[1] ? null : (score[0] > score[1] ? 0 : 1) as PlayerIndex;
  const status = finished ? (winner === null ? "Egalite" : `${players[winner].name} gagne`) : `${players[turn].name} cherche une paire`;

  useEffect(() => {
    if (!finished || winner === null || reported.current) return;
    reported.current = true;
    onWin(winner);
  }, [finished, winner, onWin]);

  const flip = (index: number) => {
    if (open.length === 2 || open.includes(index) || found.includes(index)) return;
    const next = [...open, index];
    setOpen(next);
    if (next.length === 2) {
      window.setTimeout(() => {
        if (deck[next[0]].symbol === deck[next[1]].symbol) {
          setFound((current) => [...current, ...next]);
          setScore((current) => turn === 0 ? [current[0] + 1, current[1]] : [current[0], current[1] + 1]);
        } else {
          setTurn(turn === 0 ? 1 : 0);
        }
        setOpen([]);
      }, 650);
    }
  };

  const reset = () => {
    reported.current = false;
    setDeck(makeDeck());
    setOpen([]);
    setFound([]);
    setTurn(0);
    setScore([0, 0]);
  };

  return (
    <>
      <GameHeader title="Memory" status={status} onReset={reset} />
      <div className="duel-score"><span>{players[0].name}: {score[0]}</span><span>{players[1].name}: {score[1]}</span></div>
      <div className="memory-board">
        {deck.map((card, index) => {
          const visible = open.includes(index) || found.includes(index);
          return <button key={card.id} className={visible ? "memory-card open" : "memory-card"} onClick={() => flip(index)}>{visible ? card.symbol : ""}</button>;
        })}
      </div>
    </>
  );
}
