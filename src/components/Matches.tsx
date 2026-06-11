import { useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

type Player = 0 | 1;

export function Matches({ players, settings, onWin, feedback }: GameProps) {
  const startCount = settings.matchesStart;
  const [matches, setMatches] = useState(startCount);
  const [player, setPlayer] = useState<Player>(0);
  const [winner, setWinner] = useState<Player | null>(null);
  const reportedWinner = useRef<Player | null>(null);
  const status = winner !== null ? `${players[winner].name} gagne` : `${players[player].name} joue · ${matches} allumette${matches > 1 ? "s" : ""}`;

  useEffect(() => {
    if (winner === null || reportedWinner.current === winner) return;
    reportedWinner.current = winner;
    onWin(winner as PlayerIndex);
  }, [winner, onWin]);

  useEffect(() => {
    reportedWinner.current = null;
    setMatches(startCount);
    setPlayer(0);
    setWinner(null);
  }, [startCount]);

  const take = (amount: number) => {
    if (winner !== null || amount > matches) {
      feedback("error");
      return;
    }
    feedback("tap");
    const next = matches - amount;
    if (next === 0) {
      setWinner(player === 0 ? 1 : 0);
    }
    setMatches(next);
    setPlayer(player === 0 ? 1 : 0);
  };

  const reset = () => {
    reportedWinner.current = null;
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
