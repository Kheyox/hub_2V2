import { useEffect, useRef, useState } from "react";
import { GameHeader } from "../App";
import type { GameProps, PlayerIndex } from "../playerTypes";

const DURATION = 10_000;

export function TapBattle({ players, onWin, feedback }: GameProps) {
  const [phase, setPhase] = useState<"idle" | "countdown" | "running" | "done">("idle");
  const [countdown, setCountdown] = useState(3);
  const [taps, setTaps] = useState<[number, number]>([0, 0]);
  const [remaining, setRemaining] = useState(DURATION);
  const reported = useRef(false);
  const timers = useRef<number[]>([]);
  const endAt = useRef(0);
  const winner = phase === "done" ? (taps[0] === taps[1] ? null : taps[0] > taps[1] ? 0 : 1) as PlayerIndex | null : null;
  const status = phase === "idle"
    ? "10 secondes pour tout donner"
    : phase === "countdown"
      ? `Prêts... ${countdown}`
      : phase === "running"
        ? `${(remaining / 1000).toFixed(1)} s`
        : winner === null
          ? `Égalité ${taps[0]} - ${taps[1]} !`
          : `${players[winner].name} gagne ${taps[winner]} - ${taps[winner === 0 ? 1 : 0]}`;

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearInterval(id));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  useEffect(() => {
    if (winner === null || reported.current || phase !== "done") return;
    reported.current = true;
    onWin(winner, `${taps[winner]} taps contre ${taps[winner === 0 ? 1 : 0]}`);
  }, [winner, phase, onWin, taps]);

  const start = () => {
    clearTimers();
    reported.current = false;
    setTaps([0, 0]);
    setCountdown(3);
    setPhase("countdown");
    feedback("tap");
    let count = 3;
    const countTimer = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        return;
      }
      window.clearInterval(countTimer);
      endAt.current = performance.now() + DURATION;
      setRemaining(DURATION);
      setPhase("running");
      const tick = window.setInterval(() => {
        const left = endAt.current - performance.now();
        if (left <= 0) {
          window.clearInterval(tick);
          setRemaining(0);
          setPhase("done");
          return;
        }
        setRemaining(left);
      }, 100);
      timers.current.push(tick);
    }, 800);
    timers.current.push(countTimer);
  };

  const tap = (player: PlayerIndex) => {
    if (phase !== "running") return;
    setTaps((current) => player === 0 ? [current[0] + 1, current[1]] : [current[0], current[1] + 1]);
  };

  const reset = () => {
    clearTimers();
    reported.current = false;
    setPhase("idle");
    setTaps([0, 0]);
    setRemaining(DURATION);
  };

  const progress = phase === "running" ? remaining / DURATION : 1;

  return (
    <>
      <GameHeader title="Tap Battle" status={status} onReset={reset} />
      <div className="tap-timer" aria-hidden="true">
        <i style={{ transform: `scaleX(${progress})` }} />
      </div>
      <div className={`tap-arena ${phase}`}>
        <button
          className="tap-pad pad-1"
          style={{ "--player-color": players[1].color } as React.CSSProperties}
          disabled={phase !== "running"}
          onPointerDown={() => tap(1)}
        >
          <span className="tap-count">{taps[1]}</span>
          <span className="tap-name">{players[1].avatar} {players[1].name}</span>
        </button>
        <button
          className="tap-pad pad-0"
          style={{ "--player-color": players[0].color } as React.CSSProperties}
          disabled={phase !== "running"}
          onPointerDown={() => tap(0)}
        >
          <span className="tap-count">{taps[0]}</span>
          <span className="tap-name">{players[0].avatar} {players[0].name}</span>
        </button>
      </div>
      {phase === "idle" && <button className="primary-action" onClick={start}>3, 2, 1... Tapez !</button>}
      {phase === "done" && <button className="primary-action" onClick={start}>{winner === null ? "Égalité — revanche !" : "Rejouer"}</button>}
      {phase === "countdown" && <p className="hand-label tap-countdown">{countdown}</p>}
    </>
  );
}
