import type { ReactNode } from 'react';
import { bild } from '../lib/bilder';

interface EmptyStateProps {
  title: string;
  text: string;
  action?: ReactNode;
  /** Name eines Bild-Slots aus /src/assets/bilder (z. B. "leer-start"). */
  bildName?: string;
}

function FallbackMotiv() {
  return (
    <svg viewBox="0 0 120 70" width="160" height="93" aria-hidden="true" className="mx-auto">
      <circle cx="38" cy="38" r="26" fill="#0F6B6B" opacity="0.12" />
      <circle cx="78" cy="30" r="16" fill="#378ADD" opacity="0.15" />
      <circle cx="92" cy="50" r="9" fill="#FAC775" opacity="0.5" />
      <polygon
        points="60,14 86,27 81,56 39,56 34,27"
        fill="none"
        stroke="#0F6B6B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyState({ title, text, action, bildName }: EmptyStateProps) {
  const bildUrl = bildName ? bild(bildName) : null;
  return (
    <div className="anim-auf mx-auto max-w-prose rounded-karte bg-karte p-10 text-center shadow-schwebend">
      {bildUrl ? (
        <img src={bildUrl} alt="" className="mx-auto mb-4 max-h-44 rounded-karte object-cover" />
      ) : (
        <FallbackMotiv />
      )}
      <h2 className="mt-4 text-xl font-semibold text-text">{title}</h2>
      <p className="mt-3 text-sekundaer">{text}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
