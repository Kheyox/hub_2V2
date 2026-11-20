import { useEffect, useRef, useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';

type Phase = 'waiting' | 'ready' | 'roundEnd';
const TARGET_WINS = 3;

export function ReflexGame({ players, onWin, feedback }: GameProps) {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [message, setMessage] = useState('Attends le signal vert...');
  const readyAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const wonRef = useRef(false);

  const scheduleSignal = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setPhase('waiting');
    setMessage('Attends le signal vert...');
    const delay = 1400 + Math.random() * 2400;
    timerRef.current = window.setTimeout(() => {
      readyAtRef.current = performance.now();
      setPhase('ready');
      setMessage('MAINTENANT !');
      feedback('drop');
    }, delay);
  };

  useEffect(() => {
    scheduleSignal();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const awardPoint = (winner: PlayerIndex, reason: string) => {
    if (wonRef.current) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const next: [number, number] = [...scores] as [number, number];
    next[winner] += 1;
    setScores(next);
    setPhase('roundEnd');
    setMessage(reason);

    if (next[winner] >= TARGET_WINS) {
      wonRef.current = true;
      onWin(winner, `${next[winner]} - ${next[1 - winner]}`);
      return;
    }

    window.setTimeout(() => {
      scheduleSignal();
    }, 1200);
  };

  const handleTap = (player: PlayerIndex) => {
    if (phase === 'roundEnd' || wonRef.current) return;
    if (phase === 'waiting') {
      feedback('error');
      const other: PlayerIndex = player === 0 ? 1 : 0;
      awardPoint(other, `Faux départ de ${players[player].name} !`);
      return;
    }
    const reaction = Math.round(performance.now() - readyAtRef.current);
    feedback('tap');
    awardPoint(player, `${players[player].name} (${reaction} ms)`);
  };

  const bgClass =
    phase === 'ready'
      ? 'bg-emerald-500/25 border-emerald-400'
      : phase === 'roundEnd'
        ? 'bg-surface-2 border-border'
        : 'bg-rose-500/15 border-rose-500/40';

  return (
    <div className="flex flex-col w-full max-w-sm h-[72vh] min-h-[420px] gap-3">
      <button
        type="button"
        onPointerDown={() => handleTap(1)}
        className={`flex-1 rounded-card border-2 flex flex-col items-center justify-center gap-2 rotate-180 transition-colors active:scale-[0.98] ${bgClass}`}
      >
        <span className="text-3xl">{players[1].avatar}</span>
        <span className="text-sm font-bold" style={{ color: players[1].color }}>
          {players[1].name} ({scores[1]}/{TARGET_WINS})
        </span>
        <span className="text-xs text-ink/80 font-medium">{message}</span>
      </button>

      <button
        type="button"
        onPointerDown={() => handleTap(0)}
        className={`flex-1 rounded-card border-2 flex flex-col items-center justify-center gap-2 transition-colors active:scale-[0.98] ${bgClass}`}
      >
        <span className="text-3xl">{players[0].avatar}</span>
        <span className="text-sm font-bold" style={{ color: players[0].color }}>
          {players[0].name} ({scores[0]}/{TARGET_WINS})
        </span>
        <span className="text-xs text-ink/80 font-medium">{message}</span>
      </button>
    </div>
  );
}
