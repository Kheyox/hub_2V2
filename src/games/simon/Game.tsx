import { useEffect, useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { padTone } from '../../sound';
import { PlayerPill } from '../../design-system';

const PADS = [
  { id: 0, color: 'bg-emerald-500', active: 'brightness-150 scale-95' },
  { id: 1, color: 'bg-rose-500', active: 'brightness-150 scale-95' },
  { id: 2, color: 'bg-amber-400', active: 'brightness-150 scale-95' },
  { id: 3, color: 'bg-sky-500', active: 'brightness-150 scale-95' },
];

export function SimonGame({ players, onWin, feedback }: GameProps) {
  const [sequence, setSequence] = useState<number[]>(() => [Math.floor(Math.random() * 4)]);
  const [inputIdx, setInputIdx] = useState(0);
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const [showing, setShowing] = useState(true);
  const [litPad, setLitPad] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setShowing(true);
    setInputIdx(0);

    const playSeq = async () => {
      await new Promise((r) => setTimeout(r, 450));
      for (const pad of sequence) {
        if (cancelled) return;
        setLitPad(pad);
        padTone(pad);
        await new Promise((r) => setTimeout(r, 380));
        if (cancelled) return;
        setLitPad(null);
        await new Promise((r) => setTimeout(r, 140));
      }
      if (!cancelled) setShowing(false);
    };

    playSeq();
    return () => {
      cancelled = true;
    };
  }, [sequence]);

  const handlePad = (padId: number) => {
    if (showing) return;
    padTone(padId);
    setLitPad(padId);
    window.setTimeout(() => setLitPad(null), 160);

    if (padId !== sequence[inputIdx]) {
      feedback('error');
      const winner: PlayerIndex = turn === 0 ? 1 : 0;
      onWin(winner, `Séquence de ${sequence.length}`);
      return;
    }

    const nextIdx = inputIdx + 1;
    if (nextIdx >= sequence.length) {
      setTurn(turn === 0 ? 1 : 0);
      setSequence((prev) => [...prev, Math.floor(Math.random() * 4)]);
    } else {
      setInputIdx(nextIdx);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={players[0].name} avatar={players[0].avatar} color={players[0].color} active={turn === 0} />
        <PlayerPill name={players[1].name} avatar={players[1].avatar} color={players[1].color} active={turn === 1} />
      </div>

      <p className="text-xs font-medium text-muted">
        {showing ? 'Observe la séquence...' : `À ${players[turn].name} (${inputIdx}/${sequence.length})`}
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] aspect-square">
        {PADS.map((pad) => (
          <button
            key={pad.id}
            type="button"
            disabled={showing}
            onClick={() => handlePad(pad.id)}
            aria-label={`Pad ${pad.id + 1}`}
            className={`rounded-card transition-all ${pad.color} ${
              litPad === pad.id ? pad.active : 'opacity-80 hover:opacity-100'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
