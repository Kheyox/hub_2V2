import { ArrowLeft, BookOpen, Dices, Download, Play, RefreshCw, RotateCcw, ShieldAlert, SlidersHorizontal, Star, Trophy, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Battleship } from "./components/Battleship";
import { Checkers } from "./components/Checkers";
import { ConnectFour } from "./components/ConnectFour";
import { DotsBoxes } from "./components/DotsBoxes";
import { Dominoes } from "./components/Dominoes";
import { Hangman } from "./components/Hangman";
import { Mancala } from "./components/Mancala";
import { Mastermind } from "./components/Mastermind";
import { Matches } from "./components/Matches";
import { MemoryDuel } from "./components/MemoryDuel";
import { Quarto } from "./components/Quarto";
import { Reflex } from "./components/Reflex";
import { Reversi } from "./components/Reversi";
import { TicTacToe } from "./components/TicTacToe";
import { Yatzy } from "./components/Yatzy";
import { games, type GameDefinition, type GameId } from "./games";
import type { GameProps, GameSettings, PlayerIndex, PlayerProfiles } from "./playerTypes";
import { configureAudio, sfx, type MusicStyle, type SfxKind } from "./sound";
import { checkForUpdate, type UpdateInfo } from "./updateService";
import { APP_VERSION } from "./version";

const AVATARS = ["😀", "😎", "🦊", "🐯", "🐸", "🐼", "🦄", "🐲", "🤖", "👾", "🦁", "🐙", "🌟", "🔥", "⚡", "🍀"];
const PLAYER_COLORS = ["#7fb7ff", "#f5c84c", "#39c6a3", "#ef7a59", "#d89cff", "#f28bba", "#69d2a0", "#ff9f6e"];

const defaultPlayers: PlayerProfiles = [
  { name: "Joueur 1", wins: 0, avatar: "😀", color: "#7fb7ff" },
  { name: "Joueur 2", wins: 0, avatar: "😎", color: "#f5c84c" }
];

type ThemeName = "dark" | "arcade" | "wood" | "neon";
const musicStyleForTheme: Record<ThemeName, MusicStyle> = {
  dark: "chill",
  neon: "chill",
  arcade: "chiptune",
  wood: "acoustic"
};
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
type MarathonState = {
  active: boolean;
  games: GameId[];
  round: number;
  score: [number, number];
};
const defaultMarathon: MarathonState = { active: false, games: [], round: 0, score: [0, 0] };
type OnboardingState = {
  done: boolean;
  step: 0 | 1 | 2;
};

const defaultSettings: GameSettings = {
  matchesStart: 21,
  ticTacToeSize: 3,
  hangmanErrors: 6,
  memorySize: 4,
  checkersSize: 8,
  checkersMajority: false,
  sound: true,
  music: true,
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
const gameFilters: GameFilter[] = ["Tous", "Rapide", "Stratégie", "Hasard", "Déduction"];

const loadPlayers = (): PlayerProfiles => {
  try {
    const stored = window.localStorage.getItem("duelio.players");
    if (!stored) return defaultPlayers;
    const parsed = JSON.parse(stored) as PlayerProfiles;
    return [
      { name: parsed[0]?.name || defaultPlayers[0].name, wins: Number(parsed[0]?.wins || 0), avatar: parsed[0]?.avatar || defaultPlayers[0].avatar, color: parsed[0]?.color || defaultPlayers[0].color },
      { name: parsed[1]?.name || defaultPlayers[1].name, wins: Number(parsed[1]?.wins || 0), avatar: parsed[1]?.avatar || defaultPlayers[1].avatar, color: parsed[1]?.color || defaultPlayers[1].color }
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
  memory: (props) => <MemoryDuel {...props} />,
  dotsboxes: (props) => <DotsBoxes {...props} />,
  reflex: (props) => <Reflex {...props} />
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
  const [marathon, setMarathon] = useState<MarathonState>(defaultMarathon);
  const [onboarding, setOnboarding] = useState<OnboardingState>(() => loadJson("duelio.onboarding", { done: false, step: 0 as const }));
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
    configureAudio({ sound: settings.sound, music: settings.music, style: musicStyleForTheme[theme] });
  }, [settings.sound, settings.music, theme]);

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
    window.localStorage.setItem("duelio.onboarding", JSON.stringify(onboarding));
  }, [onboarding]);

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
          setMarathon(defaultMarathon);
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

  const setPlayerAvatar = (index: PlayerIndex, avatar: string) => {
    setPlayers((current) => {
      const next: PlayerProfiles = [{ ...current[0] }, { ...current[1] }];
      next[index].avatar = avatar;
      return next;
    });
    playFeedback("tap");
  };

  const setPlayerColor = (index: PlayerIndex, color: string) => {
    setPlayers((current) => {
      const next: PlayerProfiles = [{ ...current[0] }, { ...current[1] }];
      next[index].color = color;
      return next;
    });
    playFeedback("tap");
  };

  const playSurprise = () => {
    const pool = games.map((game) => game.id);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    openGame(pick);
  };

  const playFeedback = (kind: SfxKind) => {
    if (settings.vibration && navigator.vibrate) {
      navigator.vibrate(kind === "win" ? [30, 40, 60] : kind === "error" ? 40 : kind === "dice" ? [10, 20, 10] : 15);
    }
    sfx(kind);
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
    setMarathon((current) => {
      if (!current.active) return current;
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

  const startMarathon = (count: 3 | 5) => {
    const pool = [...games.map((game) => game.id)].sort(() => Math.random() - 0.5).slice(0, count);
    setMarathon({ active: true, games: pool, round: 0, score: [0, 0] });
    setSelectedGame(pool[0]);
    setLastPlayed(pool[0]);
    setLastResult(null);
    playFeedback("tap");
  };

  const advanceMarathon = () => {
    setMarathon((current) => {
      const nextRound = current.round + 1;
      if (nextRound >= current.games.length) return current;
      setSelectedGame(current.games[nextRound]);
      setLastPlayed(current.games[nextRound]);
      setLastResult(null);
      return { ...current, round: nextRound };
    });
    playFeedback("tap");
  };

  const replayMarathonRound = () => {
    setLastResult(null);
    setGameRun((current) => current + 1);
    playFeedback("tap");
  };

  const stopMarathon = () => {
    setMarathon(defaultMarathon);
    setSelectedGame(null);
    setLastResult(null);
    playFeedback("tap");
  };

  const bestGameFor = (player: PlayerIndex) => {
    const best = Object.entries(stats.perGameWins).sort((a, b) => (b[1][player] || 0) - (a[1][player] || 0))[0];
    const game = best ? games.find((item) => item.id === best[0]) : null;
    return game && best[1][player] > 0 ? `${game.title} (${best[1][player]})` : "-";
  };

  const tournamentLimit = Math.ceil(tournament.target / 2);
  const tournamentWinner: PlayerIndex | null = tournament.score[0] >= tournamentLimit ? 0 : tournament.score[1] >= tournamentLimit ? 1 : null;
  const totalGames = stats.gamesPlayed[0] + stats.gamesPlayed[1];
  const marathonGames = useMemo(() => marathon.games.map((id) => games.find((game) => game.id === id)).filter(Boolean) as GameDefinition[], [marathon.games]);
  const marathonLastRound = marathon.active && marathon.round >= marathon.games.length - 1;
  const marathonWinner: PlayerIndex | null = marathon.score[0] === marathon.score[1] ? null : marathon.score[0] > marathon.score[1] ? 0 : 1;
  const nextMarathonGame = marathon.active && !marathonLastRound ? games.find((game) => game.id === marathon.games[marathon.round + 1]) : null;
  const headToHead = useMemo(() => games
    .map((game) => ({ game, wins: (stats.perGameWins[game.id] || [0, 0]) as [number, number] }))
    .filter(({ wins }) => wins[0] + wins[1] > 0)
    .sort((a, b) => (b.wins[0] + b.wins[1]) - (a.wins[0] + a.wins[1])), [stats.perGameWins]);

  const renderGameTile = (game: GameDefinition, compact = false) => {
    const Icon = game.icon;
    const isFavorite = favorites.includes(game.id);
    return (
      <article className={`game-tile ${compact ? "compact" : ""}`} key={game.id} data-game={game.id} style={{ "--accent": game.accent } as React.CSSProperties}>
        <button className="game-launch" onClick={() => openGame(game.id)} aria-label={`Jouer à ${game.title}`}>
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
          <button className="mini-action" onClick={() => setRulesGame(game)} aria-label={`Règles de ${game.title}`}>
            ?
          </button>
        </div>
      </article>
    );
  };

  return (
    <main className={`app-shell theme-${theme} ${selectedGame ? "in-game" : "in-hub"}`}>
      {!onboarding.done && (
        <section className="onboarding-modal" role="dialog" aria-modal="true" aria-label="Bienvenue dans Versus">
          <div className="onboarding-card">
            <div className="onboarding-preview" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            {onboarding.step === 0 && (
              <>
                <p className="kicker">Premier lancement</p>
                <h2>On prépare votre table de jeu</h2>
                <label>Joueur 1<input value={players[0].name} maxLength={16} onChange={(event) => renamePlayer(0, event.target.value)} /></label>
                <label>Joueur 2<input value={players[1].name} maxLength={16} onChange={(event) => renamePlayer(1, event.target.value)} /></label>
              </>
            )}
            {onboarding.step === 1 && (
              <>
                <p className="kicker">Ambiance</p>
                <h2>Choisis un thème</h2>
                <div className="theme-choice">
                  {(["dark", "arcade", "wood", "neon"] as ThemeName[]).map((item) => (
                    <button key={item} className={theme === item ? "active" : ""} onClick={() => setTheme(item)}>{item === "dark" ? "Sombre" : item === "wood" ? "Bois" : item === "neon" ? "Néon" : "Arcade"}</button>
                  ))}
                </div>
              </>
            )}
            {onboarding.step === 2 && (
              <>
                <p className="kicker">Comment ça marche</p>
                <h2>Un téléphone, deux joueurs, des revanches</h2>
                <div className="onboarding-notes">
                  <span>Les scores restent liés aux prénoms.</span>
                  <span>Le bouton ? affiche les règles courtes de chaque jeu.</span>
                  <span>Favoris, récents et tournois sont à portée de pouce.</span>
                </div>
              </>
            )}
            <div className="onboarding-actions">
              {onboarding.step > 0 && <button className="secondary-action" onClick={() => setOnboarding((current) => ({ ...current, step: (current.step - 1) as 0 | 1 | 2 }))}>Retour</button>}
              <button className="primary-action" onClick={() => setOnboarding((current) => current.step === 2 ? { done: true, step: 2 } : { ...current, step: (current.step + 1) as 0 | 1 | 2 })}>
                {onboarding.step === 2 ? "Entrer" : "Continuer"}
              </button>
            </div>
          </div>
        </section>
      )}
      <header className="topbar">
        {selectedGame ? (
          <button className="icon-button" onClick={() => { setSelectedGame(null); setMarathon(defaultMarathon); }} aria-label="Retour au hub">
            <ArrowLeft size={22} />
          </button>
        ) : (
          <div className="brand-mark">VS</div>
        )}

        <div>
          <p className="kicker">Versus</p>
          <h1>{currentGame?.title || "Jeux à deux"}</h1>
        </div>

        <button className="icon-button" onClick={() => selectedGame && currentGame ? setRulesGame(currentGame) : window.location.reload()} aria-label={selectedGame ? "Règles du jeu" : "Rafraîchir"}>
          {selectedGame ? <BookOpen size={20} /> : <RefreshCw size={20} />}
        </button>
      </header>

      {update?.status === "available" && (
        <section className="update-banner">
          <div>
            <strong>Version {update.latestVersion} disponible</strong>
            <span>Tu es en {update.currentVersion}. Ouvre l'APK, puis Android te proposera l'installation.</span>
          </div>
          <button onClick={() => window.open(update.apkUrl || update.releaseUrl, "_blank")} aria-label="Télécharger la mise à jour">
            <Download size={18} />
            Installer
          </button>
        </section>
      )}

      {update?.status === "blocked" && !selectedGame && homeTab === "settings" && (
        <section className="update-banner warning">
          <ShieldAlert size={20} />
          <div>
            <strong>Mises à jour non vérifiables</strong>
            <span>{update.reason}</span>
          </div>
          <button onClick={() => window.open(update.releaseUrl, "_blank")} aria-label="Ouvrir les releases">
            Releases
          </button>
        </section>
      )}

      {updatePanelOpen && update && (
        <section className="update-modal" role="dialog" aria-modal="true" aria-label="Mise à jour">
          <div className="update-card">
            <button className="modal-close" onClick={() => setUpdatePanelOpen(false)} aria-label="Fermer">
              <X size={18} />
            </button>
            <p className="kicker">Mise à jour</p>
            {update.status === "available" && (
              <>
                <h2>Version {update.latestVersion} disponible</h2>
                <p>Version installée : {update.currentVersion}. Le bouton ouvre l'APK de la release ; Android affichera ensuite l'installation.</p>
                <button className="primary-action" onClick={() => window.open(update.apkUrl || update.releaseUrl, "_blank")}>
                  <Download size={18} />
                  Installer la mise à jour
                </button>
              </>
            )}
            {update.status === "current" && (
              <>
                <h2>Versus est à jour</h2>
                <p>Version installée : {update.currentVersion}. Dernière release : {update.latestVersion}.</p>
              </>
            )}
            {update.status === "blocked" && (
              <>
                <h2>Vérification bloquée</h2>
                <p>{update.reason}</p>
                <button className="primary-action" onClick={() => window.open(update.releaseUrl, "_blank")}>Ouvrir les releases</button>
              </>
            )}
            {update.status === "offline" && (
              <>
                <h2>Vérification impossible</h2>
                <p>{update.reason}</p>
              </>
            )}
          </div>
        </section>
      )}

      {rulesGame && (
        <section className="update-modal" role="dialog" aria-modal="true" aria-label={`Règles ${rulesGame.title}`}>
          <div className="update-card rules-card">
            <button className="modal-close" onClick={() => setRulesGame(null)} aria-label="Fermer">
              <X size={18} />
            </button>
            <p className="kicker">Règles</p>
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
        <section className={`game-stage game-stage-${selectedGame}`} key={`${selectedGame}-${gameRun}`}>
          {marathon.active && !lastResult && (
            <div className="marathon-banner">
              <div className="marathon-progress" aria-hidden="true">
                {marathonGames.map((game, index) => (
                  <i key={game.id} className={index < marathon.round ? "done" : index === marathon.round ? "current" : ""} />
                ))}
              </div>
              <div className="marathon-banner-info">
                <strong>Manche {marathon.round + 1}/{marathon.games.length}</strong>
                <span>{players[0].avatar} {marathon.score[0]} – {marathon.score[1]} {players[1].avatar}</span>
              </div>
              <button className="mini-action" onClick={replayMarathonRound}>Nul, rejouer</button>
            </div>
          )}
          {lastResult && marathon.active && (
            <>
              <div className="confetti-fullscreen" aria-hidden="true">
                {Array.from({ length: 40 }).map((_, index) => <span key={index} />)}
              </div>
              <div className="result-panel celebrate" style={{ "--win-color": players[lastResult.winner].color } as React.CSSProperties}>
                <div className="result-head">
                  <span className="result-avatar">🏆</span>
                  <div>
                    <p className="kicker">{marathonLastRound ? "Fin du tournoi" : `Manche ${marathon.round + 1}/${marathon.games.length}`}</p>
                    <h2>{marathonLastRound ? (marathonWinner === null ? "Tournoi nul !" : `${players[marathonWinner].name} remporte le tournoi !`) : `${lastResult.winnerName} gagne la manche`}</h2>
                    <span>{lastResult.gameTitle} · {lastResult.score}</span>
                  </div>
                </div>
                <div className="marathon-scoreboard">
                  <div className="marathon-tally">
                    <span style={{ color: players[0].color }}>{players[0].avatar} {players[0].name}</span>
                    <strong>{marathon.score[0]} – {marathon.score[1]}</strong>
                    <span style={{ color: players[1].color }}>{players[1].name} {players[1].avatar}</span>
                  </div>
                  <div className="marathon-list">
                    {marathonGames.map((game, index) => (
                      <span key={game.id} className={index < marathon.round ? "played" : index === marathon.round ? "played now" : "upcoming"}>
                        {index < marathon.round ? "✓" : index === marathon.round ? "●" : "○"} {game.title}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="result-actions">
                  {marathonLastRound ? (
                    <>
                      <button className="primary-action" onClick={() => startMarathon(marathon.games.length as 3 | 5)}>Nouveau tournoi</button>
                      <button className="secondary-action" onClick={stopMarathon}>Terminer</button>
                    </>
                  ) : (
                    <>
                      <button className="primary-action" onClick={advanceMarathon}>Manche suivante{nextMarathonGame ? ` : ${nextMarathonGame.title}` : ""}</button>
                      <button className="secondary-action" onClick={stopMarathon}>Abandonner</button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          {lastResult && !marathon.active && (
            <>
              <div className="confetti-fullscreen" aria-hidden="true">
                {Array.from({ length: 40 }).map((_, index) => <span key={index} />)}
              </div>
              <div className="result-panel celebrate" style={{ "--win-color": players[lastResult.winner].color } as React.CSSProperties}>
                <div className="result-head">
                  <span className="result-avatar">{players[lastResult.winner].avatar}</span>
                  <div>
                    <p className="kicker">Fin de partie</p>
                    <h2>{lastResult.winnerName} gagne !</h2>
                    <span>{lastResult.gameTitle} · {lastResult.score}</span>
                  </div>
                </div>
                <div className="result-summary">
                  <span>Score global : {players[0].name} {players[0].wins} - {players[1].wins} {players[1].name}</span>
                  {tournament.enabled && <span>Tournoi : {players[0].name} {tournament.score[0]} - {tournament.score[1]} {players[1].name}{tournamentWinner !== null ? ` — remporté par ${players[tournamentWinner].name} !` : ` (objectif ${tournamentLimit})`}</span>}
                </div>
                <div className="result-actions">
                  <button className="primary-action" onClick={rematch}>Revanche</button>
                  <button className="secondary-action" onClick={() => { setSelectedGame(null); setLastResult(null); }}>Changer de jeu</button>
                </div>
              </div>
            </>
          )}
          {gameMap[selectedGame]({ players, settings, onWin: recordWin, feedback: playFeedback })}
        </section>
      ) : (
        <section className="hub">
          <div className="hero-panel">
            <div>
              <h2>Un téléphone.<br />Deux joueurs.</h2>
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
                    <span className="player-avatar" style={{ background: player.color }}>{player.avatar}</span>
                    <strong>{player.name}</strong>
                    <small>{player.wins} victoire{player.wins > 1 ? "s" : ""}</small>
                  </div>
                ))}
              </section>

              <button className="surprise-button" onClick={playSurprise}>
                <Dices size={20} />
                Jeu surprise
              </button>

              {lastPlayedGame && (
                <section className="resume-panel">
                  <div>
                    <p className="kicker">Reprendre</p>
                    <h3>{lastPlayedGame.title}</h3>
                    <span>{stats.history[0] ? `Dernière victoire : ${stats.history[0].winnerName}` : "Prêts pour la première manche ?"}</span>
                  </div>
                  <button className="primary-action" onClick={() => openGame(lastPlayedGame.id)}>
                    <Play size={18} />
                    Jouer
                  </button>
                </section>
              )}

              <section className="tournament-panel">
                <div>
                  <p className="kicker">Tournoi (même série)</p>
                  <h3>{tournament.enabled ? `${players[0].name} ${tournament.score[0]} - ${tournament.score[1]} ${players[1].name}` : "Série de manches"}</h3>
                  <span>{tournament.enabled ? `Premier à ${tournamentLimit} victoire${tournamentLimit > 1 ? "s" : ""}` : "Compte les victoires des jeux que tu choisis. Premier à 3, 5 ou 7."}</span>
                </div>
                <div className="tournament-actions">
                  {[3, 5, 7].map((target) => (
                    <button key={target} className={tournament.enabled && tournament.target === target ? "active" : ""} onClick={() => startTournament(target as 3 | 5 | 7)}>{target}</button>
                  ))}
                  {tournament.enabled && <button onClick={stopTournament}>Stop</button>}
                </div>
              </section>

              <section className="marathon-panel">
                <div>
                  <p className="kicker">🏆 Tournoi multi-jeux</p>
                  <h3>Marathon surprise</h3>
                  <span>Versus tire au sort une série de jeux et les enchaîne. Le tableau des scores s'affiche entre chaque manche.</span>
                </div>
                <div className="tournament-actions">
                  <button onClick={() => startMarathon(3)}>3 jeux</button>
                  <button onClick={() => startMarathon(5)}>5 jeux</button>
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
                      <p className="kicker">Récents</p>
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
                <div key={index} className="player-card">
                  <span className="player-avatar" style={{ background: player.color }}>{player.avatar}</span>
                  <span>Joueur {index + 1}</span>
                  <input value={player.name} maxLength={16} onChange={(event) => renamePlayer(index as PlayerIndex, event.target.value)} />
                  <div className="avatar-grid" role="group" aria-label="Avatar">
                    {AVATARS.map((emoji) => (
                      <button key={emoji} className={player.avatar === emoji ? "avatar-pick active" : "avatar-pick"} onClick={() => setPlayerAvatar(index as PlayerIndex, emoji)} aria-label={`Avatar ${emoji}`}>{emoji}</button>
                    ))}
                  </div>
                  <div className="color-grid" role="group" aria-label="Couleur">
                    {PLAYER_COLORS.map((color) => (
                      <button key={color} className={player.color === color ? "color-pick active" : "color-pick"} style={{ background: color }} onClick={() => setPlayerColor(index as PlayerIndex, color)} aria-label={`Couleur ${color}`} />
                    ))}
                  </div>
                  <strong>{player.wins} victoire{player.wins > 1 ? "s" : ""}</strong>
                  <small>Meilleur jeu : {bestGameFor(index as PlayerIndex)}</small>
                </div>
              ))}
              <button className="reset-score" onClick={resetWins}>Remettre les scores à zéro</button>
            </section>
          )}

          {homeTab === "stats" && (
            <section className="stats-panel clean-panel">
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-num">{totalGames}</span>
                  <span className="stat-label">parties jouées</span>
                </div>
                <div className="stat-box">
                  <span className="stat-num">{players[0].avatar} {stats.gamesPlayed[0]} · {stats.gamesPlayed[1]} {players[1].avatar}</span>
                  <span className="stat-label">victoires globales</span>
                </div>
                <div className="stat-box wide">
                  <span className="stat-num">{stats.currentStreak.player === null ? "—" : `${players[stats.currentStreak.player].avatar} ${players[stats.currentStreak.player].name} · ${stats.currentStreak.count}`}</span>
                  <span className="stat-label">série en cours</span>
                </div>
              </div>

              <p className="kicker">Face-à-face par jeu</p>
              {headToHead.length === 0 && <p className="empty-state">Aucune partie terminée pour l'instant.</p>}
              {headToHead.map(({ game, wins }) => (
                <div key={game.id} className="h2h-row">
                  <span className="h2h-title">{game.title}</span>
                  <div className="h2h-bar" aria-hidden="true">
                    <i style={{ flexGrow: wins[0] || 0.001, background: players[0].color }} />
                    <i style={{ flexGrow: wins[1] || 0.001, background: players[1].color }} />
                  </div>
                  <strong className="h2h-score">{wins[0]} - {wins[1]}</strong>
                </div>
              ))}

              {stats.history.length > 0 && (
                <>
                  <p className="kicker">Dernières parties</p>
                  {stats.history.slice(0, 8).map((entry) => (
                    <div key={entry.id} className="history-row">
                      <span>{entry.gameTitle}</span>
                      <strong>{players[entry.winner].avatar} {entry.winnerName}</strong>
                      <small>{new Date(entry.date).toLocaleDateString("fr-FR")} · {entry.score}</small>
                    </div>
                  ))}
                </>
              )}
            </section>
          )}

          {homeTab === "settings" && (
            <>
              <section className="settings-panel clean-panel">
                <label>
                  Thème
                  <select value={theme} onChange={(event) => setTheme(event.target.value as ThemeName)}>
                    <option value="dark">Sombre</option>
                    <option value="arcade">Arcade</option>
                    <option value="wood">Bois / table</option>
                    <option value="neon">Néon</option>
                  </select>
                </label>
                <label>
                  Allumettes au départ
                  <input type="number" min="9" max="41" step="2" value={settings.matchesStart} onChange={(event) => setSettings({ ...settings, matchesStart: Number(event.target.value) })} />
                </label>
                <label>
                  Grille du morpion
                  <select value={settings.ticTacToeSize} onChange={(event) => setSettings({ ...settings, ticTacToeSize: Number(event.target.value) as 3 | 4 })}>
                    <option value={3}>3x3</option>
                    <option value={4}>4x4</option>
                  </select>
                </label>
                <label>
                  Erreurs au pendu
                  <input type="number" min="4" max="10" value={settings.hangmanErrors} onChange={(event) => setSettings({ ...settings, hangmanErrors: Number(event.target.value) })} />
                </label>
                <label>
                  Grille du Memory
                  <select value={settings.memorySize} onChange={(event) => setSettings({ ...settings, memorySize: Number(event.target.value) as 4 | 6 })}>
                    <option value={4}>4x4 (8 paires)</option>
                    <option value={6}>6x6 (18 paires)</option>
                  </select>
                </label>
                <label>
                  Plateau des Dames
                  <select value={settings.checkersSize} onChange={(event) => setSettings({ ...settings, checkersSize: Number(event.target.value) as 8 | 10 })}>
                    <option value={8}>8x8</option>
                    <option value={10}>10x10</option>
                  </select>
                </label>
                <button className={settings.checkersMajority ? "toggle-on" : ""} onClick={() => setSettings({ ...settings, checkersMajority: !settings.checkersMajority })}>Dames : prise majoritaire {settings.checkersMajority ? "ON" : "OFF"}</button>
                <button className={settings.sound ? "toggle-on" : ""} onClick={() => setSettings({ ...settings, sound: !settings.sound })}>Sons {settings.sound ? "activés" : "coupés"}</button>
                <button className={settings.music ? "toggle-on" : ""} onClick={() => setSettings({ ...settings, music: !settings.music })}>Musique {settings.music ? "activée" : "coupée"}</button>
                <button className={settings.vibration ? "toggle-on" : ""} onClick={() => setSettings({ ...settings, vibration: !settings.vibration })}>Vibrations {settings.vibration ? "activées" : "coupées"}</button>
              </section>
              <button className="update-check" onClick={refreshUpdate}>
                <RefreshCw size={18} />
                Vérifier les mises à jour
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

