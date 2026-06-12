import { useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";
import { Handover } from "./Handover";

type Phase = "set" | "hand" | "guess" | "interlude" | "done";

export function HigherLower({ players, onWin, feedback }: GameProps) {
  const [round, setRound] = useState(0); // 0 : J1 cache, J2 devine — 1 : inverse
  const [phase, setPhase] = useState<Phase>("set");
  const [secretInput, setSecretInput] = useState("");
  const [secret, setSecret] = useState(0);
  const [guessInput, setGuessInput] = useState("");
  const [guesses, setGuesses] = useState<number[]>([]);
  const [attempts, setAttempts] = useState<[number, number]>([0, 0]); // essais du devineur de chaque manche
  const reported = useRef(false);
  const setter: PlayerIndex = round === 0 ? 0 : 1;
  const guesser: PlayerIndex = round === 0 ? 1 : 0;
  // attempts[0] = essais de J2 (manche 1), attempts[1] = essais de J1 (manche 2)
  const winner: PlayerIndex | null = phase === "done"
    ? (attempts[0] === attempts[1] ? null : attempts[0] < attempts[1] ? 1 : 0)
    : null;
  const lastGuess = guesses[guesses.length - 1];
  const status = phase === "set"
    ? `${players[setter].name} cache un nombre (1-100)`
    : phase === "guess"
      ? `${players[guesser].name} devine · essai ${guesses.length + 1}`
      : phase === "interlude"
        ? `Trouvé en ${attempts[0]} essai${attempts[0] > 1 ? "s" : ""} ! On échange.`
        : phase === "done"
          ? (winner === null ? `Égalité ${attempts[0]} - ${attempts[1]}` : `${players[winner].name} gagne ${attempts[winner === 1 ? 0 : 1]} - ${attempts[winner === 1 ? 1 : 0]}`)
          : "";

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    onWin(winner, `${Math.min(...attempts)} essais contre ${Math.max(...attempts)}`);
  }, [winner, onWin, attempts]);

  const submitSecret = () => {
    const value = Number(secretInput);
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      feedback("error");
      return;
    }
    setSecret(value);
    setSecretInput("");
    setGuesses([]);
    setPhase("hand");
    feedback("tap");
  };

  const submitGuess = () => {
    const value = Number(guessInput);
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      feedback("error");
      return;
    }
    setGuessInput("");
    const nextGuesses = [...guesses, value];
    setGuesses(nextGuesses);
    if (value === secret) {
      feedback("win");
      if (round === 0) {
        setAttempts([nextGuesses.length, 0]);
        setPhase("interlude");
      } else {
        setAttempts((current) => [current[0], nextGuesses.length]);
        setPhase("done");
      }
    } else {
      feedback("tap");
    }
  };

  const startRoundTwo = () => {
    setRound(1);
    setSecret(0);
    setGuesses([]);
    setPhase("set");
    feedback("tap");
  };

  const reset = () => {
    reported.current = false;
    setRound(0);
    setPhase("set");
    setSecretInput("");
    setSecret(0);
    setGuessInput("");
    setGuesses([]);
    setAttempts([0, 0]);
  };

  return (
    <>
      <GameHeader title="Plus haut Plus bas" status={status} onReset={reset} />
      <div className="duel-score">
        <span className={round === 0 && phase !== "done" ? "active" : ""}>Manche 1 : {attempts[0] > 0 ? `${attempts[0]} essais` : "en cours"}</span>
        <span className={round === 1 && phase !== "done" ? "active" : ""}>Manche 2 : {attempts[1] > 0 ? `${attempts[1]} essais` : round === 1 ? "en cours" : "à venir"}</span>
      </div>
      {phase === "set" && (
        <div className="hangman-setup">
          <p className="hand-label">{players[setter].name}, choisis un nombre entre 1 et 100 — {players[guesser].name}, ne regarde pas !</p>
          <input
            type="password"
            inputMode="numeric"
            value={secretInput}
            onChange={(event) => setSecretInput(event.target.value.replace(/\D/g, "").slice(0, 3))}
            placeholder="Nombre secret (1-100)"
            autoComplete="off"
          />
          <button className="primary-action" onClick={submitSecret}>Cacher le nombre</button>
        </div>
      )}
      {phase === "hand" && (
        <Handover to={players[guesser].name} note="Trouve le nombre en un minimum d'essais." onReady={() => { setPhase("guess"); }} />
      )}
      {phase === "guess" && (
        <>
          <div className="hl-input">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              value={guessInput}
              onChange={(event) => setGuessInput(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") submitGuess(); }}
              placeholder="Ta proposition"
            />
            <button className="primary-action" onClick={submitGuess}>Deviner</button>
          </div>
          <div className="hl-history">
            {[...guesses].reverse().map((guess, index) => (
              <span key={guesses.length - index} className={guess === secret ? "found" : guess < secret ? "low" : "high"}>
                {guess} {guess === secret ? "🎯" : guess < secret ? "↑ plus haut" : "↓ plus bas"}
              </span>
            ))}
          </div>
        </>
      )}
      {phase === "interlude" && (
        <div className="hl-interlude">
          <p>🎯 {players[1].name} a trouvé <strong>{secret}</strong> en <strong>{attempts[0]}</strong> essai{attempts[0] > 1 ? "s" : ""}.</p>
          <p>Maintenant {players[1].name} cache un nombre et {players[0].name} devine. Moins d'essais = victoire !</p>
          <button className="primary-action" onClick={startRoundTwo}>Manche 2</button>
        </div>
      )}
      {phase === "done" && lastGuess !== undefined && (
        <div className="hl-interlude">
          <p>Le nombre était <strong>{secret}</strong>.</p>
          <p>{players[1].name} : {attempts[0]} essais · {players[0].name} : {attempts[1]} essais</p>
        </div>
      )}
    </>
  );
}
