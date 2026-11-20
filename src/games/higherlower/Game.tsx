import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { Button, Card, PlayerPill } from '../../design-system';

const MAX_ATTEMPTS = 7;

export function HigherLowerGame({ players, onWin, feedback }: GameProps) {
  const [setter, setSetter] = useState<PlayerIndex>(0);
  const [input, setInput] = useState('');
  const [secret, setSecret] = useState<number | null>(null);
  const [history, setHistory] = useState<{ guess: number; hint: string }[]>([]);

  const guesser: PlayerIndex = setter === 0 ? 1 : 0;

  const submitSecret = () => {
    const n = Number(input);
    if (!Number.isInteger(n) || n < 1 || n > 100) {
      feedback('error');
      return;
    }
    feedback('tap');
    setSecret(n);
    setInput('');
    setHistory([]);
  };

  const submitGuess = () => {
    if (secret === null) return;
    const g = Number(input);
    if (!Number.isInteger(g) || g < 1 || g > 100) {
      feedback('error');
      return;
    }
    setInput('');

    if (g === secret) {
      onWin(guesser, `Trouvé en ${history.length + 1} essai(s) !`);
      return;
    }

    const hint = g < secret ? 'C’est PLUS haut ⬆️' : 'C’est MOINS bas ⬇️';
    const next = [{ guess: g, hint }, ...history];
    setHistory(next);
    feedback('tap');

    if (next.length >= MAX_ATTEMPTS) {
      onWin(setter, `Nombre secret : ${secret}`);
    }
  };

  if (secret === null) {
    return (
      <Card className="w-full max-w-sm space-y-4 text-center">
        <div>
          <p className="text-xs text-muted uppercase font-semibold">Nombre secret (1 à 100)</p>
          <h2 className="text-lg font-bold mt-1" style={{ color: players[setter].color }}>
            {players[setter].avatar} {players[setter].name} choisit
          </h2>
        </div>
        <input
          type="password"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="1 - 100"
          className="w-full rounded-btn bg-surface-2 border border-border px-3.5 py-2.5 text-center text-lg text-ink focus:outline-none focus:border-brand"
        />
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setSetter(setter === 0 ? 1 : 0)}>
            Inverser
          </Button>
          <Button variant="primary" fullWidth onClick={submitSecret}>
            Valider
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={players[guesser].name} avatar={players[guesser].avatar} color={players[guesser].color} active />
        <span className="text-xs font-semibold text-muted">
          Essais : {history.length} / {MAX_ATTEMPTS}
        </span>
      </div>

      <Card className="w-full space-y-3">
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={100}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ton nombre (1-100)"
            className="flex-1 rounded-btn bg-surface-2 border border-border px-3 py-2 text-center text-base text-ink focus:outline-none focus:border-brand"
          />
          <Button variant="primary" onClick={submitGuess}>
            Tester
          </Button>
        </div>
      </Card>

      <div className="w-full space-y-1.5 max-h-[240px] overflow-y-auto">
        {history.map((h, i) => (
          <Card key={i} className="flex items-center justify-between py-2 px-3.5 text-sm">
            <span className="font-bold text-ink">{h.guess}</span>
            <span className="text-xs font-semibold text-brand">{h.hint}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
