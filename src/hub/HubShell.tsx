import React from 'react';
import { BarChart3, Gamepad2, Settings, Users } from 'lucide-react';
import { PlayerProfiles } from '../playerTypes';
import { PlayerPill } from '../design-system';

export type HubTabId = 'play' | 'players' | 'stats' | 'settings';

const TABS: { id: HubTabId; label: string; icon: typeof Gamepad2 }[] = [
  { id: 'play', label: 'Jouer', icon: Gamepad2 },
  { id: 'players', label: 'Joueurs', icon: Users },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'settings', label: 'Options', icon: Settings },
];

interface HubShellProps {
  activeTab: HubTabId;
  players: PlayerProfiles;
  onChangeTab: (tab: HubTabId) => void;
  children: React.ReactNode;
}

export function HubShell({ activeTab, players, onChangeTab, children }: HubShellProps) {
  return (
    <div className="flex flex-col h-full min-h-0 max-w-3xl mx-auto">
      <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight text-brand">VERSUS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PlayerPill name={players[0].name} avatar={players[0].avatar} color={players[0].color} />
          <span className="text-xs text-muted font-bold">vs</span>
          <PlayerPill name={players[1].name} avatar={players[1].avatar} color={players[1].color} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4">{children}</main>

      <nav className="grid grid-cols-4 border-t border-border bg-surface/95 backdrop-blur-sm shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? 'text-brand' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
