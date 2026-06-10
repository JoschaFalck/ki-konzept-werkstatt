import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  text: string;
  action?: ReactNode;
}

export function EmptyState({ title, text, action }: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-prose rounded-karte bg-karte p-10 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-text">{title}</h2>
      <p className="mt-3 text-sekundaer">{text}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
