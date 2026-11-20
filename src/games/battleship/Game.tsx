import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { Button, Card, PlayerPill } from '../../design-system';

const SIZE = 6;
const SHIPS_COUNT = 5;

export function BattleshipGame({ players, onWin, feedback }: GameProps) {
  const [phase, setPhase] = useState<'place0' | 'place1' | 'handover' | 'battle'>('place0');
  const [boards, setBoards] = useState<[boolean[], boolean[]]>(() => [
    Array(SIZE * SIZE).fill(false),
    Array(SIZE * SIZE).fill(false),
  ]);
  const [shots, setShots] = useState<[boolean[], boolean[]]>(() => [
    Array(SIZE * SIZE).fill(false),
    Array(SIZE * SIZE).fill(false),
  ]);
  const [turn, setTurn] = useState<PlayerIndex>(0);

  const toggleShip = (player: PlayerIndex, idx: number) => {
    const current = boards[player];
    const count = current.filter(Boolean).length;
    if (!current[idx] && count >= SHIPS_COUNT) return;

    feedback('tap');
    const next: [boolean[], boolean[]] = [[...boards[0]], [...boards[1]]];
    next[player][idx] = !next[player][idx];
    setBoards(next);
  };

  if (phase === 'place0' || phase === 'place1') {
    const p: PlayerIndex = phase === 'place0' ? 0 : 1;
    const placed = boards[p].filter(Boolean).length;

    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <PlayerPill name={players[p].name} avatar={players[p].avatar} color={players[p].color} active />
        <p className="text-xs text-muted">
          Place {SHIPS_COUNT} cases-navires ({placed}/{SHIPS_COUNT}) à l'abri des regards
        </p>

        <div className="grid grid-cols-6 gap-1.5 w-full max-w-[290px]">
          {boards[p].map((hasShip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => toggleShip(p, idx)}
              className={`aspect-square rounded-btn border transition-colors ${
                hasShip ? 'bg-brand border-brand' : 'bg-surface border-border hover:bg-surface-2'
              }`}
            />
          ))}
        </div>

        <Button
          variant="primary"
          disabled={placed !== SHIPS_COUNT}
          onClick={() => {
            feedback('drop');
            setPhase(p === 0 ? 'place1' : 'handover');
          }}
        >
          {p === 0 ? 'Valider et passer à J2' : 'Commencer la bataille'}
        </Button>
      </div>
    );
  }

  if (phase === 'handover') {
    return (
      <Card className="w-full max-w-sm text-center space-y-4 py-8">
        <div className="text-4xl">{players[turn].avatar}</div>
        <div>
          <p className="text-xs text-muted uppercase font-semibold">Au tour de</p>
          <h2 className="text-xl font-bold mt-1" style={{ color: players[turn].color }}>
            {players[turn].name}
          </h2>
        </div>
        <Button variant="primary" fullWidth onClick={() => setPhase('battle')}>
          Tirer
        </Button>
      </Card>
    );
  }

  const opp: PlayerIndex = turn === 0 ? 1 : 0;

  const fire = (idx: number) => {
    if (shots[turn][idx]) return;
    const nextShots: [boolean[], boolean[]] = [[...shots[0]], [...shots[1]]];
    nextShots[turn][idx] = true;
    setShots(nextShots);

    const hit = boards[opp][idx];
    feedback(hit ? 'drop' : 'tap');

    const oppTotalHits = boards[opp].filter((has, i) => has && nextShots[turn][i]).length;
    if (oppTotalHits >= SHIPS_COUNT) {
      onWin(turn, 'Flotte adverse coulée !');
      return;
    }

    setTurn(opp);
    setPhase('handover');
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={players[0].name} avatar={players[0].avatar} color={players[0].color} active={turn === 0} />
        <PlayerPill name={players[1].name} avatar={players[1].avatar} color={players[1].color} active={turn === 1} />
      </div>

      <p className="text-xs text-muted">Grille ennemie — Touche une case pour tirer</p>

      <div className="grid grid-cols-6 gap-1.5 w-full max-w-[300px]">
        {shots[turn].map((fired, idx) => {
          const hit = fired && boards[opp][idx];
          return (
            <button
              key={idx}
              type="button"
              disabled={fired}
              onClick={() => fire(idx)}
              className={`aspect-square rounded-btn border flex items-center justify-center text-sm font-bold ${
                hit
                  ? 'bg-rose-500/30 border-rose-500 text-rose-300'
                  : fired
                    ? 'bg-surface/40 border-border text-muted'
                    : 'bg-surface border-border hover:border-brand'
              }`}
            >
              {hit ? '💥' : fired ? '•' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
