import { games as GAMES } from '../games';
import { PlayerProfiles } from '../playerTypes';
import { MatchRecord } from '../stores/appStore';
import { Button, Card } from '../design-system';

interface StatsTabProps {
  players: PlayerProfiles;
  history: MatchRecord[];
  onResetStats: () => void;
}

export function StatsTab({ players, history, onResetStats }: StatsTabProps) {
  const p1Wins = history.filter((h) => h.winner === 0).length;
  const p2Wins = history.filter((h) => h.winner === 1).length;

  return (
    <div className="space-y-4 pb-4">
      <Card className="grid grid-cols-3 items-center text-center gap-2">
        <div>
          <div className="text-2xl">{players[0].avatar}</div>
          <div className="text-xs text-muted truncate mt-1">{players[0].name}</div>
          <div className="text-2xl font-bold mt-1" style={{ color: players[0].color }}>
            {p1Wins}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted font-semibold">Total</div>
          <div className="text-xl font-bold text-ink mt-1">{history.length}</div>
          <div className="text-[11px] text-muted">parties</div>
        </div>
        <div>
          <div className="text-2xl">{players[1].avatar}</div>
          <div className="text-xs text-muted truncate mt-1">{players[1].name}</div>
          <div className="text-2xl font-bold mt-1" style={{ color: players[1].color }}>
            {p2Wins}
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Historique récent</h3>
        {history.length > 0 && (
          <Button variant="danger" size="sm" onClick={onResetStats}>
            Réinitialiser
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="text-center py-8 text-sm text-muted">
          Aucune partie enregistrée pour le moment.
        </Card>
      ) : (
        <div className="space-y-2">
          {history.slice(0, 20).map((item) => {
            const game = GAMES.find((g) => g.id === item.gameId);
            const winner = item.winner === 'draw' ? null : players[item.winner];
            return (
              <Card key={item.id} className="flex items-center justify-between py-2.5 px-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{game?.title ?? item.gameId}</p>
                  <p className="text-[11px] text-muted">
                    {new Date(item.playedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {winner ? (
                  <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: winner.color }}>
                    <span>{winner.avatar}</span>
                    <span>{winner.name}</span>
                  </span>
                ) : (
                  <span className="text-xs text-muted">Égalité</span>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
