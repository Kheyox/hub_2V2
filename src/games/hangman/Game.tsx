import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { Button, Card, PlayerPill } from '../../design-system';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function normalizeWord(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

export function HangmanGame({ players, settings, onWin, feedback }: GameProps) {
  const maxErrors = settings.hangmanErrors || 6;
  const [setter, setSetter] = useState<PlayerIndex>(0);
  const [wordInput, setWordInput] = useState('');
  const [secret, setSecret] = useState<string | null>(null);
  const [guessed, setGuessed] = useState<string[]>([]);

  const guesser: PlayerIndex = setter === 0 ? 1 : 0;

  const submitWord = () => {
    const clean = normalizeWord(wordInput);
    if (clean.length < 3) {
      feedback('error');
      return;
    }
    feedback('tap');
    setSecret(clean);
    setWordInput('');
    setGuessed([]);
  };

  const guessLetter = (letter: string) => {
    if (!secret || guessed.includes(letter)) return;
    const next = [...guessed, letter];
    setGuessed(next);

    if (secret.includes(letter)) {
      feedback('drop');
      const allFound = secret.split('').every((ch) => next.includes(ch));
      if (allFound) {
        onWin(guesser, `Mot trouvé : ${secret}`);
      }
    } else {
      feedback('error');
      const errors = next.filter((l) => !secret.includes(l)).length;
      if (errors >= maxErrors) {
        onWin(setter, `Mot caché : ${secret}`);
      }
    }
  };

  if (!secret) {
    return (
      <Card className="w-full max-w-sm space-y-4 text-center">
        <div>
          <p className="text-xs text-muted uppercase font-semibold">Mot secret (cache l'écran !)</p>
          <h2 className="text-lg font-bold mt-1" style={{ color: players[setter].color }}>
            {players[setter].avatar} {players[setter].name} choisit un mot
          </h2>
        </div>
        <input
          type="password"
          value={wordInput}
          onChange={(e) => setWordInput(e.target.value)}
          placeholder="Minimum 3 lettres..."
          maxLength={16}
          className="w-full rounded-btn bg-surface-2 border border-border px-3.5 py-2.5 text-center text-base text-ink focus:outline-none focus:border-brand"
        />
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setSetter(setter === 0 ? 1 : 0)}>
            Inverser rôles
          </Button>
          <Button variant="primary" fullWidth onClick={submitWord}>
            Valider le mot
          </Button>
        </div>
      </Card>
    );
  }

  const errors = guessed.filter((l) => !secret.includes(l)).length;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={players[guesser].name} avatar={players[guesser].avatar} color={players[guesser].color} active />
        <span className="text-xs font-semibold text-muted">
          Erreurs : {errors} / {maxErrors}
        </span>
      </div>

      <Card className="w-full text-center py-5">
        <div className="flex justify-center gap-2 flex-wrap text-2xl font-extrabold tracking-widest">
          {secret.split('').map((ch, idx) => (
            <span key={idx} className="min-w-[20px] border-b-2 border-brand pb-1">
              {guessed.includes(ch) ? ch : '_'}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-7 gap-1.5 w-full">
        {ALPHABET.map((letter) => {
          const used = guessed.includes(letter);
          const hit = used && secret.includes(letter);
          return (
            <button
              key={letter}
              type="button"
              disabled={used}
              onClick={() => guessLetter(letter)}
              className={`aspect-square rounded-btn border text-xs font-bold transition-colors ${
                hit
                  ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300'
                  : used
                    ? 'bg-surface/40 border-border text-muted opacity-35'
                    : 'bg-surface border-border text-ink hover:border-brand'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
