import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Hover-Lift für interaktive Karten (Aurora). */
  interaktiv?: boolean;
}

export function Card({ className = '', interaktiv = false, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={`rounded-karte bg-karte p-5 shadow-schwebend ${interaktiv ? 'hover-lift' : ''} ${className}`}
    />
  );
}
