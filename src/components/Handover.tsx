export function Handover({ to, note, onReady }: { to: string; note?: string; onReady: () => void }) {
  return (
    <div className="handover" role="dialog" aria-modal="true" aria-label={`Passe le téléphone à ${to}`}>
      <div className="handover-card">
        <span className="handover-emoji" aria-hidden="true">🤝</span>
        <p className="kicker">Passe le téléphone</p>
        <h2>À {to} de jouer</h2>
        {note && <p className="handover-note">{note}</p>}
        <button className="primary-action" onClick={onReady}>C'est bon !</button>
      </div>
    </div>
  );
}
