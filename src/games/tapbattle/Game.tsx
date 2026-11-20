import { useEffect, useRef, useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';

const DURATION_SEC = 10;

export function TapBattleGame({ players, onWin, feedback }: GameProps) {
  const [taps, setTaps] = useState<[number, number]>([0, 0]);
  const [timeLeft, setTimeLeft] = useState(DURATION_SEC);
  const tapsRef = useRef<[number, number]>([0, 0]);
  const wonRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          if (!wonRef.current) {
            wonRef.current = true;
            const [s0, s1] = tapsRef.current;
            const winner: PlayerIndex = s0 >= s1 ? 0 : 1;
            onWin(winner, `${s0} vs ${s1} taps`);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [onWin]);

  const tap = (player: PlayerIndex) => {
    if (wonRef.current) return;
    tapsRef.current[player] += 1;
    setTaps([...tapsRef.current] as [number, number]);
    feedback('tap');
  };

  const total = taps[0] + taps[1];
  const p0Pct = total === 0 ? 50 : Math.round((taps[0] / total) * 100);

  return (
    <div className="flex flex-col w-full max-w-sm h-[72vh] min-h-[420px] gap-3">
      <button
        type="button"
        onPointerDown={() => tap(1)}
        className="flex-1 rounded-card border border-border bg-surface flex flex-col items-center justify-center gap-1 rotate-180 active:scale-[0.98] transition-transform"
        style={{ borderColor: players[1].color }}
      >
        <span className="text-3xl">{players[1].avatar}</span>
        <span className="text-sm font-bold" style={{ color: players[1].color }}>
          {players[1].name}
        </span>
        <span className="text-3xl font-extrabold text-ink">{taps[1]}</span>
      </button>

      <div className="space-y-1.5 px-1">
        <div className="flex justify-between text-xs font-semibold text-muted">
          <span>Temps : {timeLeft}s</span>
          <span>{p0Pct}% / {100 - p0Pct}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-surface-2 overflow-hidden flex border border-border">
          <div className="h-full transition-all duration-100" style={{ width: `${p0Pct}%`, backgroundColor: players[0].color }} />
          <div className="h-full transition-all duration-100" style={{ width: `${100 - p0Pct}%`, backgroundColor: players[1].color }} />
        </div>
      </div>

      <button
        type="button"
        onPointerDown={() => tap(0)}
        className="flex-1 rounded-card border border-border bg-surface flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform"
        style={{ borderColor: players[0].color }}
      >
        <span className="text-3xl">{players[0].avatar}</span>
        <span className="text-sm font-bold" style={{ color: players[0].color }}>
          {players[0].name}
        </span>
        <span className="text-3xl font-extrabold text-ink">{taps[0]}</span>
      </button>
    </div>
  );
}
