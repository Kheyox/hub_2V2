import { ArrowLeft, Download, RefreshCw, RotateCcw, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ConnectFour } from "./components/ConnectFour";
import { Hangman } from "./components/Hangman";
import { TicTacToe } from "./components/TicTacToe";
import { Yatzy } from "./components/Yatzy";
import { games, type GameId } from "./games";
import { checkForUpdate, type UpdateInfo } from "./updateService";
import { APP_VERSION } from "./version";

const gameMap: Record<GameId, JSX.Element> = {
  tictactoe: <TicTacToe />,
  connect4: <ConnectFour />,
  hangman: <Hangman />,
  yatzy: <Yatzy />
};

export function App() {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const currentGame = useMemo(() => games.find((game) => game.id === selectedGame), [selectedGame]);

  useEffect(() => {
    checkForUpdate().then(setUpdate);
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        {selectedGame ? (
          <button className="icon-button" onClick={() => setSelectedGame(null)} aria-label="Retour au hub">
            <ArrowLeft size={22} />
          </button>
        ) : (
          <div className="brand-mark">H2</div>
        )}

        <div>
          <p className="kicker">Hub 2V2</p>
          <h1>{currentGame?.title || "Jeux 1v1 locaux"}</h1>
        </div>

        <button className="icon-button" onClick={() => window.location.reload()} aria-label="Rafraichir">
          <RefreshCw size={20} />
        </button>
      </header>

      {update?.status === "available" && (
        <section className="update-banner">
          <div>
            <strong>Version {update.latestVersion} disponible</strong>
            <span>Tu es en {update.currentVersion}. L'APK peut etre ouverte depuis la release GitHub.</span>
          </div>
          <button onClick={() => window.open(update.apkUrl || update.releaseUrl, "_blank")} aria-label="Telecharger la mise a jour">
            <Download size={18} />
            Maj
          </button>
        </section>
      )}

      {selectedGame ? (
        <section className="game-stage">{gameMap[selectedGame]}</section>
      ) : (
        <section className="hub">
          <div className="hero-panel">
            <div>
              <p className="kicker">Meme telephone</p>
              <h2>Choisis un jeu, passe le telephone, garde le score.</h2>
            </div>
            <div className="version-pill">v{APP_VERSION}</div>
          </div>

          <div className="game-grid">
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <button className="game-tile" key={game.id} onClick={() => setSelectedGame(game.id)} style={{ "--accent": game.accent } as React.CSSProperties}>
                  <span className="tile-icon">
                    <Icon size={30} />
                  </span>
                  <span>
                    <strong>{game.title}</strong>
                    <small>{game.subtitle}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="score-note">
            <Trophy size={20} />
            <span>Architecture prevue pour ajouter d'autres jeux tour par tour sans refaire le hub.</span>
          </div>
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
