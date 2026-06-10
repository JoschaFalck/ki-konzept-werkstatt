import { useState, type ReactNode } from 'react';
import { ui } from '../../content/ui-strings';

type Kind = 'info' | 'warn' | 'error';

const KIND_CLASSES: Record<Kind, string> = {
  info: 'border-primaer bg-karte text-text',
  warn: 'border-akzent bg-karte text-text',
  error: 'border-fehler bg-karte text-text',
};

interface BannerProps {
  kind: Kind;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
}

export function Banner({ kind, title, children, dismissible = false }: BannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`rounded border-l-4 p-4 shadow-sm ${KIND_CLASSES[kind]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {title && <p className="font-semibold">{title}</p>}
          <div className="text-sm text-sekundaer">{children}</div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="shrink-0 text-sm text-sekundaer underline hover:text-text"
          >
            {ui.app.schliessen}
          </button>
        )}
      </div>
    </div>
  );
}
