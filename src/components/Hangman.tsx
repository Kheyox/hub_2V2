import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

export function Hangman({ players, settings, onWin }: GameProps) {
  const [phase, setPhase] = useState<"roles" | "setup" | "guess" | "done">("roles");
  const [setter, setSetter] = useState<PlayerIndex>(0);
  const [wordInput, setWordInput] = useState("");
  const [word, setWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const reported = useRef(false);
  const guesser: PlayerIndex = setter === 0 ? 1 : 0;
  const errors = guesses.filter((letter) => !word.includes(letter)).length;
  const won = Boolean(word) && word.split("").every((letter) => guesses.includes(letter));
  const lost = errors >= settings.hangmanErrors;
  const winner = won ? guesser : lost ? setter : null;
  const status = phase === "roles"
    ? "Qui choisit le mot ?"
    : phase === "setup"
      ? `${players[setter].name} écrit le mot secret`
      : winner === null
        ? `${players[guesser].name} devine (${settings.hangmanErrors - errors} erreur${settings.hangmanErrors - errors > 1 ? "s" : ""} restante${settings.hangmanErrors - errors > 1 ? "s" : ""})`
        : `${players[winner].name} gagne`;

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    setPhase("done");
    onWin(winner, won ? "Mot trouvé" : `Le mot était « ${word} »`);
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
    setPhase("roles");
    setWordInput("");
    setWord("");
    setGuesses([]);
  };

  return (
    <>
      <GameHeader title="Pendu" status={status} onReset={reset} />
      {phase === "roles" && (
        <div className="role-picker">
          {([0, 1] as PlayerIndex[]).map((index) => (
            <button key={index} className="secondary-action" onClick={() => { setSetter(index); setPhase("setup"); }}>
              {players[index].name} cache un mot, {players[index === 0 ? 1 : 0].name} devine
            </button>
          ))}
        </div>
      )}
      {phase === "setup" && (
        <div className="hangman-setup">
          <input
            type="password"
            value={wordInput}
            onChange={(event) => setWordInput(event.target.value)}
            placeholder="Mot secret (lettres uniquement)"
            autoComplete="off"
          />
          <button className="primary-action" onClick={start}>Cacher le mot</button>
        </div>
      )}
      {(phase === "guess" || phase === "done") && (
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
