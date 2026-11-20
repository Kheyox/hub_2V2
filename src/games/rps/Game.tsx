import { useEffect, useRef, useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { Button, Card } from '../../design-system';

type Move = 'rock' | 'paper' | 'scissors';

const MOVES: { id: Move; emoji: string; label: string }[] = [
  { id: 'rock', emoji: '🪨', label: 'Pierre' },
  { id: 'paper', emoji: '📄', label: 'Feuille' },
  { id: 'scissors', emoji: '✂️', label: 'Ciseaux' },
];

const TARGET_WINS = 3;

function resolveRound(m0: Move, m1: Move): PlayerIndex | 'draw' {
  if (m0 === m1) return 'draw';
  if (
    (m0 === 'rock' && m1 === 'scissors') ||
    (m0 === 'paper' && m1 === 'rock') ||
    (m0 === 'scissors' && m1 === 'paper')
  ) {
    return 0;
  }
  return 1;
}

export function RockPaperScissorsGame({ players, onWin, feedback }: GameProps) {
  const [picks, setPicks] = useState<[Move | null, Move | null]>([null, null]);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [roundNote, setRoundNote] = useState('Choisissez en même temps !');
  const wonRef = useRef(false);

  useEffect(() => {
    const [m0, m1] = picks;
    if (!m0 || !m1 || wonRef.current) return;

    const result = resolveRound(m0, m1);
    const next: [number, number] = [...scores] as [number, number];
    if (result === 'draw') {
      feedback('tap');
      setRoundNote('Égalité ! On rejoue.');
    } else {
      next[result] += 1;
      setScores(next);
      feedback('drop');
      setRoundNote(`${players[result].name} remporte la manche !`);
      if (next[result] >= TARGET_WINS) {
        wonRef.current = true;
        onWin(result, `${next[result]} - ${next[1 - result]}`);
        return;
      }
    }

    const id = window.setTimeout(() => {
      setPicks([null, null]);
      setRoundNote('Choisissez en même temps !');
    }, 1100);
    return () => window.clearTimeout(id);
  }, [picks]);

  const choose = (player: PlayerIndex, move: Move) => {
    if (wonRef.current || (picks[0] && picks[1])) return;
    feedback('tap');
    setPicks((prev) => {
      const next: [Move | null, Move | null] = [...prev] as [Move | null, Move | null];
      next[player] = move;
      return next;
    });
  };

  const revealed = Boolean(picks[0] && picks[1]);

  return (
    <div className="flex flex-col w-full max-w-sm h-[72vh] min-h-[420px] justify-between gap-3">
      <Card className="rotate-180 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span style={{ color: players[1].color }}>
            {players[1].avatar} {players[1].name}
          </span>
          <span>
            {scores[1]} / {TARGET_WINS}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MOVES.map((m) => (
            <Button
              key={m.id}
              variant={picks[1] === m.id ? 'primary' : 'secondary'}
              onClick={() => choose(1, m.id)}
              className="flex-col py-3"
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[11px]">{m.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      <div className="text-center space-y-1">
        {revealed && (
          <div className="text-2xl flex items-center justify-center gap-4">
            <span>{MOVES.find((m) => m.id === picks[0])?.emoji}</span>
            <span className="text-xs text-muted">VS</span>
            <span>{MOVES.find((m) => m.id === picks[1])?.emoji}</span>
          </div>
        )}
        <p className="text-xs font-medium text-muted">{roundNote}</p>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span style={{ color: players[0].color }}>
            {players[0].avatar} {players[0].name}
          </span>
          <span>
            {scores[0]} / {TARGET_WINS}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MOVES.map((m) => (
            <Button
              key={m.id}
              variant={picks[0] === m.id ? 'primary' : 'secondary'}
              onClick={() => choose(0, m.id)}
              className="flex-col py-3"
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[11px]">{m.label}</span>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
