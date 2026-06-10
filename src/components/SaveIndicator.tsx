import { useAppStore } from '../store';
import { ui } from '../../content/ui-strings';

export function SaveIndicator() {
  const saveState = useAppStore((s) => s.saveState);
  if (saveState === 'idle')
    return <span className="text-sm text-transparent">{ui.app.gespeichert}</span>;
  return (
    <span aria-live="polite" className="text-sm text-sekundaer">
      {saveState === 'saving' ? ui.app.speichert : ui.app.gespeichert}
    </span>
  );
}
