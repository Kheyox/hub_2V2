import { useMemo, useState } from "react";
import { GameHeader } from "../App";

const words = ["maison", "soleil", "voyage", "clavier", "etoile", "fromage", "arcade", "mobile"];
const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
const maxErrors = 6;

export function Hangman() {
  const [word, setWord] = useState(() => words[Math.floor(Math.random() * words.length)]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const errors = guesses.filter((letter) => !word.includes(letter)).length;
  const won = word.split("").every((letter) => guesses.includes(letter));
  const lost = errors >= maxErrors;
  const status = won ? "Mot trouve" : lost ? `Perdu: ${word}` : `${maxErrors - errors} erreurs restantes`;

  const visibleWord = useMemo(
    () => word.split("").map((letter) => (guesses.includes(letter) || lost ? letter : "_")).join(" "),
    [word, guesses, lost]
  );

  const reset = () => {
    setWord(words[Math.floor(Math.random() * words.length)]);
    setGuesses([]);
  };

  return (
    <>
      <GameHeader title="Pendu" status={status} onReset={reset} />
      <div className="hangman-word">{visibleWord}</div>
      <div className="hangman-meter" aria-label={`${errors} erreurs`}>
        {Array.from({ length: maxErrors }).map((_, index) => (
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
  );
}
