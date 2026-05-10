import { ArrowLeft, Download, RefreshCw, RotateCcw, ShieldAlert, Trophy, X } from "lucide-react";
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
  const [updatePanelOpen, setUpdatePanelOpen] = useState(false);
  const currentGame = useMemo(() => games.find((game) => game.id === selectedGame), [selectedGame]);

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

  return (
    <main className="app-shell">
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

        <button className="icon-button" onClick={() => window.location.reload()} aria-label="Rafraichir">
          <RefreshCw size={20} />
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

      {update?.status === "blocked" && !selectedGame && (
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

      {selectedGame ? (
        <section className="game-stage">{gameMap[selectedGame]}</section>
      ) : (
        <section className="hub">
          <div className="hero-panel">
            <div>
              <p className="kicker">Duelio</p>
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
          <button className="update-check" onClick={refreshUpdate}>
            <RefreshCw size={18} />
            Verifier les mises a jour
          </button>
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
