import { useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

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
  const [coder, setCoder] = useState<PlayerIndex>(0);
  const [phase, setPhase] = useState<"roles" | "secret" | "guess" | "done">("roles");
  const [secret, setSecret] = useState<number[]>([]);
  const [guess, setGuess] = useState<number[]>([]);
  const [history, setHistory] = useState<Array<{ guess: number[]; exact: number; misplaced: number }>>([]);
  const reported = useRef(false);
  const guesser: PlayerIndex = coder === 0 ? 1 : 0;
  const lastGuess = history[history.length - 1];
  const winner = lastGuess?.exact === 4 ? guesser : history.length >= tries ? coder : null;
  const status = phase === "roles"
    ? "Qui code en secret ?"
    : phase === "secret"
      ? `${players[coder].name} prépare le code`
      : winner === null
        ? `${players[guesser].name} devine (essai ${history.length + 1}/${tries})`
        : `${players[winner].name} gagne`;

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    onWin(winner, winner === guesser ? `Code trouvé en ${history.length} essais` : "Code non trouvé");
    setPhase("done");
  }, [winner, onWin, guesser, history.length]);

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
    setPhase("roles");
    setSecret([]);
    setGuess([]);
    setHistory([]);
  };

  if (phase === "roles") {
    return (
      <>
        <GameHeader title="Mastermind" status={status} onReset={reset} />
        <div className="role-picker">
          {([0, 1] as PlayerIndex[]).map((index) => (
            <button key={index} className="secondary-action" onClick={() => { setCoder(index); setPhase("secret"); }}>
              {players[index].name} code, {players[index === 0 ? 1 : 0].name} devine
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <GameHeader title="Mastermind" status={status} onReset={reset} />
      {phase === "done" && (
        <div className="secret-strip revealed">
          <small>Le code était</small>
          {secret.map((color, index) => <span key={index} style={{ background: colors[color] }} />)}
        </div>
      )}
      {phase !== "done" && (
        <div className="secret-strip">
          {(phase === "secret" ? secret : guess).map((color, index) => <span key={index} style={{ background: colors[color] }} />)}
          {Array.from({ length: 4 - (phase === "secret" ? secret : guess).length }).map((_, index) => <span key={`empty-${index}`} />)}
        </div>
      )}
      <div className="color-picker">
        {colors.map((color, index) => <button key={color} style={{ background: color }} disabled={phase === "done"} onClick={() => add(index)} aria-label={`Couleur ${index + 1}`} />)}
      </div>
      <div className="action-row">
        <button className="mini-action" disabled={phase === "done"} onClick={() => phase === "secret" ? setSecret(secret.slice(0, -1)) : setGuess(guess.slice(0, -1))}>Effacer</button>
        <button className="mini-action primary-mini" disabled={phase === "done"} onClick={submit}>{phase === "secret" ? "Cacher le code" : "Valider"}</button>
      </div>
      <div className="guess-list">
        {[...history].reverse().map((row, index) => (
          <div key={history.length - index} className="guess-row">
            <span>{row.guess.map((color, colorIndex) => <i key={`${index}-${colorIndex}`} style={{ background: colors[color] }} />)}</span>
            <strong>{row.exact} bien · {row.misplaced} mal placé{row.misplaced > 1 ? "s" : ""}</strong>
          </div>
        ))}
      </div>
    </>
  );
}
