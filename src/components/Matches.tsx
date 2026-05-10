import { useState } from "react";
import { GameHeader } from "../App";

type Player = 0 | 1;

const startCount = 21;

export function Matches() {
  const [matches, setMatches] = useState(startCount);
  const [player, setPlayer] = useState<Player>(0);
  const [winner, setWinner] = useState<Player | null>(null);
  const status = winner !== null ? `Joueur ${winner + 1} gagne` : `Joueur ${player + 1} - ${matches} allumettes`;

  const take = (amount: number) => {
    if (winner !== null || amount > matches) return;
    const next = matches - amount;
    if (next === 0) {
      setWinner(player === 0 ? 1 : 0);
    }
    setMatches(next);
    setPlayer(player === 0 ? 1 : 0);
  };

  const reset = () => {
    setMatches(startCount);
    setPlayer(0);
    setWinner(null);
  };

  return (
    <>
      <GameHeader title="Allumettes" status={status} onReset={reset} />
      <div className="matches-board">
        {Array.from({ length: startCount }).map((_, index) => (
          <span key={index} className={index < matches ? "match-stick lit" : "match-stick"} />
        ))}
      </div>
      <div className="take-row">
        {[1, 2, 3].map((amount) => (
          <button key={amount} className="take-button" disabled={winner !== null || amount > matches} onClick={() => take(amount)}>
            Prendre {amount}
          </button>
        ))}
      </div>
    </>
  );
}
