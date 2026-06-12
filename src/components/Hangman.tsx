import { useEffect, useMemo, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";
import { Handover } from "./Handover";

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

// Le bonhomme se dessine en 10 traits, répartis sur le nombre d'erreurs autorisées.
const figureParts = [
  <line key="base" x1="10" y1="115" x2="70" y2="115" />,
  <line key="pole" x1="30" y1="115" x2="30" y2="10" />,
  <line key="beam" x1="30" y1="10" x2="80" y2="10" />,
  <line key="rope" x1="80" y1="10" x2="80" y2="25" />,
  <circle key="head" cx="80" cy="35" r="10" fill="none" />,
  <line key="body" x1="80" y1="45" x2="80" y2="75" />,
  <line key="armL" x1="80" y1="52" x2="65" y2="65" />,
  <line key="armR" x1="80" y1="52" x2="95" y2="65" />,
  <line key="legL" x1="80" y1="75" x2="67" y2="95" />,
  <line key="legR" x1="80" y1="75" x2="93" y2="95" />
];

function HangmanFigure({ errors, max }: { errors: number; max: number }) {
  const shown = Math.ceil((errors * figureParts.length) / max);
  return (
    <svg className="hang-figure" viewBox="0 0 110 125" aria-label={`${errors} erreur${errors > 1 ? "s" : ""} sur ${max}`}>
      {figureParts.slice(0, shown)}
    </svg>
  );
}

export function Hangman({ players, settings, onWin, feedback }: GameProps) {
  const [phase, setPhase] = useState<"roles" | "setup" | "hand" | "guess" | "done">("roles");
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
    setPhase("hand");
  };

  const guess = (letter: string) => {
    feedback(word.includes(letter) ? "tap" : "error");
    setGuesses([...guesses, letter]);
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
      {phase === "hand" && (
        <Handover to={players[guesser].name} note={`${word.length} lettres à deviner.`} onReady={() => setPhase("guess")} />
      )}
      {(phase === "guess" || phase === "done") && (
        <>
          <div className="hangman-top">
            <HangmanFigure errors={errors} max={settings.hangmanErrors} />
            <div className="hangman-word">{visibleWord}</div>
          </div>
          <div className="keyboard">
            {alphabet.map((letter) => (
              <button key={letter} disabled={guesses.includes(letter) || won || lost} onClick={() => guess(letter)}>
                {letter}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
