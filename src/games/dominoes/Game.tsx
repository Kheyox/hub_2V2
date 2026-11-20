import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { Button, Card, PlayerPill } from '../../design-system';

type Domino = [number, number];

function createDeck(): Domino[] {
  const deck: Domino[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      deck.push([i, j]);
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

export function DominoesGame({ players, onWin, feedback }: GameProps) {
  const [state, setState] = useState(() => {
    const deck = createDeck();
    return {
      hands: [deck.slice(0, 7), deck.slice(7, 14)] as [Domino[], Domino[]],
      boneyard: deck.slice(14),
      chain: [] as Domino[],
      turn: 0 as PlayerIndex,
      handover: true,
    };
  });

  const leftEnd = state.chain.length > 0 ? state.chain[0][0] : null;
  const rightEnd = state.chain.length > 0 ? state.chain[state.chain.length - 1][1] : null;

  const canPlay = (d: Domino) => {
    if (leftEnd === null || rightEnd === null) return true;
    return d[0] === leftEnd || d[1] === leftEnd || d[0] === rightEnd || d[1] === rightEnd;
  };

  const playDomino = (idx: number, side: 'left' | 'right') => {
    const hand = state.hands[state.turn];
    const d = hand[idx];
    let placed: Domino = d;

    if (state.chain.length > 0) {
      if (side === 'left') {
        if (d[1] === leftEnd) placed = d;
        else if (d[0] === leftEnd) placed = [d[1], d[0]];
        else return;
      } else {
        if (d[0] === rightEnd) placed = d;
        else if (d[1] === rightEnd) placed = [d[1], d[0]];
        else return;
      }
    }

    feedback('drop');
    const nextChain = side === 'left' ? [placed, ...state.chain] : [...state.chain, placed];
    const nextHand = hand.filter((_, i) => i !== idx);
    const nextHands: [Domino[], Domino[]] = [...state.hands] as [Domino[], Domino[]];
    nextHands[state.turn] = nextHand;

    if (nextHand.length === 0) {
      onWin(state.turn, 'Main vidée !');
      return;
    }

    setState({
      ...state,
      hands: nextHands,
      chain: nextChain,
      turn: state.turn === 0 ? 1 : 0,
      handover: true,
    });
  };

  const drawOrPass = () => {
    if (state.boneyard.length > 0) {
      feedback('flip');
      const [drawn, ...rest] = state.boneyard;
      const nextHands: [Domino[], Domino[]] = [...state.hands] as [Domino[], Domino[]];
      nextHands[state.turn] = [...nextHands[state.turn], drawn];
      setState({ ...state, hands: nextHands, boneyard: rest });
    } else {
      feedback('tap');
      setState({ ...state, turn: state.turn === 0 ? 1 : 0, handover: true });
    }
  };

  const activePlayer = players[state.turn];
  const currentHand = state.hands[state.turn];

  if (state.handover) {
    return (
      <Card className="w-full max-w-sm text-center space-y-4 py-8">
        <div className="text-4xl">{activePlayer.avatar}</div>
        <div>
          <p className="text-xs text-muted uppercase font-semibold">Passe le téléphone à</p>
          <h2 className="text-xl font-bold mt-1" style={{ color: activePlayer.color }}>
            {activePlayer.name}
          </h2>
        </div>
        <Button variant="primary" fullWidth onClick={() => setState({ ...state, handover: false })}>
          Voir ma main ({currentHand.length} dominos)
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={`${players[0].name} (${state.hands[0].length})`} avatar={players[0].avatar} color={players[0].color} active={state.turn === 0} />
        <PlayerPill name={`${players[1].name} (${state.hands[1].length})`} avatar={players[1].avatar} color={players[1].color} active={state.turn === 1} />
      </div>

      <Card className="w-full min-h-[84px] flex items-center gap-1.5 overflow-x-auto">
        {state.chain.length === 0 ? (
          <p className="text-xs text-muted mx-auto">Pose le premier domino</p>
        ) : (
          state.chain.map((d, i) => (
            <span key={i} className="shrink-0 rounded-btn bg-surface-2 border border-border px-2 py-1 text-xs font-bold">
              {d[0]}|{d[1]}
            </span>
          ))
        )}
      </Card>

      <div className="flex flex-wrap justify-center gap-2 w-full">
        {currentHand.map((d, idx) => {
          const playable = canPlay(d);
          const fitsLeft = leftEnd === null || d[0] === leftEnd || d[1] === leftEnd;
          const fitsRight = rightEnd === null || d[0] === rightEnd || d[1] === rightEnd;
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={!playable}
                onClick={() => playDomino(idx, fitsLeft ? 'left' : 'right')}
                className={`rounded-btn border px-3 py-2 text-sm font-bold transition-all ${
                  playable
                    ? 'bg-surface-2 border-brand text-ink active:scale-95'
                    : 'bg-surface border-border text-muted opacity-40'
                }`}
              >
                {d[0]} | {d[1]}
              </button>
              {playable && state.chain.length > 0 && fitsLeft && fitsRight && leftEnd !== rightEnd && (
                <div className="flex gap-1">
                  <button type="button" onClick={() => playDomino(idx, 'left')} className="text-[10px] text-brand underline">
                    G
                  </button>
                  <button type="button" onClick={() => playDomino(idx, 'right')} className="text-[10px] text-brand underline">
                    D
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button variant="secondary" size="sm" onClick={drawOrPass}>
        {state.boneyard.length > 0 ? `Piocher (${state.boneyard.length})` : 'Passer le tour'}
      </Button>
    </div>
  );
}
