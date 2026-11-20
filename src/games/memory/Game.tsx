import { useEffect, useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { PlayerPill } from '../../design-system';

const SYMBOLS = [
  '🦊', '🐼', '🦁', '🐸', '🐙', '🦄', '🐝', '🐧', '🐯',
  '🐨', '🐲', '👾', '🤖', '👻', '🔥', '⚡', '🌟', '💎',
];

interface CardItem {
  id: number;
  symbol: string;
  matched: boolean;
}

function buildDeck(size: 4 | 6): CardItem[] {
  const pairs = (size * size) / 2;
  const chosen = SYMBOLS.slice(0, pairs);
  const deck = [...chosen, ...chosen]
    .sort(() => Math.random() - 0.5)
    .map((symbol, id) => ({ id, symbol, matched: false }));
  return deck;
}

export function MemoryGame({ players, settings, onWin, feedback }: GameProps) {
  const size = settings.memorySize;
  const [cards, setCards] = useState<CardItem[]>(() => buildDeck(size));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [turn, setTurn] = useState<PlayerIndex>(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    if (cards[a].symbol === cards[b].symbol) {
      feedback('drop');
      const nextCards = cards.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c));
      const nextScores: [number, number] = [...scores] as [number, number];
      nextScores[turn] += 1;
      setCards(nextCards);
      setScores(nextScores);
      setFlipped([]);

      if (nextCards.every((c) => c.matched)) {
        const winner: PlayerIndex = nextScores[0] >= nextScores[1] ? 0 : 1;
        onWin(winner, `${nextScores[0]} - ${nextScores[1]} paires`);
      }
      return;
    }

    setLocked(true);
    const id = window.setTimeout(() => {
      setFlipped([]);
      setTurn(turn === 0 ? 1 : 0);
      setLocked(false);
    }, 750);
    return () => window.clearTimeout(id);
  }, [flipped]);

  const flipCard = (idx: number) => {
    if (locked || flipped.includes(idx) || cards[idx].matched) return;
    feedback('flip');
    setFlipped((prev) => [...prev, idx]);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={`${players[0].name} (${scores[0]})`} avatar={players[0].avatar} color={players[0].color} active={turn === 0} />
        <PlayerPill name={`${players[1].name} (${scores[1]})`} avatar={players[1].avatar} color={players[1].color} active={turn === 1} />
      </div>

      <div
        className="grid gap-1.5 w-full max-w-[340px]"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {cards.map((card, idx) => {
          const isOpen = card.matched || flipped.includes(idx);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flipCard(idx)}
              className={`aspect-square rounded-btn border flex items-center justify-center transition-all ${
                size === 6 ? 'text-lg' : 'text-2xl'
              } ${
                card.matched
                  ? 'bg-emerald-500/20 border-emerald-500/40'
                  : isOpen
                    ? 'bg-surface-2 border-brand'
                    : 'bg-surface border-border hover:bg-surface-2'
              }`}
            >
              {isOpen ? card.symbol : '?'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
