import { PlayerProfiles } from '../playerTypes';
import { Card } from '../design-system';

const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🐙', '🦄', '🐝', '🐧', '🐯', '🐨', '🐲', '👾', '🤖', '👻', '🔥', '⚡'];
const COLORS = ['#38bdf8', '#f43f5e', '#10b981', '#f59e0b', '#a855f7', '#ec4899', '#22d3ee', '#84cc16'];

interface PlayersTabProps {
  players: PlayerProfiles;
  onUpdatePlayer: (index: 0 | 1, patch: Partial<PlayerProfiles[0]>) => void;
}

export function PlayersTab({ players, onUpdatePlayer }: PlayersTabProps) {
  return (
    <div className="space-y-4 pb-4">
      {([0, 1] as const).map((idx) => {
        const player = players[idx];
        return (
          <Card key={idx} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{player.avatar}</span>
                <div>
                  <p className="text-xs text-muted font-medium">Joueur {idx + 1}</p>
                  <p className="text-sm font-bold text-ink">{player.name}</p>
                </div>
              </div>
              <span
                className="h-4 w-4 rounded-full border border-white/20"
                style={{ backgroundColor: player.color }}
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">Nom</label>
              <input
                type="text"
                maxLength={18}
                value={player.name}
                onChange={(e) => onUpdatePlayer(idx, { name: e.target.value })}
                className="w-full rounded-btn bg-surface-2 border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <p className="text-xs text-muted mb-1.5">Avatar</p>
              <div className="grid grid-cols-8 gap-1.5">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => onUpdatePlayer(idx, { avatar: av })}
                    className={`rounded-btn py-1.5 text-lg border transition-all ${
                      player.avatar === av
                        ? 'bg-surface-2 border-brand scale-105'
                        : 'bg-bg/40 border-transparent hover:bg-surface-2'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted mb-1.5">Couleur</p>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => onUpdatePlayer(idx, { color: col })}
                    aria-label={`Couleur ${col}`}
                    className={`h-7 w-7 rounded-full border-2 transition-transform ${
                      player.color === col ? 'border-white scale-110' : 'border-transparent opacity-75'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
