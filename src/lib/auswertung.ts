import type { DiagnoseContent, DiagnosisItem, Dimension } from '../types/contentSchemas';
import type { Project } from '../types/schemas';

// Auswertungslogik (Spezifikation 5.1 und 5.2). Reine Funktionen, kein React.

export function activeItems(dim: Dimension): DiagnosisItem[] {
  return dim.items.filter((i) => !i.deprecated);
}

/** Mittelwert einer Dimension; null, solange nicht alle aktiven Items eingeschätzt sind. */
export function dimensionMean(dim: Dimension, project: Project): number | null {
  const items = activeItems(dim);
  const levels: number[] = [];
  for (const item of items) {
    const state = project.diagnosis.items[item.id];
    if (!state || state.level === null) return null;
    levels.push(state.level);
  }
  if (levels.length === 0) return null;
  return levels.reduce((a, b) => a + b, 0) / levels.length;
}

export function dimensionProgress(
  dim: Dimension,
  project: Project,
): { done: number; total: number } {
  const items = activeItems(dim);
  const done = items.filter((i) => project.diagnosis.items[i.id]?.level != null).length;
  return { done, total: items.length };
}

export function isDimensionComplete(dim: Dimension, project: Project): boolean {
  const { done, total } = dimensionProgress(dim, project);
  return total > 0 && done === total;
}

export function isDiagnosisComplete(content: DiagnoseContent, project: Project): boolean {
  return content.dimensions.every((d) => isDimensionComplete(d, project));
}

export type HebelRegelId = 'fundament' | 'pruefung' | 'governance' | 'spreizung' | 'default';

export interface Auswertung {
  /** Mittelwert je Dimension (null = Dimension unvollständig). */
  means: Record<string, number | null>;
  complete: boolean;
  /** Erste zutreffende Regel = Haupt-Empfehlung; nur gesetzt, wenn Diagnose vollständig. */
  hauptRegel: HebelRegelId | null;
  /** Weitere zutreffende Regeln als Zusatzhinweise (Prioritätsreihenfolge). */
  zusatzRegeln: HebelRegelId[];
  /** Zwei niedrigste vollständige Dimensionen. */
  entwicklungsfelder: string[];
  /** Bis zu zwei höchste vollständige Dimensionen mit Mittelwert >= 2. */
  staerken: string[];
  irritation: { triggered: boolean; ohneEvidenz: number; gesamt: number };
}

export function computeAuswertung(content: DiagnoseContent, project: Project): Auswertung {
  const means: Record<string, number | null> = {};
  for (const dim of content.dimensions) {
    means[dim.id] = dimensionMean(dim, project);
  }
  const complete = content.dimensions.every((d) => means[d.id] !== null);

  // Hebel-Regeln (5.2): vollständiger Regelsatz, Reihenfolge = Priorität.
  let hauptRegel: HebelRegelId | null = null;
  let zusatzRegeln: HebelRegelId[] = [];
  if (complete) {
    const m = (id: string) => means[id] as number;
    const values = content.dimensions.map((d) => m(d.id));
    const matching: HebelRegelId[] = [];
    if (m('d1') < 1.5) matching.push('fundament');
    if (m('d3') < 1.0 && m('d2') >= 1.5) matching.push('pruefung');
    if (m('d6') < 1.0) matching.push('governance');
    if (Math.max(...values) - Math.min(...values) >= 1.5) matching.push('spreizung');
    hauptRegel = matching[0] ?? 'default';
    zusatzRegeln = matching.slice(1);
  }

  // Stärken / Entwicklungsfelder über vollständige Dimensionen.
  const ranked = content.dimensions
    .filter((d) => means[d.id] !== null)
    .map((d) => ({ id: d.id, mean: means[d.id] as number }));
  const ascending = [...ranked].sort((a, b) => a.mean - b.mean);
  const entwicklungsfelder = ascending.slice(0, 2).map((r) => r.id);
  const staerken = [...ranked]
    .sort((a, b) => b.mean - a.mean)
    .filter((r) => r.mean >= 2)
    .slice(0, 2)
    .map((r) => r.id);

  // Irritationshinweis: alle 7 Mittelwerte >= 2,5.
  const triggered = complete && content.dimensions.every((d) => (means[d.id] as number) >= 2.5);
  let ohneEvidenz = 0;
  let gesamt = 0;
  for (const dim of content.dimensions) {
    for (const item of activeItems(dim)) {
      const state = project.diagnosis.items[item.id];
      if (state && state.level !== null) {
        gesamt++;
        if (state.evidence.trim() === '') ohneEvidenz++;
      }
    }
  }

  return {
    means,
    complete,
    hauptRegel,
    zusatzRegeln,
    entwicklungsfelder,
    staerken,
    irritation: { triggered, ohneEvidenz, gesamt },
  };
}
