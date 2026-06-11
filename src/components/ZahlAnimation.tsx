import { useEffect, useRef, useState } from 'react';

// Hochzählende Mittelwerte (Spezifikation Abschnitt 6, Aurora).
// Respektiert prefers-reduced-motion: dann sofortiger Endwert.

interface ZahlAnimationProps {
  /** Zielwert (z. B. Mittelwert 0–3). */
  wert: number;
  dauerMs?: number;
}

export function ZahlAnimation({ wert, dauerMs = 800 }: ZahlAnimationProps) {
  const [anzeige, setAnzeige] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnzeige(wert);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / dauerMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnzeige(wert * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [wert, dauerMs]);

  return <span className="tabular-nums">{anzeige.toFixed(2).replace('.', ',')}</span>;
}
