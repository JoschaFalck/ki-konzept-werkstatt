import { DiagnoseContentSchema, type DiagnoseContent } from '../../types/contentSchemas';
import { SCHEMA_VERSION, type Project } from '../../types/schemas';

// Synthetischer 7-Dimensionen-Content für deterministische Logik-Tests
// (unabhängig von redaktionellen Änderungen an /content).

export function makeContent(itemsPerDim = 2): DiagnoseContent {
  return DiagnoseContentSchema.parse({
    contentVersion: 'test',
    dimensions: Array.from({ length: 7 }, (_, di) => {
      const id = `d${di + 1}`;
      return {
        id,
        title: `Dimension ${di + 1}`,
        leitfrage: `Leitfrage ${di + 1}?`,
        items: Array.from({ length: itemsPerDim }, (_, ii) => ({
          id: `${id}-i${ii + 1}`,
          text: `Item ${ii + 1}`,
          deprecated: false,
          levels: [0, 1, 2, 3].map((level) => ({ level, description: `Stufe ${level}` })),
        })),
      };
    }),
  });
}

export function makeProject(): Project {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    contentVersion: 'test',
    id: '33333333-3333-4333-8333-333333333333',
    title: 'Testprojekt',
    createdAt: now,
    updatedAt: now,
    diagnosis: { items: {}, completedAt: null },
    concept: { sections: {} },
    measures: [],
  };
}

/** Setzt für jede Dimension alle Items auf den angegebenen Mittelwert-Level. */
export function withLevels(
  project: Project,
  content: DiagnoseContent,
  levelsByDim: Record<string, (0 | 1 | 2 | 3)[]>,
  evidence = '',
): Project {
  const items: Project['diagnosis']['items'] = {};
  for (const dim of content.dimensions) {
    const levels = levelsByDim[dim.id];
    dim.items.forEach((item, i) => {
      if (levels && levels[i] !== undefined) {
        items[item.id] = { level: levels[i], evidence };
      }
    });
  }
  return { ...project, diagnosis: { ...project.diagnosis, items } };
}
