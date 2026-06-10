import { describe, expect, it } from 'vitest';
import { computeAuswertung, dimensionMean } from './auswertung';
import { makeContent, makeProject, withLevels } from './__fixtures__/testHelpers';
import type { DiagnoseContent } from '../types/contentSchemas';

const content = makeContent(2);

/** Alle Dimensionen auf Stufenpaare gesetzt; default 2/2 (Mittelwert 2). */
function levels(overrides: Record<string, (0 | 1 | 2 | 3)[]> = {}) {
  const base: Record<string, (0 | 1 | 2 | 3)[]> = {};
  for (let i = 1; i <= 7; i++) base[`d${i}`] = [2, 2];
  return { ...base, ...overrides };
}

describe('dimensionMean', () => {
  it('liefert null, solange Items fehlen', () => {
    const project = withLevels(makeProject(), content, { d1: [2, 2] });
    expect(dimensionMean(content.dimensions[0], project)).toBe(2);
    expect(dimensionMean(content.dimensions[1], project)).toBeNull();
  });

  it('ignoriert deprecated-Items', () => {
    const deprecatedContent: DiagnoseContent = {
      ...content,
      dimensions: content.dimensions.map((d) =>
        d.id === 'd1' ? { ...d, items: [d.items[0], { ...d.items[1], deprecated: true }] } : d,
      ),
    };
    const project = withLevels(makeProject(), deprecatedContent, { d1: [3] });
    expect(dimensionMean(deprecatedContent.dimensions[0], project)).toBe(3);
  });
});

describe('Hebel-Regeln (5.2)', () => {
  it('Regel 1 Fundament: d1 < 1,5', () => {
    const project = withLevels(makeProject(), content, levels({ d1: [1, 1] }));
    const a = computeAuswertung(content, project);
    expect(a.hauptRegel).toBe('fundament');
  });

  it('Regel 2 Prüfung: d3 < 1,0 bei d2 >= 1,5', () => {
    const project = withLevels(makeProject(), content, levels({ d3: [0, 1], d2: [2, 2] }));
    const a = computeAuswertung(content, project);
    expect(a.hauptRegel).toBe('pruefung');
    // Spreizung (2 − 0,5 = 1,5) trifft ebenfalls zu → Zusatzhinweis
    expect(a.zusatzRegeln).toContain('spreizung');
  });

  it('Regel 2 greift nicht ohne d2 >= 1,5', () => {
    const project = withLevels(makeProject(), content, levels({ d3: [0, 1], d2: [1, 1] }));
    const a = computeAuswertung(content, project);
    expect(a.hauptRegel).not.toBe('pruefung');
  });

  it('Regel 3 Governance: d6 < 1,0', () => {
    const project = withLevels(makeProject(), content, levels({ d6: [0, 1] }));
    const a = computeAuswertung(content, project);
    expect(a.hauptRegel).toBe('governance');
  });

  it('Regel 4 Spreizung: Differenz >= 1,5', () => {
    const project = withLevels(makeProject(), content, levels({ d7: [3, 3], d5: [1, 2] }));
    const a = computeAuswertung(content, project);
    expect(a.hauptRegel).toBe('spreizung');
  });

  it('Regel 5 Default: keine Regel ausgelöst → zwei niedrigste als Entwicklungsfelder', () => {
    const project = withLevels(makeProject(), content, levels({ d4: [1, 2], d5: [1, 2] }));
    const a = computeAuswertung(content, project);
    expect(a.hauptRegel).toBe('default');
    expect(a.entwicklungsfelder).toEqual(['d4', 'd5']);
  });

  it('Prioritätsreihenfolge: Fundament vor Governance, Rest als Zusatz', () => {
    const project = withLevels(makeProject(), content, levels({ d1: [0, 0], d6: [0, 1] }));
    const a = computeAuswertung(content, project);
    expect(a.hauptRegel).toBe('fundament');
    expect(a.zusatzRegeln[0]).toBe('governance');
    expect(a.zusatzRegeln).toContain('spreizung');
  });

  it('liefert keine Hebel-Regel bei unvollständiger Diagnose', () => {
    const project = withLevels(makeProject(), content, { d1: [2, 2] });
    const a = computeAuswertung(content, project);
    expect(a.complete).toBe(false);
    expect(a.hauptRegel).toBeNull();
  });
});

describe('Irritationshinweis', () => {
  it('löst aus, wenn alle Mittelwerte >= 2,5, und beziffert fehlende Evidenz', () => {
    const project = withLevels(
      makeProject(),
      content,
      levels(
        Object.fromEntries(
          Array.from({ length: 7 }, (_, i) => [`d${i + 1}`, [3, 2] as (0 | 1 | 2 | 3)[]]),
        ),
      ),
    );
    const a = computeAuswertung(content, project);
    expect(a.irritation.triggered).toBe(true);
    expect(a.irritation.gesamt).toBe(14);
    expect(a.irritation.ohneEvidenz).toBe(14);
  });

  it('löst nicht aus, wenn eine Dimension unter 2,5 liegt', () => {
    const project = withLevels(makeProject(), content, levels({ d4: [2, 2] }));
    const a = computeAuswertung(content, project);
    expect(a.irritation.triggered).toBe(false);
  });
});
