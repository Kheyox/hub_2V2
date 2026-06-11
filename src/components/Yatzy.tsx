import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import { emptyYatzySheet, isYatzySheetComplete, yatzyBonusFor, yatzyScoreFor, yatzyTotalFor, yatzyUpperTotal, type YatzyCategory, type YatzyScoreSheet } from "../gameEngines";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Player = 0 | 1;
type Category = YatzyCategory;

const upperCategories: Array<{ id: Category; label: string; icon: string }> = [
  { id: "ones", label: "Un", icon: "⚀" },
  { id: "twos", label: "Deux", icon: "⚁" },
  { id: "threes", label: "Trois", icon: "⚂" },
  { id: "fours", label: "Quatre", icon: "⚃" },
  { id: "fives", label: "Cinq", icon: "⚄" },
  { id: "sixes", label: "Six", icon: "⚅" }
];

const lowerCategories: Array<{ id: Category; label: string; icon: string }> = [
  { id: "onePair", label: "Paire", icon: "2×" },
  { id: "twoPairs", label: "2 paires", icon: "2+2" },
  { id: "threeKind", label: "Brelan", icon: "3×" },
  { id: "fourKind", label: "Carré", icon: "4×" },
  { id: "smallStraight", label: "P. suite", icon: "↗4" },
  { id: "largeStraight", label: "G. suite", icon: "↗5" },
  { id: "fullHouse", label: "Full", icon: "🏠" },
  { id: "chance", label: "Chance", icon: "?" },
  { id: "yatzy", label: "Yatzy", icon: "★" }
];

const rollDice = (held: boolean[], current: number[]) => current.map((value, index) => (held[index] ? value : Math.ceil(Math.random() * 6)));

export function Yatzy({ players, onWin, feedback }: GameProps) {
  const [dice, setDice] = useState([1, 1, 1, 1, 1]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [rolling, setRolling] = useState(false);
  const [rolls, setRolls] = useState(0);
  const [player, setPlayer] = useState<Player>(0);
  const reportedWinner = useRef<PlayerIndex | null>(null);
  const [scores, setScores] = useState<[YatzyScoreSheet, YatzyScoreSheet]>([emptyYatzySheet(), emptyYatzySheet()]);
  const totals = useMemo(() => scores.map(yatzyTotalFor), [scores]);
  const upperTotals = useMemo(() => scores.map(yatzyUpperTotal), [scores]);
  const bonuses = useMemo(() => scores.map(yatzyBonusFor), [scores]);
  const finished = scores.every(isYatzySheetComplete);
  const winnerIndex = totals[0] === totals[1] ? null : ((totals[0] > totals[1] ? 0 : 1) as PlayerIndex);
  const canScore = rolls > 0 && !finished && !rolling;
  const status = finished
    ? (winnerIndex === null ? `Égalité ${totals[0]} - ${totals[1]}` : `${players[winnerIndex].name} gagne ${totals[winnerIndex]} - ${totals[winnerIndex === 0 ? 1 : 0]}`)
    : `${players[player].name} joue`;

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
    feedback("dice");
    setRolling(true);
    window.setTimeout(() => {
      setDice((current) => rollDice(held, current));
      setRolls((current) => current + 1);
      setRolling(false);
    }, 430);
  };

  const score = (category: Category) => {
    if (!canScore || scores[player][category] !== null) return;
    feedback("tap");
    const next: [YatzyScoreSheet, YatzyScoreSheet] = [{ ...scores[0] }, { ...scores[1] }];
    next[player][category] = yatzyScoreFor(category, dice);
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
    setScores([emptyYatzySheet(), emptyYatzySheet()]);
  };

  const renderCell = (category: { id: Category; label: string; icon: string }) => {
    const stored = [scores[0][category.id], scores[1][category.id]];
    const open = stored[player] === null && canScore;
    const preview = open ? yatzyScoreFor(category.id, dice) : null;
    return (
      <button
        key={category.id}
        className={`yatzy-cell ${open ? "open" : ""}`}
        onClick={() => score(category.id)}
        disabled={!open}
        aria-label={`${category.label} : ${players[0].name} ${stored[0] ?? "vide"}, ${players[1].name} ${stored[1] ?? "vide"}`}
      >
        <span className="yatzy-icon" aria-hidden="true">{category.icon}</span>
        <span className="yatzy-label">{category.label}</span>
        <span className="yatzy-vals">
          {([0, 1] as Player[]).map((index) => (
            <b key={index} className={`val-${index} ${index === player && !finished ? "now" : ""}`}>
              {stored[index] !== null ? stored[index] : index === player && preview !== null ? `+${preview}` : "·"}
            </b>
          ))}
        </span>
      </button>
    );
  };

  return (
    <>
      <GameHeader title="Yatzy" status={status} onReset={reset} />
      <div className="yatzy-sheet">
        <div className="yatzy-col upper">
          {upperCategories.map(renderCell)}
          <div className="yatzy-cell bonus">
            <span className="yatzy-icon" aria-hidden="true">🎁</span>
            <span className="yatzy-label">Bonus</span>
            <span className="yatzy-vals">
              <b className="val-0">{bonuses[0] || `${upperTotals[0]}/63`}</b>
              <b className="val-1">{bonuses[1] || `${upperTotals[1]}/63`}</b>
            </span>
          </div>
        </div>
        <div className="yatzy-col lower">
          {lowerCategories.map(renderCell)}
        </div>
      </div>
      <div className="yatzy-totals">
        <span className={player === 0 && !finished ? "active" : ""}>{players[0].name} · {totals[0]}</span>
        <span className={player === 1 && !finished ? "active" : ""}>{players[1].name} · {totals[1]}</span>
      </div>
      <div className={rolling ? "dice-row rolling" : "dice-row"}>
        {dice.map((value, index) => (
          <button
            key={index}
            className={held[index] ? "die held" : "die"}
            disabled={rolling || rolls === 0 || finished}
            onClick={() => { feedback("tap"); setHeld(held.map((item, itemIndex) => (itemIndex === index ? !item : item))); }}
            aria-label={`Dé ${index + 1}: ${value}${held[index] ? ", gardé" : ""}`}
          >
            <span className={`pip-face face-${value}`}>
              {Array.from({ length: value }).map((_, pipIndex) => (
                <span key={pipIndex} className="pip" />
              ))}
            </span>
          </button>
        ))}
      </div>
      <button className="primary-action yatzy-roll" disabled={rolls >= 3 || finished || rolling} onClick={roll}>
        {rolling ? "Ça roule..." : rolls === 0 ? "Lancer les dés" : "Relancer"}
        <span className="roll-dots" aria-label={`${3 - rolls} lancers restants`}>
          {[0, 1, 2].map((index) => <i key={index} className={index < 3 - rolls ? "left" : ""} />)}
        </span>
      </button>
    </>
  );
}
