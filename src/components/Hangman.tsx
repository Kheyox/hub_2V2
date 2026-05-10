import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps } from "../playerTypes";

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

export function Hangman({ players, settings, onWin }: GameProps) {
  const [phase, setPhase] = useState<"setup" | "guess" | "done">("setup");
  const [wordInput, setWordInput] = useState("");
  const [word, setWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const reported = useRef(false);
  const errors = guesses.filter((letter) => !word.includes(letter)).length;
  const won = Boolean(word) && word.split("").every((letter) => guesses.includes(letter));
  const lost = errors >= settings.hangmanErrors;
  const winner = won ? 1 : lost ? 0 : null;
  const status = phase === "setup" ? `${players[0].name} choisit le mot` : winner === null ? `${players[1].name} devine` : `${players[winner].name} gagne`;

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    setPhase("done");
    onWin(winner, won ? "Mot trouve" : `Mot: ${word}`);
  }, [winner, onWin, won, word]);

  const visibleWord = useMemo(
    () => word.split("").map((letter) => (guesses.includes(letter) || lost ? letter : "_")).join(" "),
    [word, guesses, lost]
  );

  const start = () => {
    const clean = wordInput.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
    if (!clean) return;
    setWord(clean);
    setGuesses([]);
    setPhase("guess");
  };

  const reset = () => {
    reported.current = false;
    setPhase("setup");
    setWordInput("");
    setWord("");
    setGuesses([]);
  };

  return (
    <>
      <GameHeader title="Pendu" status={status} onReset={reset} />
      {phase === "setup" ? (
        <div className="hangman-setup">
          <input type="password" value={wordInput} onChange={(event) => setWordInput(event.target.value)} placeholder="Mot secret" />
          <button className="primary-action" onClick={start}>Cacher le mot</button>
        </div>
      ) : (
        <>
          <div className="hangman-word">{visibleWord}</div>
          <div className="hangman-meter" aria-label={`${errors} erreurs`}>
            {Array.from({ length: settings.hangmanErrors }).map((_, index) => (
              <span key={index} className={index < errors ? "filled" : ""} />
            ))}
          </div>
          <div className="keyboard">
            {alphabet.map((letter) => (
              <button key={letter} disabled={guesses.includes(letter) || won || lost} onClick={() => setGuesses([...guesses, letter])}>
                {letter}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
