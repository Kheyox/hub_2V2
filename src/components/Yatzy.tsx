import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Player = 0 | 1;
type Category = "ones" | "twos" | "threes" | "fours" | "fives" | "sixes" | "chance" | "yatzy";
type Scores = Record<Category, number | null>;

const categories: Array<{ id: Category; label: string }> = [
  { id: "ones", label: "Uns" },
  { id: "twos", label: "Deux" },
  { id: "threes", label: "Trois" },
  { id: "fours", label: "Quatre" },
  { id: "fives", label: "Cinq" },
  { id: "sixes", label: "Six" },
  { id: "chance", label: "Chance" },
  { id: "yatzy", label: "Yatzy" }
];

const emptyScores = (): Scores => ({ ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null, chance: null, yatzy: null });
const rollDice = (held: boolean[], current: number[]) => current.map((value, index) => (held[index] ? value : Math.ceil(Math.random() * 6)));

const scoreFor = (category: Category, dice: number[]) => {
  const target = categories.findIndex((item) => item.id === category) + 1;
  if (category === "chance") return dice.reduce((sum, value) => sum + value, 0);
  if (category === "yatzy") return dice.every((value) => value === dice[0]) ? 50 : 0;
  return dice.filter((value) => value === target).reduce((sum, value) => sum + value, 0);
};

export function Yatzy({ players, onWin, feedback }: GameProps) {
  const [dice, setDice] = useState([1, 1, 1, 1, 1]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [rolling, setRolling] = useState(false);
  const [rolls, setRolls] = useState(0);
  const [player, setPlayer] = useState<Player>(0);
  const reportedWinner = useRef<PlayerIndex | null>(null);
  const [scores, setScores] = useState<[Scores, Scores]>([emptyScores(), emptyScores()]);
  const totals = useMemo(() => scores.map((sheet) => Object.values(sheet).reduce<number>((sum, value) => sum + (value ?? 0), 0)), [scores]);
  const finished = scores.every((sheet) => Object.values(sheet).every((value) => value !== null));
  const winnerIndex = totals[0] === totals[1] ? null : ((totals[0] > totals[1] ? 0 : 1) as PlayerIndex);
  const status = finished ? `Fin: ${players[0].name} ${totals[0]} - ${players[1].name} ${totals[1]}` : `${players[player].name} - lancer ${rolls}/3`;

  useEffect(() => {
    if (!finished || winnerIndex === null || reportedWinner.current === winnerIndex) return;
    reportedWinner.current = winnerIndex;
    onWin(winnerIndex);
  }, [finished, winnerIndex, onWin]);

  const roll = () => {
    if (rolls >= 3 || finished || rolling) {
      feedback("error");
      return;
    }
    feedback("tap");
    setRolling(true);
    window.setTimeout(() => {
      setDice((current) => rollDice(held, current));
      setRolls((current) => current + 1);
      setRolling(false);
    }, 430);
  };

  const score = (category: Category) => {
    if (rolls === 0 || scores[player][category] !== null || finished || rolling) return;
    const next: [Scores, Scores] = [{ ...scores[0] }, { ...scores[1] }];
    next[player][category] = scoreFor(category, dice);
    setScores(next);
    setPlayer(player === 0 ? 1 : 0);
    setHeld([false, false, false, false, false]);
    setRolls(0);
    setDice([1, 1, 1, 1, 1]);
  };

  const reset = () => {
    setDice([1, 1, 1, 1, 1]);
    setHeld([false, false, false, false, false]);
    setRolling(false);
    setRolls(0);
    setPlayer(0);
    reportedWinner.current = null;
    setScores([emptyScores(), emptyScores()]);
  };

  return (
    <>
      <GameHeader title="Yatzy" status={status} onReset={reset} />
      <div className={rolling ? "dice-row rolling" : "dice-row"}>
        {dice.map((value, index) => (
          <button
            key={index}
            className={held[index] ? "die held" : "die"}
            disabled={rolling}
            onClick={() => { feedback("tap"); setHeld(held.map((item, itemIndex) => (itemIndex === index ? !item : item))); }}
            aria-label={`De ${index + 1}: ${value}${held[index] ? ", garde" : ""}`}
          >
            <span className={`pip-face face-${value}`}>
              {Array.from({ length: value }).map((_, pipIndex) => (
                <span key={pipIndex} className="pip" />
              ))}
            </span>
          </button>
        ))}
      </div>
      <button className="primary-action" disabled={rolls >= 3 || finished || rolling} onClick={roll}>
        {rolling ? "Ca roule..." : "Lancer"}
      </button>
      <div className="score-table">
        <div className="score-row head"><span>Categorie</span><span>{players[0].name}</span><span>{players[1].name}</span></div>
        {categories.map((category) => (
          <button key={category.id} className="score-row" onClick={() => score(category.id)} disabled={scores[player][category.id] !== null || rolls === 0 || finished || rolling}>
            <span>{category.label}</span>
            <span>{scores[0][category.id] ?? "-"}</span>
            <span>{scores[1][category.id] ?? "-"}</span>
          </button>
        ))}
        <div className="score-row total"><span>Total</span><span>{totals[0]}</span><span>{totals[1]}</span></div>
      </div>
    </>
  );
}
