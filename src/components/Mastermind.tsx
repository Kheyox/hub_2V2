import { useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps } from "../playerTypes";

const colors = ["#e84834", "#f5c84c", "#39c6a3", "#7fb7ff", "#d89cff", "#f28bba"];
const tries = 8;

const feedback = (secret: number[], guess: number[]) => {
  const exact = guess.filter((value, index) => value === secret[index]).length;
  const secretCounts = colors.map((_, color) => secret.filter((value) => value === color).length);
  const guessCounts = colors.map((_, color) => guess.filter((value) => value === color).length);
  const colorMatches = secretCounts.reduce((sum, count, index) => sum + Math.min(count, guessCounts[index]), 0);
  return { exact, misplaced: colorMatches - exact };
};

export function Mastermind({ players, onWin }: GameProps) {
  const [phase, setPhase] = useState<"secret" | "guess" | "done">("secret");
  const [secret, setSecret] = useState<number[]>([]);
  const [guess, setGuess] = useState<number[]>([]);
  const [history, setHistory] = useState<Array<{ guess: number[]; exact: number; misplaced: number }>>([]);
  const reported = useRef(false);
  const lastGuess = history[history.length - 1];
  const winner = lastGuess?.exact === 4 ? 1 : history.length >= tries ? 0 : null;
  const status = phase === "secret" ? `${players[0].name} prepare le code` : winner === null ? `${players[1].name} devine` : `${players[winner].name} gagne`;

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    onWin(winner);
    setPhase("done");
  }, [winner, onWin]);

  const add = (color: number) => {
    if (phase === "secret" && secret.length < 4) setSecret([...secret, color]);
    if (phase === "guess" && guess.length < 4) setGuess([...guess, color]);
  };

  const submit = () => {
    if (phase === "secret" && secret.length === 4) setPhase("guess");
    if (phase === "guess" && guess.length === 4) {
      const result = feedback(secret, guess);
      setHistory([...history, { guess, ...result }]);
      setGuess([]);
    }
  };

  const reset = () => {
    reported.current = false;
    setPhase("secret");
    setSecret([]);
    setGuess([]);
    setHistory([]);
  };

  return (
    <>
      <GameHeader title="Mastermind" status={status} onReset={reset} />
      <div className="secret-strip">
        {(phase === "secret" ? secret : guess).map((color, index) => <span key={index} style={{ background: colors[color] }} />)}
        {Array.from({ length: 4 - (phase === "secret" ? secret : guess).length }).map((_, index) => <span key={`empty-${index}`} />)}
      </div>
      <div className="color-picker">
        {colors.map((color, index) => <button key={color} style={{ background: color }} onClick={() => add(index)} aria-label={`Couleur ${index + 1}`} />)}
      </div>
      <div className="action-row">
        <button className="mini-action" onClick={() => phase === "secret" ? setSecret(secret.slice(0, -1)) : setGuess(guess.slice(0, -1))}>Effacer</button>
        <button className="mini-action primary-mini" onClick={submit}>{phase === "secret" ? "Cacher" : "Valider"}</button>
      </div>
      <div className="guess-list">
        {history.map((row, index) => (
          <div key={index} className="guess-row">
            <span>{row.guess.map((color, colorIndex) => <i key={`${index}-${colorIndex}`} style={{ background: colors[color] }} />)}</span>
            <strong>{row.exact} bien / {row.misplaced} couleur</strong>
          </div>
        ))}
      </div>
    </>
  );
}
