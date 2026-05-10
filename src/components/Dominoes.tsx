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

export function Dominoes({ players, onWin }: GameProps) {
  const [stock, setStock] = useState<Domino[]>([]);
  const [hands, setHands] = useState<[Domino[], Domino[]]>([[], []]);
  const [line, setLine] = useState<Domino[]>([]);
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const reported = useRef(false);
  const ends = line.length ? [line[0][0], line[line.length - 1][1]] : null;
  const playable = (tile: Domino) => !ends || tile.includes(ends[0]) || tile.includes(ends[1]);
  const blocked = stock.length === 0 && !hands[0].some(playable) && !hands[1].some(playable);
  const winner = hands[0].length === 0 ? 0 : hands[1].length === 0 ? 1 : blocked ? (pips(hands[0]) === pips(hands[1]) ? null : (pips(hands[0]) < pips(hands[1]) ? 0 : 1) as PlayerIndex) : null;
  const status = winner === null ? `${players[turn].name} pose` : `${players[winner].name} gagne`;

  const reset = () => {
    const set = makeSet();
    reported.current = false;
    setHands([set.slice(0, 7), set.slice(7, 14)]);
    setStock(set.slice(14));
    setLine([]);
    setTurn(0);
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
    if (!stock.length || winner !== null) return;
    const nextHands: [Domino[], Domino[]] = [[...hands[0]], [...hands[1]]];
    nextHands[turn].push(stock[0]);
    setHands(nextHands);
    setStock(stock.slice(1));
  };

  return (
    <>
      <GameHeader title="Dominos" status={status} onReset={reset} />
      <div className="domino-line">{line.map((tile, index) => <span key={index} className="domino-tile">{tile[0]}|{tile[1]}</span>)}</div>
      <div className="domino-hand">
        {hands[turn].map((tile, index) => <button key={`${tile[0]}-${tile[1]}-${index}`} className="domino-tile" disabled={!playable(tile)} onClick={() => play(index)}>{tile[0]}|{tile[1]}</button>)}
      </div>
      <button className="primary-action" onClick={draw} disabled={!stock.length}>Piocher ({stock.length})</button>
    </>
  );
}
