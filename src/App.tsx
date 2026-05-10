import { ArrowLeft, BookOpen, Download, Play, RefreshCw, RotateCcw, ShieldAlert, SlidersHorizontal, Star, Trophy, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Battleship } from "./components/Battleship";
import { Checkers } from "./components/Checkers";
import { ConnectFour } from "./components/ConnectFour";
import { Dominoes } from "./components/Dominoes";
import { Hangman } from "./components/Hangman";
import { Mancala } from "./components/Mancala";
import { Mastermind } from "./components/Mastermind";
import { Matches } from "./components/Matches";
import { MemoryDuel } from "./components/MemoryDuel";
import { Quarto } from "./components/Quarto";
import { Reversi } from "./components/Reversi";
import { TicTacToe } from "./components/TicTacToe";
import { Yatzy } from "./components/Yatzy";
import { games, type GameDefinition, type GameId } from "./games";
import type { GameProps, GameSettings, PlayerIndex, PlayerProfiles } from "./playerTypes";
import { checkForUpdate, type UpdateInfo } from "./updateService";
import { APP_VERSION } from "./version";

const defaultPlayers: PlayerProfiles = [
  { name: "Joueur 1", wins: 0 },
  { name: "Joueur 2", wins: 0 }
];

type ThemeName = "dark" | "arcade" | "wood" | "neon";
type MatchHistoryEntry = {
  id: string;
  gameId: GameId;
  gameTitle: string;
  winner: PlayerIndex;
  winnerName: string;
  date: string;
  score: string;
};
type AppStats = {
  history: MatchHistoryEntry[];
  perGameWins: Record<string, [number, number]>;
  gamesPlayed: [number, number];
  currentStreak: { player: PlayerIndex | null; count: number };
};
type HomeTab = "play" | "players" | "stats" | "settings";
type GameFilter = "Tous" | GameDefinition["category"];
type TournamentState = {
  enabled: boolean;
  target: 3 | 5 | 7;
  score: [number, number];
};

const defaultSettings: GameSettings = {
  matchesStart: 21,
  ticTacToeSize: 3,
  hangmanErrors: 6,
  sound: true,
  vibration: true
};

const defaultStats: AppStats = {
  history: [],
  perGameWins: {},
  gamesPlayed: [0, 0],
  currentStreak: { player: null, count: 0 }
};
const defaultTournament: TournamentState = {
  enabled: false,
  target: 3,
  score: [0, 0]
};
const gameFilters: GameFilter[] = ["Tous", "Rapide", "Strategie", "Hasard", "Deduction"];

const loadPlayers = (): PlayerProfiles => {
  try {
    const stored = window.localStorage.getItem("duelio.players");
    if (!stored) return defaultPlayers;
    const parsed = JSON.parse(stored) as PlayerProfiles;
    return [
      { name: parsed[0]?.name || defaultPlayers[0].name, wins: Number(parsed[0]?.wins || 0) },
      { name: parsed[1]?.name || defaultPlayers[1].name, wins: Number(parsed[1]?.wins || 0) }
    ];
  } catch {
    return defaultPlayers;
  }
};

const loadJson = <T,>(key: string, fallback: T): T => {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    if (typeof fallback !== "object" || fallback === null || Array.isArray(fallback)) return parsed as T;
    return { ...fallback, ...parsed } as T;
  } catch {
    return fallback;
  }
};

const gameMap: Record<GameId, (props: GameProps) => JSX.Element> = {
  tictactoe: (props) => <TicTacToe {...props} />,
  connect4: (props) => <ConnectFour {...props} />,
  hangman: (props) => <Hangman {...props} />,
  yatzy: (props) => <Yatzy {...props} />,
  reversi: (props) => <Reversi {...props} />,
  matches: (props) => <Matches {...props} />,
  mastermind: (props) => <Mastermind {...props} />,
  battleship: (props) => <Battleship {...props} />,
  checkers: (props) => <Checkers {...props} />,
  dominoes: (props) => <Dominoes {...props} />,
  mancala: (props) => <Mancala {...props} />,
  quarto: (props) => <Quarto {...props} />,
  memory: (props) => <MemoryDuel {...props} />
};

export function App() {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [gameRun, setGameRun] = useState(0);
  const [lastPlayed, setLastPlayed] = useState<GameId | null>(() => loadJson("duelio.lastPlayed", null as GameId | null));
  const [homeTab, setHomeTab] = useState<HomeTab>("play");
  const [players, setPlayers] = useState<PlayerProfiles>(loadPlayers);
  const [stats, setStats] = useState<AppStats>(() => loadJson("duelio.stats", defaultStats));
  const [settings, setSettings] = useState<GameSettings>(() => loadJson("duelio.settings", defaultSettings));
  const [theme, setTheme] = useState<ThemeName>(() => loadJson("duelio.theme", "dark" as ThemeName));
  const [lastResult, setLastResult] = useState<MatchHistoryEntry | null>(null);
  const [favorites, setFavorites] = useState<GameId[]>(() => loadJson("duelio.favorites", [] as GameId[]));
  const [recentGames, setRecentGames] = useState<GameId[]>(() => loadJson("duelio.recentGames", [] as GameId[]));
  const [gameFilter, setGameFilter] = useState<GameFilter>("Tous");
  const [rulesGame, setRulesGame] = useState<GameDefinition | null>(null);
  const [tournament, setTournament] = useState<TournamentState>(() => loadJson("duelio.tournament", defaultTournament));
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [updatePanelOpen, setUpdatePanelOpen] = useState(false);
  const currentGame = useMemo(() => games.find((game) => game.id === selectedGame), [selectedGame]);
  const lastPlayedGame = useMemo(() => games.find((game) => game.id === lastPlayed), [lastPlayed]);
  const favoriteGames = useMemo(() => favorites.map((id) => games.find((game) => game.id === id)).filter(Boolean) as GameDefinition[], [favorites]);
  const recentGameDefs = useMemo(() => recentGames.map((id) => games.find((game) => game.id === id)).filter(Boolean) as GameDefinition[], [recentGames]);
  const filteredGames = useMemo(() => games.filter((game) => gameFilter === "Tous" || game.category === gameFilter), [gameFilter]);

  useEffect(() => {
    window.localStorage.setItem("duelio.players", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    window.localStorage.setItem("duelio.stats", JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    window.localStorage.setItem("duelio.settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    window.localStorage.setItem("duelio.theme", JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("duelio.lastPlayed", JSON.stringify(lastPlayed));
  }, [lastPlayed]);

  useEffect(() => {
    window.localStorage.setItem("duelio.favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem("duelio.recentGames", JSON.stringify(recentGames));
  }, [recentGames]);

  useEffect(() => {
    window.localStorage.setItem("duelio.tournament", JSON.stringify(tournament));
  }, [tournament]);

  useEffect(() => {
    let remove: undefined | (() => void);
    import("@capacitor/app").then(({ App: CapacitorApp }) => {
      CapacitorApp.addListener("backButton", ({ canGoBack }) => {
        if (rulesGame) {
          setRulesGame(null);
          return;
        }
        if (selectedGame) {
          setSelectedGame(null);
          setLastResult(null);
          return;
        }
        if (updatePanelOpen) {
          setUpdatePanelOpen(false);
          return;
        }
        if (canGoBack) window.history.back();
      }).then((handle) => {
        remove = () => handle.remove();
      });
    }).catch(() => undefined);

    return () => remove?.();
  }, [selectedGame, updatePanelOpen, rulesGame]);

  useEffect(() => {
    checkForUpdate().then((info) => {
      setUpdate(info);
      setUpdatePanelOpen(info.status === "available");
    });
  }, []);

  const refreshUpdate = () => {
    checkForUpdate().then((info) => {
      setUpdate(info);
      setUpdatePanelOpen(true);
    });
  };

  const renamePlayer = (index: PlayerIndex, name: string) => {
    setPlayers((current) => {
      const next: PlayerProfiles = [{ ...current[0] }, { ...current[1] }];
      next[index].name = name;
      return next;
    });
  };

  const playFeedback = (kind: "win" | "tap" | "error") => {
    if (settings.vibration && navigator.vibrate) {
      navigator.vibrate(kind === "win" ? [30, 40, 60] : kind === "error" ? 40 : 15);
    }
    if (!settings.sound) return;
    const AudioContextType = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextType) return;
    const ctx = new AudioContextType();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = kind === "win" ? 740 : kind === "error" ? 180 : 420;
    gain.gain.value = 0.045;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (kind === "win" ? 0.18 : 0.08));
  };

  const recordWin = (winner: PlayerIndex, score = "Victoire") => {
    if (!selectedGame || !currentGame) return;
    const entry: MatchHistoryEntry = {
      id: `${Date.now()}-${selectedGame}`,
      gameId: selectedGame,
      gameTitle: currentGame.title,
      winner,
      winnerName: players[winner].name,
      date: new Date().toISOString(),
      score
    };

    setPlayers((current) => {
      const next: PlayerProfiles = [{ ...current[0] }, { ...current[1] }];
      next[winner].wins += 1;
      return next;
    });
    setStats((current) => {
      const previousGame = current.perGameWins[selectedGame] || [0, 0];
      const perGameWins: Record<string, [number, number]> = {
        ...current.perGameWins,
        [selectedGame]: winner === 0 ? [previousGame[0] + 1, previousGame[1]] : [previousGame[0], previousGame[1] + 1]
      };
      return {
        history: [entry, ...current.history].slice(0, 30),
        perGameWins,
        gamesPlayed: winner === 0 ? [current.gamesPlayed[0] + 1, current.gamesPlayed[1]] : [current.gamesPlayed[0], current.gamesPlayed[1] + 1],
        currentStreak: current.currentStreak.player === winner ? { player: winner, count: current.currentStreak.count + 1 } : { player: winner, count: 1 }
      };
    });
    setLastResult(entry);
    setTournament((current) => {
      if (!current.enabled) return current;
      const nextScore: [number, number] = [...current.score];
      nextScore[winner] += 1;
      return { ...current, score: nextScore };
    });
    playFeedback("win");
  };

  const resetWins = () => {
    setPlayers((current) => [
      { ...current[0], wins: 0 },
      { ...current[1], wins: 0 }
    ]);
    setStats(defaultStats);
    setLastResult(null);
    setTournament(defaultTournament);
  };

  const rematch = () => {
    setLastResult(null);
    setGameRun((current) => current + 1);
  };

  const openGame = (gameId: GameId) => {
    setSelectedGame(gameId);
    setLastPlayed(gameId);
    setRecentGames((current) => [gameId, ...current.filter((id) => id !== gameId)].slice(0, 5));
    setLastResult(null);
    playFeedback("tap");
  };

  const toggleFavorite = (gameId: GameId) => {
    setFavorites((current) => current.includes(gameId) ? current.filter((id) => id !== gameId) : [gameId, ...current]);
    playFeedback("tap");
  };

  const startTournament = (target: 3 | 5 | 7) => {
    setTournament({ enabled: true, target, score: [0, 0] });
    playFeedback("tap");
  };

  const stopTournament = () => {
    setTournament(defaultTournament);
    playFeedback("tap");
  };

  const bestGameFor = (player: PlayerIndex) => {
    const best = Object.entries(stats.perGameWins).sort((a, b) => (b[1][player] || 0) - (a[1][player] || 0))[0];
    const game = best ? games.find((item) => item.id === best[0]) : null;
    return game && best[1][player] > 0 ? `${game.title} (${best[1][player]})` : "-";
  };

  const tournamentLimit = Math.ceil(tournament.target / 2);
  const tournamentWinner: PlayerIndex | null = tournament.score[0] >= tournamentLimit ? 0 : tournament.score[1] >= tournamentLimit ? 1 : null;

  const renderGameTile = (game: GameDefinition, compact = false) => {
    const Icon = game.icon;
    const isFavorite = favorites.includes(game.id);
    return (
      <article className={`game-tile ${compact ? "compact" : ""}`} key={game.id} data-game={game.id} style={{ "--accent": game.accent } as React.CSSProperties}>
        <button className="game-launch" onClick={() => openGame(game.id)} aria-label={`Jouer a ${game.title}`}>
          <span className="tile-art" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="tile-icon">
            <Icon size={24} />
          </span>
          <span className="tile-copy">
            <strong>{game.title}</strong>
            <small>{game.subtitle}</small>
            {!compact && <em>{game.category}</em>}
          </span>
        </button>
        <div className="tile-actions">
          <button className={isFavorite ? "mini-action active" : "mini-action"} onClick={() => toggleFavorite(game.id)} aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
            <Star size={17} />
          </button>
          <button className="mini-action" onClick={() => setRulesGame(game)} aria-label={`Regles de ${game.title}`}>
            ?
          </button>
        </div>
      </article>
    );
  };

  return (
    <main className={`app-shell theme-${theme}`}>
      <header className="topbar">
        {selectedGame ? (
          <button className="icon-button" onClick={() => setSelectedGame(null)} aria-label="Retour au hub">
            <ArrowLeft size={22} />
          </button>
        ) : (
          <div className="brand-mark">D</div>
        )}

        <div>
          <p className="kicker">Duelio</p>
          <h1>{currentGame?.title || "Jeux 1v1 locaux"}</h1>
        </div>

        <button className="icon-button" onClick={() => selectedGame && currentGame ? setRulesGame(currentGame) : window.location.reload()} aria-label={selectedGame ? "Regles du jeu" : "Rafraichir"}>
          {selectedGame ? <BookOpen size={20} /> : <RefreshCw size={20} />}
        </button>
      </header>

      {update?.status === "available" && (
        <section className="update-banner">
          <div>
            <strong>Version {update.latestVersion} disponible</strong>
            <span>Tu es en {update.currentVersion}. Ouvre l'APK, puis Android te proposera l'installation.</span>
          </div>
          <button onClick={() => window.open(update.apkUrl || update.releaseUrl, "_blank")} aria-label="Telecharger la mise a jour">
            <Download size={18} />
            Installer
          </button>
        </section>
      )}

      {update?.status === "blocked" && !selectedGame && homeTab === "settings" && (
        <section className="update-banner warning">
          <ShieldAlert size={20} />
          <div>
            <strong>Mises a jour non verifiables</strong>
            <span>{update.reason}</span>
          </div>
          <button onClick={() => window.open(update.releaseUrl, "_blank")} aria-label="Ouvrir les releases">
            Releases
          </button>
        </section>
      )}

      {updatePanelOpen && update && (
        <section className="update-modal" role="dialog" aria-modal="true" aria-label="Mise a jour">
          <div className="update-card">
            <button className="modal-close" onClick={() => setUpdatePanelOpen(false)} aria-label="Fermer">
              <X size={18} />
            </button>
            <p className="kicker">Mise a jour</p>
            {update.status === "available" && (
              <>
                <h2>Version {update.latestVersion} disponible</h2>
                <p>Version installee: {update.currentVersion}. Le bouton ouvre l'APK de la release; Android affichera ensuite l'installation.</p>
                <button className="primary-action" onClick={() => window.open(update.apkUrl || update.releaseUrl, "_blank")}>
                  <Download size={18} />
                  Installer la mise a jour
                </button>
              </>
            )}
            {update.status === "current" && (
              <>
                <h2>Duelio est a jour</h2>
                <p>Version installee: {update.currentVersion}. Derniere release: {update.latestVersion}.</p>
              </>
            )}
            {update.status === "blocked" && (
              <>
                <h2>Verification bloquee</h2>
                <p>{update.reason}</p>
                <button className="primary-action" onClick={() => window.open(update.releaseUrl, "_blank")}>Ouvrir les releases</button>
              </>
            )}
            {update.status === "offline" && (
              <>
                <h2>Verification impossible</h2>
                <p>{update.reason}</p>
              </>
            )}
          </div>
        </section>
      )}

      {rulesGame && (
        <section className="update-modal" role="dialog" aria-modal="true" aria-label={`Regles ${rulesGame.title}`}>
          <div className="update-card rules-card">
            <button className="modal-close" onClick={() => setRulesGame(null)} aria-label="Fermer">
              <X size={18} />
            </button>
            <p className="kicker">Regles</p>
            <h2>{rulesGame.title}</h2>
            <div className="rules-block">
              <strong>Objectif</strong>
              <p>{rulesGame.rules.objective}</p>
            </div>
            <div className="rules-block">
              <strong>Tour de jeu</strong>
              <p>{rulesGame.rules.turn}</p>
            </div>
            <div className="rules-tips">
              {rulesGame.rules.tips.map((tip) => <span key={tip}>{tip}</span>)}
            </div>
          </div>
        </section>
      )}

      {selectedGame ? (
        <section className="game-stage" key={`${selectedGame}-${gameRun}`}>
          {lastResult && (
            <div className="result-panel">
              <div className="confetti" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, index) => <span key={index} />)}
              </div>
              <div>
                <p className="kicker">Fin de partie</p>
                <h2>{lastResult.winnerName} gagne</h2>
                <span>{lastResult.gameTitle} - {lastResult.score}</span>
              </div>
              <div className="result-summary">
                <span>Score partie: {lastResult.score}</span>
                <span>Global: {players[0].name} {players[0].wins} - {players[1].wins} {players[1].name}</span>
                {tournament.enabled && <span>Tournoi: {players[0].name} {tournament.score[0]} - {tournament.score[1]} {players[1].name}{tournamentWinner !== null ? `, gagne par ${players[tournamentWinner].name}` : `, objectif ${tournamentLimit}`}</span>}
              </div>
              <div className="result-actions">
                <button className="primary-action" onClick={rematch}>Revanche</button>
                <button className="secondary-action" onClick={() => { setSelectedGame(null); setLastResult(null); }}>Changer de jeu</button>
              </div>
            </div>
          )}
          {gameMap[selectedGame]({ players, settings, onWin: recordWin, feedback: playFeedback })}
        </section>
      ) : (
        <section className="hub">
          <div className="hero-panel">
            <div>
              <p className="kicker">Duelio</p>
              <h2>Un telephone. Deux joueurs. Une revanche.</h2>
            </div>
            <div className="version-pill">v{APP_VERSION}</div>
          </div>

          <nav className="home-tabs" aria-label="Sections">
            <button className={homeTab === "play" ? "active" : ""} onClick={() => setHomeTab("play")}><Play size={17} />Jouer</button>
            <button className={homeTab === "players" ? "active" : ""} onClick={() => setHomeTab("players")}><UserRound size={17} />Joueurs</button>
            <button className={homeTab === "stats" ? "active" : ""} onClick={() => setHomeTab("stats")}><Trophy size={17} />Stats</button>
            <button className={homeTab === "settings" ? "active" : ""} onClick={() => setHomeTab("settings")}><SlidersHorizontal size={17} />Options</button>
          </nav>

          {homeTab === "play" && (
            <>
              <section className="versus-strip">
                {players.map((player, index) => (
                  <div key={index}>
                    <span className={`player-avatar avatar-${index}`}>{player.name.slice(0, 1).toUpperCase() || index + 1}</span>
                    <strong>{player.name}</strong>
                    <small>{player.wins} victoire{player.wins > 1 ? "s" : ""}</small>
                  </div>
                ))}
              </section>

              <section className="resume-panel">
                <div>
                  <p className="kicker">Reprendre</p>
                  <h3>{lastPlayedGame ? lastPlayedGame.title : "Choisis un jeu"}</h3>
                  <span>{stats.history[0] ? `Derniere victoire: ${stats.history[0].winnerName}` : "Les parties se jouent directement a deux sur ce telephone."}</span>
                </div>
                {lastPlayedGame && (
                  <button className="primary-action" onClick={() => openGame(lastPlayedGame.id)}>
                    <Play size={18} />
                    Reprendre
                  </button>
                )}
              </section>

              <section className="tournament-panel">
                <div>
                  <p className="kicker">Tournoi</p>
                  <h3>{tournament.enabled ? `${players[0].name} ${tournament.score[0]} - ${tournament.score[1]} ${players[1].name}` : "Serie de manches"}</h3>
                  <span>{tournament.enabled ? `Premier a ${tournamentLimit} victoire${tournamentLimit > 1 ? "s" : ""}` : "Choisis 3, 5 ou 7 manches, Duelio garde le score global."}</span>
                </div>
                <div className="tournament-actions">
                  {[3, 5, 7].map((target) => (
                    <button key={target} className={tournament.enabled && tournament.target === target ? "active" : ""} onClick={() => startTournament(target as 3 | 5 | 7)}>{target}</button>
                  ))}
                  {tournament.enabled && <button onClick={stopTournament}>Stop</button>}
                </div>
              </section>

              {(favoriteGames.length > 0 || recentGameDefs.length > 0) && (
                <section className="quick-games">
                  {favoriteGames.length > 0 && (
                    <div>
                      <p className="kicker">Favoris</p>
                      <div className="quick-row">{favoriteGames.map((game) => renderGameTile(game, true))}</div>
                    </div>
                  )}
                  {recentGameDefs.length > 0 && (
                    <div>
                      <p className="kicker">Recents</p>
                      <div className="quick-row">{recentGameDefs.map((game) => renderGameTile(game, true))}</div>
                    </div>
                  )}
                </section>
              )}

              <section className="section-heading">
                <p className="kicker">Jeux</p>
                <span>{filteredGames.length} jeu{filteredGames.length > 1 ? "x" : ""}</span>
              </section>

              <div className="filter-row" aria-label="Filtrer les jeux">
                {gameFilters.map((filter) => (
                  <button key={filter} className={gameFilter === filter ? "active" : ""} onClick={() => setGameFilter(filter)}>{filter}</button>
                ))}
              </div>

              <div className="game-grid">
                {filteredGames.map((game) => renderGameTile(game))}
              </div>
            </>
          )}

          {homeTab === "players" && (
            <section className="players-panel clean-panel" aria-label="Joueurs">
              {players.map((player, index) => (
                <label key={index} className="player-card">
                  <span className={`player-avatar avatar-${index}`}>{player.name.slice(0, 1).toUpperCase() || index + 1}</span>
                  <span>Joueur {index + 1}</span>
                  <input value={player.name} maxLength={16} onChange={(event) => renamePlayer(index as PlayerIndex, event.target.value)} />
                  <strong>{player.wins} victoire{player.wins > 1 ? "s" : ""}</strong>
                  <small>Meilleur jeu: {bestGameFor(index as PlayerIndex)}</small>
                </label>
              ))}
              <button className="reset-score" onClick={resetWins}>Remettre les victoires a zero</button>
            </section>
          )}

          {homeTab === "stats" && (
            <section className="history-panel clean-panel">
              <div>
                <p className="kicker">Serie actuelle</p>
                <strong>{stats.currentStreak.player === null ? "Aucune serie" : `${players[stats.currentStreak.player].name}: ${stats.currentStreak.count} victoire${stats.currentStreak.count > 1 ? "s" : ""} de suite`}</strong>
              </div>
              {stats.history.length === 0 && <p className="empty-state">Aucune partie terminee pour l'instant.</p>}
              {stats.history.slice(0, 10).map((entry) => (
                <div key={entry.id} className="history-row">
                  <span>{entry.gameTitle}</span>
                  <strong>{entry.winnerName}</strong>
                  <small>{new Date(entry.date).toLocaleDateString("fr-FR")} - {entry.score}</small>
                </div>
              ))}
            </section>
          )}

          {homeTab === "settings" && (
            <>
              <section className="settings-panel clean-panel">
                <label>
                  Theme
                  <select value={theme} onChange={(event) => setTheme(event.target.value as ThemeName)}>
                    <option value="dark">Sombre</option>
                    <option value="arcade">Arcade</option>
                    <option value="wood">Bois/table</option>
                    <option value="neon">Neon</option>
                  </select>
                </label>
                <label>
                  Allumettes
                  <input type="number" min="9" max="41" step="2" value={settings.matchesStart} onChange={(event) => setSettings({ ...settings, matchesStart: Number(event.target.value) })} />
                </label>
                <label>
                  Morpion
                  <select value={settings.ticTacToeSize} onChange={(event) => setSettings({ ...settings, ticTacToeSize: Number(event.target.value) as 3 | 4 })}>
                    <option value={3}>3x3</option>
                    <option value={4}>4x4</option>
                  </select>
                </label>
                <label>
                  Pendu erreurs
                  <input type="number" min="4" max="10" value={settings.hangmanErrors} onChange={(event) => setSettings({ ...settings, hangmanErrors: Number(event.target.value) })} />
                </label>
                <button className={settings.sound ? "toggle-on" : ""} onClick={() => setSettings({ ...settings, sound: !settings.sound })}>Sons</button>
                <button className={settings.vibration ? "toggle-on" : ""} onClick={() => setSettings({ ...settings, vibration: !settings.vibration })}>Vibrations</button>
              </section>
              <button className="update-check" onClick={refreshUpdate}>
                <RefreshCw size={18} />
                Verifier les mises a jour
              </button>
            </>
          )}
        </section>
      )}
    </main>
  );
}

export function GameHeader({ title, status, onReset }: { title: string; status: string; onReset: () => void }) {
  return (
    <div className="game-header">
      <div>
        <p className="kicker">{title}</p>
        <h2>{status}</h2>
      </div>
      <button className="icon-button" onClick={onReset} aria-label="Recommencer">
        <RotateCcw size={20} />
      </button>
    </div>
  );
}
