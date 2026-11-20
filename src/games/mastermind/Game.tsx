import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { Button, Card, PlayerPill } from '../../design-system';

const COLORS = [
  { id: 0, bg: 'bg-rose-500', label: 'Rouge' },
  { id: 1, bg: 'bg-sky-500', label: 'Bleu' },
  { id: 2, bg: 'bg-emerald-500', label: 'Vert' },
  { id: 3, bg: 'bg-amber-400', label: 'Jaune' },
  { id: 4, bg: 'bg-purple-500', label: 'Violet' },
  { id: 5, bg: 'bg-orange-500', label: 'Orange' },
];

const CODE_LEN = 4;
const MAX_ATTEMPTS = 8;

function evaluateGuess(secret: number[], guess: number[]): { exact: number; misplaced: number } {
  let exact = 0;
  const sRem: number[] = [];
  const gRem: number[] = [];
  for (let i = 0; i < CODE_LEN; i++) {
    if (secret[i] === guess[i]) exact++;
    else {
      sRem.push(secret[i]);
      gRem.push(guess[i]);
    }
  }
  let misplaced = 0;
  for (const g of gRem) {
    const idx = sRem.indexOf(g);
    if (idx !== -1) {
      misplaced++;
      sRem.splice(idx, 1);
    }
  }
  return { exact, misplaced };
}

export function MastermindGame({ players, onWin, feedback }: GameProps) {
  const [setter, setSetter] = useState<PlayerIndex>(0);
  const [secret, setSecret] = useState<number[] | null>(null);
  const [draft, setDraft] = useState<number[]>([]);
  const [attempts, setAttempts] = useState<{ guess: number[]; exact: number; misplaced: number }[]>([]);

  const guesser: PlayerIndex = setter === 0 ? 1 : 0;

  const pushColor = (c: number) => {
    if (draft.length >= CODE_LEN) return;
    feedback('tap');
    setDraft([...draft, c]);
  };

  const submitSecret = () => {
    if (draft.length !== CODE_LEN) return;
    feedback('drop');
    setSecret(draft);
    setDraft([]);
    setAttempts([]);
  };

  const submitGuess = () => {
    if (!secret || draft.length !== CODE_LEN) return;
    const res = evaluateGuess(secret, draft);
    const next = [...attempts, { guess: draft, ...res }];
    setAttempts(next);
    setDraft([]);
    feedback(res.exact === CODE_LEN ? 'win' : 'drop');

    if (res.exact === CODE_LEN) {
      onWin(guesser, `Trouvé en ${next.length} essai(s)`);
      return;
    }
    if (next.length >= MAX_ATTEMPTS) {
      onWin(setter, 'Code non trouvé !');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill
          name={secret ? players[guesser].name : players[setter].name}
          avatar={secret ? players[guesser].avatar : players[setter].avatar}
          color={secret ? players[guesser].color : players[setter].color}
          active
        />
        <span className="text-xs text-muted font-semibold">
          {secret ? `Essai ${attempts.length}/${MAX_ATTEMPTS}` : 'Code secret'}
        </span>
      </div>

      {secret && (
        <div className="w-full space-y-1.5 max-h-[240px] overflow-y-auto">
          {attempts.map((a, idx) => (
            <Card key={idx} className="flex items-center justify-between py-2 px-3">
              <div className="flex gap-2">
                {a.guess.map((c, i) => (
                  <span key={i} className={`w-6 h-6 rounded-full ${COLORS[c].bg}`} />
                ))}
              </div>
              <div className="text-xs font-semibold text-muted">
                🎯 {a.exact} · 🔀 {a.misplaced}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="w-full space-y-3">
        <div className="flex justify-center gap-2.5 min-h-[36px]">
          {Array.from({ length: CODE_LEN }).map((_, i) => (
            <span
              key={i}
              className={`w-8 h-8 rounded-full border border-border ${
                draft[i] !== undefined ? COLORS[draft[i]].bg : 'bg-surface-2'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-6 gap-2">
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => pushColor(c.id)}
              aria-label={c.label}
              className={`aspect-square rounded-full ${c.bg} active:scale-90 transition-transform`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {!secret && (
            <Button variant="ghost" size="sm" onClick={() => setSetter(setter === 0 ? 1 : 0)}>
              Inverser
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setDraft((d) => d.slice(0, -1))}>
            Effacer
          </Button>
          <Button
            variant="primary"
            fullWidth
            size="sm"
            disabled={draft.length !== CODE_LEN}
            onClick={secret ? submitGuess : submitSecret}
          >
            {secret ? 'Tester' : 'Valider le code'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
