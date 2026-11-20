import { useState } from 'react';
import { GameProps, PlayerIndex } from '../../playerTypes';
import { PlayerPill } from '../../design-system';

const DOTS = 4;
const BOXES = DOTS - 1;

export function DotsBoxesGame({ players, onWin, feedback }: GameProps) {
  const [hLines, setHLines] = useState<boolean[]>(() => Array(DOTS * BOXES).fill(false));
  const [vLines, setVLines] = useState<boolean[]>(() => Array(BOXES * DOTS).fill(false));
  const [owners, setOwners] = useState<(PlayerIndex | null)[]>(() => Array(BOXES * BOXES).fill(null));
  const [turn, setTurn] = useState<PlayerIndex>(0);

  const checkCompletedBoxes = (nextH: boolean[], nextV: boolean[], nextOwners: (PlayerIndex | null)[]) => {
    let gained = 0;
    for (let r = 0; r < BOXES; r++) {
      for (let c = 0; c < BOXES; c++) {
        const idx = r * BOXES + c;
        if (nextOwners[idx] !== null) continue;
        const top = nextH[r * BOXES + c];
        const bottom = nextH[(r + 1) * BOXES + c];
        const left = nextV[r * DOTS + c];
        const right = nextV[r * DOTS + (c + 1)];
        if (top && bottom && left && right) {
          nextOwners[idx] = turn;
          gained += 1;
        }
      }
    }
    return gained;
  };

  const playLine = (type: 'h' | 'v', idx: number) => {
    if (type === 'h' && hLines[idx]) return;
    if (type === 'v' && vLines[idx]) return;

    const nextH = type === 'h' ? hLines.map((v, i) => (i === idx ? true : v)) : hLines;
    const nextV = type === 'v' ? vLines.map((v, i) => (i === idx ? true : v)) : vLines;
    const nextOwners = [...owners];

    const gained = checkCompletedBoxes(nextH, nextV, nextOwners);
    setHLines(nextH);
    setVLines(nextV);
    setOwners(nextOwners);
    feedback(gained > 0 ? 'drop' : 'tap');

    if (nextOwners.every((o) => o !== null)) {
      const s0 = nextOwners.filter((o) => o === 0).length;
      const s1 = nextOwners.filter((o) => o === 1).length;
      onWin(s0 >= s1 ? 0 : 1, `${s0} - ${s1}`);
      return;
    }

    if (gained === 0) {
      setTurn(turn === 0 ? 1 : 0);
    }
  };

  const s0 = owners.filter((o) => o === 0).length;
  const s1 = owners.filter((o) => o === 1).length;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <PlayerPill name={`${players[0].name} (${s0})`} avatar={players[0].avatar} color={players[0].color} active={turn === 0} />
        <PlayerPill name={`${players[1].name} (${s1})`} avatar={players[1].avatar} color={players[1].color} active={turn === 1} />
      </div>

      <div className="p-4 rounded-card bg-surface border border-border">
        {Array.from({ length: DOTS }).map((_, r) => (
          <div key={r} className="flex flex-col">
            <div className="flex items-center">
              {Array.from({ length: DOTS }).map((__, c) => (
                <div key={c} className="flex items-center">
                  <span className="h-3 w-3 rounded-full bg-ink" />
                  {c < BOXES && (
                    <button
                      type="button"
                      onClick={() => playLine('h', r * BOXES + c)}
                      aria-label={`Ligne H ${r}-${c}`}
                      className={`h-2 w-14 mx-0.5 rounded-full transition-colors ${
                        hLines[r * BOXES + c] ? 'bg-brand' : 'bg-surface-2 hover:bg-brand/40'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            {r < BOXES && (
              <div className="flex items-center">
                {Array.from({ length: DOTS }).map((__, c) => (
                  <div key={c} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => playLine('v', r * DOTS + c)}
                      aria-label={`Ligne V ${r}-${c}`}
                      className={`w-2 h-14 my-0.5 rounded-full transition-colors ${
                        vLines[r * DOTS + c] ? 'bg-brand' : 'bg-surface-2 hover:bg-brand/40'
                      }`}
                    />
                    {c < BOXES && (
                      <div
                        className="w-14 h-14 mx-0.5 rounded-btn flex items-center justify-center text-lg font-bold"
                        style={{
                          backgroundColor:
                            owners[r * BOXES + c] !== null
                              ? `${players[owners[r * BOXES + c]!].color}33`
                              : 'transparent',
                        }}
                      >
                        {owners[r * BOXES + c] !== null ? players[owners[r * BOXES + c]!].avatar : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
