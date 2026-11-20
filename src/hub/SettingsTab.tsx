import { useState } from 'react';
import { GameSettings } from '../playerTypes';
import { ThemeId } from '../stores/appStore';
import { APP_VERSION } from '../version';
import { checkForUpdate, downloadAndInstall, isNativeApp } from '../updateService';
import { Button, Card } from '../design-system';

const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'dark', label: 'Sombre' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'wood', label: 'Bois' },
  { id: 'neon', label: 'Néon' },
];

interface SettingsTabProps {
  theme: ThemeId;
  settings: GameSettings;
  onChangeTheme: (theme: ThemeId) => void;
  onUpdateSettings: (patch: Partial<GameSettings>) => void;
}

export function SettingsTab({
  theme,
  settings,
  onChangeTheme,
  onUpdateSettings,
}: SettingsTabProps) {
  const [otaStatus, setOtaStatus] = useState<string | null>(null);
  const [otaBusy, setOtaBusy] = useState(false);

  const handleCheckUpdate = async () => {
    setOtaBusy(true);
    setOtaStatus('Vérification...');
    try {
      const info = await checkForUpdate();
      if (info.status !== 'available' || !info.apkUrl) {
        setOtaStatus('Tu es déjà sur la dernière version.');
      } else {
        setOtaStatus(`Mise à jour ${info.latestVersion} disponible — téléchargement...`);
        await downloadAndInstall(info.apkUrl, (st) => {
          if (st.step === 'downloading') {
            setOtaStatus(`Téléchargement : ${Math.round(st.progress)}%`);
          } else if (st.step === 'installing') {
            setOtaStatus('Installation en cours...');
          } else if (st.step === 'error') {
            setOtaStatus(st.message);
          }
        });
      }
    } catch {
      setOtaStatus('Impossible de vérifier les mises à jour.');
    } finally {
      setOtaBusy(false);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <Card className="space-y-2.5">
        <h3 className="text-sm font-semibold text-ink">Thème visuel</h3>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <Button
              key={t.id}
              variant={theme === t.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onChangeTheme(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-sm font-semibold text-ink">Audio & Retours</h3>
        {(
          [
            ['sound', 'Effets sonores'],
            ['music', 'Musique de fond'],
            ['vibration', 'Vibrations'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between text-sm text-ink cursor-pointer">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(e) => onUpdateSettings({ [key]: e.target.checked })}
              className="h-4 w-4 accent-brand"
            />
          </label>
        ))}
      </Card>

      <Card className="space-y-3">
        <h3 className="text-sm font-semibold text-ink">Règles rapides</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink">Morpion</span>
          <div className="flex gap-1.5">
            {([3, 4] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={settings.ticTacToeSize === s ? 'primary' : 'secondary'}
                onClick={() => onUpdateSettings({ ticTacToeSize: s })}
              >
                {s}x{s}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink">Memory</span>
          <div className="flex gap-1.5">
            {([4, 6] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={settings.memorySize === s ? 'primary' : 'secondary'}
                onClick={() => onUpdateSettings({ memorySize: s })}
              >
                {s}x{s}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink">Dames</span>
          <div className="flex gap-1.5">
            {([8, 10] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={settings.checkersSize === s ? 'primary' : 'secondary'}
                onClick={() => onUpdateSettings({ checkersSize: s })}
              >
                {s}x{s}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Versus</p>
            <p className="text-xs text-muted">Version {APP_VERSION}</p>
          </div>
          {isNativeApp() && (
            <Button size="sm" disabled={otaBusy} onClick={handleCheckUpdate}>
              Mise à jour
            </Button>
          )}
        </div>
        {otaStatus && <p className="text-xs text-muted">{otaStatus}</p>}
      </Card>
    </div>
  );
}
