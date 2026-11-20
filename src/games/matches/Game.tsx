import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { Button, Card, PlayerPill } from '../../design-system';

export function MatchesGame({ players, settings, onWin, feedback }: GameProps) {
  const startCount = settings.matchesStart || 21;
  const [remaining, setRemaining] = useState(startCount);
  const [turn, setTurn] = useState<PlayerIndex>(0);

  const take = (count: 1 | 2 | 3) => {
    if (count > remaining) return;
    const next = remaining - count;
    setRemaining(next);
    feedback('drop');

    if (next === 0) {
      // Celui qui prend la dernière allumette perd
      const winner: PlayerIndex = turn === 0 ? 1 : 0;
      onWin(winner, 'Dernière allumette prise');
      return;
    }
    setTurn(turn === 0 ? 1 : 0);
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={players[0].name} avatar={players[0].avatar} color={players[0].color} active={turn === 0} />
        <PlayerPill name={players[1].name} avatar={players[1].avatar} color={players[1].color} active={turn === 1} />
      </div>

      <Card className="w-full text-center space-y-3">
        <p className="text-xs text-muted">Ne prends pas la dernière allumette !</p>
        <div className="text-4xl font-extrabold text-brand">{remaining}</div>
        <div className="flex flex-wrap justify-center gap-1.5 py-2">
          {Array.from({ length: remaining }).map((_, i) => (
            <span key={i} className="inline-block w-2 h-8 rounded-full bg-amber-400 border-t-4 border-rose-500" />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2.5 w-full">
        {([1, 2, 3] as const).map((n) => (
          <Button key={n} variant="primary" size="lg" disabled={n > remaining} onClick={() => take(n)}>
            -{n}
          </Button>
        ))}
      </div>
    </div>
  );
}
