import { ui } from '../../content/ui-strings';

export type ModuleStatus = 'none' | 'in-progress' | 'done';

const LABELS: Record<ModuleStatus, string> = {
  none: ui.dashboard.statusNichtBegonnen,
  'in-progress': ui.dashboard.statusInArbeit,
  done: ui.dashboard.statusAbgeschlossen,
};

const CLASSES: Record<ModuleStatus, string> = {
  none: 'bg-flaeche text-sekundaer',
  'in-progress': 'bg-flaeche text-akzent',
  done: 'bg-flaeche text-erfolg',
};

export function StatusBadge({ status }: { status: ModuleStatus }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${CLASSES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
