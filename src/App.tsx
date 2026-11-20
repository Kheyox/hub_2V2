import React, { useCallback, useEffect, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { games as GAMES, GameId } from './games';
import { GameProps, PlayerIndex, PlayerProfiles } from './playerTypes';
import { configureAudio, sfx, SfxKind } from './sound';
import { loadAppState, PersistedAppState, saveAppState } from './stores/appStore';
import { GameStage } from './hub/GameStage';
import { HubShell, HubTabId } from './hub/HubShell';
import { PlayTab } from './hub/PlayTab';
import { PlayersTab } from './hub/PlayersTab';
import { StatsTab } from './hub/StatsTab';
import { SettingsTab } from './hub/SettingsTab';

import { TicTacToeGame as TicTacToe } from './games/tictactoe/Game';
import { ConnectFourGame as ConnectFour } from './games/connect4/Game';
import { HangmanGame as Hangman } from './games/hangman/Game';
import { YatzyGame as Yatzy } from './games/yatzy/Game';
import { ReversiGame as Reversi } from './games/reversi/Game';
import { MatchesGame as Matches } from './games/matches/Game';
import { MastermindGame as Mastermind } from './games/mastermind/Game';
import { BattleshipGame as Battleship } from './games/battleship/Game';
import { CheckersGame as Checkers } from './games/checkers/Game';
import { DominoesGame as Dominoes } from './games/dominoes/Game';
import { MancalaGame as Mancala } from './games/mancala/Game';
import { QuartoGame as Quarto } from './games/quarto/Game';
import { MemoryGame as MemoryDuel } from './games/memory/Game';
import { DotsBoxesGame as DotsBoxes } from './games/dotsboxes/Game';
import { ReflexGame as Reflex } from './games/reflex/Game';
import { RockPaperScissorsGame as RockPaperScissors } from './games/rps/Game';
import { SimonGame as Simon } from './games/simon/Game';
import { TapBattleGame as TapBattle } from './games/tapbattle/Game';
import { HigherLowerGame as HigherLower } from './games/higherlower/Game';
import { PongGame as Pong } from './games/pong/Game';

const GAME_COMPONENTS: Record<GameId, React.ComponentType<GameProps>> = {
  tictactoe: TicTacToe,
  connect4: ConnectFour,
  hangman: Hangman,
  yatzy: Yatzy,
  reversi: Reversi,
  matches: Matches,
  mastermind: Mastermind,
  battleship: Battleship,
  checkers: Checkers,
  dominoes: Dominoes,
  mancala: Mancala,
  quarto: Quarto,
  memory: MemoryDuel,
  dotsboxes: DotsBoxes,
  reflex: Reflex,
  rps: RockPaperScissors,
  simon: Simon,
  tapbattle: TapBattle,
  higherlower: HigherLower,
  pong: Pong,
};

export function GameHeader({
  title,
  status,
  onReset,
}: {
  title: string;
  status: string;
  onReset: () => void;
}) {
  return (
    <div className="game-header">
      <div>
        <h2>{title}</h2>
        <p className="status">{status}</p>
      </div>
      <button type="button" className="btn-reset" onClick={onReset}>
        Rejouer
      </button>
    </div>
  );
}

export function App() {
  const [state, setState] = useState<PersistedAppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<HubTabId>('play');
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [gameRun, setGameRun] = useState(0);
  const [winner, setWinner] = useState<PlayerIndex | null>(null);
  const [winScore, setWinScore] = useState<string | undefined>(undefined);
  const [tournament, setTournament] = useState<{ bestOf: 3 | 5; scores: [number, number] } | null>(null);

  useEffect(() => {
    saveAppState(state);
    document.documentElement.dataset.theme = state.theme;
    configureAudio({ sound: state.gameSettings.sound, music: state.gameSettings.music });
  }, [state]);

  useEffect(() => {
    const sub = CapApp.addListener('backButton', () => {
      if (selectedGame) {
        setSelectedGame(null);
        setWinner(null);
        setTournament(null);
      } else if (activeTab !== 'play') {
        setActiveTab('play');
      } else {
        CapApp.exitApp();
      }
    });
    return () => {
      sub.then((h) => h.remove());
    };
  }, [selectedGame, activeTab]);

  const feedback = useCallback(
    (kind: SfxKind) => {
      if (state.gameSettings.sound) sfx(kind);
      if (state.gameSettings.vibration && 'vibrate' in navigator) {
        navigator.vibrate(kind === 'win' ? [40, 30, 60] : 15);
      }
    },
    [state.gameSettings.sound, state.gameSettings.vibration]
  );

  const launchGame = (id: GameId) => {
    setSelectedGame(id);
    setWinner(null);
    setWinScore(undefined);
    setGameRun((r) => r + 1);
    setState((prev) => ({
      ...prev,
      recents: [id, ...prev.recents.filter((g) => g !== id)].slice(0, 6),
    }));
  };

  const handleWin = useCallback(
    (winIdx: PlayerIndex, score?: string) => {
      if (!selectedGame) return;
      feedback('win');
      setWinner(winIdx);
      setWinScore(score);
      setState((prev) => ({
        ...prev,
        history: [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            gameId: selectedGame,
            winner: winIdx,
            playedAt: new Date().toISOString(),
          },
          ...prev.history,
        ].slice(0, 50),
      }));
      setTournament((prev) => {
        if (!prev) return null;
        const next: [number, number] = [...prev.scores] as [number, number];
        next[winIdx] += 1;
        return { ...prev, scores: next };
      });
    },
    [selectedGame, feedback]
  );

  const startTournament = (bestOf: 3 | 5) => {
    const pick = GAMES[Math.floor(Math.random() * GAMES.length)];
    setTournament({ bestOf, scores: [0, 0] });
    if (pick) launchGame(pick.id);
  };

  const activeGameDef = selectedGame ? GAMES.find((g) => g.id === selectedGame) : undefined;
  const ActiveGameComponent = selectedGame ? GAME_COMPONENTS[selectedGame] : undefined;

  if (selectedGame && activeGameDef && ActiveGameComponent) {
    const tournamentLabel = tournament
      ? `Tournoi Bo${tournament.bestOf} — ${tournament.scores[0]} : ${tournament.scores[1]}`
      : undefined;

    return (
      <GameStage
        game={activeGameDef}
        players={state.players}
        winner={winner}
        winScore={winScore}
        tournamentLabel={tournamentLabel}
        onBack={() => {
          setSelectedGame(null);
          setWinner(null);
          setTournament(null);
        }}
        onRestart={() => {
          if (tournament) {
            const needed = Math.ceil(tournament.bestOf / 2);
            if (tournament.scores[0] >= needed || tournament.scores[1] >= needed) {
              setSelectedGame(null);
              setWinner(null);
              setTournament(null);
              return;
            }
            const pick = GAMES[Math.floor(Math.random() * GAMES.length)];
            if (pick) {
              launchGame(pick.id);
              return;
            }
          }
          setWinner(null);
          setWinScore(undefined);
          setGameRun((r) => r + 1);
        }}
      >
        <ActiveGameComponent
          key={`${selectedGame}-${gameRun}`}
          players={state.players}
          settings={state.gameSettings}
          onWin={handleWin}
          feedback={feedback}
        />
      </GameStage>
    );
  }

  return (
    <HubShell activeTab={activeTab} players={state.players} onChangeTab={setActiveTab}>
      {activeTab === 'play' && (
        <PlayTab
          favorites={state.favorites}
          recents={state.recents}
          onToggleFavorite={(id) =>
            setState((prev) => ({
              ...prev,
              favorites: prev.favorites.includes(id)
                ? prev.favorites.filter((f) => f !== id)
                : [...prev.favorites, id],
            }))
          }
          onSelectGame={launchGame}
          onStartTournament={startTournament}
        />
      )}
      {activeTab === 'players' && (
        <PlayersTab
          players={state.players}
          onUpdatePlayer={(idx, patch) =>
            setState((prev) => {
              const next = [...prev.players] as typeof prev.players;
              next[idx] = { ...next[idx], ...patch };
              return { ...prev, players: next };
            })
          }
        />
      )}
      {activeTab === 'stats' && (
        <StatsTab
          players={state.players}
          history={state.history}
          onResetStats={() => setState((prev) => ({ ...prev, history: [] }))}
        />
      )}
      {activeTab === 'settings' && (
        <SettingsTab
          theme={state.theme}
          settings={state.gameSettings}
          onChangeTheme={(theme) => setState((prev) => ({ ...prev, theme }))}
          onUpdateSettings={(patch) =>
            setState((prev) => ({
              ...prev,
              gameSettings: { ...prev.gameSettings, ...patch },
            }))
          }
        />
      )}
    </HubShell>
  );
}
