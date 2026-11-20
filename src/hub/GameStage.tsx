import React, { useState } from 'react';
import { ArrowLeft, BookOpen, RotateCcw, Trophy } from 'lucide-react';
import { GameDefinition } from '../games';
import { PlayerIndex, PlayerProfiles } from '../playerTypes';
import { Button, Modal } from '../design-system';

interface GameStageProps {
  game: GameDefinition;
  players: PlayerProfiles;
  winner: PlayerIndex | null;
  winScore?: string;
  tournamentLabel?: string;
  onBack: () => void;
  onRestart: () => void;
  children: React.ReactNode;
}

export function GameStage({
  game,
  players,
  winner,
  winScore,
  tournamentLabel,
  onBack,
  onRestart,
  children,
}: GameStageProps) {
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border bg-surface/90 backdrop-blur-sm shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label="Retour au Hub">
          <ArrowLeft className="h-4 w-4" />
          Hub
        </Button>

        <div className="text-center min-w-0">
          <h1 className="text-sm font-bold text-ink truncate">{game.title}</h1>
          {tournamentLabel && (
            <p className="text-[11px] text-brand font-medium truncate">{tournamentLabel}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setRulesOpen(true)} aria-label="Règles">
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onRestart} aria-label="Recommencer">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="relative flex-1 overflow-y-auto p-3 flex flex-col items-center justify-center">
        {children}

        {winner !== null && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-card bg-surface border border-border p-6 text-center space-y-4 shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-3xl">
                {players[winner].avatar}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-brand font-semibold flex items-center justify-center gap-1">
                  <Trophy className="h-3.5 w-3.5" /> Victoire
                </p>
                <h2 className="text-xl font-bold text-ink mt-1">{players[winner].name} gagne !</h2>
                {winScore && <p className="text-sm text-muted mt-1">{winScore}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <Button variant="secondary" onClick={onBack}>
                  Hub
                </Button>
                <Button variant="primary" onClick={onRestart}>
                  Revanche
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Modal open={rulesOpen} onClose={() => setRulesOpen(false)} title={`Règles — ${game.title}`}>
        <div className="space-y-3 text-sm text-ink">
          <div>
            <p className="text-xs font-semibold uppercase text-brand mb-0.5">Objectif</p>
            <p className="text-muted">{game.rules.objective}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-brand mb-0.5">Déroulement</p>
            <p className="text-muted">{game.rules.turn}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
