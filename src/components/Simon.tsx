import { useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";
import { padTone } from "../sound";

const padColors = ["#e84834", "#f5c84c", "#39c6a3", "#7fb7ff"];
const FLASH = 420;
const GAP = 160;

export function Simon({ players, onWin, feedback }: GameProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "watch" | "repeat" | "done">("idle");
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const [progress, setProgress] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const reported = useRef(false);
  const timers = useRef<number[]>([]);
  const winner = phase === "done" ? (turn === 0 ? 1 : 0) as PlayerIndex : null;
  const status = phase === "idle"
    ? "Prêts à mémoriser ?"
    : phase === "watch"
      ? `Regarde bien... (${sequence.length} note${sequence.length > 1 ? "s" : ""})`
      : phase === "repeat"
        ? `${players[turn].name} reproduit (${progress}/${sequence.length})`
        : `${players[winner as PlayerIndex].name} gagne !`;

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  useEffect(() => {
    if (winner === null || reported.current) return;
    reported.current = true;
    onWin(winner, `Séquence de ${sequence.length}`);
  }, [winner, onWin, sequence.length]);

  const playSequence = (seq: number[]) => {
    setPhase("watch");
    setProgress(0);
    seq.forEach((pad, index) => {
      timers.current.push(window.setTimeout(() => {
        setLit(pad);
        padTone(pad);
        timers.current.push(window.setTimeout(() => setLit(null), FLASH - 80));
      }, 500 + index * (FLASH + GAP)));
    });
    timers.current.push(window.setTimeout(() => {
      setPhase("repeat");
    }, 500 + seq.length * (FLASH + GAP)));
  };

  const start = () => {
    clearTimers();
    reported.current = false;
    const seq = [Math.floor(Math.random() * 4)];
    setSequence(seq);
    setTurn(0);
    feedback("tap");
    playSequence(seq);
  };

  const tap = (pad: number) => {
    if (phase !== "repeat") return;
    if (sequence[progress] === pad) {
      padTone(pad, 0.2);
      setLit(pad);
      timers.current.push(window.setTimeout(() => setLit(null), 180));
      const nextProgress = progress + 1;
      if (nextProgress >= sequence.length) {
        // séquence réussie : une note s'ajoute, à l'autre joueur
        const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
        const nextTurn: PlayerIndex = turn === 0 ? 1 : 0;
        setSequence(nextSeq);
        setTurn(nextTurn);
        setProgress(0);
        setPhase("watch");
        timers.current.push(window.setTimeout(() => playSequence(nextSeq), 600));
      } else {
        setProgress(nextProgress);
      }
    } else {
      feedback("error");
      setPhase("done");
    }
  };

  const reset = () => {
    clearTimers();
    reported.current = false;
    setSequence([]);
    setPhase("idle");
    setTurn(0);
    setProgress(0);
    setLit(null);
  };

  return (
    <>
      <GameHeader title="Simon" status={status} onReset={reset} />
      <div className="duel-score">
        <span className={turn === 0 && phase !== "idle" && winner === null ? "active" : ""}>{players[0].avatar} {players[0].name}</span>
        <span className={turn === 1 && phase !== "idle" && winner === null ? "active" : ""}>{players[1].avatar} {players[1].name}</span>
      </div>
      <div className={`simon-board ${phase}`}>
        {padColors.map((color, index) => (
          <button
            key={color}
            className={`simon-pad ${lit === index ? "lit" : ""}`}
            style={{ "--pad-color": color } as React.CSSProperties}
            disabled={phase !== "repeat"}
            onPointerDown={() => tap(index)}
            aria-label={`Pad ${index + 1}`}
          />
        ))}
        <div className="simon-center" aria-hidden="true">{sequence.length || "▶"}</div>
      </div>
      {phase === "idle" && <button className="primary-action" onClick={start}>Lancer la partie</button>}
      {phase === "done" && <button className="primary-action" onClick={start}>Rejouer</button>}
      {phase !== "idle" && phase !== "done" && (
        <p className="hand-label">{phase === "watch" ? "Mémorisez la séquence qui s'allume..." : `À ${players[turn].name} de la reproduire. Une erreur = défaite !`}</p>
      )}
    </>
  );
}
