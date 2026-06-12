import { useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

const TARGET = 5;
type Phase = "idle" | "armed" | "go" | "result";

export function Reflex({ players, onWin, feedback }: GameProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [roundWinner, setRoundWinner] = useState<PlayerIndex | null>(null);
  const [resultNote, setResultNote] = useState("");
  const timer = useRef<number | null>(null);
  const goAt = useRef(0);
  const reported = useRef(false);
  const winner = score[0] >= TARGET ? 0 : score[1] >= TARGET ? 1 : null;
  const status = winner !== null
    ? `${players[winner].name} gagne ${score[winner]} - ${score[winner === 0 ? 1 : 0]}`
    : phase === "armed"
      ? "Attendez le vert..."
      : phase === "go"
        ? "GO !"
        : `Premier à ${TARGET} · ${score[0]} - ${score[1]}`;

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    onWin(winner, `${score[winner]} - ${score[winner === 0 ? 1 : 0]}`);
  }, [winner, onWin, score]);

  const arm = () => {
    if (winner !== null) return;
    setPhase("armed");
    setRoundWinner(null);
    setResultNote("");
    feedback("tap");
    timer.current = window.setTimeout(() => {
      goAt.current = performance.now();
      setPhase("go");
    }, 1200 + Math.random() * 2600);
  };

  const tap = (player: PlayerIndex) => {
    if (phase === "armed") {
      // faux départ : le point va à l'autre
      if (timer.current !== null) window.clearTimeout(timer.current);
      const other = player === 0 ? 1 : 0;
      setScore((current) => other === 0 ? [current[0] + 1, current[1]] : [current[0], current[1] + 1]);
      setRoundWinner(other as PlayerIndex);
      setResultNote(`Faux départ de ${players[player].name} !`);
      setPhase("result");
      feedback("error");
      return;
    }
    if (phase === "go") {
      const ms = Math.round(performance.now() - goAt.current);
      setScore((current) => player === 0 ? [current[0] + 1, current[1]] : [current[0], current[1] + 1]);
      setRoundWinner(player);
      setResultNote(`${players[player].name} en ${ms} ms !`);
      setPhase("result");
      feedback("win");
    }
  };

  const reset = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    reported.current = false;
    setPhase("idle");
    setScore([0, 0]);
    setRoundWinner(null);
    setResultNote("");
  };

  return (
    <>
      <GameHeader title="Réflexe" status={status} onReset={reset} />
      <div className="duel-score">
        <span className={roundWinner === 0 ? "active" : ""}>{players[0].avatar} {players[0].name} · {score[0]}</span>
        <span className={roundWinner === 1 ? "active" : ""}>{players[1].avatar} {players[1].name} · {score[1]}</span>
      </div>
      <div className={`reflex-arena ${phase}`}>
        <button
          className="reflex-pad pad-1"
          style={{ "--player-color": players[1].color } as React.CSSProperties}
          disabled={phase === "idle" || phase === "result" || winner !== null}
          onPointerDown={() => tap(1)}
        >
          <span>{players[1].avatar} {players[1].name}</span>
        </button>
        <div className="reflex-center">
          {(phase === "idle" || phase === "result") && winner === null && (
            <button className="primary-action" onClick={arm}>{phase === "idle" && score[0] + score[1] === 0 ? "Démarrer la manche" : "Manche suivante"}</button>
          )}
          {phase === "armed" && <span className="reflex-wait">Attendez le vert…</span>}
          {phase === "go" && <span className="reflex-go">TAPE !</span>}
          {resultNote && phase === "result" && <span className="reflex-note">{resultNote}</span>}
          {winner !== null && <span className="reflex-note">🏆 {players[winner].name} remporte le duel !</span>}
        </div>
        <button
          className="reflex-pad pad-0"
          style={{ "--player-color": players[0].color } as React.CSSProperties}
          disabled={phase === "idle" || phase === "result" || winner !== null}
          onPointerDown={() => tap(0)}
        >
          <span>{players[0].avatar} {players[0].name}</span>
        </button>
      </div>
      <p className="hand-label">Chacun garde un pouce sur sa zone. Dès que l'écran passe au vert, tape ! Faux départ = point pour l'autre.</p>
    </>
  );
}
