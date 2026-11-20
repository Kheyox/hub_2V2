import { useMemo, useState } from 'react';
import { Dices, Heart, Play, Sparkles, Trophy } from 'lucide-react';
import { games as GAMES, GameDefinition, GameId } from '../games';
import { Badge, Button, Card } from '../design-system';

type CategoryFilter = 'Tous' | 'Favoris' | GameDefinition['category'];

const CATEGORIES: CategoryFilter[] = ['Tous', 'Favoris', 'Rapide', 'Stratégie', 'Hasard', 'Déduction'];

interface PlayTabProps {
  favorites: string[];
  recents: string[];
  onToggleFavorite: (id: GameId) => void;
  onSelectGame: (id: GameId) => void;
  onStartTournament: (bestOf: 3 | 5) => void;
}

export function PlayTab({
  favorites,
  recents,
  onToggleFavorite,
  onSelectGame,
  onStartTournament,
}: PlayTabProps) {
  const [filter, setFilter] = useState<CategoryFilter>('Tous');
  const [query, setQuery] = useState('');

  const filteredGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter((game) => {
      if (filter === 'Favoris' && !favorites.includes(game.id)) return false;
      if (filter !== 'Tous' && filter !== 'Favoris' && game.category !== filter) return false;
      if (q && !game.title.toLowerCase().includes(q) && !game.subtitle.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [filter, favorites, query]);

  const lastGame = recents.length > 0 ? GAMES.find((g) => g.id === recents[0]) : undefined;

  const launchRandom = () => {
    const pick = GAMES[Math.floor(Math.random() * GAMES.length)];
    if (pick) onSelectGame(pick.id);
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="primary" size="md" onClick={launchRandom}>
          <Dices className="h-4 w-4" />
          Jeu surprise
        </Button>
        {lastGame ? (
          <Button variant="secondary" size="md" onClick={() => onSelectGame(lastGame.id)}>
            <Play className="h-4 w-4" />
            <span className="truncate">{lastGame.title}</span>
          </Button>
        ) : (
          <Button variant="secondary" size="md" onClick={() => onStartTournament(3)}>
            <Trophy className="h-4 w-4" />
            Tournoi Bo3
          </Button>
        )}
      </div>

      <Card className="flex items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Sparkles className="h-4 w-4 text-brand shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Mode Tournoi</p>
            <p className="text-xs text-muted truncate">Enchaîne plusieurs jeux en duel</p>
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button size="sm" onClick={() => onStartTournament(3)}>
            Bo3
          </Button>
          <Button size="sm" onClick={() => onStartTournament(5)}>
            Bo5
          </Button>
        </div>
      </Card>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un jeu..."
        className="w-full rounded-btn bg-surface border border-border px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-brand"
      />

      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              filter === cat
                ? 'bg-brand text-bg border-brand font-semibold'
                : 'bg-surface text-muted border-border hover:text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredGames.map((game) => {
          const Icon = game.icon;
          const isFav = favorites.includes(game.id);
          return (
            <Card
              key={game.id}
              className="flex items-center justify-between gap-3 cursor-pointer hover:bg-surface-2/80 transition-colors"
              onClick={() => onSelectGame(game.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-btn bg-surface-2 border border-border"
                  style={{ color: game.accent }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-ink truncate">{game.title}</h3>
                    <Badge>{game.category}</Badge>
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">{game.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(game.id);
                }}
                aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                className={`p-2 rounded-btn hover:bg-surface-2 shrink-0 ${
                  isFav ? 'text-rose-400' : 'text-muted'
                }`}
              >
                <Heart className="h-4 w-4" fill={isFav ? 'currentColor' : 'none'} />
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
