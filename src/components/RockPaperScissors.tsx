import { useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

const TARGET = 5;
const moves = [
  { id: 0, emoji: "✊", label: "Pierre" },
  { id: 1, emoji: "✋", label: "Feuille" },
  { id: 2, emoji: "✌️", label: "Ciseaux" }
];

// 0 bat 2, 1 bat 0, 2 bat 1
const beats = (a: number, b: number) => (a === 0 && b === 2) || (a === 1 && b === 0) || (a === 2 && b === 1);

const shuffled = () => [0, 1, 2].sort(() => Math.random() - 0.5);

export function RockPaperScissors({ players, onWin, feedback }: GameProps) {
  const [choices, setChoices] = useState<[number | null, number | null]>([null, null]);
  const [orders, setOrders] = useState<[number[], number[]]>(() => [shuffled(), shuffled()]);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [roundNote, setRoundNote] = useState("");
  const reported = useRef(false);
  const winner = score[0] >= TARGET ? 0 : score[1] >= TARGET ? 1 : null;
  const bothChosen = choices[0] !== null && choices[1] !== null;
  const status = winner !== null
    ? `${players[winner].name} gagne ${score[winner]} - ${score[winner === 0 ? 1 : 0]}`
    : revealed
      ? roundNote
      : `Premier à ${TARGET} · ${score[0]} - ${score[1]}`;

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    onWin(winner, `${score[winner]} - ${score[winner === 0 ? 1 : 0]}`);
  }, [winner, onWin, score]);

  useEffect(() => {
    if (!bothChosen || revealed) return;
    const timer = window.setTimeout(() => {
      const [a, b] = choices as [number, number];
      setRevealed(true);
      if (a === b) {
        setRoundNote("Égalité, on rejoue !");
        feedback("tap");
      } else if (beats(a, b)) {
        setScore((current) => [current[0] + 1, current[1]]);
        setRoundNote(`${moves[a].label} bat ${moves[b].label} : point ${players[0].name} !`);
        feedback("win");
      } else {
        setScore((current) => [current[0], current[1] + 1]);
        setRoundNote(`${moves[b].label} bat ${moves[a].label} : point ${players[1].name} !`);
        feedback("win");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [bothChosen, revealed, choices, players, feedback]);

  const choose = (player: PlayerIndex, move: number) => {
    if (revealed || winner !== null || choices[player] !== null) return;
    feedback("tap");
    setChoices((current) => player === 0 ? [move, current[1]] : [current[0], move]);
  };

  const nextRound = () => {
    setChoices([null, null]);
    setOrders([shuffled(), shuffled()]);
    setRevealed(false);
    setRoundNote("");
    feedback("tap");
  };

  const reset = () => {
    reported.current = false;
    setChoices([null, null]);
    setOrders([shuffled(), shuffled()]);
    setRevealed(false);
    setScore([0, 0]);
    setRoundNote("");
  };

  const renderZone = (player: PlayerIndex) => (
    <div className={`rps-zone zone-${player}`} style={{ "--player-color": players[player].color } as React.CSSProperties}>
      <div className="rps-zone-head">
        <span>{players[player].avatar} {players[player].name} · {score[player]}</span>
        {!revealed && choices[player] !== null && <em>Choix verrouillé ✓</em>}
      </div>
      <div className="rps-buttons">
        {orders[player].map((moveId) => {
          const move = moves[moveId];
          return (
            <button
              key={move.id}
              className={`rps-pick ${revealed && choices[player] === move.id ? "revealed" : ""}`}
              disabled={revealed || winner !== null || choices[player] !== null}
              onClick={() => choose(player, move.id)}
              aria-label={move.label}
            >
              {revealed ? (choices[player] === move.id ? move.emoji : "") : move.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <GameHeader title="Pierre-Feuille-Ciseaux" status={status} onReset={reset} />
      {renderZone(1)}
      <div className="rps-middle">
        {revealed && winner === null && (
          <button className="primary-action" onClick={nextRound}>Manche suivante</button>
        )}
        {!revealed && !bothChosen && (
          <span className="rps-hint">
            {choices[0] === null && choices[1] === null ? "Choisissez en secret..." : choices[0] === null ? `En attente de ${players[0].name}` : `En attente de ${players[1].name}`}
          </span>
        )}
        {revealed && winner === null && <span className="rps-note">{roundNote}</span>}
        {winner !== null && <span className="rps-note">🏆 {players[winner].name} remporte le duel !</span>}
      </div>
      {renderZone(0)}
    </>
  );
}
