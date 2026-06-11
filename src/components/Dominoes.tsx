import { useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Domino = [number, number];
const makeSet = () => {
  const set: Domino[] = [];
  for (let a = 0; a <= 6; a += 1) for (let b = a; b <= 6; b += 1) set.push([a, b]);
  return set.sort(() => Math.random() - 0.5);
};
const pips = (hand: Domino[]) => hand.reduce((sum, [a, b]) => sum + a + b, 0);
const highestDoubleIndex = (hand: Domino[]) => {
  let best = -1;
  let value = -1;
  hand.forEach(([a, b], index) => {
    if (a === b && a > value) {
      best = index;
      value = a;
    }
  });
  return best;
};

export function Dominoes({ players, onWin }: GameProps) {
  const [stock, setStock] = useState<Domino[]>([]);
  const [hands, setHands] = useState<[Domino[], Domino[]]>([[], []]);
  const [line, setLine] = useState<Domino[]>([]);
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const reported = useRef(false);
  const ends = line.length ? [line[0][0], line[line.length - 1][1]] : null;
  const playable = (tile: Domino) => !ends || tile.includes(ends[0]) || tile.includes(ends[1]);
  const canPlay = hands[turn].some(playable);
  const blocked = stock.length === 0 && !hands[0].some(playable) && !hands[1].some(playable) && hands[0].length > 0 && hands[1].length > 0;
  const winner = hands[0].length === 0 && line.length > 0 ? 0 : hands[1].length === 0 && line.length > 0 ? 1 : blocked ? (pips(hands[0]) === pips(hands[1]) ? null : (pips(hands[0]) < pips(hands[1]) ? 0 : 1) as PlayerIndex) : null;
  const finished = winner !== null || blocked;
  const status = winner !== null ? `${players[winner].name} gagne` : blocked ? `Bloqué — égalité ${pips(hands[0])} - ${pips(hands[1])}` : `${players[turn].name} ${canPlay ? "pose" : "pioche"}`;

  const reset = () => {
    const set = makeSet();
    const hand0 = set.slice(0, 7);
    const hand1 = set.slice(7, 14);
    const double0 = highestDoubleIndex(hand0);
    const double1 = highestDoubleIndex(hand1);
    const starter: PlayerIndex = double1 >= 0 && (double0 < 0 || hand1[double1][0] > hand0[double0][0]) ? 1 : 0;
    const starterDouble = starter === 0 ? double0 : double1;
    const nextHands: [Domino[], Domino[]] = [[...hand0], [...hand1]];
    const opening = starterDouble >= 0 ? nextHands[starter].splice(starterDouble, 1)[0] : null;
    reported.current = false;
    setHands(nextHands);
    setStock(set.slice(14));
    setLine(opening ? [opening] : []);
    setTurn(opening ? (starter === 0 ? 1 : 0) : starter);
  };

  useEffect(reset, []);
  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    onWin(winner);
  }, [winner, onWin]);

  const play = (tileIndex: number) => {
    const tile = hands[turn][tileIndex];
    if (!tile || !playable(tile) || winner !== null) return;
    const nextHands: [Domino[], Domino[]] = [hands[0].filter((_, i) => turn !== 0 || i !== tileIndex), hands[1].filter((_, i) => turn !== 1 || i !== tileIndex)];
    let nextLine = [...line];
    if (!ends) nextLine = [tile];
    else if (tile[1] === ends[0]) nextLine = [tile, ...nextLine];
    else if (tile[0] === ends[0]) nextLine = [[tile[1], tile[0]], ...nextLine];
    else if (tile[0] === ends[1]) nextLine = [...nextLine, tile];
    else nextLine = [...nextLine, [tile[1], tile[0]]];
    setHands(nextHands);
    setLine(nextLine);
    setTurn(turn === 0 ? 1 : 0);
  };

  const draw = () => {
    if (!stock.length || canPlay || finished) return;
    const nextHands: [Domino[], Domino[]] = [[...hands[0]], [...hands[1]]];
    nextHands[turn].push(stock[0]);
    setHands(nextHands);
    setStock(stock.slice(1));
  };

  const pass = () => {
    if (stock.length || canPlay || finished) return;
    setTurn(turn === 0 ? 1 : 0);
  };

  return (
    <>
      <GameHeader title="Dominos" status={status} onReset={reset} />
      <div className="duel-score">
        <span className={turn === 0 && !finished ? "active" : ""}>{players[0].name} · {hands[0].length} dominos</span>
        <span className={turn === 1 && !finished ? "active" : ""}>{players[1].name} · {hands[1].length} dominos</span>
      </div>
      <div className="domino-line">
        {line.length === 0 && <span className="empty-state">Pose le premier domino</span>}
        {line.map((tile, index) => <span key={index} className="domino-tile">{tile[0]}|{tile[1]}</span>)}
      </div>
      <p className="hand-label">Main de {players[turn].name}</p>
      <div className="domino-hand">
        {hands[turn].map((tile, index) => <button key={`${tile[0]}-${tile[1]}-${index}`} className="domino-tile" disabled={!playable(tile) || finished} onClick={() => play(index)}>{tile[0]}|{tile[1]}</button>)}
      </div>
      <button className="primary-action" onClick={stock.length ? draw : pass} disabled={canPlay || finished}>
        {stock.length ? `Piocher (${stock.length} en pioche)` : "Passer son tour"}
      </button>
    </>
  );
}
